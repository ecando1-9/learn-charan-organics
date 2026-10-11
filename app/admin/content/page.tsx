import Link from "next/link";
import {
  FileText,
  BookOpen,
  Youtube,
  HelpCircle,
  Award,
  Users2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminContentPage() {
  const contentSections = [
    {
      title: "Course Catalog & Video Lessons",
      description: "Manage paid curriculum, pricing duration variants (6-Mo / 1-Yr), video streams, and downloadable formulation PDFs.",
      url: "/admin/courses",
      icon: BookOpen,
      status: "Live & Managed",
      count: "Active in DB",
    },
    {
      title: "Free Classes Strip",
      description: "YouTube-embedded public classes displayed on homepage and free classes directory with zero login required.",
      url: "/admin/free-classes",
      icon: Youtube,
      status: "Live & Managed",
      count: "Active in DB",
    },
    {
      title: "Student Testimonials & Case Studies",
      description: "Customer reviews, verified student badges, brand success stories, and rating metrics.",
      url: "/testimonials",
      icon: Award,
      status: "Published",
      count: "6 Case Studies",
    },
    {
      title: "Knowledge Base & FAQs",
      description: "Categorized student FAQs covering UPI payments, video playback, PDF downloads, and certificates.",
      url: "/faq",
      icon: HelpCircle,
      status: "Published",
      count: "12 Categories",
    },
    {
      title: "Faculty & Instructors Roster",
      description: "Cosmetic chemistry mentors, master formulators, qualifications, experience, and bios.",
      url: "/instructors",
      icon: Users2,
      status: "Published",
      count: "4 Mentors",
    },
    {
      title: "Formulation Guides & Blog",
      description: "Technical articles on cold-process soap, preservative systems, hair taila paka, and cosmetic licensing.",
      url: "/blog",
      icon: FileText,
      status: "Published",
      count: "6 Articles",
    },
    {
      title: "Terms of Service Agreement",
      description: "Governing legal agreement under The Trademarks Act 1999, anti-piracy policies, and cosmetic safety disclaimers.",
      url: "/terms",
      icon: ShieldCheck,
      status: "Legally Active",
      count: "Updated Oct 2026",
    },
    {
      title: "Privacy & Data Protection Policy",
      description: "Student data safeguards, RLS security policies, encryption standards, and student rights.",
      url: "/privacy",
      icon: ShieldCheck,
      status: "Legally Active",
      count: "Updated Oct 2026",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
          CMS Control Hub
        </p>
        <h1 className="text-3xl font-black text-forest dark:text-cream">
          Site Content Management
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Centralized directory to inspect, manage, and verify all public and internal academy content pages.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="group flex flex-col justify-between rounded-[2rem] border border-forest/10 bg-white p-6 shadow-soft transition-all duration-300 hover:border-emerald-500/40 hover:shadow-glass dark:border-white/10 dark:bg-white/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-2xl bg-forest/10 text-forest dark:bg-white/10 dark:text-cream">
                    <Icon size={22} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={12} /> {section.status}
                  </span>
                </div>

                <h2 className="text-lg font-black text-forest dark:text-cream">
                  {section.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed text-ink/70 dark:text-cream/70">
                  {section.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-ink/50 dark:text-cream/50">
                  {section.count}
                </span>

                <Link href={section.url}>
                  <Button className="rounded-full bg-forest text-white hover:bg-leaf text-xs font-bold px-4 py-2 min-h-0 h-9">
                    <span>Manage / View</span>
                    <ExternalLink size={13} />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
