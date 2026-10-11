import { SiteHeader } from "@/components/layout/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen dark:bg-[#07140f] flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center p-4 pb-24 lg:pb-8">{children}</main>
    </div>
  );
}
