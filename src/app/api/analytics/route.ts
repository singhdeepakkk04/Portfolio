import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            path,
            referrer,
            user_agent,
            screen_resolution,
            device_type,
            browser,
            utm_source,
            utm_medium,
            utm_campaign,
        } = body;

        // Try to get country from Cloudflare or Vercel headers
        const country =
            request.headers.get("cf-ipcountry") ||
            request.headers.get("x-vercel-ip-country") ||
            "Unknown";

        if (!path) {
            return NextResponse.json({ error: "Path is required" }, { status: 400 });
        }

        const adminClient = getServiceRoleClient();
        const { error } = await adminClient.from("analytics").insert([
            {
                path,
                referrer: referrer || "",
                country,
                user_agent: user_agent || "",
                screen_resolution: screen_resolution || "",
                device_type: device_type || "unknown",
                browser: browser || "unknown",
                utm_source: utm_source || "",
                utm_medium: utm_medium || "",
                utm_campaign: utm_campaign || "",
            },
        ]);

        if (error) {
            console.error("Analytics error:", error);
            return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
