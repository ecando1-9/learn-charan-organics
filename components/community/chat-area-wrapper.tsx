"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatAreaWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIndex = pathname === "/community";

  return (
    <div className={cn(
      "flex-1 flex-col bg-white dark:bg-[#07140f] overflow-hidden relative",
      isIndex ? "hidden lg:flex" : "flex"
    )}>
      {children}
    </div>
  );
}
