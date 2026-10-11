"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  Search,
  Sparkles,
  BookOpen,
  CreditCard,
  Award,
  FileText,
  Users2,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type FAQItem = {
  category: "enrollment" | "courses" | "pdf" | "certificates" | "business";
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  // Enrollment & Payments
  {
    category: "enrollment",
    question: "How does the course enrollment and UPI payment process work?",
    answer:
      "When you choose a course on our single-page checkout (/enroll), select your preferred access duration (such as 6 Months or 1 Year Best Value). Scan the provided official academy UPI QR code using Google Pay, PhonePe, Paytm, or BHIM. After transferring, enter your 12-digit UPI UTR / Transaction Reference number and upload a payment screenshot. Our team verifies your transaction and unlocks course access typically within 1 to 3 hours, after which an automated confirmation email is sent.",
  },
  {
    category: "enrollment",
    question: "What is the difference between the 6-Month and 1-Year enrollment plans?",
    answer:
      "The 6-Month plan gives you complete access to all course video lessons, formulation PDF guides, and certificate eligibility for 180 days. The 1-Year plan provides an extended 365 days of access at a heavily discounted rate (saving you 30% to 40% compared to renewals), ideal for entrepreneurs who wish to revisit formulation adjustments as they scale production batches across seasonal changes.",
  },
  {
    category: "enrollment",
    question: "Can I pay using Credit Card, Netbanking, or International Cards?",
    answer:
      "Our primary zero-commission payment method for Indian students is direct UPI (8985482084@hdfc). If you are an international student or wish to use alternate banking methods, please reach out to our WhatsApp support helpline (+91 89854 82084) for custom invoice generation.",
  },

  // Courses & Lessons
  {
    category: "courses",
    question: "How do I access my enrolled course videos?",
    answer:
      "Once your enrollment request is approved, simply log into your account and your courses will appear prominently on your Homepage ('My Enrolled Courses') and in your Student Dashboard (/dashboard/courses). Click 'Continue Learning' to jump straight into the high-definition video player without having to navigate through extra sales pages.",
  },
  {
    category: "courses",
    question: "Can I watch the lessons on mobile, tablet, and desktop?",
    answer:
      "Yes! Charan Organics LMS is fully responsive and optimized for mobile phones (iOS and Android), iPads, laptops, and smart TVs. Your progress syncs in real-time across all your devices so you can learn anytime, anywhere.",
  },
  {
    category: "courses",
    question: "Are the courses taught in English, Hindi, or Telugu?",
    answer:
      "Our classes are primarily instructed in clear, easy-to-understand conversational language with bilingual technical terminology. Each course catalog card clearly specifies the primary instructional language (e.g. English, Telugu, or Hindi).",
  },

  // Formulation PDFs & Notes
  {
    category: "pdf",
    question: "How do I download the formulation notes and batch recipe PDFs?",
    answer:
      "All registered enrolled students receive direct 1-click access to downloadable PDF notes right from their Home dashboard, Course Detail page, and video player classroom. These PDFs include exact ingredient percentages, INCI names, phase calculations, pH ranges, preservative dosages, and vendor sourcing links.",
  },
  {
    category: "pdf",
    question: "Can I print the formulation PDFs for my workshop or lab?",
    answer:
      "Yes! Once downloaded, you are encouraged to print the formulation worksheets and keep them at your manufacturing bench for reference during batch weighing and emulsification.",
  },

  // Certificates
  {
    category: "certificates",
    question: "How do I earn my Certificate of Completion?",
    answer:
      "To qualify for an official certificate, complete at least 70% of the lessons in your enrolled course. As soon as you hit the 70% threshold, your Certificate status unlocks automatically in your Dashboard (/dashboard/certificates). You can enter your verified legal name and instantly download a high-resolution, print-ready Certificate featuring a unique verification code and QR stamp.",
  },
  {
    category: "certificates",
    question: "Is the certificate recognized for starting my own organic brand?",
    answer:
      "Yes. Charan Organics is a legally registered brand under The Trademarks Act 1999. Our Certificates of Completion validate your technical knowledge in natural cosmetic chemistry, cold-process saponification, and herbal formulations, providing credibility to customers, retailers, and cosmetic drug authorities.",
  },

  // Business & Community
  {
    category: "business",
    question: "What is the Batch Community Chat?",
    answer:
      "Every enrolled student gets free access to our interactive Community Chat (/community). You can join course-specific groups to interact with fellow student formulators, share photos of your completed soap batches or emulsions, ask troubleshooting questions, and receive feedback directly from faculty mentors.",
  },
  {
    category: "business",
    question: "Do you teach regulatory compliance, BIS standards, and cosmetic licensing?",
    answer:
      "Yes! Our advanced diploma courses cover product labeling standards, ingredient INCI declarations, basic shelf-life stability tests, microbial safety, and licensing guidelines for setting up a legal manufacturing unit in India.",
  },
];

const categories = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "enrollment", label: "Enrollment & Payment", icon: CreditCard },
  { id: "courses", label: "Video Classroom", icon: BookOpen },
  { id: "pdf", label: "Formulation PDFs", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "business", label: "Community & Brand", icon: Users2 },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({ 0: true, 1: true });

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles size={14} /> Knowledge Base & Assistance
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/80">
            Find instant answers to questions regarding course access, UPI payments, formulation notes, certificates, and community mentorship.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question, topic or keyword (e.g. certificate, payment, PDF)..."
                className="w-full rounded-2xl bg-white/15 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/60 backdrop-blur border border-white/20 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-leaf"
              />
            </div>
          </div>
        </div>
      </section>

      <Section className="pt-12">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-forest/10 dark:border-white/10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                  isActive
                    ? "bg-forest text-white shadow-soft dark:bg-emerald-600"
                    : "bg-white text-forest hover:bg-linen dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-8 space-y-4 max-w-4xl">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-soft dark:bg-white/5 space-y-3">
              <HelpCircle className="mx-auto text-ink/30 dark:text-cream/30" size={40} />
              <h3 className="text-xl font-black text-forest dark:text-cream">No matching questions found</h3>
              <p className="text-sm text-ink/60 dark:text-cream/60">
                Try adjusting your search terms or contact our support team directly.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="rounded-full bg-forest px-5 py-2 text-xs font-bold text-white hover:bg-leaf"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = Boolean(openItems[idx]);
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-[1.75rem] border transition-all ${
                    isOpen
                      ? "border-emerald-500/40 bg-white shadow-soft dark:border-emerald-500/30 dark:bg-white/5"
                      : "border-forest/10 bg-white hover:border-forest/25 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(idx)}
                    className="flex w-full items-center justify-between p-5 sm:p-6 text-left"
                  >
                    <span className="font-black text-forest dark:text-cream text-base sm:text-lg pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full bg-forest/5 text-forest transition-transform dark:bg-white/10 dark:text-cream ${
                        isOpen ? "rotate-180 bg-leaf text-white" : ""
                      }`}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-1 text-sm leading-relaxed text-ink/75 dark:text-cream/75 border-t border-forest/5 dark:border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-r from-forest to-[#12382a] p-8 sm:p-12 text-cream shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Still have questions?
            </h3>
            <p className="text-sm text-cream/75 max-w-xl">
              Can&apos;t find what you&apos;re looking for? Chat with our academy team on WhatsApp or send us an email.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/918985482084"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-black text-white hover:bg-emerald-500 shadow-md transition"
            >
              <MessageCircle size={16} /> WhatsApp Chat
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-xs font-black text-white hover:bg-white/25 border border-white/20 transition"
            >
              <Mail size={16} /> Contact Desk
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
