import React from "react";
import { Laptop, Smartphone, Tablet, Globe, Shield, Zap } from "lucide-react";

export default function DeviceBreakdown() {
  const devices = [
    { name: "Desktop", icon: Laptop, percent: 64, count: "64%" },
    { name: "Mobile", icon: Smartphone, percent: 30, count: "30%" },
    { name: "Tablet", icon: Tablet, percent: 6, count: "6%" },
  ];

  const referrers = [
    { source: "Direct / Navigational", percent: 48, share: "48%" },
    { source: "GitHub & Developer Portals", percent: 28, share: "28%" },
    { source: "Social (X, LinkedIn)", percent: 14, share: "14%" },
    { source: "Internal Team Slack", percent: 10, share: "10%" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Device Breakdown */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5">
        <h3 className="text-sm font-bold text-text-charcoal mb-1">Device Breakdown</h3>
        <p className="text-xs text-text-muted mb-4">Traffic distribution across client environments</p>

        <div className="space-y-3.5">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <div key={device.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-text-muted" />
                    <span className="font-medium text-text-charcoal">{device.name}</span>
                  </div>
                  <span className="font-semibold text-text-slate font-mono">{device.count}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-container rounded-full transition-all duration-500"
                    style={{ width: `${device.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Referral Channels */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5">
        <h3 className="text-sm font-bold text-text-charcoal mb-1">Referral Channels</h3>
        <p className="text-xs text-text-muted mb-4">Incoming traffic source attribution</p>

        <div className="space-y-3">
          {referrers.map((ref) => (
            <div key={ref.source} className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/50 last:border-0">
              <span className="text-text-muted truncate max-w-[200px]">{ref.source}</span>
              <span className="font-semibold text-text-charcoal font-mono bg-canvas-bg px-2 py-0.5 rounded border border-border-subtle">
                {ref.share}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Global Infrastructure SLA */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-charcoal mb-1">Infrastructure Health</h3>
          <p className="text-xs text-text-muted mb-4">Edge caching & Cloud Tasks telemetry</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 bg-canvas-bg rounded-xl border border-border-subtle">
              <div className="p-2 bg-blue-50 text-primary-container rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-charcoal">Sub-12ms Edge Redirects</div>
                <div className="text-[11px] text-text-muted">Redis cache-first resolution</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-canvas-bg rounded-xl border border-border-subtle">
              <div className="p-2 bg-emerald-50 text-success-emerald rounded-lg">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-charcoal">Durable Analytics</div>
                <div className="text-[11px] text-text-muted">Asynchronous Google Cloud Tasks</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5 text-success-emerald font-semibold">
            <Globe className="w-3.5 h-3.5" />
            100% Edge Availability
          </span>
          <span className="font-mono text-[11px]">us-central1</span>
        </div>
      </div>
    </div>
  );
}
