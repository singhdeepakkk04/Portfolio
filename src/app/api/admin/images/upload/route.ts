import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/admin/file-operations";
import { isValidSessionToken } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Default slug if not known (or could pass it in query/body)
        const url = await uploadImage("uploads", file);

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

export const runtime = 'edge';
