"use client";

import React from "react";
import LinksTable from "@/components/links/LinksTable";
import AuthGuard from "@/components/auth/AuthGuard";

export default function LinksPage() {
  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LinksTable />
      </div>
    </AuthGuard>
  );
}
