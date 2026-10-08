import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, GraduationCap, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { testimonials } from "@/lib/data";
import { JoinAcademyCta } from "@/components/home/join-academy-cta";
import { FreeClassesStrip } from "@/components/home/free-classes-strip";
import { getPublishedCourses } from "@/lib/course-data";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeCourseTabs } from "@/components/home/home-course-tabs";
import { TestimonialsSection } from "@/components/home/testimonials-section";

export default async function HomePage() {
  const courses = await getPublishedCourses();

  return (
    <>
      {/* 1. Sleek Hero Carousel */}
      <HeroCarousel />

      {/* 2. Quick Stats Bar */}
      <section className="border-b border-forest/10 bg-white dark:border-white/10 dark:bg-[#0a1c15]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:py-8 sm:grid-cols-3 sm:px-6 lg:px-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-forest/10 dark:divide-white/10">
          <div className="pt-3 sm:pt-0">
            <p className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">2,000+</p>
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-0.5">Students Enrolled</p>
          </div>
          <div className="pt-3 sm:pt-0">
            <p className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">{courses.length}+</p>
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-0.5">Premium Courses</p>
          </div>
          <div className="pt-3 sm:pt-0">
            <p className="text-2xl sm:text-3xl font-black text-forest dark:text-cream">50+</p>
            <p className="text-xs font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-0.5">Free Video Lessons</p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Course Tabs: Recently Added | Featured | Trending */}
      <HomeCourseTabs courses={courses} />

      {/* 4. Free Classes Strip */}
      <div id="free-classes">
        <FreeClassesStrip />
      </div>

      {/* 5. Prominent Community Section */}
      <section className="overflow-hidden bg-white py-16 sm:py-24 dark:bg-[#07140f] border-b border-forest/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-leaf text-xs sm:text-sm flex items-center gap-2">
                <Users size={16} /> Vibrant Community
              </p>
              <h2 className="mt-3 text-3xl font-black text-forest dark:text-cream sm:text-5xl leading-tight">
                Learn together. <br className="hidden sm:block" />Grow together.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-ink/70 dark:text-cream/70 leading-relaxed">
                Charan Organics has evolved into a thriving ecosystem of passionate makers. When you enroll, you join exclusive batches where you can chat, share your formulations, get expert feedback, and build lifelong connections.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  "Private batch chat rooms for enrolled students",
                  "Direct access to expert instructors for Q&A",
                  "Share photos and formulation progress",
                  "Collaborate on new organic recipes",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-forest dark:text-cream">
                    <span className="grid size-7 place-items-center rounded-full bg-leaf/10 text-leaf shrink-0">
                      <CheckCircle2 size={14} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/community" className="block w-full sm:inline-block">
                  <Button className="w-full sm:w-auto bg-forest hover:bg-moss text-cream px-8 py-4 text-sm sm:text-base font-bold shadow-lg">
                    Join the Community Today
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual mockup of community chat */}
            <div className="relative h-[480px] sm:h-[540px] w-full rounded-[2.5rem] bg-forest p-2 shadow-2xl">
              <div className="h-full w-full rounded-[2rem] bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden flex flex-col relative border border-white/10">
                <div className="bg-[#e9edef] dark:bg-[#202c33] p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-700 rounded-full grid place-items-center text-white font-bold text-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-cream">Soap Making Batch 2025</div>
                    <div className="text-xs text-gray-500 dark:text-cream/50">24 members online</div>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                  <div className="flex gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-700 grid place-items-center text-white text-xs font-bold shrink-0">
                      MG
                    </div>
                    <div>
                      <div className="flex items-center gap-2"><span className="text-xs font-bold text-gray-900 dark:text-cream">Maria G.</span></div>
                      <div className="mt-1 bg-white dark:bg-[#202c33] p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-gray-800 dark:text-cream border">
                        Just tried the aloe vera shampoo formulation from Module 3! The consistency is perfect. 🌿
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 grid place-items-center text-white text-xs font-bold shrink-0">
                      You
                    </div>
                    <div className="items-end flex flex-col">
                      <div className="mt-1 bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-2xl rounded-tr-none shadow-sm text-xs text-gray-900 dark:text-cream">
                        That looks amazing Maria! Did you adjust the pH at all?
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Features Grid */}
      <Section className="py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl font-black text-forest dark:text-cream sm:text-4xl">Everything you need to succeed</h2>
          <p className="mt-3 text-sm sm:text-base text-ink/70 dark:text-cream/70">
            An industry-standard learning experience designed specifically for organic product makers.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "Step-by-Step Formulation Training",
              text: "Master herbal soaps, organic shampoos, hair oils, and skin serums with step-by-step video lessons and batch-scaling guides.",
            },
            {
              icon: Sparkles,
              title: "Practical Resources",
              text: "Download PDF notes, formulation spreadsheets, ingredient checklists, and batch safety worksheets.",
            },
            {
              icon: Award,
              title: "Verifiable Certificates",
              text: "Track your progress and earn beautifully designed, verifiable certificates upon course completion.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-white/5 border border-forest/5 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-soft hover:shadow-md transition text-center"
            >
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-leaf/10 text-leaf mb-5">
                <item.icon size={26} />
              </div>
              <h3 className="text-lg font-black text-forest dark:text-cream">{item.title}</h3>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ink/65 dark:text-cream/65">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Testimonials Section with Add Review Action */}
      <TestimonialsSection />

      {/* 8. Call to Action */}
      <Section className="pb-24">
        <JoinAcademyCta />
      </Section>
    </>
  );
}
