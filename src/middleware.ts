import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidSessionToken } from "@/lib/admin/session-edge";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        // Allow login page without authentication
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        // Verify the cookie's signature, not merely its presence. Checking only
        // that the cookie existed meant `document.cookie = "admin-session=x"`
        // was enough to reach the admin UI. The API routes behind it always
        // validated properly, so nothing could be read or written -- but the
        // gate itself did nothing.
        const session = request.cookies.get("admin-session")?.value;
        if (!(await isValidSessionToken(session))) {
            const response = NextResponse.redirect(new URL("/admin/login", request.url));

            // Clear a rejected cookie so an expired or forged token doesn't sit
            // in the browser re-triggering this redirect on every navigation.
            if (session) {
                response.cookies.delete("admin-session");
            }

            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
