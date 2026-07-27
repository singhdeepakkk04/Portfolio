import { NextRequest, NextResponse } from "next/server";
import { markdownToHTML } from "@/data/blog";

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const { content } = await request.json();
        const html = await markdownToHTML(content);
        return NextResponse.json({ html });
    } catch (error) {
        console.error("Error rendering markdown:", error);
        return NextResponse.json({ error: "Failed to render" }, { status: 500 });
    }
}
