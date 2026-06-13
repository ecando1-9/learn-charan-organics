import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, FileText, Leaf, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FadeIn } from "@/components/ui/animated";
import { CourseCard } from "@/components/course/course-card";
import { diplomaCurriculum, testimonials } from "@/lib/data";
import { JoinAcademyCta } from "@/components/home/join-academy-cta";
import { getPublishedCourses } from "@/lib/course-data";

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const featuredCourses = courses.filter((course) => course.featured).slice(0, 6);

  return (
    <>
      <section className="organic-bg relative min-h-[calc(100svh-4rem)] overflow-hidden text-white">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <FadeIn>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"><Leaf size={16} /> Natural product making academy</span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">Build your organic products brand with expert-led courses.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">Learn soap, shampoo, herbal oils, skin care, candles, perfumes, incense, detergents and beauty product manufacturing with practical video lessons, PDFs, progress tracking and certificates.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/courses"><Button className="bg-white text-forest hover:bg-cream"><BookOpen size={18} /> Browse courses</Button></Link>
                <Link href="/dashboard"><Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20"><PlayCircle size={18} /> Continue learning</Button></Link>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15} className="glass rounded-[2rem] p-4 text-forest dark:text-cream">
            <div className="grid gap-4">
              {[
                { icon: BookOpen, title: "Structured course library", text: "Browse natural product manufacturing courses by category." },
                { icon: PlayCircle, title: "Video lessons", text: "Learn through protected lessons with notes and resources." },
                { icon: FileText, title: "PDF resources", text: "Attach formulas, ingredients, measurements and safety sheets." }
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[1.5rem] bg-white/80 p-5 dark:bg-white/10">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-leaf/10 text-leaf"><item.icon size={20} /></span>
                  <div>
                    <div className="font-black">{item.title}</div>
                    <div className="mt-1 text-sm leading-6 text-ink/60 dark:text-cream/65">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-leaf">Featured Courses</p>
            <h2 className="mt-2 text-3xl font-black text-forest dark:text-cream sm:text-4xl">Popular manufacturing programs</h2>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-2 font-bold text-leaf">View all <ArrowRight size={18} /></Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.length ? featuredCourses.map((course) => <CourseCard key={course.slug} course={course} />) : (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft dark:bg-white/5 md:col-span-2 lg:col-span-3">
              <h3 className="text-xl font-black text-forest dark:text-cream">No featured courses yet</h3>
              <p className="mt-2 text-sm text-ink/60 dark:text-cream/60">Courses added and featured by admin will appear here.</p>
            </div>
          )}
        </div>
      </Section>

      <section className="bg-white/60 dark:bg-white/[0.03]">
        <Section>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-clay">Course Curriculum</p>
              <h2 className="mt-2 text-3xl font-black text-forest dark:text-cream">{diplomaCurriculum.title}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] bg-forest p-5 text-cream shadow-soft">
                  <p className="text-sm font-bold text-cream/65">Course Fee</p>
                  <p className="mt-1 text-3xl font-black">{diplomaCurriculum.price}</p>
                </div>
                <div className="rounded-[1.5rem] bg-leaf p-5 text-white shadow-soft">
                  <p className="text-sm font-bold text-white/70">Formulations Covered</p>
                  <p className="mt-1 text-3xl font-black">{diplomaCurriculum.totalFormulations}</p>
                </div>
              </div>
              <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-soft dark:bg-white/5">
                <h3 className="font-black text-forest dark:text-cream">Course Benefits</h3>
                <div className="mt-4 grid gap-3">
                  {diplomaCurriculum.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm font-semibold text-ink/70 dark:text-cream/70">
                      <CheckCircle2 size={17} className="shrink-0 text-leaf" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {diplomaCurriculum.modules.map((module, index) => (
                <details key={module.title} open={index < 2} className="group rounded-[1.5rem] border border-forest/10 bg-linen p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span>
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-leaf">Module {index + 1}</span>
                      <span className="mt-1 block text-lg font-black text-forest dark:text-cream">{module.title}</span>
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-forest shadow-sm dark:bg-white/10 dark:text-cream">{module.groups.reduce((total, group) => total + group.items.length, 0)} items</span>
                  </summary>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {module.groups.map((group) => (
                      <div key={group.title} className="rounded-2xl bg-white p-4 dark:bg-white/5">
                        <h3 className="font-black text-forest dark:text-cream">{group.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span key={item} className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf dark:bg-white/10 dark:text-cream">{item}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Section>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Protected learning", text: "Enrollment checks, Supabase RLS and private video routes keep premium lessons secure." },
            { icon: Sparkles, title: "Practical resources", text: "PDF notes, formulas, ingredient sheets, safety instructions and batch worksheets for each course." },
            { icon: Award, title: "Certificates", text: "Track completion, issue certificates and download polished course completion PDFs." }
          ].map((item) => <div key={item.title} className="glass rounded-[2rem] p-6"><item.icon className="text-leaf" /><h3 className="mt-4 text-xl font-black text-forest dark:text-cream">{item.title}</h3><p className="mt-2 text-sm leading-6 text-ink/65 dark:text-cream/65">{item.text}</p></div>)}
        </div>
      </Section>

      <section className="bg-forest text-cream">
        <Section>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => <div key={item.name} className="rounded-[2rem] bg-white/10 p-6"><div className="grid size-12 place-items-center rounded-full bg-moss font-black">{item.avatar}</div><p className="mt-5 leading-7 text-cream/80">"{item.quote}"</p><div className="mt-5 font-bold">{item.name}</div><div className="text-sm text-cream/55">{item.role}</div></div>)}
          </div>
        </Section>
      </section>

      <Section className="pb-24">
        <JoinAcademyCta />
      </Section>
    </>
  );
}
