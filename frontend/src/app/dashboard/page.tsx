"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardResponse } from "@/lib/types";
import MetricCards from "@/components/dashboard/MetricCards";
import TrafficChart from "@/components/dashboard/TrafficChart";
import DeviceBreakdown from "@/components/dashboard/DeviceBreakdown";
import LinksTable from "@/components/links/LinksTable";
import { Skeleton } from "@/components/ui/Skeleton";
import CreateLinkModal from "@/components/modals/CreateLinkModal";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const periods = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] uppercase tracking-wider font-semibold mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-text-charcoal">Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-charcoal tracking-tight font-sans">
            Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-1">
            A quick overview of your links and real-time engagement telemetry
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-xl shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span>{selectedPeriod}</span>
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 z-30 mt-1 w-36 bg-surface-card rounded-xl border border-border-subtle shadow-lg p-1 animate-fade-in">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setPeriodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? "bg-blue-50 text-primary-container font-semibold"
                        : "text-text-charcoal hover:bg-canvas-bg"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Link</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-danger-rose flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1 font-semibold underline hover:text-rose-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        </div>
      ) : dashboard ? (
        <>
          {/* Metric Cards */}
          <MetricCards
            totalLinks={dashboard.totalLinks}
            totalClicks={dashboard.totalClicks}
            activeLinks={dashboard.activeLinks}
            expiringSoonLinks={dashboard.expiringSoonLinks}
          />

          {/* Traffic Chart */}
          <TrafficChart
            data={dashboard.clickTraffic}
            totalClicks={dashboard.totalClicks}
          />

          {/* Device and Infrastructure Breakdown */}
          <DeviceBreakdown />

          {/* Recent Links Table */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-text-charcoal font-sans">
                  Recent Short Links
                </h2>
                <p className="text-xs text-text-muted">
                  Latest shortened destinations and active routing status
                </p>
              </div>
              <Link
                href="/links"
                className="text-xs font-semibold text-primary-container hover:underline"
              >
                View all links →
              </Link>
            </div>

            <LinksTable limit={5} title="" subtitle="" />
          </div>
        </>
      ) : null}

      {/* Global Create Link Modal */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchDashboard();
        }}
      />
    </div>
  );
}
