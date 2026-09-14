"use client";

import React, { useState } from "react";
import { X, Link2, Sparkles, Check, Copy, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { CreateLinkResponse } from "@/lib/types";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newLink: CreateLinkResponse) => void;
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess }: CreateLinkModalProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreateLinkResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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
      setError("Please provide a destination URL.");
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

      setCreatedResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create short link";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!createdResult) return;
    try {
      await navigator.clipboard.writeText(createdResult.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleResetAndClose = () => {
    setUrl("");
    setAlias("");
    setExpiration("never");
    setError(null);
    setCreatedResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border-subtle relative">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-charcoal rounded-lg hover:bg-canvas-bg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {createdResult ? (
          <div className="flex flex-col items-center text-center py-2 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-success-emerald flex items-center justify-center mb-3">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-text-charcoal">Your Short Link is Live</h3>
            <p className="text-xs text-text-muted mt-1">
              Ready to redirect traffic with sub-12ms latency.
            </p>

            <div className="w-full my-5 p-3.5 bg-canvas-bg border border-border-subtle rounded-xl flex items-center justify-between gap-3">
              <span className="text-base font-bold text-primary-container font-mono truncate">
                {createdResult.shortUrl}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setCreatedResult(null);
                  setUrl("");
                  setAlias("");
                }}
                className="flex-1 py-2.5 bg-canvas-bg hover:bg-slate-200/60 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-lg transition-all"
              >
                Create Another
              </button>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary-container flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-charcoal">Create a Short Link</h3>
                <p className="text-xs text-text-muted">Generate a permanent or scheduled short URL</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-danger-rose flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Destination URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-slate flex items-center justify-between">
                <span>Destination URL</span>
                <span className="text-[11px] text-primary-container font-normal">Required</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/your-long-campaign-link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-10 px-3.5 bg-canvas-bg font-sans text-xs text-text-charcoal rounded-lg border border-border-subtle focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
              />
            </div>

            {/* Custom Alias */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-slate flex items-center justify-between">
                <span>Custom Alias</span>
                <span className="text-[11px] text-text-muted font-normal">Optional (7-char random default)</span>
              </label>
              <div className="flex h-10 rounded-lg overflow-hidden bg-canvas-bg border border-border-subtle focus-within:ring-2 focus-within:ring-primary-container/20 focus-within:border-primary-container transition-all">
                <span className="inline-flex items-center px-3 bg-slate-100 font-mono text-xs text-text-muted border-r border-border-subtle select-none">
                  snipli.io/
                </span>
                <input
                  type="text"
                  placeholder="launch-2026"
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
                <span className="text-[11px] text-text-muted font-normal">Auto HTTP 410 Gone</span>
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

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle mt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 bg-canvas-bg hover:bg-slate-200/60 text-text-slate text-xs font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>{loading ? "Generating..." : "Create Short Link"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
