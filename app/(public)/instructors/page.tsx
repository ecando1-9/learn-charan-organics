import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Star,
  Users2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

type Instructor = {
  name: string;
  role: string;
  qualification: string;
  experience: string;
  studentsTaught: string;
  rating: string;
  specialties: string[];
  bio: string;
  avatarUrl?: string;
  initials: string;
};

const faculty: Instructor[] = [
  {
    name: "Dr. Charan Raj",
    role: "Founder & Master Cosmetic Formulator",
    qualification: "M.Tech / Phytochemistry & Cosmetic Science Specialist",
    experience: "12+ Years Industry Experience",
    studentsTaught: "4,500+ Students",
    rating: "4.98",
    specialties: [
      "Natural Cosmetic Chemistry",
      "Herbal Hair Oil Formulations",
      "Ayurvedic Syrups & Extracts",
      "Commercial Brand Scale-Up",
    ],
    bio: "Pioneer in modernizing traditional herbal cosmetics with contemporary green chemistry. Having formulated over 40+ commercially successful retail SKUs across India, Dr. Charan mentors aspiring entrepreneurs through every nuance of safe, shelf-stable, and result-oriented product making.",
    initials: "CR",
  },
  {
    name: "Dr. Meera Iyer",
    role: "Ayurvedic Cosmetology & Dravyaguna Specialist",
    qualification: "BAMS, MD (Ayurveda Dravyaguna Vijnana)",
    experience: "9+ Years Research & Clinical Experience",
    studentsTaught: "3,200+ Students",
    rating: "4.95",
    specialties: [
      "Botanical Actives & Stability",
      "Organic Emulsions & Lotions",
      "Natural Preservative Systems",
      "pH & Microbial Control",
    ],
    bio: "Renowned expert in classical Ayurvedic herbs and their active constituents. Dr. Meera specializes in marrying therapeutic plant extracts with safe natural emulsifiers, teaching students how to produce certified organic creams and serums that pass stringent microbiology tests.",
    initials: "MI",
  },
  {
    name: "Er. Arun Prakash",
    role: "Small-Batch Manufacturing & GMP Consultant",
    qualification: "B.Tech Chemical Engineering, Lead Auditor GMP",
    experience: "10+ Years Plant Operations",
    studentsTaught: "2,100+ Students",
    rating: "4.92",
    specialties: [
      "Lab Machinery & Tool Sourcing",
      "Packaging Compatibility & Testing",
      "BIS & Drug License Protocols",
      "Cost of Goods & Profit Margins",
    ],
    bio: "Industry engineer guiding indie makers from kitchen hobbyists to registered small-batch manufacturing units. Arun breaks down equipment selection, packaging seal testing, batch records, and regulatory paperwork so your products can legally sit on retail shelves.",
    initials: "AP",
  },
  {
    name: "Smt. Nisha Varma",
    role: "Master Artisan Soapmaker & Botanical Crafter",
    qualification: "Certified Master Soapcrafter & Aromatherapist",
    experience: "8+ Years Studio Soapmaking",
    studentsTaught: "3,800+ Students",
    rating: "4.97",
    specialties: [
      "Cold-Process Soap Chemistry",
      "Saponification Value Calculations",
      "Natural Clays & Herb Infusions",
      "Luxury Artisanal Swirl Techniques",
    ],
    bio: "Beloved mentor to thousands of boutique soap brand owners. Nisha is celebrated for her foolproof breakdown of lye calculations, fatty acid balancing for rich lather, and 100% plant-based color infusions that retain vibrant hues and essential oil aromas without synthetic additives.",
    initials: "NV",
  },
];

export default function InstructorsPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="organic-bg text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur">
            <Sparkles size={14} /> Master Formulators & Faculty
          </span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl lg:text-6xl text-white">
            Meet Your Mentors
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/80">
            Learn organic cosmetic chemistry and small-batch manufacturing directly from India&apos;s leading Ayurvedic formulators and industry entrepreneurs.
          </p>
        </div>
      </section>

      <Section className="pt-12">
        {/* Faculty Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {faculty.map((mentor) => (
            <div
              key={mentor.name}
              className="group flex flex-col justify-between rounded-[2.5rem] border border-forest/10 bg-white p-6 sm:p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-glass dark:border-white/10 dark:bg-white/5"
            >
              <div className="space-y-6">
                {/* Header: Avatar, Name, Credentials */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="relative grid size-16 sm:size-20 shrink-0 place-items-center rounded-2xl bg-forest text-2xl sm:text-3xl font-black text-white shadow-soft dark:bg-emerald-600">
                    {mentor.initials}
                    <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-leaf text-white text-[10px] shadow-sm">
                      <CheckCircle2 size={13} />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-forest dark:text-cream">
                        {mentor.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-black text-amber-700 dark:text-amber-300">
                        <Star size={11} className="fill-amber-500 text-amber-500" /> {mentor.rating}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-leaf mt-0.5">
                      {mentor.role}
                    </p>
                    <p className="text-xs text-ink/55 dark:text-cream/55 mt-0.5">
                      {mentor.qualification}
                    </p>
                  </div>
                </div>

                {/* Metrics Pill Bar */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-linen p-3 text-center dark:bg-white/5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                      Experience
                    </p>
                    <p className="text-xs sm:text-sm font-black text-forest dark:text-cream">
                      {mentor.experience}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50">
                      Trained
                    </p>
                    <p className="text-xs sm:text-sm font-black text-forest dark:text-cream">
                      {mentor.studentsTaught}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs sm:text-sm leading-relaxed text-ink/75 dark:text-cream/75">
                  {mentor.bio}
                </p>

                {/* Specialties Chips */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50 dark:text-cream/50 mb-2">
                    Core Specializations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold text-forest dark:bg-white/10 dark:text-cream"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-8 pt-5 border-t border-forest/10 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs text-ink/60 dark:text-cream/60 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-leaf" /> Verified Faculty Member
                </span>
                <Link href="/courses">
                  <Button className="rounded-full bg-forest text-white hover:bg-leaf text-xs font-bold px-4 py-2 min-h-0 h-9">
                    View Mentored Courses <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Teaching / Faculty Banner */}
        <div className="mt-16 rounded-[2.5rem] bg-gradient-to-r from-forest to-[#12382a] p-8 sm:p-12 text-cream shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-cream">
              <GraduationCap size={14} /> Academic Faculty
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Are you a Cosmetic Chemist or Master Formulator?
            </h3>
            <p className="text-sm text-cream/75 max-w-xl">
              Partner with Charan Organics Academy to record accredited masterclasses and train the next generation of eco-friendly personal care brand creators.
            </p>
          </div>
          <Link href="/contact" className="shrink-0">
            <Button className="rounded-full bg-white px-6 py-3.5 text-xs font-black text-forest hover:bg-cream shadow-md">
              Apply to Teach <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
