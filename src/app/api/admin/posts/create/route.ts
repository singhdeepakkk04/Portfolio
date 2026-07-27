import { NextRequest, NextResponse } from "next/server";
import { createPost, type PostMetadata } from "@/lib/admin/file-operations";
import { isValidSessionToken } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!(await isValidSessionToken(session))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, metadata, content } = body as {
            slug: string;
            metadata: PostMetadata;
            content: string;
        };

        await createPost(slug, metadata, content);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

export const runtime = 'edge';

