"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Bell,
  Menu,
  X,
  Link as LinkIcon,
  BarChart2,
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Building,
  ChevronDown,
  LogIn,
} from "lucide-react";
import CreateLinkModal from "../modals/CreateLinkModal";
import NotificationsDropdown from "./NotificationsDropdown";
import AccountSettingsModal from "../modals/AccountSettingsModal";
import AuthModal from "../modals/AuthModal";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/", icon: LinkIcon },
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
    : "GU";

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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
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
          </div>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-3 relative">
            {/* Create Link Button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-container hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Link</span>
            </button>

            {/* Notifications Bell */}
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
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-container rounded-full ring-2 ring-surface-card"></span>
              </button>

              <NotificationsDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
              />
            </div>

            <div className="h-5 w-px bg-border-subtle hidden sm:block"></div>

            {/* User Profile / Auth Actions */}
            {isAuthenticated && user ? (
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

                {/* Profile Dropdown Menu */}
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
                          <span>Account & API Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setAuthModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors text-left"
                        >
                          <User className="w-3.5 h-3.5 text-text-muted" />
                          <span>Switch User / Workspace</span>
                        </button>
                      </div>

                      <div className="p-1.5 border-t border-border-subtle bg-slate-50/30">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
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
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-text-charcoal hover:bg-canvas-bg rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-primary-container hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs"
                >
                  Sign Up
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface-card px-4 py-3 space-y-1 shadow-lg animate-fade-in">
            {navLinks.map((link) => {
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
          </div>
        )}
      </header>

      {/* Global Create Link Modal */}
      <CreateLinkModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
        }}
      />

      {/* Account Settings Modal */}
      {user && (
        <AccountSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          user={user}
          onUpdateUser={(updated) => {
            updateUser(updated);
          }}
        />
      )}

      {/* Auth & Switch Account Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={(loggedInUser) => {
          updateUser(loggedInUser);
        }}
      />
    </>
  );
}
