import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { CourseCard } from "@/components/course/course-card";
import { testimonials } from "@/lib/data";
import { JoinAcademyCta } from "@/components/home/join-academy-cta";
import { FreeClassesStrip } from "@/components/home/free-classes-strip";
import { getPublishedCourses } from "@/lib/course-data";
import { HeroCarousel } from "@/components/home/hero-carousel";

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const featuredCourses = courses.filter((course) => course.featured).slice(0, 6);

  return (
    <>
      <HeroCarousel />

      {/* Quick Stats Bar */}
      <section className="border-b border-forest/10 bg-white dark:border-white/10 dark:bg-[#0a1c15]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-forest/10 dark:divide-white/10">
          <div className="pt-4 sm:pt-0">
            <p className="text-3xl font-black text-forest dark:text-cream">2,000+</p>
            <p className="text-sm font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-1">Students Enrolled</p>
          </div>
          <div className="pt-4 sm:pt-0">
            <p className="text-3xl font-black text-forest dark:text-cream">{courses.length}+</p>
            <p className="text-sm font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-1">Premium Courses</p>
          </div>
          <div className="pt-4 sm:pt-0">
            <p className="text-3xl font-black text-forest dark:text-cream">50+</p>
            <p className="text-sm font-bold text-ink/50 dark:text-cream/50 uppercase tracking-widest mt-1">Free Video Lessons</p>
          </div>
        </div>
      </section>

      {/* Prominent Community Section - "Not just a streaming site" */}
      <section className="overflow-hidden bg-white py-24 dark:bg-[#07140f] border-b border-forest/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
               <p className="font-bold uppercase tracking-[0.18em] text-leaf flex items-center gap-2"><Users size={18}/> Vibrant Community</p>
               <h2 className="mt-4 text-4xl font-black text-forest dark:text-cream sm:text-5xl leading-tight">Learn together. <br className="hidden sm:block"/>Grow together.</h2>
               <p className="mt-6 text-lg text-ink/70 dark:text-cream/70 leading-relaxed">
                 Charan Organics has evolved beyond just video streaming. We are a thriving ecosystem of passionate makers. 
                 When you enroll, you join exclusive batches where you can chat, share your formulations, get expert feedback, and build lifelong connections.
               </p>
               <ul className="mt-8 space-y-5">
                 {[
                   "Private batch chat rooms for enrolled students",
                   "Direct access to expert instructors for Q&A",
                   "Share photos and formulation progress",
                   "Collaborate on new organic recipes"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-4 font-bold text-forest dark:text-cream">
                     <span className="grid size-8 place-items-center rounded-full bg-leaf/10 text-leaf"><CheckCircle2 size={16} /></span>
                     {item}
                   </li>
                 ))}
               </ul>
               <div className="mt-10">
                 <Link href="/register" className="block w-full sm:inline-block">
                   <Button className="w-full sm:w-auto bg-forest hover:bg-moss text-cream px-8 py-6 text-base font-bold shadow-lg">Join the Community Today</Button>
                 </Link>
               </div>
             </div>
             
             {/* Visual mockup of the community chat */}
             <div className="relative h-[600px] w-full rounded-[2.5rem] bg-forest p-2 shadow-2xl">
                <div className="h-full w-full rounded-[2rem] bg-[#f7f3ea] dark:bg-[#0a1c15] overflow-hidden flex flex-col relative border border-white/10">
                  {/* Mock Header */}
                  <div className="bg-white dark:bg-white/5 p-4 border-b border-forest/10 dark:border-white/10 flex items-center gap-3">
                    <div className="h-10 w-10 bg-leaf rounded-xl grid place-items-center text-white"><Users size={20}/></div>
                    <div>
                      <div className="font-bold text-sm text-forest dark:text-cream">Soap Making Batch 2025</div>
                      <div className="text-xs text-ink/50 dark:text-cream/50">24 members online</div>
                    </div>
                  </div>
                  {/* Mock Messages */}
                  <div className="flex-1 p-5 space-y-6 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f7f3ea] dark:to-[#0a1c15] z-10" />
                     
                     <div className="flex gap-3">
                       <div className="h-8 w-8 rounded-full bg-clay grid place-items-center text-white text-xs font-bold shrink-0">MG</div>
                       <div>
                         <div className="flex items-center gap-2"><span className="text-sm font-bold text-forest dark:text-cream">Maria G.</span><span className="text-[10px] text-ink/40">10:42 AM</span></div>
                         <div className="mt-1 bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-ink/80 dark:text-cream/80 border border-forest/5 dark:border-white/5">
                           Just tried the aloe vera shampoo formulation from Module 3! The consistency is perfect. Thanks everyone for the tips on blending. 🌿
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-3 flex-row-reverse">
                       <div className="h-8 w-8 rounded-full bg-leaf grid place-items-center text-white text-xs font-bold shrink-0">Me</div>
                       <div className="items-end flex flex-col">
                         <div className="flex items-center gap-2 flex-row-reverse"><span className="text-sm font-bold text-forest dark:text-cream">You</span><span className="text-[10px] text-ink/40">10:45 AM</span></div>
                         <div className="mt-1 bg-leaf p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-white">
                           That looks amazing Maria! Did you adjust the pH at all?
                         </div>
                       </div>
                     </div>

                     <div className="flex gap-3">
                       <div className="h-8 w-8 rounded-full bg-forest grid place-items-center text-white text-xs font-bold shrink-0">SA</div>
                       <div>
                         <div className="flex items-center gap-2"><span className="text-sm font-bold text-forest dark:text-cream">Instructor Sarah</span><span className="text-[10px] bg-leaf/20 text-leaf px-2 rounded-full font-bold">Admin</span><span className="text-[10px] text-ink/40">10:50 AM</span></div>
                         <div className="mt-1 bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-ink/80 dark:text-cream/80 border border-forest/5 dark:border-white/5">
                           Great job! Remember to keep the temperature below 40°C when adding the essential oils to preserve their properties.
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-leaf">Featured Courses</p>
            <h2 className="mt-2 text-3xl font-black text-forest dark:text-cream sm:text-4xl">Master the art of formulation</h2>
          </div>
          <Link href="/courses" className="inline-flex items-center gap-2 font-bold text-leaf hover:text-forest transition">View full catalog <ArrowRight size={18} /></Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.length ? featuredCourses.map((course) => <CourseCard key={course.slug} course={course} />) : (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-soft dark:bg-white/5 md:col-span-2 lg:col-span-3">
              <BookOpen className="mx-auto mb-4 text-leaf" size={40} />
              <h3 className="text-2xl font-black text-forest dark:text-cream">No featured courses yet</h3>
              <p className="mt-2 text-ink/60 dark:text-cream/60">Courses added and featured by admin will appear here.</p>
            </div>
          )}
        </div>
      </Section>

      <FreeClassesStrip />

      <Section>
        <div className="text-center max-w-3xl mx-auto mb-16">
           <h2 className="text-3xl font-black text-forest dark:text-cream sm:text-4xl">Everything you need to succeed</h2>
           <p className="mt-4 text-lg text-ink/70 dark:text-cream/70">An industry-standard learning experience designed specifically for organic product makers.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Premium Video Player", text: "Enjoy fast, ad-free video streaming with our protected custom player. Watch on any device seamlessly." },
            { icon: Sparkles, title: "Practical Resources", text: "Download PDF notes, formulation spreadsheets, ingredient checklists, and batch safety worksheets." },
            { icon: Award, title: "Verifiable Certificates", text: "Track your progress and earn beautifully designed, verifiable certificates upon course completion." }
          ].map((item) => <div key={item.title} className="bg-white dark:bg-white/5 border border-forest/5 dark:border-white/5 rounded-[2.5rem] p-8 shadow-soft hover:shadow-md transition text-center"><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-leaf/10 text-leaf mb-6"><item.icon size={28} /></div><h3 className="text-xl font-black text-forest dark:text-cream">{item.title}</h3><p className="mt-4 text-sm leading-relaxed text-ink/65 dark:text-cream/65">{item.text}</p></div>)}
        </div>
      </Section>

      <section className="bg-forest text-cream">
        <Section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black sm:text-4xl">What our makers say</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => <div key={item.name} className="rounded-[2.5rem] bg-white/10 p-8 border border-white/5"><div className="grid size-14 place-items-center rounded-full bg-leaf text-white font-black text-lg">{item.avatar}</div><p className="mt-6 leading-relaxed text-cream/90 italic">"{item.quote}"</p><div className="mt-6 font-bold">{item.name}</div><div className="text-sm text-cream/60">{item.role}</div></div>)}
          </div>
        </Section>
      </section>

      <Section className="pb-24">
        <JoinAcademyCta />
      </Section>
    </>
  );
}
