"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, Home, Settings, Users2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const dashboardNav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/community", label: "Community", icon: Users2 },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCommunity = pathname?.startsWith("/community");

  return (
    <div className="min-h-screen bg-linen dark:bg-[#07140f] flex flex-col">
      {/* 1. Global Academy Main Header on all dashboard & community pages */}
      <SiteHeader />

      <div className="flex-1 flex">
        {/* 2. Desktop Sidebar (sits cleanly under SiteHeader) */}
        <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-72 border-r border-forest/10 bg-white/75 p-5 backdrop-blur-xl lg:flex flex-col justify-between dark:border-white/10 dark:bg-white/5 z-30 overflow-y-auto">
          <div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-forest/5 dark:bg-white/5 mb-5 border border-forest/10 dark:border-white/10">
              <p className="text-[10px] font-black uppercase tracking-wider text-leaf">Student Portal</p>
              <h2 className="font-black text-forest dark:text-cream text-base">My Learning</h2>
            </div>
            <nav className="grid gap-1.5">
              {dashboardNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                      isActive
                        ? "bg-forest text-cream shadow-sm dark:bg-white/15 dark:text-white"
                        : "text-ink/70 hover:bg-forest/5 dark:text-cream/70 dark:hover:bg-white/10"
                    )}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-forest/10 dark:border-white/10 text-[11px] text-ink/40 dark:text-cream/40">
            Charan Organics Academy LMS
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 lg:pl-72 w-full min-w-0">
          {/* Quick pill tabs on mobile for non-community dashboard pages */}
          {!isCommunity && (
            <div className="lg:hidden border-b border-forest/10 bg-linen/90 dark:border-white/10 dark:bg-[#07140f]/90 px-4 py-2.5 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 min-w-max">
                {dashboardNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap",
                        isActive
                          ? "bg-forest text-white dark:bg-leaf dark:text-forest shadow-xs"
                          : "bg-white/60 text-ink/70 dark:bg-white/5 dark:text-cream/70"
                      )}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Page content */}
          <div
            className={cn(
              isCommunity
                ? "p-0"
                : "px-3 py-4 sm:px-6 lg:px-8 sm:py-6 pb-24 sm:pb-28 lg:pb-8"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
