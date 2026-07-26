"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BlurFade from "@/components/magicui/blur-fade";
import {
    FileEdit,
    Trash2,
    Plus,
    LogOut,
    CheckCircle,
    XCircle,
    Eye,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    TrendingUp,
    BarChart3,
    Link as LinkIcon,
} from "lucide-react";

type Post = {
    slug: string;
    metadata: {
        title: string;
        publishedAt: string;
        category: string;
        status?: "draft" | "published";
    };
};

type Recommendation = {
    id: string;
    author_name: string;
    author_title: string;
    author_company?: string;
    content: string;
    linkedin_url?: string;
    approved: boolean;
    created_at: string;
};

type AnalyticsRow = {
    id: string;
    path: string;
    referrer: string;
    country: string;
    device_type: string;
    browser: string;
    screen_resolution: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    created_at: string;
};

type AnalyticsStats = {
    totalViews: number;
    uniqueCountries: number;
    topPages: { path: string; count: number }[];
    deviceCounts: Record<string, number>;
    topBrowsers: { browser: string; count: number }[];
    topReferrers: { referrer: string; count: number }[];
    topCampaigns: { campaign: string; count: number }[];
    dailyViews: { date: string; count: number }[];
    topCountries: { country: string; count: number }[];
};

function StatCard({
    title,
    value,
    icon: Icon,
    subtitle,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subtitle?: string;
}) {
    return (
        <div className="p-6 rounded-xl border bg-card hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
    );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function DeviceIcon({ type }: { type: string }) {
    switch (type) {
        case "mobile":
            return <Smartphone className="size-4" />;
        case "tablet":
            return <Tablet className="size-4" />;
        default:
            return <Monitor className="size-4" />;
    }
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"blogs" | "recommendations" | "analytics">("recommendations");

    // Blogs State
    const [posts, setPosts] = useState<Post[]>([]);

    // Recommendations State
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

    // Analytics State
    const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
    const [stats, setStats] = useState<AnalyticsStats>({
        totalViews: 0,
        uniqueCountries: 0,
        topPages: [],
        deviceCounts: {},
        topBrowsers: [],
        topReferrers: [],
        topCampaigns: [],
        dailyViews: [],
        topCountries: [],
    });

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "blogs") {
                const res = await fetch("/api/admin/posts");
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : []);
            } else if (activeTab === "recommendations") {
                const res = await fetch("/api/recommendations");
                if (res.ok) {
                    const data = await res.json();
                    setRecommendations(Array.isArray(data) ? data : []);
                } else {
                    setRecommendations([]);
                }
            } else if (activeTab === "analytics") {
                const res = await fetch("/api/admin/analytics");
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data?.rows && Array.isArray(data.rows) ? data.rows : []);
                    setStats(
                        data?.stats || {
                            totalViews: 0,
                            uniqueCountries: 0,
                            topPages: [],
                            deviceCounts: {},
                            topBrowsers: [],
                            topReferrers: [],
                            topCampaigns: [],
                            dailyViews: [],
                            topCountries: [],
                        }
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (slug: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const handleSetApproval = async (id: string, approved: boolean) => {
        try {
            await fetch("/api/recommendations", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, approved }),
            });
            fetchData();
        } catch (error) {
            console.error("Failed to update recommendation:", error);
        }
    };

    const handleDeleteRecommendation = async (id: string) => {
        if (!confirm("Are you sure you want to delete this recommendation?")) return;
        try {
            await fetch(`/api/recommendations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Failed to delete recommendation:", error);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const maxDailyView = Math.max(...(stats.dailyViews?.map((d) => d.count) || [1]), 1);

    return (
        <div className="min-h-screen bg-background px-8 py-12">
            <div className="mx-auto w-full max-w-6xl">
                <BlurFade delay={0.1}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-2">Manage your site content and analytics</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/" target="_blank">
                                <button className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors">
                                    View Site
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors flex items-center gap-2"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </BlurFade>

                <BlurFade delay={0.2}>
                    <div className="flex gap-4 mb-8 border-b pb-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("recommendations")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === "recommendations" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Recommendations
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === "analytics" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab("blogs")}
                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === "blogs" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Blogs
                        </button>
                    </div>
                </BlurFade>

                {loading ? (
                    <div className="text-center text-muted-foreground py-12">Loading data...</div>
                ) : (
                    <div className="space-y-4">
                        {/* ═══ RECOMMENDATIONS TAB ═══ */}
                        {activeTab === "recommendations" && (
                            <div className="space-y-4">
                                {recommendations.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-12">No recommendations yet.</div>
                                ) : (
                                    recommendations.map((rec, idx) => (
                                        <BlurFade key={rec.id} delay={0.3 + idx * 0.05}>
                                            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 pr-4">
                                                        <h3 className="text-xl font-semibold">{rec.author_name}</h3>
                                                        <p className="text-sm text-primary mb-3 flex items-center gap-2">
                                                            {rec.author_title}
                                                            {rec.author_company && ` at ${rec.author_company}`}
                                                            {rec.linkedin_url && (
                                                                <a
                                                                    href={rec.linkedin_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    (LinkedIn)
                                                                </a>
                                                            )}
                                                        </p>
                                                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                                            {rec.content}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-3">
                                                            {new Date(rec.created_at).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span
                                                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                                                                rec.approved
                                                                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                            }`}
                                                        >
                                                            {rec.approved ? (
                                                                <CheckCircle className="size-4" />
                                                            ) : (
                                                                <XCircle className="size-4" />
                                                            )}
                                                            {rec.approved ? "Approved" : "Needs Approval"}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {rec.approved ? (
                                                                <button
                                                                    onClick={() => handleSetApproval(rec.id, false)}
                                                                    className="px-3 py-2 rounded-lg border border-input hover:bg-accent transition-colors text-sm"
                                                                >
                                                                    Reject
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleSetApproval(rec.id, true)}
                                                                    className="px-3 py-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteRecommendation(rec.id)}
                                                                className="p-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </BlurFade>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ═══ ANALYTICS TAB ═══ */}
                        {activeTab === "analytics" && (
                            <div className="space-y-6">
                                {/* Overview Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <StatCard title="Total Page Views" value={stats.totalViews} icon={Eye} />
                                    <StatCard
                                        title="Countries"
                                        value={stats.uniqueCountries}
                                        icon={Globe}
                                        subtitle="Unique visitor countries"
                                    />
                                    <StatCard
                                        title="Top Page"
                                        value={stats.topPages?.[0]?.path || "/"}
                                        icon={TrendingUp}
                                        subtitle={`${stats.topPages?.[0]?.count || 0} views`}
                                    />
                                </div>

                                {/* Daily Views Chart */}
                                {stats.dailyViews?.length > 0 && (
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <BarChart3 className="size-5" />
                                            Views — Last 7 Days
                                        </h3>
                                        <div className="flex items-end gap-2 h-40">
                                            {stats.dailyViews.map((day) => {
                                                const pct = maxDailyView > 0 ? (day.count / maxDailyView) * 100 : 0;
                                                return (
                                                    <div
                                                        key={day.date}
                                                        className="flex-1 flex flex-col items-center gap-1"
                                                    >
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {day.count}
                                                        </span>
                                                        <div className="w-full bg-muted/30 rounded-t-md overflow-hidden flex-1 flex items-end">
                                                            <div
                                                                className="w-full bg-primary/80 rounded-t-md transition-all duration-700"
                                                                style={{
                                                                    height: `${Math.max(pct, 4)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(day.date).toLocaleDateString("en", {
                                                                weekday: "short",
                                                            })}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Two-column grid for breakdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Device Breakdown */}
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            Devices
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(stats.deviceCounts || {})
                                                .filter(([, count]) => count > 0)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([device, count]) => (
                                                    <div key={device} className="flex items-center gap-3">
                                                        <DeviceIcon type={device} />
                                                        <span className="text-sm capitalize flex-1">{device}</span>
                                                        <span className="text-sm font-medium">{count}</span>
                                                        <div className="w-24">
                                                            <MiniBar
                                                                value={count}
                                                                max={stats.totalViews}
                                                                color="bg-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    {/* Browser Breakdown */}
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            Browsers
                                        </h3>
                                        <div className="space-y-3">
                                            {(stats.topBrowsers || []).map((b) => (
                                                <div key={b.browser} className="flex items-center gap-3">
                                                    <span className="text-sm flex-1">{b.browser}</span>
                                                    <span className="text-sm font-medium">{b.count}</span>
                                                    <div className="w-24">
                                                        <MiniBar
                                                            value={b.count}
                                                            max={stats.totalViews}
                                                            color="bg-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {(!stats.topBrowsers || stats.topBrowsers.length === 0) && (
                                                <p className="text-sm text-muted-foreground">No data yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Countries */}
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            Top Countries
                                        </h3>
                                        <div className="space-y-3">
                                            {(stats.topCountries || []).map((c) => (
                                                <div key={c.country} className="flex items-center gap-3">
                                                    <Globe className="size-4 text-muted-foreground" />
                                                    <span className="text-sm flex-1">{c.country}</span>
                                                    <span className="text-sm font-medium">{c.count}</span>
                                                    <div className="w-24">
                                                        <MiniBar
                                                            value={c.count}
                                                            max={stats.totalViews}
                                                            color="bg-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {(!stats.topCountries || stats.topCountries.length === 0) && (
                                                <p className="text-sm text-muted-foreground">No data yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Referrers */}
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            Top Referrers
                                        </h3>
                                        <div className="space-y-3">
                                            {(stats.topReferrers || []).map((r) => (
                                                <div key={r.referrer} className="flex items-center gap-3">
                                                    <LinkIcon className="size-4 text-muted-foreground" />
                                                    <span className="text-sm flex-1 truncate">{r.referrer}</span>
                                                    <span className="text-sm font-medium">{r.count}</span>
                                                    <div className="w-24">
                                                        <MiniBar
                                                            value={r.count}
                                                            max={stats.totalViews}
                                                            color="bg-orange-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {(!stats.topReferrers || stats.topReferrers.length === 0) && (
                                                <p className="text-sm text-muted-foreground">No referrer data yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* UTM Campaigns */}
                                {stats.topCampaigns && stats.topCampaigns.length > 0 && (
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            UTM Campaigns
                                        </h3>
                                        <div className="space-y-3">
                                            {stats.topCampaigns.map((c) => (
                                                <div key={c.campaign} className="flex items-center gap-3">
                                                    <TrendingUp className="size-4 text-muted-foreground" />
                                                    <span className="text-sm flex-1 truncate">{c.campaign}</span>
                                                    <span className="text-sm font-medium">{c.count}</span>
                                                    <div className="w-24">
                                                        <MiniBar
                                                            value={c.count}
                                                            max={stats.totalViews}
                                                            color="bg-pink-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Pages */}
                                {stats.topPages && stats.topPages.length > 0 && (
                                    <div className="p-6 rounded-xl border bg-card">
                                        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                                            Top Pages
                                        </h3>
                                        <div className="space-y-3">
                                            {stats.topPages.map((p) => (
                                                <div key={p.path} className="flex items-center gap-3">
                                                    <Eye className="size-4 text-muted-foreground" />
                                                    <span className="text-sm flex-1 font-mono">{p.path}</span>
                                                    <span className="text-sm font-medium">{p.count} views</span>
                                                    <div className="w-24">
                                                        <MiniBar
                                                            value={p.count}
                                                            max={stats.totalViews}
                                                            color="bg-cyan-500"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Visitors Table */}
                                <div className="p-6 rounded-xl border bg-card">
                                    <h3 className="text-lg font-semibold mb-4">Recent Visitors</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-lg">Time</th>
                                                    <th className="px-4 py-3">Page</th>
                                                    <th className="px-4 py-3">Device</th>
                                                    <th className="px-4 py-3">Browser</th>
                                                    <th className="px-4 py-3">Country</th>
                                                    <th className="px-4 py-3 rounded-tr-lg">Referrer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.slice(0, 25).map((row) => (
                                                    <tr key={row.id} className="border-b last:border-0">
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                            {new Date(row.created_at).toLocaleString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs">{row.path}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center gap-1 text-xs capitalize">
                                                                <DeviceIcon type={row.device_type} />
                                                                {row.device_type || "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs">{row.browser || "-"}</td>
                                                        <td className="px-4 py-3 text-xs">{row.country || "-"}</td>
                                                        <td className="px-4 py-3 truncate max-w-[150px] text-xs">
                                                            {row.referrer || "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ BLOGS TAB ═══ */}
                        {activeTab === "blogs" && (
                            <div className="space-y-4">
                                <Link href="/admin/editor">
                                    <button className="w-full mb-6 px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium">
                                        <Plus className="size-5" />
                                        Create New Post
                                    </button>
                                </Link>
                                {posts.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-12">
                                        No posts yet. Create your first post!
                                    </div>
                                ) : (
                                    posts.map((post, idx) => (
                                        <BlurFade key={post.slug} delay={0.3 + idx * 0.05}>
                                            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold">
                                                            {post.metadata.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span>{post.metadata.publishedAt}</span>
                                                            <span>&bull;</span>
                                                            <span>{post.metadata.category}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={`/admin/editor/${post.slug}`}>
                                                            <button className="p-2 rounded-lg border border-input hover:bg-accent transition-colors">
                                                                <FileEdit className="size-4" />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeletePost(post.slug)}
                                                            className="p-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </BlurFade>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
