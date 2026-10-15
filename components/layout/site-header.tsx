"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Home, Menu, Moon, Search, ShieldCheck, Sun, Users2, UserRound, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { BrandLogo } from "@/components/brand-logo";
import { NotificationsPopover } from "@/components/notifications-popover";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "Academy" },
  { href: "/blog", label: "Articles" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileCloseTimer = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    if (profileCloseTimer.current) {
      clearTimeout(profileCloseTimer.current);
    }
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (profileCloseTimer.current) {
        clearTimeout(profileCloseTimer.current);
      }
    };
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      // Do not close dropdown if clicking inside a modal or dialog
      if (target?.closest(".logout-modal") || target?.closest('[role="dialog"]')) {
        return;
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    function evaluateAdmin(user: any) {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const adminEmails = ["yuvakiranreddy7@gmail.com", "charanorganics@outlook.com", "charanorganics@gmail.com"];
      const email = user.email?.toLowerCase();
      const isMeta = user.user_metadata?.role === "admin" || (email && adminEmails.includes(email));

      setIsAdmin(Boolean(isMeta));
    }

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? null);
      evaluateAdmin(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserLabel(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? null);
      evaluateAdmin(user);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isShellRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/community");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/30 bg-linen/80 backdrop-blur-2xl dark:border-white/10 dark:bg-forest/80">
        <div
          className={cn(
            "flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8",
            isShellRoute ? "w-full" : "mx-auto max-w-7xl"
          )}
        >
          <BrandLogo />
          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={cn("rounded-full px-4 py-2 text-sm font-medium text-ink/75 transition hover:bg-white/70 hover:text-forest dark:text-cream/80 dark:hover:bg-white/10", pathname === link.href && "bg-white text-forest shadow-sm dark:bg-white/10 dark:text-white")}>
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Desktop actions */}
          <div className="hidden items-center gap-5 lg:flex">
            <div className="flex items-center gap-4 text-ink/60 dark:text-cream/60">
              <Link href="/courses" aria-label="Search courses" className="hover:text-forest dark:hover:text-cream transition"><Search size={18} /></Link>
              <button aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:text-forest dark:hover:text-cream transition">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            
            <div className="h-6 w-px bg-forest/10 dark:bg-white/10" />

            {userLabel ? (
              <div className="flex items-center gap-3">
                <NotificationsPopover />

                <Link href="/community" className="inline-flex items-center justify-center rounded-full bg-leaf text-white hover:bg-forest px-5 h-10 text-xs font-bold shadow-md transition-transform hover:scale-105">
                  <Users2 size={16} className="mr-1.5" /> Groups Chat
                </Link>

                {/* Profile menu with hover safety bridge & persistent click */}
                <div
                  ref={profileRef}
                  className="relative"
                  onMouseEnter={() => {
                    if (profileCloseTimer.current) {
                      clearTimeout(profileCloseTimer.current);
                      profileCloseTimer.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    profileCloseTimer.current = setTimeout(() => {
                      setProfileOpen(false);
                    }, 400);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (profileCloseTimer.current) {
                        clearTimeout(profileCloseTimer.current);
                        profileCloseTimer.current = null;
                      }
                      setProfileOpen((prev) => !prev);
                    }}
                    className="grid size-10 place-items-center rounded-full bg-forest text-cream shadow-md transition hover:scale-105 border-2 border-transparent hover:border-leaf/50 cursor-pointer"
                    aria-label="Profile navigation menu"
                    aria-expanded={profileOpen}
                  >
                    <UserRound size={18} />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => {
                        if (profileCloseTimer.current) {
                          clearTimeout(profileCloseTimer.current);
                          profileCloseTimer.current = null;
                        }
                      }}
                    >
                      <div className="w-56 flex flex-col rounded-[1.5rem] bg-white p-2 shadow-2xl ring-1 ring-forest/10 dark:bg-[#0e1f18] dark:ring-white/10">
                        <div className="px-3 py-2 border-b border-forest/10 dark:border-white/10 mb-1">
                          <p className="text-xs font-bold text-ink/50 dark:text-cream/50 truncate">{userLabel}</p>
                          {isAdmin && (
                            <span className="inline-block mt-0.5 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              Administrator
                            </span>
                          )}
                        </div>

                        {/* Admin Panel link ONLY displayed if user is admin */}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-forest/5 dark:text-emerald-400 dark:hover:bg-white/10 transition flex items-center justify-between"
                          >
                            <span>Admin Panel</span>
                            <ShieldCheck size={14} />
                          </Link>
                        )}

                        <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">Dashboard</Link>
                        <Link href="/dashboard/courses" onClick={() => setProfileOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">My Learning</Link>
                        <Link href="/dashboard/certificates" onClick={() => setProfileOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">Certificates</Link>
                        <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">Settings</Link>
                        <div className="mt-1 pt-1 border-t border-forest/10 dark:border-white/10">
                          <LogoutButton asMenuItem onLogout={() => setProfileOpen(false)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link href="/login" className="text-sm font-bold text-ink/80 hover:text-forest dark:text-cream/80 dark:hover:text-cream transition">
                  Login
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-leaf text-white hover:bg-forest px-6 h-10 text-sm font-bold shadow-md transition-transform hover:scale-105">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            {userLabel && <NotificationsPopover />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="grid size-11 place-items-center rounded-full bg-forest/5 text-forest transition hover:bg-forest/10 dark:bg-white/10 dark:text-cream"
              aria-label="Open menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-linen shadow-2xl dark:bg-[#0e1f18] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-forest/10 px-5 py-5 dark:border-white/10">
              <BrandLogo />
              <button onClick={() => setMenuOpen(false)} className="grid size-9 place-items-center rounded-full bg-forest/5 dark:bg-white/10">
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 p-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold text-ink/75 transition hover:bg-forest/5 dark:text-cream/80 dark:hover:bg-white/10",
                    pathname === link.href && "bg-forest/10 text-forest dark:bg-white/10 dark:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="mt-auto space-y-3 border-t border-forest/10 p-4 dark:border-white/10">
              <button
                onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink/75 transition hover:bg-forest/5 dark:text-cream/80 dark:hover:bg-white/10"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>

              {userLabel ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-emerald-600 transition hover:bg-forest/5 dark:text-emerald-400 dark:hover:bg-white/10">
                      <span>Admin Panel</span>
                      <ShieldCheck size={16} />
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10">
                    <UserRound size={17} /> {userLabel}
                  </Link>
                  <Link href="/community" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10">
                    <Users2 size={17} /> Groups Chat
                  </Link>
                  <Link href="/dashboard/courses" className="flex items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-cream">
                    <BookOpen size={17} /> My Learning
                  </Link>
                  <Link href="/dashboard/certificates" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10">
                    <GraduationCap size={17} /> Certificates
                  </Link>
                  <div className="pt-1">
                    <LogoutButton asMenuItem onLogout={() => setMenuOpen(false)} />
                  </div>
                </>
              ) : (
                <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-cream">
                  <UserRound size={17} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav — Top-Class Industry Standard */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-forest/10 bg-white/95 px-1 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-[#06140e]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {[
          { href: "/", label: "Home", icon: Home },
          { href: "/courses", label: "Courses", icon: Search },
          { href: "/dashboard/courses", label: "My Learning", icon: BookOpen },
          { href: "/community", label: "Community", icon: Users2 },
          { href: userLabel ? "/dashboard/settings" : "/login", label: "Profile", icon: UserRound }
        ].map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/dashboard/courses"
              ? pathname === "/dashboard/courses" || pathname?.startsWith("/dashboard/courses")
              : item.href === "/courses"
              ? pathname === "/courses" || pathname?.startsWith("/courses/")
              : item.href === "/dashboard/settings"
              ? pathname === "/dashboard/settings"
              : pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center min-w-0 px-0.5 py-1 text-center transition-all duration-150 active:scale-95",
                isActive
                  ? "text-leaf dark:text-emerald-400"
                  : "text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream"
              )}
            >
              {/* Bold Icon Pill with active background indicator */}
              <div
                className={cn(
                  "relative grid size-8 sm:size-9 place-items-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-leaf/15 text-forest dark:bg-emerald-500/20 dark:text-emerald-300 scale-105 shadow-xs"
                    : "text-ink/75 dark:text-cream/75 group-hover:scale-105"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "transition-all",
                    isActive
                      ? "stroke-[2.7] text-leaf dark:text-emerald-400"
                      : "stroke-[2.2]"
                  )}
                />
              </div>

              {/* Text label: 100% visible, fully readable, unclipped */}
              <span
                className={cn(
                  "block w-full text-center tracking-tight text-[10px] sm:text-[11px] leading-tight mt-0.5 transition-colors whitespace-nowrap",
                  isActive
                    ? "font-black text-leaf dark:text-emerald-400"
                    : "font-bold text-ink/75 dark:text-cream/75"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
