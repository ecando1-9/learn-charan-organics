"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, LayoutDashboard, Menu, Moon, Search, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "Academy" },
  { href: "/instructors", label: "Instructors" },
  { href: "/blog", label: "Articles" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [userLabel, setUserLabel] = useState<string | null>(null);

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
          <Link href="/" className="flex items-center gap-2 font-bold text-forest dark:text-cream">
            <span className="grid size-10 place-items-center rounded-2xl bg-forest text-white shadow-soft"><GraduationCap size={21} /></span>
            <span className="leading-tight">Charan<br className="sm:hidden" /> Academy</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={cn("rounded-full px-4 py-2 text-sm font-medium text-ink/75 transition hover:bg-white/70 hover:text-forest dark:text-cream/80 dark:hover:bg-white/10", pathname === link.href && "bg-white text-forest shadow-sm dark:bg-white/10 dark:text-white")}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" className="size-11 px-0" aria-label="Search"><Search size={18} /></Button>
            <Button variant="ghost" className="size-11 px-0" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</Button>
            {userLabel ? (
              <Link href="/dashboard">
                <Button variant="secondary" className="max-w-52">
                  <UserRound size={17} />
                  <span className="truncate">{userLabel}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login"><Button variant="secondary"><UserRound size={17} /> Login</Button></Link>
            )}
            <Link href="/dashboard"><Button><BookOpen size={17} /> My Learning</Button></Link>
          </div>
          <Button variant="ghost" className="size-11 px-0 md:hidden" aria-label="Open menu"><Menu /></Button>
        </div>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-forest/10 bg-cream/95 px-2 py-2 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-forest/95">
        {[
          { href: "/", label: "Home", icon: GraduationCap },
          { href: "/courses", label: "Courses", icon: Search },
          { href: "/dashboard", label: "Learn", icon: BookOpen },
          { href: "/login", label: "Account", icon: UserRound }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-semibold text-forest dark:text-cream">
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
