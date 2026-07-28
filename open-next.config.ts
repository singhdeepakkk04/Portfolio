import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The portfolio reads everything it renders straight from Supabase on each
// request, so there is nothing worth persisting in an incremental cache. The
// defaults here leave the cache/tag/queue overrides as no-ops, which keeps the
// Worker free of R2/KV/D1 bindings and keeps the bundle small.
export default defineCloudflareConfig();
