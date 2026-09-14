"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, BarChart3, QrCode, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { CreateLinkResponse } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import QrCodeModal from "../modals/QrCodeModal";

interface SuccessCardProps {
  result: CreateLinkResponse;
  onReset: () => void;
}

export default function SuccessCard({ result, onReset }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result.shortUrl);
      } else {
        throw new Error("Clipboard API not available");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = result.shortUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <>
      <div className="mt-6 bg-surface-card rounded-2xl shadow-md border border-border-subtle p-6 transition-all duration-300 animate-fade-in">
        <div className="flex flex-col gap-4">
          {/* Status and Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-success-emerald">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span className="text-sm font-bold text-text-charcoal">Your short link is ready</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-success-emerald border border-emerald-200 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
                Active
              </span>
              <span className="text-text-muted text-xs">• HTTP 301 Permanent</span>
            </div>
          </div>

          {/* Short Link Display Box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-canvas-bg rounded-xl border border-border-subtle">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg sm:text-xl font-bold text-primary-container tracking-tight truncate">
                  {result.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy Short Link"
                  className="p-1.5 text-text-muted hover:text-text-charcoal rounded-md hover:bg-slate-200/60 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success-emerald" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs text-text-muted truncate mt-1 flex items-center gap-1.5">
                <span className="text-text-slate font-bold select-none">↳</span>
                <span>Points to:</span>
                <a
                  href={result.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-slate hover:text-primary-container hover:underline truncate max-w-md inline-flex items-center gap-1 font-mono"
                >
                  <span>{result.originalUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied Link!" : "Copy Link"}</span>
              </button>

              <Link
                href={`/links/${result.shortCode}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-text-muted" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>

          {/* Quick Metadata Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-text-muted border-t border-border-subtle/60">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-text-slate" />
              <span>
                Expires:{" "}
                <strong className="text-text-charcoal font-medium">
                  {formatDate(result.expiresAt)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-text-slate" />
              <button
                onClick={() => setQrOpen(true)}
                className="text-primary-container hover:underline font-medium"
              >
                View QR Code
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-text-slate" />
              <span>
                SSL: <strong className="text-text-charcoal font-medium">Auto HTTPS</strong>
              </span>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={onReset}
                className="text-text-muted hover:text-text-charcoal font-medium transition-colors"
              >
                Shorten another URL →
              </button>
            </div>
          </div>
        </div>
      </div>

      <QrCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={result.shortUrl}
        shortCode={result.shortCode}
      />
    </>
  );
}
