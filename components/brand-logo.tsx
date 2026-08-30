import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const logoUrl = "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

export function BrandLogo({ href = "/", compact = false, className }: { href?: string; compact?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 font-bold text-forest dark:text-cream", className)}>
      <Image src={logoUrl} alt="Charan Organics" width={40} height={40} className="h-10 w-auto object-contain" priority />
      {!compact && <span className="text-lg leading-tight tracking-tight">Charan<br className="sm:hidden" /> Academy</span>}
    </Link>
  );
}
