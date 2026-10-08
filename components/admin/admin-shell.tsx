"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award, BarChart3, BookOpen, CreditCard, FileText, Globe, Home,
  MessageSquare, PlayCircle, ReceiptText, ShieldAlert, Users, Users2, Youtube,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import { NotificationsPopover } from "@/components/notifications-popover";
import { cn } from "@/lib/utils";

const logoUrl = "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

// 1. Core LMS Business & Project Objects (Top Priority)
const mainNav = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: ReceiptText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/admin/community", label: "Community", icon: Users2 },
  { href: "/admin/free-classes", label: "Free Classes", icon: Youtube },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
];

// 2. System Utilities, Analytics & Logs (Bottom Tools Section)
const systemNav = [
  { href: "/admin/traffic", label: "Web Traffic", icon: Globe },
  { href: "/admin/analytics", label: "Video Analytics", icon: PlayCircle },
  { href: "/admin/logs", label: "System Logs", icon: ShieldAlert },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f7f1] dark:bg-[#07140f]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-forest/10 bg-white xl:flex flex-col dark:border-white/10 dark:bg-[#0c1f17] overflow-hidden">
        {/* Sidebar top — brand logo */}
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-forest/8 dark:border-white/8">
          <BrandLogo href="/admin" />
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Operations Section */}
          <div>
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-forest/40 dark:text-cream/40 mb-2">
              Main Operations
            </p>
            <nav className="grid gap-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all",
                      isActive
                        ? "bg-forest text-white shadow-sm dark:bg-emerald-600"
                        : "text-ink/70 hover:bg-linen hover:text-forest dark:text-cream/70 dark:hover:bg-white/10 dark:hover:text-cream"
                    )}
                  >
                    <item.icon size={17} className={isActive ? "text-white" : "text-forest/70 dark:text-emerald-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* System & Tools Section */}
          <div className="pt-2 border-t border-forest/10 dark:border-white/10">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-forest/40 dark:text-cream/40 mb-2">
              System & Analytics Tools
            </p>
            <nav className="grid gap-1">
              {systemNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all",
                      isActive
                        ? "bg-forest text-white shadow-sm dark:bg-emerald-600"
                        : "text-ink/70 hover:bg-linen hover:text-forest dark:text-cream/70 dark:hover:bg-white/10 dark:hover:text-cream"
                    )}
                  >
                    <item.icon size={17} className={isActive ? "text-white" : "text-amber-600/70 dark:text-amber-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Admin Profile Card (bottom of sidebar) ── */}
        <div className="shrink-0 border-t border-forest/10 dark:border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-forest/5 dark:bg-white/5 px-4 py-3">
            {/* Logo as avatar */}
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-forest/10 dark:bg-white/10 border-2 border-forest/20 dark:border-white/20 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt="Admin"
                width={36}
                height={36}
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-forest dark:text-cream truncate flex items-center gap-1">
                <ShieldCheck size={11} className="text-leaf shrink-0" />
                Administrator
              </p>
              <p className="text-[10px] font-semibold text-ink/50 dark:text-cream/50 truncate">
                Charan Organics Academy
              </p>
            </div>
            <LogoutButton iconOnly />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="xl:pl-72">
        {/* Top Header — logo on left, actions on right */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-forest/10 bg-[#f4f7f1]/90 px-4 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#07140f]/90">
          {/* Brand logo (visible on mobile; on desktop sidebar already shows it) */}
          <div className="flex items-center gap-3 xl:hidden">
            <BrandLogo href="/admin" compact />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay leading-none">Secure Panel</p>
              <p className="font-black text-forest dark:text-cream text-sm leading-tight">Admin Dashboard</p>
            </div>
          </div>

          {/* On desktop — show page breadcrumb */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-full bg-forest/10 dark:bg-white/10">
              <ShieldCheck size={16} className="text-forest dark:text-leaf" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-clay leading-none">Secure Admin</p>
              <p className="font-black text-forest dark:text-cream text-sm leading-tight">Charan LMS Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsPopover />
            <Link
              href="/"
              className="rounded-full bg-forest px-3 sm:px-4 py-2 text-xs font-bold text-white hover:bg-moss transition shadow-sm"
            >
              View site
            </Link>
            <div className="hidden sm:block">
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar (Top 5 Core Items) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-1 border-t border-forest/10 bg-white/95 px-2 py-2 backdrop-blur-xl xl:hidden dark:border-white/10 dark:bg-forest/95">
        {mainNav.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-semibold transition",
                isActive ? "text-leaf font-bold" : "text-forest/70 dark:text-cream/70"
              )}
            >
              <item.icon size={18} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
