import * as OTPAuth from "otpauth";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getSessionSecretKey(): Promise<CryptoKey> {
    const material = `${process.env.ADMIN_PASSWORD || ""}:${process.env.TOTP_SECRET || ""}`;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.digest("SHA-256", encoder.encode(material));
    return crypto.subtle.importKey(
        "raw",
        keyMaterial,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    const binary = atob(base64 + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function sign(payload: string): Promise<string> {
    const key = await getSessionSecretKey();
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return bufferToBase64Url(signature);
}

export function isValidPassword(password: string): boolean {
    const adminPassword = process.env.ADMIN_PASSWORD;
    return !!adminPassword && password === adminPassword;
}

export function isValidUsername(username: string): boolean {
    const adminUsername = process.env.ADMIN_USERNAME || "deepak";
    return username.toLowerCase() === adminUsername.toLowerCase();
}

export async function createSessionToken(): Promise<string> {
    const payloadObj = { exp: Date.now() + SESSION_TTL_MS };
    const encoder = new TextEncoder();
    const payload = bufferToBase64Url(encoder.encode(JSON.stringify(payloadObj)));
    const signature = await sign(payload);
    return `${payload}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    try {
        const key = await getSessionSecretKey();
        const encoder = new TextEncoder();
        const signatureBuffer = base64UrlToBuffer(signature);
        const isValid = await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(payload));
        
        if (!isValid) return false;

        const payloadStr = new TextDecoder().decode(base64UrlToBuffer(payload));
        const { exp } = JSON.parse(payloadStr);
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
