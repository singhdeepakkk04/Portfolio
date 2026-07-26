"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlurFade from "@/components/magicui/blur-fade";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { ShieldCheck, KeyRound, Smartphone, Eye, EyeOff } from "lucide-react";

type LoginStep = "credentials" | "totp_setup" | "totp_verify";

export default function AdminLoginPage() {
    const [step, setStep] = useState<LoginStep>("credentials");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [totpCode, setTotpCode] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [manualKey, setManualKey] = useState("");
    const [tempToken, setTempToken] = useState("");
    const [setupToken, setSetupToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: "credentials", username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid credentials");
                return;
            }

            if (data.next_step === "totp_verify") {
                setTempToken(data.temp_token);
                setStep("totp_verify");
            } else if (data.next_step === "totp_setup") {
                setQrCode(data.qr_code);
                setManualKey(data.manual_key);
                setSetupToken(data.setup_token);
                setStep("totp_setup");
            } else if (data.authenticated) {
                router.push("/admin");
            }
        } catch (err) {
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTOTPVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    step: "totp_verify",
                    totp_code: totpCode,
                    temp_token: tempToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid code");
                setTotpCode("");
                return;
            }

            if (data.authenticated) {
                router.push("/admin");
            }
        } catch (err) {
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTOTPSetupConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    step: "totp_setup_confirm",
                    totp_code: totpCode,
                    setup_token: setupToken,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Invalid code");
                setTotpCode("");
                return;
            }

            if (data.authenticated) {
                setSuccessMessage(data.message || "2FA set up successfully!");
                setTimeout(() => router.push("/admin"), 1500);
            }
        } catch (err) {
            setError("Setup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

            <BlurFade delay={0.1}>
                <div className="w-full max-w-md space-y-8 p-8 relative">
                    {/* ─── STEP 1: Credentials ─── */}
                    {step === "credentials" && (
                        <BlurFade delay={0.15}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
                                    <KeyRound className="size-8 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight">Admin Access</h1>
                                <p className="mt-2 text-muted-foreground text-sm">
                                    Enter your credentials to continue
                                </p>
                            </div>

                            <form onSubmit={handleCredentials} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="username" className="text-sm font-medium leading-none">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium leading-none">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-sm text-destructive text-center bg-destructive/10 py-2 px-4 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <ShimmerButton
                                    type="submit"
                                    className="w-full"
                                    background="hsl(var(--foreground))"
                                    shimmerColor="hsl(var(--background))"
                                    disabled={loading}
                                >
                                    <span className="text-background font-medium">
                                        {loading ? "Verifying..." : "Continue"}
                                    </span>
                                </ShimmerButton>
                            </form>
                        </BlurFade>
                    )}

                    {/* ─── STEP 2A: TOTP Setup (First Time) ─── */}
                    {step === "totp_setup" && (
                        <BlurFade delay={0.15}>
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-green-500/10 mb-4">
                                    <Smartphone className="size-8 text-green-500" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">Set Up 2FA</h1>
                                <p className="mt-2 text-muted-foreground text-sm">
                                    Scan this QR code with Google Authenticator
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-6">
                                {/* QR Code */}
                                <div className="p-4 bg-white rounded-2xl shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrCode} alt="QR Code for Google Authenticator" className="size-48" />
                                </div>

                                {/* Manual Key */}
                                <div className="w-full">
                                    <p className="text-xs text-muted-foreground text-center mb-2">
                                        Or enter this key manually:
                                    </p>
                                    <div className="bg-muted/50 rounded-xl px-4 py-3 text-center font-mono text-sm tracking-widest break-all select-all border border-border">
                                        {manualKey}
                                    </div>
                                </div>

                                {/* Verification */}
                                <form onSubmit={handleTOTPSetupConfirm} className="w-full space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="setup-code" className="text-sm font-medium leading-none">
                                            Enter the 6-digit code to confirm setup
                                        </label>
                                        <input
                                            id="setup-code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            required
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="000000"
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-sm text-destructive text-center bg-destructive/10 py-2 px-4 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="text-sm text-green-600 text-center bg-green-500/10 py-2 px-4 rounded-lg">
                                            {successMessage}
                                        </div>
                                    )}

                                    <ShimmerButton
                                        type="submit"
                                        className="w-full"
                                        background="hsl(var(--foreground))"
                                        shimmerColor="hsl(var(--background))"
                                        disabled={loading || totpCode.length !== 6}
                                    >
                                        <span className="text-background font-medium">
                                            {loading ? "Verifying..." : "Activate 2FA & Login"}
                                        </span>
                                    </ShimmerButton>
                                </form>
                            </div>
                        </BlurFade>
                    )}

                    {/* ─── STEP 2B: TOTP Verify (Returning User) ─── */}
                    {step === "totp_verify" && (
                        <BlurFade delay={0.15}>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
                                    <ShieldCheck className="size-8 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h1>
                                <p className="mt-2 text-muted-foreground text-sm">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            <form onSubmit={handleTOTPVerify} className="space-y-5">
                                <div className="space-y-2">
                                    <input
                                        id="totp-code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        value={totpCode}
                                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                                        className="w-full px-4 py-4 rounded-xl border border-input bg-background text-foreground text-center text-3xl font-mono tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        placeholder="000000"
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-destructive text-center bg-destructive/10 py-2 px-4 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <ShimmerButton
                                    type="submit"
                                    className="w-full"
                                    background="hsl(var(--foreground))"
                                    shimmerColor="hsl(var(--background))"
                                    disabled={loading || totpCode.length !== 6}
                                >
                                    <span className="text-background font-medium">
                                        {loading ? "Verifying..." : "Verify & Login"}
                                    </span>
                                </ShimmerButton>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("credentials");
                                        setTotpCode("");
                                        setError("");
                                    }}
                                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                                >
                                    ← Back to login
                                </button>
                            </form>
                        </BlurFade>
                    )}
                </div>
            </BlurFade>
        </div>
    );
}
