import { NextRequest, NextResponse } from "next/server";
import { getPost, updatePost, deletePost } from "@/lib/admin/file-operations";
import { isValidSessionToken } from "@/lib/admin/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const post = await getPost(params.slug);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { metadata, content } = body;

        await updatePost(params.slug, metadata, content);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await deletePost(params.slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
