import Link from "next/link";
import { ShieldCheck, Scale, FileText, AlertCircle, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Terms and Conditions | Charan Organics Academy",
  description: "Terms of service, course enrollment rules, intellectual property protection, and refund policies of Charan Organics Academy.",
};

export default function TermsPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Scale size={14} /> Legal Agreement
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl text-white">
            Terms & Conditions of Service
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/80">
            Last updated: October 2026 • Registered under The Trademarks Act 1999
          </p>
        </div>
      </section>

      <Section className="pt-12">
        <div className="mx-auto max-w-4xl space-y-10 text-ink/80 dark:text-cream/80 leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">1</span>
              Acceptance of Agreement
            </h2>
            <p>
              By accessing, browsing, registering an account, or enrolling in any course on Charan Organics Academy (&ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), you (&ldquo;Student&rdquo;, &ldquo;User&rdquo;) agree to be legally bound by these Terms and Conditions. If you do not agree to these terms, please refrain from using this website and enrolling in our educational programs.
            </p>
          </div>

          {/* Section 2 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">2</span>
              Course Access, Licenses & Duration Variants
            </h2>
            <p>
              Upon verification and approval of your enrollment request by our administration team, you are granted a non-exclusive, non-transferable, revocable license to view digital lessons and access educational materials for the specific duration selected during checkout (e.g., 6 Months or 1 Year):
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li><strong>6-Month Plan:</strong> Unrestricted access to course videos and PDF formulation worksheets for 180 calendar days from the activation date.</li>
              <li><strong>1-Year Plan:</strong> Unrestricted access for 365 calendar days from the activation date.</li>
              <li>Account credentials may not be shared, rented, or distributed to any third party. Simultaneous multi-ip streaming may trigger automated account suspension for security review.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">3</span>
              Intellectual Property & Strict Anti-Piracy Policy
            </h2>
            <p>
              All video lessons, audio tracks, downloadable formulation recipes, ingredient percentage sheets, trade secrets, software code, graphic marks, and academy logos are the exclusive intellectual property of Charan Organics.
            </p>
            <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              <strong>Strict Prohibition:</strong> Screen recording, ripping, re-uploading, mirroring, selling, or distributing course media on Telegram, Google Drive, WhatsApp groups, YouTube, or file-sharing websites is strictly illegal and constitutes a civil and criminal offense under the Indian Copyright Act, 1957 and Information Technology Act, 2000. Video streams incorporate dynamic forensic watermarks.
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">4</span>
              Payments, UPI Verification & Refund Policy
            </h2>
            <p>
              Courses must be paid via official UPI QR code or authorized banking instructions. All payments are verified manually via the submitted 12-digit UTR transaction reference number:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li><strong>Zero Refund on Digital Delivery:</strong> Due to immediate digital unlock of proprietary cosmetic chemical formulations, video lessons, and downloadable PDF sheets, course fees are non-refundable once approved and accessed.</li>
              <li><strong>Payment Discrepancy:</strong> If a payment fails or UTR is submitted incorrectly, our support desk will contact the student via email/WhatsApp to reconcile within 48 hours.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">5</span>
              Certificates of Completion
            </h2>
            <p>
              Official Certificates of Completion are unlocked automatically upon achieving 70% or greater verified course progress. Certificates bear a unique cryptographically signed serial identifier and verification QR code. Tampering with certificates or misrepresenting academic qualifications is grounds for revocation.
            </p>
          </div>

          {/* Section 6 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">6</span>
              Safety Disclaimer for Cosmetic Formulation
            </h2>
            <p>
              Formulation courses teach safe cosmetic chemistry, saponification calculations, and plant extracts. Students are solely responsible for conducting appropriate 24-hour skin patch tests, microbial challenge tests, and stability testing before commercially retailing products to consumers. Charan Organics Academy is not liable for manufacturing errors or skin reactions occurring from student-made batches.
            </p>
          </div>

          {/* Section 7 */}
          <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-forest/10 text-forest text-sm dark:bg-white/10 dark:text-cream">7</span>
              Jurisdiction & Legal Inquiries
            </h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Andhra Pradesh / Telangana, India.
            </p>
            <p className="pt-2 text-xs text-ink/60 dark:text-cream/60">
              For formal legal inquiries, contact: <Link href="mailto:orders@charanorganics.com" className="font-bold text-leaf underline">orders@charanorganics.com</Link>.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
