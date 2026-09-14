"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, TrendingUp, AlertTriangle, Sparkles, Clock, Trash2, X } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "trend" | "warning" | "feature" | "system";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Traffic Spike Alert",
    message: "Your most recent link reached 1,420 total clicks (+45% today).",
    time: "10m ago",
    type: "trend",
    read: false,
  },
  {
    id: "notif-2",
    title: "Expiration Warning",
    message: "One of your links is set to expire in 3 days.",
    time: "2h ago",
    type: "warning",
    read: false,
  },
  {
    id: "notif-3",
    title: "New Feature Available",
    message: "High-resolution SVG & PNG QR code export is now enabled for all links.",
    time: "1d ago",
    type: "feature",
    read: true,
  },
  {
    id: "notif-4",
    title: "Cloud Tasks Queue Healthy",
    message: "10,000 asynchronous click events processed with zero lag.",
    time: "2d ago",
    type: "system",
    read: true,
  },
];

// Singleton store so Header badge and dropdown share the same state
let _globalNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
const _listeners: Array<(n: NotificationItem[]) => void> = [];

function subscribeNotifications(cb: (n: NotificationItem[]) => void) {
  _listeners.push(cb);
  return () => {
    const idx = _listeners.indexOf(cb);
    if (idx >= 0) _listeners.splice(idx, 1);
  };
}

function updateNotifications(next: NotificationItem[]) {
  _globalNotifications = next;
  _listeners.forEach((cb) => cb(next));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(_globalNotifications);

  React.useEffect(() => {
    setNotifications(_globalNotifications);
    return subscribeNotifications(setNotifications);
  }, []);

  const markAllAsRead = () => updateNotifications(notifications.map((n) => ({ ...n, read: true })));
  const clearAll = () => updateNotifications([]);
  const markOneAsRead = (id: string) =>
    updateNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return { notifications, markAllAsRead, clearAll, markOneAsRead };
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { notifications, markAllAsRead, clearAll, markOneAsRead } = useNotifications();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "feature":
        return <Sparkles className="w-4 h-4 text-primary-container" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "trend":
        return "bg-emerald-50 border-emerald-200/60";
      case "warning":
        return "bg-amber-50 border-amber-200/60";
      case "feature":
        return "bg-blue-50 border-blue-200/60";
      default:
        return "bg-slate-50 border-slate-200/60";
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-surface-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-charcoal">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-primary-container">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all read"
                className="text-xs text-text-muted hover:text-primary-container font-medium transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Read all</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-charcoal p-1 rounded-md hover:bg-canvas-bg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border-subtle/60">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No new notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markOneAsRead(n.id)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                  !n.read ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getBg(
                    n.type
                  )}`}
                >
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-semibold ${!n.read ? "text-text-charcoal" : "text-text-slate"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary-container mt-1.5 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2.5 bg-canvas-bg border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
            <span className="text-[11px] text-text-slate">Real-time telemetry alerts</span>
            <button
              onClick={clearAll}
              className="text-text-muted hover:text-danger-crimson flex items-center gap-1 transition-colors text-[11px] font-medium"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
