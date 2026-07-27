"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MDXEditor from "@/components/admin/mdx-editor";
import PreviewPanel from "@/components/admin/preview-panel";
import CoverImageUpload from "@/components/admin/cover-image-upload";
import { Save, Eye, Send, ArrowLeft, Layout, Calendar, Tag } from "lucide-react";
import type { PostMetadata } from "@/lib/admin/file-operations";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Engineering",
    "Data Engineering",
    "Product Management",
    "SQL & Databases",
    "PySpark & Big Data",
    "Tech Decoded",
] as const;

export default function EditPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();

    const [metadata, setMetadata] = useState<PostMetadata>({
        title: "",
        publishedAt: new Date().toISOString().split("T")[0],
        summary: "",
        tags: [],
        category: "Engineering",
        featured: false,
        status: "draft",
        image: "",
    });
    const [content, setContent] = useState("");
    const [newTag, setNewTag] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false); // Default to editor view

    useEffect(() => {
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/admin/posts/${slug}`);
            const data = await res.json();
            setMetadata({
                ...data.metadata,
                tags: data.metadata.tags || [],
            });
            setContent(data.content);
        } catch (error) {
            console.error("Failed to fetch post:", error);
            alert("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (status?: "draft" | "published") => {
        if (!metadata.title || !content) {
            alert("Please fill in title and content");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/posts/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    metadata: { ...metadata, status: status || metadata.status },
                    content,
                }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to save post");
            }
        } catch (error) {
            alert("Error saving post");
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        if (newTag && !metadata.tags.includes(newTag)) {
            setMetadata({ ...metadata, tags: [...metadata.tags, newTag] });
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setMetadata({
            ...metadata,
            tags: metadata.tags.filter((t) => t !== tag),
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading post...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="size-4" />
                        </Link>
                        <h1 className="font-semibold text-lg">Edit Post</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-2",
                                showPreview ? "bg-accent border-accent text-accent-foreground" : "border-transparent hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Eye className="size-4" />
                            Preview
                        </button>
                        <div className="h-6 w-px bg-border mx-2" />
                        <button
                            onClick={() => handleSave("draft")}
                            disabled={saving}
                            className="px-3 py-1.5 text-sm rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        >
                            <Save className="size-4" />
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSave("published")}
                            disabled={saving}
                            className="px-3 py-1.5 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-2 font-medium"
                        >
                            <Send className="size-4" />
                            Publish
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 h-[calc(100vh-3.5rem)]">
                {/* Editor Column */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    <div className="space-y-4 flex-shrink-0">
                        <input
                            type="text"
                            value={metadata.title}
                            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                            className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground/50 p-0"
                            placeholder="Post Title..."
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Summary</label>
                            <textarea
                                value={metadata.summary}
                                onChange={(e) => setMetadata({ ...metadata, summary: e.target.value })}
                                className="w-full text-lg bg-transparent border-none resize-none focus:ring-0 placeholder:text-muted-foreground/50 p-0 min-h-[60px]"
                                placeholder="Write a brief summary for your post..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex-1 border rounded-lg overflow-hidden bg-background shadow-sm">
                        {showPreview ? (
                            <PreviewPanel content={content} />
                        ) : (
                            <MDXEditor value={content} onChange={setContent} />
                        )}
                    </div>
                </div>

                {/* Settings Column */}
                <div className="space-y-6 overflow-y-auto pr-2 pb-6">
                    <div className="space-y-6">
                        {/* Cover Image */}
                        <div className="space-y-3">
                            <CoverImageUpload
                                url={metadata.image}
                                onUpload={(url) => setMetadata({ ...metadata, image: url })}
                                onRemove={() => setMetadata({ ...metadata, image: undefined })}
                            />
                        </div>

                        <div className="h-px bg-border" />

                        {/* Organization */}
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Layout className="size-4" />
                                Organization
                            </h3>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Category</label>
                                    <select
                                        value={metadata.category}
                                        onChange={(e) => setMetadata({ ...metadata, category: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Slug</label>
                                    <input
                                        type="text"
                                        value={slug}
                                        disabled
                                        className="w-full px-3 py-2 rounded-md border bg-muted text-muted-foreground text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Publishing */}
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Calendar className="size-4" />
                                Publishing
                            </h3>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Date</label>
                                    <input
                                        type="date"
                                        value={metadata.publishedAt}
                                        onChange={(e) => setMetadata({ ...metadata, publishedAt: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={metadata.featured}
                                        onChange={(e) => setMetadata({ ...metadata, featured: e.target.checked })}
                                        className="rounded border-input text-primary focus:ring-primary size-4"
                                    />
                                    <span className="text-sm group-hover:text-foreground transition-colors">Featured Post</span>
                                </label>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Tags */}
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Tag className="size-4" />
                                Tags
                            </h3>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {(metadata.tags || []).map((tag) => (
                                        <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs flex items-center gap-1">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-destructive">×</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                                    placeholder="Add tag + Enter"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export const runtime = 'edge';
