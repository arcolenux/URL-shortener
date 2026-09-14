"use client";

import React from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shortCode: string;
  loading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  shortCode,
  loading = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border-subtle animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-charcoal rounded-lg hover:bg-canvas-bg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-danger-crimson flex items-center justify-center mb-3 border border-rose-200/60">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-text-charcoal">Delete Short Link?</h3>
          <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-text-charcoal font-mono font-semibold">/{shortCode}</strong>?
            Any incoming traffic will receive an HTTP 404/410 status.
          </p>

          <div className="flex items-center gap-2.5 w-full mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3.5 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="flex-1 py-2 px-3.5 bg-danger-crimson hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
