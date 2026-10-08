"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Menu, Moon, Search, ShieldCheck, Sun, Users2, UserRound, X } from "lucide-react";
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

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserLabel(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserLabel(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/30 bg-linen/80 backdrop-blur-2xl dark:border-white/10 dark:bg-forest/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <div className="hidden items-center gap-5 md:flex">
            <div className="flex items-center gap-4 text-ink/60 dark:text-cream/60">
              <button aria-label="Search" className="hover:text-forest dark:hover:text-cream transition"><Search size={18} /></button>
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

                <div className="relative group">
                  <button className="grid size-10 place-items-center rounded-full bg-forest text-cream shadow-md transition hover:scale-105 border-2 border-transparent group-hover:border-leaf/50">
                    <UserRound size={18} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 hidden w-48 flex-col rounded-[1.5rem] bg-white p-2 shadow-2xl ring-1 ring-forest/10 dark:bg-[#0e1f18] dark:ring-white/10 group-hover:flex">
                     <div className="px-3 py-2 border-b border-forest/10 dark:border-white/10 mb-1">
                        <p className="text-xs font-bold text-ink/50 dark:text-cream/50 truncate">{userLabel}</p>
                     </div>
                     <Link href="/admin" className="rounded-xl px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-forest/5 dark:text-emerald-400 dark:hover:bg-white/10 transition flex items-center justify-between">
                       <span>Admin Panel</span>
                       <ShieldCheck size={14} />
                     </Link>
                     <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">Dashboard</Link>
                     <Link href="/dashboard/courses" className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">My Learning</Link>
                     <Link href="/dashboard/settings" className="rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10 transition">Settings</Link>
                     <div className="mt-1 pt-1 border-t border-forest/10 dark:border-white/10">
                       <LogoutButton compact />
                     </div>
                  </div>
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
          <div className="flex items-center gap-2 md:hidden">
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
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
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
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10">
                    <UserRound size={17} /> {userLabel}
                  </Link>
                  <Link href="/community" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest/5 dark:text-cream dark:hover:bg-white/10">
                    <Users2 size={17} /> Groups Chat
                  </Link>
                  <Link href="/dashboard/courses" className="flex items-center gap-3 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-cream">
                    <BookOpen size={17} /> My Learning
                  </Link>
                  <LogoutButton compact />
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

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-forest/10 bg-cream/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-forest/95">
        {[
          { href: "/", label: "Home", icon: GraduationCap },
          { href: "/courses", label: "Courses", icon: Search },
          { href: "/community", label: "Groups", icon: Users2 },
          { href: "/dashboard", label: "Learn", icon: BookOpen },
          { href: userLabel ? "/dashboard/settings" : "/login", label: "Profile", icon: UserRound }
        ].map((item) => (
          <Link key={item.href} href={item.href} className={cn(
            "flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-semibold transition",
            pathname === item.href
              ? "text-forest dark:text-leaf"
              : "text-ink/50 dark:text-cream/50"
          )}>
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
