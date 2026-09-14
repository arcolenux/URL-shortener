"use client";

import React, { useState } from "react";
import { X, Copy, Check, Download, QrCode } from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  shortCode: string;
}

export default function QrCodeModal({ isOpen, onClose, shortUrl, shortCode }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate a high-contrast QR code URL using a public zero-tracking standard service or SVG
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    shortUrl
  )}&margin=10`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `snipli-${shortCode}-qr.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border-subtle relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-charcoal rounded-lg hover:bg-canvas-bg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary-container flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-charcoal">QR Code for Short Link</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs truncate font-mono">
            {shortUrl}
          </p>

          <div className="my-5 p-4 bg-white border border-border-subtle rounded-xl shadow-xs flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt={`QR Code for ${shortUrl}`}
              className="w-48 h-48 rounded-lg object-contain"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleCopyUrl}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-canvas-bg hover:bg-slate-200/70 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied URL!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
