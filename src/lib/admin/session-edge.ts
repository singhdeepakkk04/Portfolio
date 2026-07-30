/**
 * Session verification for the middleware.
 *
 * This deliberately duplicates the signing scheme in `./auth.ts` rather than
 * importing it. That module pulls in `node:crypto` and `otpauth`, and the
 * middleware is bundled for the edge runtime where neither belongs -- importing
 * it would drag the whole admin auth surface into the middleware bundle.
 *
 * The two implementations MUST stay byte-compatible: `auth.ts` mints the cookie
 * and this file validates it. Both derive the same key and produce the same
 * base64url HMAC:
 *
 *   secret    = SHA-256(`${ADMIN_PASSWORD}:${TOTP_SECRET}`)
 *   signature = base64url(HMAC-SHA256(secret, payload))
 *   token     = `${payload}.${signature}`
 *
 * If you change the scheme in one file, change it in the other.
 */

function toBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Node's .digest("base64url") is base64 with +/ swapped for -_ and padding
    // stripped. Match it exactly or every signature comparison fails.
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return atob(base64 + padding);
}

/** Compares two equal-length strings without leaking position via timing. */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

async function sign(payload: string): Promise<string | null> {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const totpSecret = process.env.TOTP_SECRET;

    // With no credentials configured the key would degrade to the SHA-256 of a
    // constant (":"), which anyone could reproduce and use to forge a session.
    // Refuse to verify instead, so the caller denies access.
    if (!adminPassword && !totpSecret) return null;

    const encoder = new TextEncoder();
    const material = `${adminPassword || ""}:${totpSecret || ""}`;
    const secret = await crypto.subtle.digest("SHA-256", encoder.encode(material));

    const key = await crypto.subtle.importKey(
        "raw",
        secret,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/**
 * True only for a correctly signed, unexpired session cookie.
 *
 * The previous middleware checked merely that the cookie *existed*, so
 * `document.cookie = "admin-session=x"` was enough to walk past the redirect
 * into the admin UI.
 */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
    if (!token) return false;

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const expected = await sign(payload);
    if (!expected || !timingSafeEqual(signature, expected)) return false;

    try {
        const { exp } = JSON.parse(decodeBase64Url(payload));
        return typeof exp === "number" && Date.now() < exp;
    } catch {
        return false;
    }
}
