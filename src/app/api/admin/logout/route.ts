import { NextRequest, NextResponse } from "next/server";
import { invalidateSessionToken } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
    const token = request.cookies.get("admin-session")?.value;
    invalidateSessionToken(token);

    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin-session");
    return response;
}
