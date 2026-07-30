import { NextRequest, NextResponse } from "next/server";
import {
    isValidPassword,
    isValidUsername,
    createSessionToken,
    isTOTPConfigured,
    generateTOTPSecret,
    verifyTOTPCode,
} from "@/lib/admin/auth";
import QRCode from "qrcode";

// Temporary store for pending TOTP secrets (during first-time setup)
// Maps a temporary setup token → { secret, uri, expiresAt }
const pendingSetups = new Map<
    string,
    { secret: string; uri: string; expiresAt: number }
>();

// Temporary store for password-verified sessions awaiting TOTP
// Maps a temp token → expiresAt
const pendingTOTP = new Map<string, number>();

function generateTempToken(): string {
    return (
        Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2) +
        Date.now().toString(36)
    );
}

/**
 * Tries to store a freshly-enrolled TOTP secret so it survives this request.
 *
 * Only possible when running on a real filesystem, i.e. `next dev` locally.
 * Cloudflare Workers has no writable filesystem, so this returns false there
 * and the caller must tell the operator to store it as a Worker secret.
 *
 * @returns true only if the secret was actually written somewhere durable.
 */
async function persistTotpSecret(secret: string): Promise<boolean> {
    try {
        const fs = await import("node:fs");
        const path = await import("node:path");
        const envPath = path.join(process.cwd(), ".env.local");

        if (!fs.existsSync(envPath)) return false;

        let envContent = fs.readFileSync(envPath, "utf-8");
        envContent = envContent.includes("TOTP_SECRET=")
            ? envContent.replace(/TOTP_SECRET=.*/, `TOTP_SECRET=${secret}`)
            : `${envContent}\nTOTP_SECRET=${secret}\n`;
        fs.writeFileSync(envPath, envContent);

        // Safe here precisely because the value is now on disk: this process
        // keeps serving with it, and a restart reloads the same value.
        process.env.TOTP_SECRET = secret;
        return true;
    } catch {
        // No filesystem (Workers) or no write permission.
        return false;
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { step, username, password, totp_code, setup_token } = body;

    // ─────────────────────────────────────────────
    // STEP 1: Validate username + password
    // ─────────────────────────────────────────────
    if (step === "credentials" || !step) {
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        if (!isValidUsername(username) || !isValidPassword(password)) {
            return NextResponse.json(
                { error: "Invalid username or password" },
                { status: 401 }
            );
        }

        // Credentials valid. Check if TOTP is configured.
        if (isTOTPConfigured()) {
            // TOTP is set up — ask for the code
            const tempToken = generateTempToken();
            pendingTOTP.set(tempToken, Date.now() + 5 * 60 * 1000); // 5 min expiry
            return NextResponse.json({
                success: true,
                next_step: "totp_verify",
                temp_token: tempToken,
            });
        } else {
            // TOTP not yet configured — generate QR code for setup
            const { secret, uri } = generateTOTPSecret();
            const qrDataUrl = await QRCode.toDataURL(uri, {
                width: 256,
                margin: 2,
                color: { dark: "#000000", light: "#ffffff" },
            });
            const setupToken = generateTempToken();
            pendingSetups.set(setupToken, {
                secret,
                uri,
                expiresAt: Date.now() + 10 * 60 * 1000, // 10 min expiry
            });

            return NextResponse.json({
                success: true,
                next_step: "totp_setup",
                qr_code: qrDataUrl,
                setup_token: setupToken,
                manual_key: secret,
            });
        }
    }

    // ─────────────────────────────────────────────
    // STEP 2A: Verify TOTP code (already configured)
    // ─────────────────────────────────────────────
    if (step === "totp_verify") {
        const { temp_token } = body;
        if (!temp_token || !pendingTOTP.has(temp_token)) {
            return NextResponse.json(
                { error: "Session expired. Please log in again." },
                { status: 401 }
            );
        }

        const expiresAt = pendingTOTP.get(temp_token)!;
        if (Date.now() > expiresAt) {
            pendingTOTP.delete(temp_token);
            return NextResponse.json(
                { error: "Session expired. Please log in again." },
                { status: 401 }
            );
        }

        if (!totp_code) {
            return NextResponse.json(
                { error: "Authenticator code is required" },
                { status: 400 }
            );
        }

        if (!verifyTOTPCode(totp_code)) {
            return NextResponse.json(
                { error: "Invalid authenticator code" },
                { status: 401 }
            );
        }

        // TOTP verified — create session
        pendingTOTP.delete(temp_token);
        const sessionToken = createSessionToken();
        const response = NextResponse.json({ success: true, authenticated: true });

        response.cookies.set("admin-session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    }

    // ─────────────────────────────────────────────
    // STEP 2B: First-time TOTP setup confirmation
    // ─────────────────────────────────────────────
    if (step === "totp_setup_confirm") {
        if (!setup_token || !pendingSetups.has(setup_token)) {
            return NextResponse.json(
                { error: "Setup session expired. Please log in again." },
                { status: 401 }
            );
        }

        const setup = pendingSetups.get(setup_token)!;
        if (Date.now() > setup.expiresAt) {
            pendingSetups.delete(setup_token);
            return NextResponse.json(
                { error: "Setup session expired. Please log in again." },
                { status: 401 }
            );
        }

        if (!totp_code) {
            return NextResponse.json(
                { error: "Enter the code from your authenticator app" },
                { status: 400 }
            );
        }

        // Verify the code against the pending secret
        if (!verifyTOTPCode(totp_code, setup.secret)) {
            return NextResponse.json(
                { error: "Invalid code. Make sure you scanned the QR code correctly." },
                { status: 401 }
            );
        }

        // Code verified. The secret now has to outlive this request, and on
        // Cloudflare Workers it cannot: there is no filesystem to write
        // .env.local to, and a `process.env` assignment lives only in the
        // isolate that handled this request and disappears with it.
        //
        // Reporting success anyway would be the worst outcome. The session
        // cookie is signed with a key derived from ADMIN_PASSWORD and
        // TOTP_SECRET, so a session minted here would be signed with the new
        // secret while every other isolate still derives the old one -- the
        // admin would be logged straight back out, and 2FA would appear
        // configured while nothing had been stored. Fail loudly instead and
        // tell the operator how to persist it.
        const persisted = await persistTotpSecret(setup.secret);

        if (!persisted) {
            pendingSetups.delete(setup_token);

            return NextResponse.json(
                {
                    error:
                        "Your code was correct, but this deployment cannot store the " +
                        "2FA secret itself. Save it as the TOTP_SECRET secret, then log " +
                        "in again.",
                    requires_manual_persist: true,
                    // Already shown to this admin as a QR code and `manual_key`
                    // earlier in the same password-authenticated flow, so this
                    // is not a new disclosure.
                    secret: setup.secret,
                    how_to:
                        "Add TOTP_SECRET to .dev.vars and run `npm run cf:secrets`, or add " +
                        "it under Settings > Variables and Secrets as a Secret.",
                },
                { status: 503 }
            );
        }

        pendingSetups.delete(setup_token);

        // Create session
        const sessionToken = createSessionToken();
        const response = NextResponse.json({
            success: true,
            authenticated: true,
            message: "2FA has been set up successfully!",
        });

        response.cookies.set("admin-session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
