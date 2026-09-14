"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  BarChart2,
  Plus,
  QrCode,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { Link as LinkType } from "@/lib/types";
import { api } from "@/lib/api";
import { formatDate, truncateUrl, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import QrCodeModal from "../modals/QrCodeModal";
import CreateLinkModal from "../modals/CreateLinkModal";

interface LinksTableProps {
  initialLinks?: LinkType[];
  showPagination?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function LinksTable({
  limit,
  title = "Links",
  subtitle = "Manage and monitor your shortened URLs.",
}: LinksTableProps) {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listLinks(search, statusFilter, page, limit || 10);
      setLinks(res.links);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load links";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCopy = async (code: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete short link /${code}?`)) return;
    try {
      await api.deleteLink(code);
      fetchLinks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  const filterTabs = [
    { id: "all", label: "All Links" },
    { id: "active", label: "Active" },
    { id: "expiring_soon", label: "Expiring Soon" },
    { id: "expired", label: "Expired" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-charcoal tracking-tight font-sans">
            {title}
          </h1>
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Link</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by short code or destination..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full h-9 pl-9 pr-3.5 bg-canvas-bg font-sans text-xs text-text-charcoal rounded-lg border border-border-subtle focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-primary-container text-white font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text-charcoal hover:bg-canvas-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-danger-rose flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchLinks}
            className="font-semibold underline hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48 hidden sm:block" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="py-14 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-text-muted flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-charcoal">No short links found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs">
              {search
                ? `No links matched "${search}". Try clearing your search.`
                : "Create your first short URL to start redirecting and recording click analytics."}
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Link</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-bg/70 border-b border-border-subtle text-text-muted font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Short Link</th>
                  <th className="py-3 px-4">Destination URL</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/70">
                {links.map((link) => {
                  const isCopied = copiedCode === link.shortCode;
                  return (
                    <tr
                      key={link.shortCode}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Short Link */}
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-container">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/links/${link.shortCode}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>/{link.shortCode}</span>
                          </Link>
                          <button
                            onClick={() => handleCopy(link.shortCode, link.shortUrl)}
                            title="Copy Short URL"
                            className="p-1 text-text-muted hover:text-text-charcoal rounded hover:bg-slate-200/60 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-success-emerald" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Destination URL */}
                      <td className="py-3.5 px-4 font-mono text-text-slate max-w-xs truncate">
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary-container hover:underline inline-flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{truncateUrl(link.originalUrl, 38)}</span>
                          <ExternalLink className="w-3 h-3 text-text-muted shrink-0" />
                        </a>
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-4 text-center font-bold text-text-charcoal font-mono">
                        {formatNumber(link.totalClicks)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            link.status === "ACTIVE"
                              ? "active"
                              : link.status === "EXPIRING_SOON"
                              ? "expiring_soon"
                              : "expired"
                          }
                        >
                          {link.status === "ACTIVE"
                            ? "Active"
                            : link.status === "EXPIRING_SOON"
                            ? "Expiring Soon"
                            : "Expired"}
                        </Badge>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-text-muted">
                        {formatDate(link.createdAt)}
                      </td>

                      {/* Expires */}
                      <td className="py-3.5 px-4 text-text-muted">
                        {formatDate(link.expiresAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setQrModalLink({
                                url: link.shortUrl,
                                code: link.shortCode,
                              })
                            }
                            title="QR Code"
                            className="p-1.5 text-text-muted hover:text-text-charcoal rounded-md hover:bg-slate-200/60 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/links/${link.shortCode}`}
                            title="View Analytics"
                            className="p-1.5 text-text-muted hover:text-text-charcoal rounded-md hover:bg-slate-200/60 transition-colors"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(link.shortCode)}
                            title="Delete Link"
                            className="p-1.5 text-text-muted hover:text-danger-rose rounded-md hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-canvas-bg/60 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
            <span>
              Showing {links.length} of {totalElements} total links
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 bg-surface-card border border-border-subtle rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors font-medium"
              >
                Previous
              </button>
              <span className="font-mono">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 bg-surface-card border border-border-subtle rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModalLink && (
        <QrCodeModal
          isOpen={true}
          onClose={() => setQrModalLink(null)}
          shortUrl={qrModalLink.url}
          shortCode={qrModalLink.code}
        />
      )}

      {/* Create Link Modal */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchLinks();
        }}
      />
    </div>
  );
}
