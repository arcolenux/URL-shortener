"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps any page that requires authentication.
 * - While loading the auth state: renders a full-screen spinner.
 * - If unauthenticated: shows a locked-page prompt with Sign In / Sign Up links.
 * - If authenticated: renders children normally.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Soft redirect after the gate message renders
      const t = setTimeout(() => router.push("/login"), 3000);
      return () => clearTimeout(t);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-container opacity-60" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-primary-container" />
        </div>
        <h2 className="text-xl font-bold text-text-charcoal">Sign in to continue</h2>
        <p className="text-xs text-text-muted mt-2 max-w-xs leading-relaxed">
          This page is only accessible to signed-in users. You&apos;ll be redirected to the login
          page shortly.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Link
            href="/login"
            className="px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-lg transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
