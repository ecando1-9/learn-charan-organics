"use client";

import Link from "next/link";
import {
  ShieldCheck, Award, Heart, Leaf, Sparkles, CheckCircle2,
  Instagram, Youtube, Mail, Phone, MapPin, ExternalLink, ScrollText
} from "lucide-react";

export function AboutAcademySection({ showFullDetails = true }: { showFullDetails?: boolean }) {
  return (
    <section className="bg-linen/60 dark:bg-[#07140f] py-16 sm:py-24 border-t border-forest/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-4 py-1.5 text-xs font-black text-leaf uppercase tracking-wider border border-leaf/20">
            <Award size={15} /> Official Brand & Formulation Academy
          </span>
          <h2 className="text-3xl font-black text-forest dark:text-cream sm:text-5xl tracking-tight">
            About Charan Organics
          </h2>
          <p className="text-sm sm:text-base text-ink/75 dark:text-cream/75 leading-relaxed font-medium">
            Your trusted source for pure, handcrafted organic and ayurvedic products & certified formulation training.
          </p>
        </div>

        {/* Legal Authorization & Trademark Notice Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-forest via-[#0d2a1f] to-forest text-cream p-6 sm:p-8 shadow-xl border border-leaf/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <ShieldCheck size={220} />
          </div>
          <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                <ScrollText size={14} /> Legal Compliance & Brand Authorization
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Officially Registered Under The Trademarks Act, 1999
              </h3>
              <p className="text-xs sm:text-sm text-cream/85 leading-relaxed">
                Charan Organics operates with complete legal authorization and official trademark application under 
                <span className="font-bold text-white"> The Trademarks Act, 1999</span>. The trademark process is officially handled through authorized legal representatives to ensure full compliance with Indian intellectual property laws, reflecting our commitment to authenticity, brand protection, and customer trust.
              </p>
            </div>
            <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center space-y-2">
              <ShieldCheck size={36} className="mx-auto text-emerald-400" />
              <p className="text-xs font-black uppercase text-cream tracking-wider">100% Authentic Brand</p>
              <p className="text-[11px] text-cream/75">Certified formulations & training classes available worldwide online.</p>
            </div>
          </div>
        </div>

        {/* Our Story & Academy Training Overview */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="rounded-3xl bg-white dark:bg-white/5 p-6 sm:p-8 border border-forest/10 dark:border-white/10 shadow-soft space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-leaf tracking-wider">
              <Heart size={16} /> Our Story & Heritage
            </div>
            <h3 className="text-2xl font-black text-forest dark:text-cream">
              Handcrafted with Love & Traditional Expertise
            </h3>
            <p className="text-xs sm:text-sm text-ink/75 dark:text-cream/75 leading-relaxed">
              Founded with a passion for natural wellness, Charan Organics brings you the finest organic and ayurvedic products, handcrafted with love and care. We believe in the power of nature to heal and nourish, and every product and formulation we create reflects this philosophy.
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-white/5 p-6 sm:p-8 border border-forest/10 dark:border-white/10 shadow-soft space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-leaf tracking-wider">
              <Sparkles size={16} /> Formulation Training Classes
            </div>
            <h3 className="text-2xl font-black text-forest dark:text-cream">
              Learn Organic Product Manufacturing Online
            </h3>
            <p className="text-xs sm:text-sm text-ink/75 dark:text-cream/75 leading-relaxed">
              We provide professional training classes on how organic and personal care products are made. Our online classes allow learners to join from anywhere in India and globally, empowering students to master batch formulation, safety protocols, and brand building.
            </p>
          </div>
        </div>

        {/* Our Core Values (5 Pillars) */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-forest dark:text-cream sm:text-3xl">Our Core Values</h3>
            <p className="text-xs sm:text-sm text-ink/65 dark:text-cream/65 mt-1">Guided by nature, purity, and traditional wisdom</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: "Pure & Natural", desc: "Only pure, natural ingredients with no harmful chemicals", icon: Leaf },
              { title: "Handmade", desc: "Carefully handcrafted in small batches for maximum quality", icon: Heart },
              { title: "Cruelty-Free", desc: "Never tested on animals, 100% ethical ingredients", icon: ShieldCheck },
              { title: "Sustainable", desc: "Committed to eco-friendly practices & packaging", icon: Sparkles },
              { title: "Authentic", desc: "Traditional ayurvedic formulations passed down generations", icon: Award },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-white dark:bg-white/5 p-5 border border-forest/10 dark:border-white/10 shadow-sm text-center space-y-2 hover:-translate-y-1 transition">
                <div className="mx-auto grid size-11 place-items-center rounded-xl bg-leaf/15 text-leaf">
                  <v.icon size={22} />
                </div>
                <h4 className="font-black text-forest dark:text-cream text-sm">{v.title}</h4>
                <p className="text-[11px] text-ink/65 dark:text-cream/65 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Promise Checklist */}
        <div className="rounded-3xl bg-emerald-950/10 dark:bg-white/5 p-6 sm:p-8 border border-emerald-500/20 space-y-4">
          <h3 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
            <CheckCircle2 className="text-leaf" size={24} /> Our Quality Promise
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Free from harmful chemicals & synthetic additives",
              "Made with certified organic ingredients",
              "Rigorously tested for quality & purity",
              "Eco-friendly packaging delivered with care",
            ].map((promise, i) => (
              <div key={i} className="flex items-start gap-3 bg-white dark:bg-white/5 p-3.5 rounded-xl border border-emerald-500/10 text-xs font-bold text-forest dark:text-cream">
                <span className="grid size-5 place-items-center rounded-full bg-leaf text-white font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{promise}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media & Contact Headquarters Grid */}
        <div className="grid lg:grid-cols-2 gap-8 pt-4">
          {/* Social Channels */}
          <div className="rounded-3xl bg-white dark:bg-white/5 p-6 sm:p-8 border border-forest/10 dark:border-white/10 shadow-soft space-y-5">
            <div>
              <h3 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
                Follow Us for Daily Updates
              </h3>
              <p className="text-xs text-ink/65 dark:text-cream/65 mt-1">
                Stay connected for product updates, formulation behind-the-scenes, and wellness tips.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://www.instagram.com/charan_organics_cosmetics/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 hover:border-pink-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-pink-600 text-white shadow-md">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 dark:text-cream">Instagram Profile</p>
                    <p className="text-xs font-bold text-pink-600 dark:text-pink-400">@charan_organics_cosmetics</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-pink-600 transition" />
              </a>

              <a
                href="https://youtube.com/@charanorganicsoapsvlogs?si=B2L-khPUbmEIjsyn"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-red-600 text-white shadow-md">
                    <Youtube size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 dark:text-cream">YouTube Channel</p>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">@charanorganicsoapsvlogs</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-red-600 transition" />
              </a>
            </div>
          </div>

          {/* Contact Details & Official Address */}
          <div className="rounded-3xl bg-white dark:bg-white/5 p-6 sm:p-8 border border-forest/10 dark:border-white/10 shadow-soft space-y-4">
            <div>
              <h3 className="text-xl font-black text-forest dark:text-cream">Contact Us</h3>
              <p className="text-xs text-ink/65 dark:text-cream/65 mt-1">
                Have questions about our academy or products? Reach out directly!
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-linen dark:bg-white/5 border border-forest/5 dark:border-white/5">
                <Mail size={18} className="text-leaf shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-ink/50 dark:text-cream/50 uppercase">Email Address</p>
                  <a href="mailto:chinnammadu46@gmail.com" className="font-bold text-forest dark:text-cream hover:underline">
                    chinnammadu46@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-linen dark:bg-white/5 border border-forest/5 dark:border-white/5">
                <Phone size={18} className="text-leaf shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-ink/50 dark:text-cream/50 uppercase">Phone / WhatsApp</p>
                  <a href="tel:+918247838125" className="font-bold text-forest dark:text-cream hover:underline">
                    +91 824 783 8125
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-linen dark:bg-white/5 border border-forest/5 dark:border-white/5">
                <MapPin size={18} className="text-leaf shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-ink/50 dark:text-cream/50 uppercase">Academy Headquarters</p>
                  <p className="font-bold text-forest dark:text-cream leading-relaxed">
                    Charan Organics, Tirumala Reddy's Building, Rohini Residency, House No.: 201, 2nd Floor (Lift Side), Retreat Colony, Old Alwal, Secunderabad, Telangana - 500010
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
