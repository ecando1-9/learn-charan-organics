import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function ContactPage() {
  return <Section><div className="grid gap-8 lg:grid-cols-2"><div><h1 className="text-4xl font-black text-forest dark:text-cream">Contact Charan Organics Academy</h1><p className="mt-4 leading-7 text-ink/65 dark:text-cream/65">Need course help, enrollment support or business training guidance? Reach the academy team.</p><div className="mt-6 grid gap-3 text-sm font-semibold"><span className="flex gap-2"><Mail size={18} /> support@charanorganics.com</span><span className="flex gap-2"><Phone size={18} /> +91 99999 99999</span><span className="flex gap-2"><MessageCircle size={18} /> WhatsApp support available</span></div></div><form className="glass grid gap-4 rounded-[2rem] p-6"><input className="rounded-2xl bg-white p-4 outline-none dark:bg-white/10" placeholder="Name" /><input className="rounded-2xl bg-white p-4 outline-none dark:bg-white/10" placeholder="Email" /><textarea className="min-h-32 rounded-2xl bg-white p-4 outline-none dark:bg-white/10" placeholder="Message" /><Button>Send message</Button></form></div></Section>;
}
