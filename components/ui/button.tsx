import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-forest text-white shadow-soft hover:bg-leaf",
        variant === "secondary" && "border border-forest/15 bg-white text-forest hover:bg-cream dark:bg-white/10 dark:text-white",
        variant === "ghost" && "text-forest hover:bg-forest/10 dark:text-cream",
        className
      )}
      {...props}
    />
  );
}
