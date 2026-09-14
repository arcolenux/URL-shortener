"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("alex@snipli.io");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-canvas-bg">
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-xl border border-border-subtle p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-white mx-auto mb-4 shadow-md">
            <Image src="/snipli-icon.svg" alt="Snipli Icon" width={28} height={28} className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-text-charcoal tracking-tight">Welcome back</h1>
          <p className="text-xs text-text-muted mt-1">Sign in to your Snipli account and workspace</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-danger-crimson flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-charcoal">Password</label>
              <span className="text-[11px] text-text-muted">Demo: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? "Signing in..." : "Sign in to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary-container font-semibold hover:underline">
              Create a free workspace
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border-subtle/60 flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-success-emerald" />
          <span>Secured with JWT HMAC-SHA256 & BCrypt encryption</span>
        </div>
      </div>
    </div>
  );
}
