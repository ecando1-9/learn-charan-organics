"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Tag,
  Search,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type Article = {
  id: string;
  category: "formulation" | "soapmaking" | "haircare" | "business";
  title: string;
  excerpt: string;
  readTime: string;
  publishDate: string;
  author: string;
  tags: string[];
};

const articles: Article[] = [
  {
    id: "cold-process-saponification-guide",
    category: "soapmaking",
    title: "The Ultimate Guide to Saponification Values & Lye Discounting",
    excerpt:
      "Understand the chemical interaction between sodium hydroxide and fatty acid triglycerides. Learn how a 5% to 8% superfat prevents harshness and creates ultra-conditioning botanical bars.",
    readTime: "7 min read",
    publishDate: "October 2026",
    author: "Dr. Charan Raj",
    tags: ["Soap Chemistry", "Cold Process", "Fatty Acids"],
  },
  {
    id: "natural-preservatives-microbial-safety",
    category: "formulation",
    title: "Natural Preservatives vs Synthetics: Formulating Microbial-Safe Emulsions",
    excerpt:
      "Why water-based creams need broad-spectrum protection. A deep-dive into ECOCERT-approved preservative blends, challenge testing (USP 51), and water activity reduction.",
    readTime: "9 min read",
    publishDate: "September 2026",
    author: "Dr. Meera Iyer",
    tags: ["Preservatives", "ECOCERT", "Emulsion Science"],
  },
  {
    id: "ayurvedic-hair-oil-taila-paka-vidhi",
    category: "haircare",
    title: "Mastering Classical Taila Paka Vidhi for Potent Ayurvedic Hair Oils",
    excerpt:
      "A clinical guide to the three classical boiling stages (Mridu, Madhyama, Khara Paka). How to extract botanical alkaloids into sesame and coconut bases without burning herb phytocompounds.",
    readTime: "8 min read",
    publishDate: "September 2026",
    author: "Dr. Meera Iyer",
    tags: ["Ayurveda", "Taila Paka", "Herbal Hair Care"],
  },
  {
    id: "cosmetics-business-license-india",
    category: "business",
    title: "How to Legally Start an Organic Cosmetics Brand in India: Licenses & BIS Norms",
    excerpt:
      "Demystifying cosmetic manufacturing licenses (Form 32), loan licensing, AYUSH vs Drug Control approvals, INCI label declarations, and batch testing documentation.",
    readTime: "11 min read",
    publishDate: "August 2026",
    author: "Er. Arun Prakash",
    tags: ["Legal Compliance", "BIS Standards", "Brand Licensing"],
  },
  {
    id: "carrier-oils-fatty-acid-profiles",
    category: "formulation",
    title: "Carrier Oils 101: Comparing Oleic, Linoleic, and Lauric Acid Ratios",
    excerpt:
      "Choose the right plant oils for your skincare line. Learn how absorption rates, comedogenic ratings, and oxidative stability vary between Jojoba, Rosehip, Sweet Almond, and Moringa oils.",
    readTime: "6 min read",
    publishDate: "August 2026",
    author: "Dr. Charan Raj",
    tags: ["Botanical Oils", "Skin Barrier", "Raw Materials"],
  },
  {
    id: "packaging-compatibility-testing",
    category: "business",
    title: "Packaging Compatibility Testing: Preventing Leaks, Warping, and Oxidation",
    excerpt:
      "Why essential oils can degrade certain plastics. How to test glass, amber PET, HDPE, and aluminium containers under 45°C accelerated oven stress.",
    readTime: "7 min read",
    publishDate: "July 2026",
    author: "Er. Arun Prakash",
    tags: ["Packaging", "Stability", "Quality Control"],
  },
];

const categories = [
  { id: "all", label: "All Guides" },
  { id: "formulation", label: "Formulation Chemistry" },
  { id: "soapmaking", label: "Soap Crafting" },
  { id: "haircare", label: "Herbal Hair Care" },
  { id: "business", label: "Business & Legal" },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = articles.filter((a) => {
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles size={14} /> Knowledge Hub & Research
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Formulation Insights & Guides
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/80">
            Authoritative technical guides on organic cosmetic chemistry, soapmaking saponification, regulatory licensing, and botanical extraction.
          </p>

          <div className="mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chemistry topics, ingredients, licensing..."
                className="w-full rounded-2xl bg-white/15 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/60 backdrop-blur border border-white/20 focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-leaf"
              />
            </div>
          </div>
        </div>
      </section>

      <Section className="pt-12">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-forest/10 dark:border-white/10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-black transition ${
                  isActive
                    ? "bg-forest text-white shadow-soft dark:bg-emerald-600"
                    : "bg-white text-forest hover:bg-linen dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Article Cards Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="group flex flex-col justify-between rounded-[2.25rem] border border-forest/10 bg-white p-6 sm:p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-glass dark:border-white/10 dark:bg-white/5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-ink/55 dark:text-cream/55">
                  <span className="flex items-center gap-1 font-bold text-leaf">
                    <BookOpen size={13} /> {art.category.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {art.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-black text-forest dark:text-cream group-hover:text-leaf transition leading-snug">
                  {art.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed text-ink/70 dark:text-cream/70">
                  {art.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {art.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-forest/5 px-2.5 py-0.5 text-[11px] font-semibold text-forest dark:bg-white/10 dark:text-cream"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-forest dark:text-cream">{art.author}</p>
                  <p className="text-[10px] text-ink/45 dark:text-cream/45">{art.publishDate}</p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-xs font-black text-leaf group-hover:translate-x-1 transition"
                >
                  Learn in Course <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Free Formulation Newsletter Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-forest p-8 sm:p-12 text-cream shadow-soft dark:bg-[#0c1f17] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-leaf">
              <FileText size={14} /> Weekly Formulation Digest
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Get Natural Cosmetic Formulations in Your Inbox
            </h3>
            <p className="text-sm text-cream/75 max-w-xl">
              Join thousands of small-batch formulators receiving free batch calculation worksheets, raw material sourcing tips, and regulatory alerts.
            </p>
          </div>
          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              placeholder="Enter your email address"
              className="rounded-full bg-white/10 px-5 py-3 text-xs text-white placeholder:text-cream/50 backdrop-blur border border-white/20 focus:bg-white/20 focus:outline-none min-w-[240px]"
            />
            <Button className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-black text-white hover:bg-emerald-500 shadow-md">
              Subscribe Free
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
