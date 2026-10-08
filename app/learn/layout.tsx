import { SiteHeader } from "@/components/layout/site-header";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07140f] text-cream flex flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
