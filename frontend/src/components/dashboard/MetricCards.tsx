import React from "react";
import { Link2, MousePointerClick, CheckCircle2, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface MetricCardsProps {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  expiringSoonLinks: number;
}

export default function MetricCards({
  totalLinks,
  totalClicks,
  activeLinks,
  expiringSoonLinks,
}: MetricCardsProps) {
  const activePercent =
    totalLinks > 0 ? ((activeLinks / totalLinks) * 100).toFixed(1) : "100";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Links */}
      <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">Total Links</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-primary-container">
            <Link2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-charcoal tracking-tight font-sans">
            {formatNumber(totalLinks)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-success-emerald font-semibold border border-emerald-200/60">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </span>
            <span className="text-text-muted">all routes</span>
          </div>
        </div>
      </div>

      {/* 2. Total Clicks */}
      <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">Total Clicks</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-secondary">
            <MousePointerClick className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-charcoal tracking-tight font-sans">
            {formatNumber(totalClicks)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-success-emerald font-semibold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              Real-time
            </span>
            <span className="text-text-muted">edge telemetry</span>
          </div>
        </div>
      </div>

      {/* 3. Active Links */}
      <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">Active Links</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-success-emerald">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-charcoal tracking-tight font-sans">
            {formatNumber(activeLinks)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="text-text-slate font-semibold">{activePercent}%</span>
            <span className="text-text-muted">routing rate</span>
          </div>
        </div>
      </div>

      {/* 4. Expiring Soon */}
      <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">Expiring Soon</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-warning-amber">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-text-charcoal tracking-tight font-sans">
            {formatNumber(expiringSoonLinks)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-warning-amber font-semibold border border-amber-200/60">
              Next 7 days
            </span>
            <span className="text-text-muted">auto HTTP 410</span>
          </div>
        </div>
      </div>
    </div>
  );
}
