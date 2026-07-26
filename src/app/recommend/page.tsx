"use client";

import React, { useState } from "react";
import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;

export default function RecommendPage() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        author_name: "",
        author_title: "",
        author_company: "",
        content: "",
        linkedin_url: "",
    });
    const [linkedinError, setLinkedinError] = useState("");

    const validateLinkedinUrl = (url: string) => {
        if (!url) return true; // Optional field
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.hostname.includes("linkedin.com");
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.linkedin_url && !validateLinkedinUrl(formData.linkedin_url)) {
            setLinkedinError("Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/...)");
            return;
        }
        setLinkedinError("");
        setStatus("submitting");

        try {
            const res = await fetch("/api/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ author_name: "", author_title: "", author_company: "", content: "", linkedin_url: "" });
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        }
    };

    return (
        <main className="flex flex-col min-h-[100dvh] space-y-10 px-8 py-12 max-w-2xl mx-auto">
            <nav className="w-full flex justify-start mb-4">
                <Link href="/">
                    <Button variant="ghost" className="flex items-center gap-2 -ml-4 text-muted-foreground hover:text-foreground">
                        Visit site
                    </Button>
                </Link>
            </nav>

            <section id="recommendation-form">
                <BlurFade delay={BLUR_FADE_DELAY}>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none mb-4">
                        Write a Recommendation
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for taking the time to share your experience working with me. I deeply appreciate your support and insights!
                    </p>
                </BlurFade>

                <BlurFade delay={BLUR_FADE_DELAY * 2}>
                    {status === "success" ? (
                        <div className="p-8 border rounded-xl bg-primary/10 text-center space-y-4">
                            <h2 className="text-xl font-semibold">Thank You! 🎉</h2>
                            <p className="text-muted-foreground">Your recommendation has been submitted successfully.</p>
                            <Button variant="outline" onClick={() => setStatus("idle")}>
                                Write another
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none">
                                    Your Name
                                </label>
                                <input
                                    id="name"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="John Doe"
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium leading-none">
                                        Your Title
                                    </label>
                                    <input
                                        id="title"
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Senior Product Manager"
                                        value={formData.author_title}
                                        onChange={(e) => setFormData({ ...formData, author_title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="company" className="text-sm font-medium leading-none">
                                        Company <span className="text-muted-foreground font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        id="company"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="TechCorp"
                                        value={formData.author_company}
                                        onChange={(e) => setFormData({ ...formData, author_company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="linkedin" className="text-sm font-medium leading-none">
                                    LinkedIn Profile URL <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <input
                                    id="linkedin"
                                    type="url"
                                    className={`flex h-10 w-full rounded-md border ${linkedinError ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                                    placeholder="https://linkedin.com/in/johndoe"
                                    value={formData.linkedin_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, linkedin_url: e.target.value });
                                        if (linkedinError) setLinkedinError("");
                                    }}
                                />
                                {linkedinError && <p className="text-xs text-red-500 mt-1">{linkedinError}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="content" className="text-sm font-medium leading-none">
                                    Recommendation
                                </label>
                                <textarea
                                    id="content"
                                    required
                                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Deepak is an exceptional..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            {status === "error" && (
                                <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
                            )}
                            <Button type="submit" disabled={status === "submitting"} className="w-full">
                                {status === "submitting" ? "Submitting..." : "Submit Recommendation"}
                            </Button>
                        </form>
                    )}
                </BlurFade>
            </section>
        </main>
    );
}
