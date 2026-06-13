import Link from "next/link";
import { Award, BarChart3, BookOpen, FileText, Home, MessageSquare, ReceiptText, Settings, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const nav = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: ReceiptText },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/content", label: "Content", icon: FileText }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f1] dark:bg-[#07140f]">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-forest/10 bg-white p-5 xl:block dark:border-white/10 dark:bg-white/5">
        <BrandLogo href="/admin" />
        <nav className="mt-8 grid gap-2">{nav.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-ink/70 hover:bg-linen dark:text-cream/70 dark:hover:bg-white/10"><item.icon size={18} /> {item.label}</Link>)}</nav>
      </aside>
      <main className="xl:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-forest/10 bg-[#f4f7f1]/90 px-4 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#07140f]/90">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">Secure Admin</p><h1 className="font-black text-forest dark:text-cream">Charan LMS Operations</h1></div>
          <Link href="/" className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white">View site</Link>
        </header>
        <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8">{children}</div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 gap-1 border-t border-forest/10 bg-white/95 px-2 py-2 backdrop-blur-xl xl:hidden dark:border-white/10 dark:bg-forest/95">
        {nav.slice(0, 4).map((item) => <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-semibold text-forest dark:text-cream"><item.icon size={18} />{item.label}</Link>)}
      </nav>
    </div>
  );
}
