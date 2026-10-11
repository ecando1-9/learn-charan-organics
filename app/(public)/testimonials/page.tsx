import Link from "next/link";
import {
  Award,
  CheckCircle2,
  GraduationCap,
  Quote,
  Sparkles,
  Star,
  TrendingUp,
  Users2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type Testimonial = {
  name: string;
  role: string;
  location: string;
  brand?: string;
  course: string;
  rating: number;
  highlight: string;
  story: string;
};

const reviews: Testimonial[] = [
  {
    name: "Priyadarshini Rao",
    role: "Founder, Prakriti Botane Handcrafted",
    location: "Hyderabad, Telangana",
    brand: "Prakriti Botane",
    course: "Diploma in Herbal Cosmetic Product Making",
    rating: 5,
    highlight: "Scaled from a kitchen hobby to 250+ units monthly retail sales",
    story:
      "Before joining Charan Organics Academy, my cold-process soaps kept weeping and losing scent. Dr. Charan's step-by-step videos on lye discount calculations, trace temperature, and fatty acid profiling completely changed my products. My customers love the gentle lather, and I've now launched my own D2C website!",
  },
  {
    name: "Karthik Subramanian",
    role: "Co-Founder, Oushadha Herbal Remedies",
    location: "Bengaluru, Karnataka",
    brand: "Oushadha Care",
    course: "Ayurvedic Hair Care & Taila Formulation",
    rating: 5,
    highlight: "Mastered traditional Taila Paka Vidhi with contemporary stability",
    story:
      "The precision taught in this course is unmatched. They explain phase extraction, moisture testing using the wick flame test, and microbial preservative choices in simple scientific terms. The downloadable PDF batch sheets are permanent references in my workshop.",
  },
  {
    name: "Sunita Deshmukh",
    role: "Artisanal Soapmaker & Educator",
    location: "Pune, Maharashtra",
    brand: "Sunita Herbals",
    course: "Cold Process & Melt-and-Pour Soap Mastery",
    rating: 5,
    highlight: "Earned my official Certificate of Completion within 3 weeks",
    story:
      "I was skeptical about online classes for physical soapmaking, but the multi-angle 4K videos show every detail from saponification trace to swirl pouring. The community chat group gave me feedback on my first batch within 2 hours of posting!",
  },
  {
    name: "Deepa Menon",
    role: "Formulator, Malabar Botanics",
    location: "Kochi, Kerala",
    brand: "Malabar Organics",
    course: "Organic Face Serums & Emulsion Chemistry",
    rating: 5,
    highlight: "Learned how to make stable plant creams without chemical separation",
    story:
      "Dr. Meera Iyer's module on HLB values, natural emulsifiers (Olivem 1000), and water-activity control made organic lotion crafting so straightforward. My creams no longer separate after 30 days. Truly an industry-grade educational resource.",
  },
  {
    name: "Anand Verma",
    role: "Brand Director, Vedic Roots Naturals",
    location: "Jaipur, Rajasthan",
    brand: "Vedic Roots",
    course: "Herbal Shampoo & Body Wash Formulations",
    rating: 5,
    highlight: "Replaced harsh sulfates with gentle coconut-derived surfactants",
    story:
      "The business and packaging insights alone saved us tens of thousands of rupees in machinery trials. Arun Prakash's guidance on bottle capping torque and stability testing gave our brand the confidence to enter premium boutique pharmacies.",
  },
  {
    name: "Aparna Nambiar",
    role: "Certified Skincare Crafter",
    location: "Chennai, Tamil Nadu",
    course: "Diploma in Herbal Cosmetic Product Making",
    rating: 5,
    highlight: "Easy 1-click video playback and instant PDF formulation sheets",
    story:
      "The learning interface is so smooth. Being able to watch lessons on my phone while measuring ingredients in the kitchen is fantastic. When I hit 70% progress, I instantly downloaded my QR-verified completion certificate!",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles size={14} /> Student Transformations & Case Studies
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Trusted by 2,500+ Formulators
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/80">
            Read inspiring stories of homemakers, chemistry graduates, and cosmetic entrepreneurs who mastered organic product formulation with Charan Organics Academy.
          </p>

          {/* Trust Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/15">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400" />
                ))}
              </div>
              <p className="mt-2 text-2xl font-black text-white">4.97 / 5</p>
              <p className="text-xs text-white/70">Average Student Rating</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/15">
              <Users2 size={20} className="text-leaf" />
              <p className="mt-2 text-2xl font-black text-white">2,500+</p>
              <p className="text-xs text-white/70">Graduated Students</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/15">
              <Award size={20} className="text-emerald-400" />
              <p className="mt-2 text-2xl font-black text-white">85+</p>
              <p className="text-xs text-white/70">Commercial Brands Launched</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/15">
              <CheckCircle2 size={20} className="text-teal-400" />
              <p className="mt-2 text-2xl font-black text-white">99.4%</p>
              <p className="text-xs text-white/70">Batch Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      <Section className="pt-12">
        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-[2rem] border border-forest/10 bg-white p-6 sm:p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-glass dark:border-white/10 dark:bg-white/5"
            >
              <div className="space-y-4">
                {/* Rating & Highlight */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-500" />
                    ))}
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 flex items-center gap-1 dark:text-emerald-400">
                    <ShieldCheck size={11} /> Verified Student
                  </span>
                </div>

                <div className="border-l-2 border-leaf pl-3 py-0.5">
                  <p className="text-xs font-black text-forest dark:text-cream leading-tight">
                    &ldquo;{rev.highlight}&rdquo;
                  </p>
                </div>

                {/* Review Narrative */}
                <p className="text-xs sm:text-sm leading-relaxed text-ink/70 dark:text-cream/70">
                  {rev.story}
                </p>
              </div>

              {/* Author & Course Attribution */}
              <div className="mt-6 pt-4 border-t border-forest/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-forest dark:text-cream">
                      {rev.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-leaf">
                      {rev.role}
                    </p>
                    <p className="text-[10px] text-ink/50 dark:text-cream/50">
                      {rev.location}
                    </p>
                  </div>
                  <div className="grid size-10 place-items-center rounded-xl bg-forest/5 text-forest/40 dark:bg-white/10 dark:text-cream/40">
                    <Quote size={18} />
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-linen px-3 py-1.5 text-[10px] font-bold text-ink/70 dark:bg-white/5 dark:text-cream/70 truncate">
                  📚 {rev.course}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-r from-forest to-[#12382a] p-8 sm:p-12 text-cream shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cream">
              <GraduationCap size={14} /> Join Our Successful Alumni
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready to Formulate Your Own Natural Products?
            </h3>
            <p className="text-sm text-cream/75 max-w-xl">
              Enroll today to unlock lifetime formulation video lessons, exact formulation percentages, and direct mentor support.
            </p>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button className="rounded-full bg-emerald-600 px-6 py-3.5 text-xs font-black text-white hover:bg-emerald-500 shadow-md transition scale-100 hover:scale-[1.02]">
              Explore Masterclasses <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
