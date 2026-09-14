import React from "react";
import LinkDetailsView from "@/components/links/LinkDetailsView";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function LinkDetailsPage({ params }: PageProps) {
  const { code } = await params;
  return <LinkDetailsView code={code} />;
}
