import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // TODO: Replace with a real database (Supabase, Firebase, etc.)
        // For now, just acknowledge the subscription
        console.log(`New subscriber: ${email}`);

        return NextResponse.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Subscribe error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
