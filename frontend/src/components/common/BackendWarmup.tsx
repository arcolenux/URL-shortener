"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

export default function BackendWarmup() {
  useEffect(() => {
    // Proactively warm up backend container (e.g. Render cold start) as soon as visitor arrives
    api.pingWarmup();
  }, []);

  return null;
}
