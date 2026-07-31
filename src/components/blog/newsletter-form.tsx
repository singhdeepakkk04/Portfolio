"use client";

import { useState } from "react";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            // Store subscriber email, to be connected to a DB later
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Stay in the loop
            </h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Get notified when a new article drops. No spam, only signal.
            </p>

            {status === "success" ? (
                <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-4">
                    <p className="text-white font-medium">🎉 You&apos;re subscribed! We&apos;ll keep you posted.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-white text-slate-900 font-semibold rounded-lg px-6 py-3 text-sm hover:bg-white/90 transition-colors shrink-0"
                    >
                        Subscribe
                    </button>
                </form>
            )}

            {status === "error" && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
            )}

            <p className="text-xs text-slate-500">
                We respect your privacy. Unsubscribe at any time.
            </p>
        </div>
    );
}
