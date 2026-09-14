"use client";

import React, { useState } from "react";
import {
  X,
  Key,
  Globe,
  Building,
  BellRing,
  Copy,
  Check,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    workspace: string;
    apiKey: string;
  };
  onUpdateUser: (updated: { name: string; workspace: string; apiKey: string }) => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "api" | "domain" | "security">("workspace");
  const [workspaceName, setWorkspaceName] = useState(user.workspace);
  const [userName, setUserName] = useState(user.name);
  const [customDomain, setCustomDomain] = useState("links.mybrand.io");
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = "snip_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    onUpdateUser({ name: userName, workspace: workspaceName, apiKey: newKey });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name: userName, workspace: workspaceName, apiKey: user.apiKey });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-card rounded-2xl shadow-2xl border border-border-subtle w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-primary-container font-semibold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-charcoal">Workspace & Account Settings</h3>
              <p className="text-xs text-text-muted">Manage your team profile, API access, and custom domains</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-charcoal p-1.5 rounded-lg hover:bg-canvas-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle px-6 bg-canvas-bg/50 gap-2 overflow-x-auto">
          {[
            { id: "workspace", label: "General & Workspace", icon: Building },
            { id: "api", label: "API Keys", icon: Key },
            { id: "domain", label: "Custom Domains", icon: Globe },
            { id: "security", label: "Notifications & Security", icon: BellRing },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary-container text-primary-container font-bold"
                    : "border-transparent text-text-muted hover:text-text-charcoal"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-success-emerald font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              Settings updated successfully!
            </div>
          )}

          {activeTab === "workspace" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
                  Workspace Team Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-border-subtle rounded-xl text-text-muted cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1">
                  Production Secret API Key
                </label>
                <p className="text-xs text-text-muted mb-3">
                  Use this key in the <code className="font-mono text-primary-container">X-API-Key</code> header for backend REST calls.
                </p>
                <div className="flex items-center gap-2 p-2.5 bg-canvas-bg rounded-xl border border-border-subtle font-mono text-xs text-text-charcoal">
                  <span className="flex-1 truncate select-all">{user.apiKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg text-text-muted hover:text-text-charcoal transition-colors"
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-success-emerald" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Regenerating will revoke the previous key.</span>
                </div>
                <button
                  onClick={handleRegenerateKey}
                  className="px-3.5 py-1.5 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Key</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "domain" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-charcoal mb-1">
                  Custom Branded Short Domain
                </label>
                <p className="text-xs text-text-muted mb-3">
                  Point your CNAME record to <code className="font-mono text-primary-container">cname.snipli.io</code> to use your custom domain for redirects.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="links.yourbrand.com"
                    className="flex-1 px-3.5 py-2 text-sm bg-canvas-bg border border-border-subtle rounded-xl text-text-charcoal focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-success-emerald border border-emerald-200">
                    DNS Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4 text-xs text-text-charcoal">
              <div className="flex items-center justify-between p-3.5 bg-canvas-bg rounded-xl border border-border-subtle">
                <div>
                  <p className="font-semibold text-text-charcoal">Email click spike notifications</p>
                  <p className="text-text-muted text-[11px] mt-0.5">Receive alerts when any link gets over 1,000 clicks/hour</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-container rounded" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-canvas-bg rounded-xl border border-border-subtle">
                <div>
                  <p className="font-semibold text-text-charcoal">Link expiration warnings</p>
                  <p className="text-text-muted text-[11px] mt-0.5">Alert 3 days before a scheduled link expiry</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-container rounded" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-canvas-bg border-t border-border-subtle flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-card hover:bg-slate-100 border border-border-subtle text-text-charcoal text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
