"use client";

import { useEffect } from "react";

export default function ApiWarmup() {
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api", { method: "GET", signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);
  return null;
}
