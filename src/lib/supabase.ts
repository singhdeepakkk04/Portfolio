import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// supabase-js makes its requests with the global `fetch`, which Next.js's App
// Router patches to cache indefinitely by default. Without this override, a
// server component reading from Supabase can keep serving a stale snapshot
// (e.g. a newly-approved recommendation, or a new blog post) until the next
// full redeploy, even though the page itself isn't statically cached.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

// Credentials are resolved per call rather than at module scope. On Cloudflare
// Workers there is no populated `process.env` until a request arrives: the
// OpenNext runtime copies the Worker's bindings and secrets into `process.env`
// during per-request init. Reading them while the module is still being
// evaluated therefore yields `undefined`, and `createClient(undefined, ...)`
// throws "supabaseUrl is required." straight from its constructor -- which is
// what turned every request to `/` into a 500.
//
// The `SUPABASE_*` names are read first and deliberately carry no NEXT_PUBLIC_
// prefix, so they stay genuine runtime lookups. Next.js inlines NEXT_PUBLIC_*
// vars into the bundle at *build* time, so a build that ran without
// `.env.local` bakes in `undefined` and no amount of Cloudflare secrets can
// override it afterwards. The NEXT_PUBLIC_ names stay as a fallback so local
// `next dev` keeps working off the existing `.env.local`.
function readConfig() {
    return {
        url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
}

/**
 * True when the Supabase URL and service-role key are both present. Lets a
 * caller tell "no rows yet" apart from "not wired up".
 */
export function isSupabaseConfigured(): boolean {
    const { url, serviceRoleKey } = readConfig();
    return !!url && !!serviceRoleKey;
}

/**
 * Client for admin operations (bypasses RLS, server-only).
 *
 * Returns `null` rather than throwing when credentials are missing, so a
 * misconfigured deployment degrades to empty content instead of a 500 on every
 * page. Callers must handle the null.
 */
export function getServiceRoleClient(): SupabaseClient | null {
    const { url, serviceRoleKey } = readConfig();

    if (!url || !serviceRoleKey) {
        console.error(
            "[supabase] Missing credentials; skipping query. Set SUPABASE_URL and " +
                "SUPABASE_SERVICE_ROLE_KEY (Cloudflare: `npm run cf:secrets`; local: .dev.vars)."
        );
        return null;
    }

    return createClient(url, serviceRoleKey, { global: { fetch: noStoreFetch } });
}

/**
 * Same as {@link getServiceRoleClient} but throws instead of returning null.
 *
 * For authenticated admin write paths, where silently doing nothing would be
 * worse than a visible failure -- the admin needs to know the post did not
 * save. Public read paths should use the nullable variant.
 */
export function requireServiceRoleClient(): SupabaseClient {
    const client = getServiceRoleClient();

    if (!client) {
        throw new Error(
            "Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        );
    }

    return client;
}

/**
 * Client for public, RLS-constrained operations. Same null contract as above.
 */
export function getAnonClient(): SupabaseClient | null {
    const { url, anonKey } = readConfig();

    if (!url || !anonKey) {
        console.error(
            "[supabase] Missing anon credentials; skipping query. Set SUPABASE_URL and SUPABASE_ANON_KEY."
        );
        return null;
    }

    return createClient(url, anonKey, { global: { fetch: noStoreFetch } });
}
