"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Zap, ChevronDown, AlertCircle, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { CreateLinkResponse } from "@/lib/types";
import SuccessCard from "./SuccessCard";

export default function CreateLinkForm() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<CreateLinkResponse | null>(null);

  const calculateExpiresAt = (option: string): string | null => {
    if (option === "never") return null;
    const now = new Date();
    if (option === "1d") now.setDate(now.getDate() + 1);
    else if (option === "7d") now.setDate(now.getDate() + 7);
    else if (option === "30d") now.setDate(now.getDate() + 30);
    return now.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please paste a destination URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expiresAt = calculateExpiresAt(expiration);
      const res = await api.createLink({
        url: url.trim(),
        alias: alias.trim() ? alias.trim() : undefined,
        expiresAt,
      });

      setSuccessResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to shorten link";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setAlias("");
    setExpiration("never");
    setError(null);
    setSuccessResult(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero Headings */}
      <div className="flex flex-col items-center text-center pt-6 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface-container rounded-full text-text-muted text-xs font-mono mb-4 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-success-emerald animate-pulse"></span>
          <span>v2.4 Engine • Sub-12ms Edge Redirects</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-charcoal tracking-tight font-sans max-w-2xl leading-tight">
          Short links. <span className="text-primary-container">Clear analytics.</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted mt-3 max-w-lg font-sans">
          Create clean, memorable links in seconds and track visitor engagement with production-grade telemetry.
        </p>
      </div>

      {/* Main Shortening Card */}
      <div className="bg-surface-card rounded-2xl shadow-md border border-border-subtle p-6 sm:p-8 transition-all">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-danger-rose flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Long URL Input Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                placeholder="Paste your long URL (e.g. https://github.com/company/repo)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-canvas-bg font-sans text-sm text-text-charcoal rounded-xl border border-border-subtle placeholder:text-text-muted transition-all focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-primary-container hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-white" />
              )}
              <span>{loading ? "Shortening..." : "Create Short Link"}</span>
            </button>
          </div>

          {/* Advanced Drawer Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-charcoal font-medium transition-colors"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  advancedOpen ? "rotate-180 text-primary-container" : ""
                }`}
              />
              <span>Advanced targeting & custom alias options</span>
            </button>

            {/* Advanced Options Drawer */}
            {advancedOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 mt-2 border-t border-border-subtle/70 animate-fade-in">
                {/* Custom Alias */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-slate flex items-center justify-between">
                    <span>Custom Alias</span>
                    <span className="text-[11px] text-text-muted font-normal">Optional</span>
                  </label>
                  <div className="flex h-10 rounded-lg overflow-hidden bg-canvas-bg border border-border-subtle focus-within:ring-2 focus-within:ring-primary-container/20 focus-within:border-primary-container transition-all">
                    <span className="inline-flex items-center px-3 bg-slate-100 font-mono text-xs text-text-muted border-r border-border-subtle select-none">
                      snipli.io/
                    </span>
                    <input
                      type="text"
                      placeholder="custom-alias"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="w-full px-3 font-mono text-xs text-text-charcoal bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-slate flex items-center justify-between">
                    <span>Link Expiration</span>
                    <span className="text-[11px] text-text-muted font-normal">Auto-deprecate</span>
                  </label>
                  <select
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className="w-full h-10 px-3 bg-canvas-bg font-sans text-xs text-text-charcoal rounded-lg border border-border-subtle focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container cursor-pointer transition-all"
                  >
                    <option value="never">Never (Permanent redirect)</option>
                    <option value="1d">1 Day</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Success Result Component */}
      {successResult && <SuccessCard result={successResult} onReset={handleReset} />}
    </div>
  );
}
