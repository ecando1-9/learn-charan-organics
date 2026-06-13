import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Clock, Copy, FileText, Globe2, Lock, PlayCircle } from "lucide-react";
import { upiId } from "@/lib/data";
import { getCourseBySlug } from "@/lib/course-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course?.title ?? "Course", description: course?.description };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <section className="bg-forest text-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{course.category}</span>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-cream/75">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-cream/80">
              <span className="flex items-center gap-1"><PlayCircle size={18} /> 1 protected video</span>
              <span className="flex items-center gap-1"><Clock size={18} /> {course.duration}</span>
              <span className="flex items-center gap-1"><Globe2 size={18} /> {course.language}</span>
            </div>
            <p className="mt-5 text-sm text-cream/60">Instructor: <strong className="text-cream">{course.instructor}</strong></p>
          </div>
          <aside className="glass h-fit rounded-[2rem] p-4 text-forest lg:sticky lg:top-24 dark:text-cream">
            <div className="relative aspect-video overflow-hidden rounded-[1.5rem]">
              <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-black/25"><PlayCircle className="text-white" size={54} /></div>
            </div>
            <div className="p-3">
              <div className="text-3xl font-black">{formatCurrency(course.price)}</div>
              <div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm font-semibold leading-6 dark:bg-white/10">
                <p>Pay using UPI, then request course access from dashboard/admin approval.</p>
                <p className="mt-2 flex items-center gap-2 text-forest dark:text-cream"><Copy size={16} /> {upiId}</p>
              </div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Charan%20Organics&am=${course.price}&cu=INR&tn=${course.title}`)}`}
                alt={`UPI QR code for ${course.title}`}
                className="mx-auto mt-4 size-44 rounded-2xl bg-white p-2"
              />
              <Link href="/dashboard"><Button className="mt-4 w-full"><Lock size={18} /> Request enrollment</Button></Link>
              <Link href={`/learn/${course.slug}/main-video`}><Button variant="secondary" className="mt-3 w-full"><PlayCircle size={18} /> Open if approved</Button></Link>
              <div className="mt-5 grid gap-3 text-sm font-semibold">
                <span className="flex items-center gap-2"><Award size={17} /> Certificate after admin approval</span>
                <span className="flex items-center gap-2"><FileText size={17} /> PDFs and formula sheets</span>
                <span className="flex items-center gap-2"><Lock size={17} /> Video access for approved students</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
              <h2 className="text-2xl font-black text-forest dark:text-cream">What students will learn</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((outcome) => <div key={outcome} className="flex gap-3 text-sm font-semibold text-ink/75 dark:text-cream/75"><CheckCircle2 className="shrink-0 text-leaf" size={18} /> {outcome}</div>)}
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
              <h2 className="text-2xl font-black text-forest dark:text-cream">Curriculum</h2>
              <div className="mt-5 divide-y divide-forest/10 dark:divide-white/10">
                {course.modules.map((module) => <div key={module.title} className="py-4"><h3 className="font-black">{module.title}</h3>{module.lessons.map((lesson) => <div key={lesson.slug} className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-linen p-3 text-sm dark:bg-white/5"><span className="flex items-center gap-2"><PlayCircle size={17} className="text-leaf" /> {lesson.title}</span><span className="text-ink/55 dark:text-cream/55">{lesson.duration}</span></div>)}</div>)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-forest dark:text-cream">Materials required</h2>
            {course.materials.map((material) => <div key={material} className="rounded-2xl border border-forest/10 bg-white p-4 text-sm font-semibold dark:border-white/10 dark:bg-white/5">{material}</div>)}
          </div>
        </div>
      </Section>
    </>
  );
}
