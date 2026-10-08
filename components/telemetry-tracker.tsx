"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getGeoFromTimezone(): { code: string; name: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Colombo")) {
      return { code: "IN", name: "India" };
    }
    if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles") || tz.includes("Denver")) {
      return { code: "US", name: "United States" };
    }
    if (tz.includes("London")) {
      return { code: "GB", name: "United Kingdom" };
    }
    if (tz.includes("Dubai")) {
      return { code: "AE", name: "United Arab Emirates" };
    }
    if (tz.includes("Toronto") || tz.includes("Vancouver")) {
      return { code: "CA", name: "Canada" };
    }
    if (tz.includes("Sydney") || tz.includes("Melbourne")) {
      return { code: "AU", name: "Australia" };
    }
    if (tz.includes("Singapore")) {
      return { code: "SG", name: "Singapore" };
    }
    if (tz.includes("Berlin") || tz.includes("Frankfurt")) {
      return { code: "DE", name: "Germany" };
    }
    return { code: "IN", name: "India" };
  } catch {
    return { code: "IN", name: "India" };
  }
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "anon";
  let vid = localStorage.getItem("charan_lms_vid");
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("charan_lms_vid", vid);
  }
  return vid;
}

export function TelemetryTracker() {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    // Don't track admin internal routes
    if (pathname.startsWith("/admin")) return;

    const vid = getVisitorId();
    const geo = getGeoFromTimezone();
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    fetch("/api/telemetry/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: vid,
        path: pathname,
        referrer,
        countryCode: geo.code,
        countryName: geo.name,
        sessionDurationSeconds: 15,
      }),
    }).catch(() => {});

    startRef.current = Date.now();
  }, [pathname]);

  return null;
}
