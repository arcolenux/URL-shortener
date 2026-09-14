import React from "react";
import LinkDetailsView from "@/components/links/LinkDetailsView";
import AuthGuard from "@/components/auth/AuthGuard";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function LinkDetailsPage({ params }: PageProps) {
  const { code } = await params;
  return (
    <AuthGuard>
      <LinkDetailsView code={code} />
    </AuthGuard>
  );
}
