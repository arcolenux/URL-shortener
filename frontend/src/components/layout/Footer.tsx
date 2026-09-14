import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-card border-t border-border-subtle py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Image src="/snipli-icon.svg" alt="Snipli" width={18} height={18} className="w-4.5 h-4.5" />
          <span className="font-semibold text-text-charcoal text-sm">Snipli</span>
          <span className="text-border-muted">•</span>
          <span>© {new Date().getFullYear()} High-velocity link infrastructure & telemetry.</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-1.5 text-success-emerald font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
            All Systems Operational
          </span>
          <Link href="/dashboard" className="hover:text-text-charcoal transition-colors">
            Telemetry
          </Link>
          <Link href="/links" className="hover:text-text-charcoal transition-colors">
            API Docs
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-text-charcoal transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
