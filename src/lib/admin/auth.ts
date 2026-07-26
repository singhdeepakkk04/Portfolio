import * as OTPAuth from "otpauth";
import crypto from "crypto";

// ============================================
// SESSION MANAGEMENT (Stateless, signed cookie)
// ============================================
// Serverless functions don't share memory across instances/cold starts, so an
// in-memory session store only works by luck (same warm instance handling both
// requests). Sessions are instead a signed, self-verifying token: no server-side
// state needed, so validation works identically on every instance.
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches the cookie's maxAge

function getSessionSecret(): Buffer {
    // Derived from secrets that must already be configured for login to work at
    // all, so this doesn't require provisioning a new env var anywhere.
    const material = `${process.env.ADMIN_PASSWORD || ""}:${process.env.TOTP_SECRET || ""}`;
    return crypto.createHash("sha256").update(material).digest();
}

function sign(payload: string): string {
    return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function isValidPassword(password: string): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;
    return !!adminPassword && password === adminPassword;
}

export function isValidUsername(username: string): boolean {
    const adminUsername = process.env.ADMIN_USERNAME || "deepak";
    return username.toLowerCase() === adminUsername.toLowerCase();
}

export function createSessionToken(): string {
    const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
    const signature = sign(payload);
    return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const expectedSignature = sign(payload);
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        return false;
    }

    try {
        const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
        return typeof exp === "number" && Date.now() < exp;
    } catch {
        return false;
    }
}

export function invalidateSessionToken(_token: string | undefined): void {
    // Stateless tokens can't be revoked server-side without a blocklist; logging
    // out just clears the cookie (handled by the logout route), which is enough
    // for this single-admin app's threat model.
}

// ============================================
// TOTP (Google Authenticator) 2FA
// ============================================

export function isTOTPConfigured(): boolean {
    return !!process.env.TOTP_SECRET && process.env.TOTP_SECRET.length > 0;
}

export function getTOTPInstance(secret?: string): OTPAuth.TOTP {
    const totpSecret = secret || process.env.TOTP_SECRET;
    if (!totpSecret) {
        throw new Error("TOTP secret not configured");
    }

    return new OTPAuth.TOTP({
        issuer: "DeepakSingh Portfolio",
        label: process.env.ADMIN_USERNAME || "deepak",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(totpSecret),
    });
}

export function generateTOTPSecret(): { secret: string; uri: string } {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
        issuer: "DeepakSingh Portfolio",
        label: process.env.ADMIN_USERNAME || "deepak",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
    });

    return {
        secret: secret.base32,
        uri: totp.toString(),
    };
}

export function verifyTOTPCode(code: string, secret?: string): boolean {
    try {
        const totp = getTOTPInstance(secret);
        // Allow a window of ±1 period (30s) to account for clock drift
        const delta = totp.validate({ token: code, window: 1 });
        return delta !== null;
    } catch {
        return false;
    }
}
