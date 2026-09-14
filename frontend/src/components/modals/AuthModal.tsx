"use client";

import React, { useState } from "react";
import { X, Lock, Mail, UserCheck, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string; workspace: string; apiKey: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("alex@snipli.io");
  const [name, setName] = useState("Alex Rivera");
  const [workspace, setWorkspace] = useState("Pro Workspace");
  const [password, setPassword] = useState("password123");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      name: name || "Demo User",
      email: email || "user@snipli.io",
      workspace: workspace || "Production Workspace",
      apiKey: "snip_live_" + Math.random().toString(36).substring(2, 12),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card rounded-2xl shadow-2xl border border-border-subtle w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-charcoal">
                {isSignUp ? "Create Workspace Account" : "Sign In to Snipli"}
              </h3>
              <p className="text-xs text-text-muted">Access your personalized links & analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-charcoal p-1 rounded-lg hover:bg-canvas-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1">
                  Workspace / Company Name
                </label>
                <input
                  type="text"
                  required
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="e.g. Acme Marketing"
                  className="w-full px-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-charcoal mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{isSignUp ? "Create Free Account" : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-text-muted">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-primary-container font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-primary-container font-semibold hover:underline"
                >
                  Create one
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
