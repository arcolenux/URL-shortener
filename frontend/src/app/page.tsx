import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, BarChart3, Terminal } from "lucide-react";
import CreateLinkForm from "@/components/create/CreateLinkForm";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Background Ambient Glow */}
      <div className="relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        
        {/* Core Shortening Form */}
        <CreateLinkForm />
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Feature 1 */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-blue-50 rounded-xl text-primary-container shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-charcoal font-sans">
              Lightning-fast redirects
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Sub-12ms cache-first resolution with Redis hot paths and Google Cloud Run auto-scaling compute.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-success-emerald shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-charcoal font-sans">
              99.99% Guaranteed SLA
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Google Cloud Firestore source of truth ensures durable links that never go dark.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-secondary shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-charcoal font-sans">
              Real-time click telemetry
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Durable asynchronous background queues via Google Cloud Tasks without blocking redirects.
            </p>
          </div>
        </div>
      </div>

      {/* Programmatic API Banner */}
      <div className="bg-surface-card rounded-2xl p-6 sm:p-8 border border-border-subtle shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary-container shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-charcoal">
              Building programmatic pipelines?
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Use the Snipli REST API or CI/CD integrations to generate secure short links on the fly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <code className="px-3.5 py-2 bg-canvas-bg rounded-xl font-mono text-xs text-text-slate border border-border-subtle hidden sm:block">
            curl -X POST https://api.snipli.io/api/v1/links -H &quot;X-Api-Key: $KEY&quot;
          </code>
          <Link
            href="/links"
            className="px-4 py-2 bg-surface-container hover:bg-slate-200/70 text-text-charcoal font-semibold text-xs rounded-xl transition-colors shrink-0"
          >
            Explore Links →
          </Link>
        </div>
      </div>
    </div>
  );
}
