"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route transition finishes, complete the bar and hide
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept internal anchor clicks
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchors, hash, downloads, target="_blank", or modifier clicks
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if clicking current URL or hash link on current page (e.g. /#free-classes or /dashboard#access-requests)
      try {
        const url = new URL(href, window.location.origin);
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          // Same page navigation (or hash anchor jump) - do not show page load spinner
          return;
        }
      } catch {
        if (href.startsWith("#") || href.includes("#")) return;
      }

      // Start loading
      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 150);
      const t2 = setTimeout(() => setProgress(85), 500);

      // Safety timeout so it doesn't get stuck forever
      const t3 = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 8000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-leaf to-amber-400 shadow-[0_0_12px_rgba(46,125,50,0.8)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating round buffering badge on top right */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none flex items-center gap-2 rounded-full bg-black/80 backdrop-blur-md px-3 py-1.5 shadow-2xl border border-white/20 text-white animate-in fade-in duration-150">
        <div className="size-3.5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
        <span className="text-[11px] font-bold tracking-wide">Loading…</span>
      </div>
    </>
  );
}
