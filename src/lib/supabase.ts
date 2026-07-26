import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// supabase-js makes its requests with the global `fetch`, which Next.js's App
// Router patches to cache indefinitely by default. Without this override, a
// server component reading from Supabase can keep serving a stale snapshot
// (e.g. a newly-approved recommendation, or a new blog post) until the next
// full redeploy, even though the page itself isn't statically cached.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

// Client for public operations (like submitting a recommendation)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: noStoreFetch },
});

// Client for admin operations (bypasses RLS, used only in server environments)
export const getServiceRoleClient = () => {
    return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        global: { fetch: noStoreFetch },
    });
};
