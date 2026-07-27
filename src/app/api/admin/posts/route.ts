import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/admin/file-operations";
import { isValidSessionToken } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await getAllPosts();
    return NextResponse.json(posts);
}

export const runtime = 'edge';
