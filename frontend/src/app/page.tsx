import React from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Link as LinkIcon,
  MousePointerClick,
  Clock,
  QrCode,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Ambient glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center pt-8 pb-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-surface-container rounded-full text-text-muted text-xs font-mono shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-success-emerald animate-pulse" />
          <span>v2.4 Engine · Sub-12ms Edge Redirects · Zero Blocking</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-text-charcoal tracking-tight font-sans max-w-3xl leading-tight">
          Short links.{" "}
          <span className="text-primary-container">Clear analytics.</span>
        </h1>

        <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
          Create clean, memorable short URLs in seconds. Track every click with
          production-grade real-time telemetry — free forever.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-card border border-border-subtle hover:border-slate-400 hover:bg-slate-50 text-text-charcoal text-sm font-semibold rounded-xl transition-all active:scale-[0.98] shadow-2xs"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Social proof strip */}
        <p className="text-xs text-text-muted mt-1">
          No credit card required · Free account · Cancel anytime
        </p>
      </section>

      {/* ── Feature grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: <Zap className="w-5 h-5" />,
            color: "bg-blue-50 text-primary-container",
            title: "Lightning-fast redirects",
            desc: "Sub-12ms cache-first resolution via Redis hot paths and Google Cloud Run auto-scaling compute.",
          },
          {
            icon: <ShieldCheck className="w-5 h-5" />,
            color: "bg-emerald-50 text-success-emerald",
            title: "99.99% SLA guaranteed",
            desc: "Google Cloud Firestore as the source of truth — your links never go dark.",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            color: "bg-indigo-50 text-indigo-600",
            title: "Real-time click telemetry",
            desc: "Async background queues via Google Cloud Tasks track every click without blocking redirects.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${f.color}`}>{f.icon}</div>
            <div>
              <h3 className="text-sm font-bold text-text-charcoal">{f.title}</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── What you get ── */}
      <section className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-text-charcoal">
            Everything you need to manage links
          </h2>
          <p className="text-sm text-text-muted mt-2">
            One dashboard. Full control. Zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <LinkIcon className="w-5 h-5 text-primary-container" />,
              title: "Custom aliases",
              desc: "Brand your links — snipli.io/your-campaign instead of random codes.",
            },
            {
              icon: <MousePointerClick className="w-5 h-5 text-success-emerald" />,
              title: "Click analytics",
              desc: "Per-link click counts, device breakdown, and 7-day traffic charts.",
            },
            {
              icon: <Clock className="w-5 h-5 text-warning-amber" />,
              title: "Link expiration",
              desc: "Set links to auto-expire after 1, 7, or 30 days with HTTP 410 Gone.",
            },
            {
              icon: <QrCode className="w-5 h-5 text-indigo-500" />,
              title: "QR code export",
              desc: "Download high-resolution PNG & SVG QR codes for any short link.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-canvas-bg border border-border-subtle flex items-center justify-center">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-text-charcoal">{item.title}</p>
              <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Ready to start shortening?
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Create your free account in under 30 seconds.
          </p>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-primary-container text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-sm shrink-0"
        >
          <span>Create Free Account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
