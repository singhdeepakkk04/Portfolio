import { NextRequest, NextResponse } from "next/server";
import { supabase, getServiceRoleClient } from "@/lib/supabase";
import { isValidSessionToken } from "@/lib/admin/auth";

// Public route to submit a recommendation
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { author_name, author_title, author_company, content, linkedin_url } = body;

        if (!author_name || !author_title || !content) {
            return NextResponse.json({ error: "Name, title and content are required" }, { status: 400 });
        }

        const adminClient = getServiceRoleClient();
        const { data, error } = await adminClient
            .from("recommendations")
            .insert([
                {
                    author_name,
                    author_title,
                    author_company: author_company || null,
                    content,
                    linkedin_url: linkedin_url || null,
                    approved: false, // Default to false until admin approves
                },
            ]);

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Failed to submit recommendation" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Admin route to get all recommendations (including unapproved)
export async function GET(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = getServiceRoleClient();
    const { data, error } = await adminClient
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }

    return NextResponse.json(data);
}

// Admin route to approve/reject recommendations
export async function PATCH(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, approved } = body;

        const adminClient = getServiceRoleClient();
        const { data, error } = await adminClient
            .from("recommendations")
            .update({ approved })
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: "Failed to update recommendation" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Admin route to delete a recommendation
export async function DELETE(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!isValidSessionToken(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const adminClient = getServiceRoleClient();
        const { error } = await adminClient.from("recommendations").delete().eq("id", id);

        if (error) {
            return NextResponse.json({ error: "Failed to delete recommendation" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export const runtime = 'edge';
