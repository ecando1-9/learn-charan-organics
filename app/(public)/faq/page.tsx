import { Section } from "@/components/ui/section";

const faqs = ["How do I access videos?", "Are videos protected?", "Do I receive certificates?", "Can I download PDF notes?", "Which languages are available?"];

export default function FaqPage() {
  return <Section><h1 className="text-4xl font-black text-forest dark:text-cream">FAQ</h1><div className="mt-8 space-y-3">{faqs.map((faq) => <details key={faq} className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/5"><summary className="cursor-pointer font-bold">{faq}</summary><p className="mt-3 text-sm leading-6 text-ink/65 dark:text-cream/65">Students can access enrolled courses after login. The platform supports protected lesson routes, progress tracking, PDFs and instructor discussions.</p></details>)}</div></Section>;
}
