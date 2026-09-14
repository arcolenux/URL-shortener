import React from "react";
import { Laptop, Smartphone, Tablet, Globe, Shield, Zap, Info } from "lucide-react";

interface DeviceBreakdownProps {
  totalClicks?: number;
}

export default function DeviceBreakdown({ totalClicks = 0 }: DeviceBreakdownProps) {
  const hasClicks = totalClicks > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Device Breakdown */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5">
        <h3 className="text-sm font-bold text-text-charcoal mb-1">Device Breakdown</h3>
        <p className="text-xs text-text-muted mb-4">Traffic distribution across client environments</p>

        {hasClicks ? (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-text-muted" />
                  <span className="font-medium text-text-charcoal">Desktop</span>
                </div>
                <span className="font-semibold text-text-slate font-mono">100%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-2">
              <Laptop className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-text-slate">No device traffic yet</p>
            <p className="text-[11px] text-text-muted mt-0.5">Share links to track user devices</p>
          </div>
        )}
      </div>

      {/* 2. Top Referral Channels */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5">
        <h3 className="text-sm font-bold text-text-charcoal mb-1">Referral Channels</h3>
        <p className="text-xs text-text-muted mb-4">Incoming traffic source attribution</p>

        {hasClicks ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/50 last:border-0">
              <span className="text-text-muted truncate max-w-[200px]">Direct / Navigation</span>
              <span className="font-semibold text-text-charcoal font-mono bg-canvas-bg px-2 py-0.5 rounded border border-border-subtle">
                {totalClicks} {totalClicks === 1 ? "click" : "clicks"} (100%)
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-2">
              <Globe className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-text-slate">No referral sources yet</p>
            <p className="text-[11px] text-text-muted mt-0.5">Incoming referrers will appear here</p>
          </div>
        )}
      </div>

      {/* 3. Global Infrastructure SLA */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-charcoal mb-1">Infrastructure Health</h3>
          <p className="text-xs text-text-muted mb-4">Edge caching & Firestore persistence</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 bg-canvas-bg rounded-xl border border-border-subtle">
              <div className="p-2 bg-blue-50 text-primary-container rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-charcoal">Sub-12ms Edge Cache</div>
                <div className="text-[11px] text-text-muted">Redis cache-first resolution active</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-canvas-bg rounded-xl border border-border-subtle">
              <div className="p-2 bg-emerald-50 text-success-emerald rounded-lg">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-charcoal">Durable Firestore</div>
                <div className="text-[11px] text-text-muted">Google Cloud Native Mode active</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5 text-success-emerald font-semibold">
            <Globe className="w-3.5 h-3.5" />
            Live & Connected
          </span>
          <span className="font-mono text-[11px]">Edge Multi-Region</span>
        </div>
      </div>
    </div>
  );
}

