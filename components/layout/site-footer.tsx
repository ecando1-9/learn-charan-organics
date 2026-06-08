import Link from "next/link";
import { Facebook, Instagram, Mail, MessageCircle, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-forest pb-20 text-cream md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold">Charan Organics Academy</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-cream/75">A premium learning platform for natural product makers, beauty entrepreneurs and organic manufacturing teams.</p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Youtube, Facebook, Mail].map((Icon, index) => <span key={index} className="grid size-10 place-items-center rounded-full bg-white/10"><Icon size={18} /></span>)}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Academy</h3>
          <div className="mt-3 grid gap-2 text-sm text-cream/75">
            <Link href="/courses">All Courses</Link>
            <Link href="/about">About Academy</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/blog">Articles</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Support</h3>
          <div className="mt-3 grid gap-2 text-sm text-cream/75">
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href="https://wa.me/919999999999" className="inline-flex items-center gap-2 text-moss"><MessageCircle size={16} /> WhatsApp support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
