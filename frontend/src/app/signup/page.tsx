"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, User, Building, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signup(name, email, password, workspace);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Failed to register account");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
          <h1 className="text-2xl font-bold text-text-charcoal tracking-tight">Create your workspace</h1>
          <p className="text-xs text-text-muted mt-1">Start creating high-velocity short links with instant analytics</p>
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
              Full name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
              Work email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
              Workspace / Team name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="Acme Growth Team"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
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
              <span>{loading ? "Creating account..." : "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-container font-semibold hover:underline">
              Sign in here
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border-subtle/60 flex items-center justify-center gap-2 text-[11px] text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-success-emerald" />
          <span>Includes free unlimited short links, QR codes & analytics</span>
        </div>
      </div>
    </div>
  );
}
