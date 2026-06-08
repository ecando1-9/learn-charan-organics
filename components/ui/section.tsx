import { cn } from "@/lib/utils";

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16", className)}>{children}</section>;
}
