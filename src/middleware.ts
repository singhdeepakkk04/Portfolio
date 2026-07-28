import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
        // Allow login page without authentication
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        // Check for valid session
        const session = request.cookies.get("admin-session");
        if (!session) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
