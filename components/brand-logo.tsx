import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/images/charan-organics-logo.png";
export const BRAND_LOGO_FALLBACK = "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

export function BrandLogo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 font-bold text-forest dark:text-cream transition hover:opacity-95",
        className
      )}
    >
      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-forest/15 dark:bg-white/10 dark:ring-white/15">
        <Image
          src={BRAND_LOGO_SRC}
          alt="Charan Organics Logo"
          width={40}
          height={40}
          className="size-full object-contain"
          priority
        />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="font-serif text-lg font-black leading-none tracking-tight text-forest dark:text-cream">
            Charan Organics
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-leaf dark:text-emerald-400">
            Academy
          </span>
        </div>
      )}
    </Link>
  );
}

export function BrandEmblem({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-[#c5a059]/60",
        className
      )}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt="Charan Organics Official Emblem"
        width={size}
        height={size}
        className="size-full object-contain p-1"
        priority
      />
    </div>
  );
}

