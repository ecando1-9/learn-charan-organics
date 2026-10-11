import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Privacy Policy | Charan Organics Academy",
  description: "Privacy policy, student data security, encryption protocols, and data protection practices of Charan Organics Academy.",
};

export default function PrivacyPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Lock size={14} /> Data Protection & Trust
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/80">
            Last updated: October 2026 • We respect your privacy and secure all student records.
          </p>
        </div>
      </section>

      <Section className="pt-12">
        <div className="mx-auto max-w-4xl space-y-10 text-ink/80 dark:text-cream/80 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">1</span>
              Information We Collect
            </h2>
            <p>
              When you interact with Charan Organics Academy, we collect information necessary to fulfill educational services, track lesson completions, and issue certificates:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li><strong>Account Identification:</strong> Full Name, Email Address, optional WhatsApp phone number, and encrypted password hash.</li>
              <li><strong>Payment Verification:</strong> 12-digit UPI UTR reference number, uploaded screenshot receipts, and selected plan durations (used strictly to verify transaction credit).</li>
              <li><strong>Learning Telemetry:</strong> Video lesson playback timestamps, completed modules, quiz records, and certificate issuance dates.</li>
              <li><strong>Technical Metadata:</strong> IP address, device type, and browser session headers (used to prevent unauthorized simultaneous streaming and ensure video delivery speed).</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">2</span>
              How We Use Your Information
            </h2>
            <p>
              We process student data only for legitimate academic and administrative purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>To grant instant access to enrolled course classrooms and formulation PDF guides.</li>
              <li>To verify payments and send automated email transaction receipts via Resend.</li>
              <li>To validate completion milestones (70%+ progress) and generate authenticated Certificates of Completion.</li>
              <li>To provide customer support on WhatsApp and email inquiries.</li>
              <li>We never sell, rent, or trade your personal information to third-party advertising brokers.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">3</span>
              Security & Encryption Standards
            </h2>
            <p>
              Your data is stored securely using industry-standard protocols:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li><strong>Database Protection:</strong> Hosted on Supabase Postgres with strict Row-Level Security (RLS) policies guaranteeing that only you and authorized administrators can access your private records.</li>
              <li><strong>SSL/TLS Encryption:</strong> All platform traffic is encrypted in transit using 256-bit TLS encryption.</li>
              <li><strong>Video Stream Protection:</strong> Digital lessons are served via high-speed encrypted content delivery networks to prevent unauthorized snooping.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">4</span>
              Cookies & Browser Storage
            </h2>
            <p>
              We use strictly necessary cookies and local storage to keep you logged in between sessions, preserve your video player playback position, and remember your dark/light appearance preferences. We do not use third-party behavioral tracking cookies.
            </p>
          </div>

          {/* Section 5 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">5</span>
              Your Data Rights & Grievance Contact
            </h2>
            <p>
              You have the right to request a copy of your personal data, request corrections to misspelled names on your completion certificates, or request account closure.
            </p>
            <p className="pt-2 text-xs text-ink/60 dark:text-cream/60">
              For any privacy or data inquiries, contact our Data Desk: <Link href="mailto:orders@charanorganics.com" className="font-bold text-leaf underline">orders@charanorganics.com</Link>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
