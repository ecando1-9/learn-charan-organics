import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const logoUrl = "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

export function BrandLogo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-bold text-forest dark:text-cream", className)}>
      <span className="grid size-11 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-forest/10 dark:bg-white/10 dark:ring-white/10">
        <Image src={logoUrl} alt="Charan Organics" width={44} height={44} className="h-full w-full object-contain p-1" priority />
      </span>
      {!compact && <span className="leading-tight">Charan<br className="sm:hidden" /> Academy</span>}
    </Link>
  );
}
