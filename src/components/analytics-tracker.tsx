"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getDeviceType(): string {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
    return "desktop";
}

function getBrowserName(): string {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("SamsungBrowser")) return "Samsung Internet";
    if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Other";
}

export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch("/api/analytics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        path: pathname,
                        referrer: document.referrer || "",
                        user_agent: navigator.userAgent,
                        screen_resolution: `${window.screen.width}x${window.screen.height}`,
                        device_type: getDeviceType(),
                        browser: getBrowserName(),
                        utm_source: searchParams.get("utm_source") || "",
                        utm_medium: searchParams.get("utm_medium") || "",
                        utm_campaign: searchParams.get("utm_campaign") || "",
                    }),
                });
            } catch (error) {
                // Silently fail: analytics should never break the user experience
            }
        };

        trackView();
    }, [pathname, searchParams]);

    return null;
}
