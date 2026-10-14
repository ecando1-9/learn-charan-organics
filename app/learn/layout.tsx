import { SiteHeader } from "@/components/layout/site-header";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen dark:bg-[#07140f]">
      <SiteHeader />
      <main className="pb-24 lg:pb-0">{children}</main>
    </div>
  );
}
