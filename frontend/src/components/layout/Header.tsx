"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Bell,
  Menu,
  X,
  BarChart2,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Building,
  ChevronDown,
} from "lucide-react";
import CreateLinkModal from "../modals/CreateLinkModal";
import NotificationsDropdown, { useNotifications } from "./NotificationsDropdown";
import AccountSettingsModal from "../modals/AccountSettingsModal";
import AuthModal from "../modals/AuthModal";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Only show Dashboard / Links nav when signed in
  const authNavLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Links", href: "/links", icon: BarChart2 },
  ];

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-surface-card border-b border-border-subtle shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo & Brand */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Image src="/snipli-icon.svg" alt="Snipli Icon" width={24} height={24} className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-text-charcoal font-sans">
                Snipli
              </span>
            </Link>

            {/* Desktop Nav — only for authenticated users */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {authNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "text-text-charcoal font-semibold bg-canvas-bg border border-border-subtle shadow-xs"
                          : "text-text-muted hover:text-text-charcoal hover:bg-canvas-bg"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 relative">

            {isAuthenticated && user ? (
              <>
                {/* Create Link Button — auth only */}
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-hidden active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Link</span>
                </button>

                {/* Notifications Bell — auth only */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    aria-label="Notifications"
                    className="p-2 text-text-muted hover:text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors relative flex items-center justify-center"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-container rounded-full ring-2 ring-surface-card" />
                    )}
                  </button>

                  <NotificationsDropdown
                    isOpen={notifDropdownOpen}
                    onClose={() => setNotifDropdownOpen(false)}
                  />
                </div>

                <div className="h-5 w-px bg-border-subtle hidden sm:block" />

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-canvas-bg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-1 ring-border-subtle shadow-xs">
                      {initials}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-text-charcoal leading-none">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-text-muted leading-none mt-1">
                        {user.workspace}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden lg:block" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-12 z-50 w-64 bg-surface-card rounded-2xl shadow-xl border border-border-subtle overflow-hidden animate-fade-in">
                        <div className="p-3.5 border-b border-border-subtle bg-slate-50/50">
                          <p className="text-xs font-bold text-text-charcoal">{user.name}</p>
                          <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[11px] font-semibold text-primary-container">
                            <Building className="w-3 h-3" />
                            <span>{user.workspace}</span>
                          </div>
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setSettingsModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors text-left"
                          >
                            <Settings className="w-3.5 h-3.5 text-text-muted" />
                            <span>Account &amp; API Settings</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setAuthModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors text-left"
                          >
                            <User className="w-3.5 h-3.5 text-text-muted" />
                            <span>Switch Workspace</span>
                          </button>
                        </div>

                        <div className="p-1.5 border-t border-border-subtle bg-slate-50/30">
                          <button
                            onClick={() => {
                              logout();
                              setProfileDropdownOpen(false);
                              router.push("/");
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-danger-crimson hover:bg-red-50 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated — Sign In / Sign Up only */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-text-charcoal bg-surface-card border border-border-subtle hover:border-slate-400 hover:bg-slate-50 rounded-lg transition-all active:scale-[0.98] shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-primary-container hover:bg-blue-700 text-white rounded-lg transition-all active:scale-[0.98] shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-muted hover:text-text-charcoal md:hidden rounded-lg hover:bg-canvas-bg transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer — only shown when authenticated */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-border-subtle bg-surface-card px-4 py-3 space-y-1 shadow-lg animate-fade-in">
            {authNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "text-text-charcoal font-semibold bg-canvas-bg border border-border-subtle"
                      : "text-text-muted hover:text-text-charcoal hover:bg-canvas-bg"
                  }`}
                >
                  <Icon className="w-4 h-4 text-text-muted" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setCreateModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary-container hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Link</span>
            </button>
          </div>
        )}

        {/* Mobile Drawer — unauthenticated */}
        {mobileMenuOpen && !isAuthenticated && (
          <div className="md:hidden border-t border-border-subtle bg-surface-card px-4 py-3 space-y-1 shadow-lg animate-fade-in">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-sm font-medium text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-sm font-semibold text-primary-container hover:bg-blue-50 rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        )}
      </header>

      {/* Global Create Link Modal (auth only) */}
      {isAuthenticated && (
        <CreateLinkModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => setCreateModalOpen(false)}
        />
      )}

      {/* Account Settings Modal */}
      {user && (
        <AccountSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          user={user}
          onUpdateUser={updateUser}
        />
      )}

      {/* Switch Account Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={(loggedInUser) => updateUser(loggedInUser)}
      />
    </>
  );
}
