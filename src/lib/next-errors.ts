/**
 * Next.js signals "this render touched dynamic data, so bail out of static
 * generation" by *throwing*. That exception is control flow, not a failure: if
 * a `catch` swallows it, the page is silently frozen into the static build with
 * whatever fallback the catch returned, and the live data never appears.
 *
 * Any catch block wrapping a data fetch must therefore re-throw these first.
 * The `digest` string is Next's own stable marker for the condition, which is
 * safer to match on than importing from `next/dist/...` internals.
 */
export function rethrowIfNextControlFlow(error: unknown): void {
    const digest = (error as { digest?: unknown } | null | undefined)?.digest;

    if (typeof digest === "string" && (
        digest === "DYNAMIC_SERVER_USAGE" ||
        digest === "NEXT_NOT_FOUND" ||
        digest === "NEXT_REDIRECT" ||
        digest.startsWith("NEXT_REDIRECT")
    )) {
        throw error;
    }
}
