import Link from "next/link";
import { Facebook, Instagram, Mail, MessageCircle, Youtube, ShieldCheck, Heart } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-cream pb-24 md:pb-0 border-t border-forest/10 dark:border-white/10 dark:bg-[#07140f]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Overview Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo href="/" />
            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-cream/75">
              India&apos;s leading academy for organic cosmetic chemistry, Ayurvedic herbal extraction, and cold-process soapmaking. Empowering indie brand founders with laboratory-tested formulations and certifications.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-leaf font-bold">
              <ShieldCheck size={16} /> Registered Trademark under The Trademarks Act 1999
            </div>

            {/* Social Channels */}
            <div className="flex gap-2.5 pt-2">
              <a
                href="https://www.youtube.com/@charanorganics"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-leaf hover:scale-105 transition"
                aria-label="YouTube"
              >
                <Youtube size={17} />
              </a>
              <a
                href="https://www.instagram.com/charanorganics"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-leaf hover:scale-105 transition"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://wa.me/918985482084"
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-leaf hover:scale-105 transition"
                aria-label="WhatsApp"
              >
                <MessageCircle size={17} />
              </a>
              <a
                href="mailto:orders@charanorganics.com"
                className="grid size-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-leaf hover:scale-105 transition"
                aria-label="Email"
              >
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* Academic Courses */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-leaf">
              Programs
            </h3>
            <div className="grid gap-2 text-xs sm:text-sm text-cream/75">
              <Link href="/courses" className="hover:text-white transition">
                All Masterclasses
              </Link>
              <Link href="/free-classes" className="hover:text-white transition">
                Free YouTube Classes
              </Link>
              <Link href="/instructors" className="hover:text-white transition">
                Academy Faculty
              </Link>
              <Link href="/testimonials" className="hover:text-white transition">
                Student Stories
              </Link>
              <Link href="/enroll" className="hover:text-white transition">
                Single-Page Checkout
              </Link>
            </div>
          </div>

          {/* Resources & Hub */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-leaf">
              Knowledge Hub
            </h3>
            <div className="grid gap-2 text-xs sm:text-sm text-cream/75">
              <Link href="/blog" className="hover:text-white transition">
                Formulation Articles
              </Link>
              <Link href="/about" className="hover:text-white transition">
                About the Academy
              </Link>
              <Link href="/faq" className="hover:text-white transition">
                Frequently Asked Questions
              </Link>
              <Link href="/community" className="hover:text-white transition">
                Batch Community Chat
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Student Learning Portal
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-leaf">
              Support & Legal
            </h3>
            <div className="grid gap-2 text-xs sm:text-sm text-cream/75">
              <Link href="/contact" className="hover:text-white transition">
                Contact Desk
              </Link>
              <Link href="/verify" className="hover:text-white text-emerald-400 font-bold transition flex items-center gap-1.5">
                <ShieldCheck size={14} /> Verify Certificate
              </Link>
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Terms & Conditions
              </Link>
              <a
                href="https://wa.me/918985482084"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-leaf font-bold hover:underline"
              >
                <MessageCircle size={15} /> WhatsApp Helpline
              </a>
              <span className="text-[11px] text-cream/50 pt-1">
                orders@charanorganics.com
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <p>
            © {new Date().getFullYear()} Charan Organics Academy. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-[11px]">
            Crafted with <Heart size={12} className="text-emerald-400 fill-emerald-400" /> for Organic Cosmetic Formulators
          </p>
        </div>
      </div>
    </footer>
  );
}
