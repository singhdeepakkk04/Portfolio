import { createClient } from "@supabase/supabase-js";

// supabase-js makes its requests with the global `fetch`, which Next.js's App
// Router patches to cache indefinitely by default. Without this override, a
// server component reading from Supabase can keep serving a stale snapshot
// (e.g. a newly-approved recommendation, or a new blog post) until the next
// full redeploy, even though the page itself isn't statically cached.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

let _supabase: ReturnType<typeof createClient> | null = null;

// Client for public operations (like submitting a recommendation)
// Lazily initialized to avoid top-level process.env evaluation in Cloudflare Workers
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
    get(target, prop) {
        if (!_supabase) {
            _supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { fetch: noStoreFetch } }
            );
        }
        return (_supabase as any)[prop];
    }
});

// Client for admin operations (bypasses RLS, used only in server environments)
export const getServiceRoleClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            global: { fetch: noStoreFetch },
        }
    );
};
