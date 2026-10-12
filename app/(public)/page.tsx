import Link from "next/link";
import {
  ArrowRight, Award, BookOpen, CheckCircle2, Clock, Download,
  FileText, GraduationCap, PlayCircle, ShieldCheck, Sparkles, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { JoinAcademyCta } from "@/components/home/join-academy-cta";
import { FreeClassesStrip } from "@/components/home/free-classes-strip";
import { getPublishedCourses, getUserEnrolledCourseIds } from "@/lib/course-data";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeCourseTabs } from "@/components/home/home-course-tabs";
import { TestimonialsSection } from "@/components/home/testimonials-section";

export default async function HomePage() {
  const [courses, enrolledIds] = await Promise.all([
    getPublishedCourses(),
    getUserEnrolledCourseIds(),
  ]);

  const enrolledIdSet = new Set(enrolledIds);
  const coursesWithStatus = courses.map((c) => ({
    ...c,
    isEnrolled: Boolean(c.id && enrolledIdSet.has(c.id)),
  }));
  const myCourses = coursesWithStatus.filter((c) => c.id && enrolledIdSet.has(c.id));

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

      {/* 2.5 Dedicated "My Enrolled Courses" Section for Logged-In Students */}
      {myCourses.length > 0 && (
        <section className="bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent py-10 sm:py-14 border-b border-forest/10 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Your Learning Dashboard</span>
                </div>
                <h2 className="mt-1 text-2xl sm:text-4xl font-black text-forest dark:text-cream flex items-center gap-2.5">
                  <GraduationCap className="text-leaf size-7 sm:size-9 shrink-0" />
                  <span>My Enrolled Courses</span>
                  <span className="rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-black px-3 py-1 shadow-sm">
                    {myCourses.length} {myCourses.length === 1 ? "Course" : "Courses"}
                  </span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-ink/65 dark:text-cream/65">
                  Pick up right where you left off. Watch protected video lessons and download formulation notes.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/courses"
                  className="inline-flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-xs font-bold text-white hover:bg-leaf transition shadow-soft dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <BookOpen size={14} /> Student Portal
                </Link>
                <Link
                  href="/community"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/10 px-4 py-2.5 text-xs font-bold text-forest dark:text-cream border border-forest/15 dark:border-white/15 hover:bg-forest/5 transition"
                >
                  <Users size={14} /> Batch Chat
                </Link>
              </div>
            </div>

            {/* Grid of Enrolled Courses */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((course) => (
                <div
                  key={course.id || course.slug}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-emerald-500/40 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glass dark:border-emerald-500/30 dark:bg-[#0e1f18]"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/learn/${course.slug}/main-video`}
                    className="relative aspect-video w-full overflow-hidden rounded-[1.4rem] bg-black/10 block"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 shadow-md flex items-center gap-1">
                      <CheckCircle2 size={11} /> Unlocked & Active
                    </span>
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5">
                      {course.category}
                    </span>
                  </Link>

                  {/* Body */}
                  <div className="mt-3.5 flex flex-1 flex-col justify-between space-y-3">
                    <div>
                      <Link href={`/learn/${course.slug}/main-video`}>
                        <h3 className="line-clamp-2 text-base font-black text-forest dark:text-cream leading-tight hover:text-leaf transition">
                          {course.title}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center gap-3 text-xs font-semibold text-ink/60 dark:text-cream/60">
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-leaf" /> {course.duration}
                        </span>
                        {course.pdfUrl && (
                          <span className="flex items-center gap-1 text-leaf font-bold">
                            <FileText size={13} /> Notes Ready
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-forest/10 dark:border-white/10 flex items-center gap-2">
                      <Link
                        href={`/learn/${course.slug}/main-video`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest px-4 py-2.5 text-xs font-black text-white hover:bg-leaf transition shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      >
                        <PlayCircle size={15} /> Continue Learning
                      </Link>
                      {course.pdfUrl && (
                        <a
                          href={`/api/courses/${course.slug}/pdf?download=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid size-9 place-items-center rounded-xl bg-forest/5 text-forest hover:bg-forest/10 transition dark:bg-white/10 dark:text-cream shrink-0"
                          title="Download formulation PDF notes"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Interactive Course Tabs: My Courses (if enrolled) | Recently Added | Featured | Trending */}
      <HomeCourseTabs courses={coursesWithStatus} myCourses={myCourses} />

      {/* 4. Free Classes Strip */}
      <div id="free-classes">
        <FreeClassesStrip />
      </div>

      {/* 5. Prominent Community Section */}
      <section className="overflow-hidden bg-white py-12 sm:py-20 dark:bg-[#07140f] border-b border-forest/10 dark:border-white/10">
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
      <Section className="py-12 sm:py-20">
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
      <Section className="pb-8 sm:pb-16">
        <JoinAcademyCta />
      </Section>
    </>
  );
}
