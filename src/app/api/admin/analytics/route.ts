import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase";
import { isValidSessionToken } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
    const session = request.cookies.get("admin-session")?.value;
    if (!(await isValidSessionToken(session))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = getServiceRoleClient();

    // Fetch last 500 rows for comprehensive stats
    const { data: rows, error } = await adminClient
        .from("analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error) {
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    const allRows = rows || [];

    // ── Total Views ──
    const totalViews = allRows.length;

    // ── Unique Countries ──
    const countryCounts: Record<string, number> = {};
    allRows.forEach((r) => {
        const c = r.country || "Unknown";
        countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const uniqueCountries = Object.keys(countryCounts).length;

    // ── Top Pages ──
    const pathCounts: Record<string, number> = {};
    allRows.forEach((r) => {
        pathCounts[r.path] = (pathCounts[r.path] || 0) + 1;
    });
    const topPages = Object.entries(pathCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }));

    // ── Device Breakdown ──
    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    allRows.forEach((r) => {
        const d = r.device_type || "unknown";
        deviceCounts[d] = (deviceCounts[d] || 0) + 1;
    });

    // ── Browser Breakdown ──
    const browserCounts: Record<string, number> = {};
    allRows.forEach((r) => {
        const b = r.browser || "Unknown";
        browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const topBrowsers = Object.entries(browserCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([browser, count]) => ({ browser, count }));

    // ── Top Referrers ──
    const referrerCounts: Record<string, number> = {};
    allRows.forEach((r) => {
        if (r.referrer) {
            try {
                const hostname = new URL(r.referrer).hostname;
                referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
            } catch {
                referrerCounts[r.referrer] = (referrerCounts[r.referrer] || 0) + 1;
            }
        }
    });
    const topReferrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([referrer, count]) => ({ referrer, count }));

    // ── UTM Campaign Performance ──
    const utmCounts: Record<string, number> = {};
    allRows.forEach((r) => {
        if (r.utm_source) {
            const label = [r.utm_source, r.utm_medium, r.utm_campaign]
                .filter(Boolean)
                .join(" / ");
            utmCounts[label] = (utmCounts[label] || 0) + 1;
        }
    });
    const topCampaigns = Object.entries(utmCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([campaign, count]) => ({ campaign, count }));

    // ── Views per Day (last 7 days) ──
    const now = new Date();
    const dailyViews: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const count = allRows.filter(
            (r) => r.created_at && r.created_at.startsWith(dateStr)
        ).length;
        dailyViews.push({ date: dateStr, count });
    }

    // ── Country breakdown ──
    const topCountries = Object.entries(countryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

    return NextResponse.json({
        rows: allRows.slice(0, 100), // Only send 100 rows for the table
        stats: {
            totalViews,
            uniqueCountries,
            topPages,
            deviceCounts,
            topBrowsers,
            topReferrers,
            topCampaigns,
            dailyViews,
            topCountries,
        },
    });
}

