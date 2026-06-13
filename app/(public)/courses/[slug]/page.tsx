import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Clock, FileText, Globe2, Lock, PlayCircle } from "lucide-react";
import { getCourseBySlug } from "@/lib/course-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isEnrolled = false;
  let hasPendingRequest = false;

  const { data: dbCourse } = await supabase
    .from("lms_courses")
    .select("id")
    .eq("slug", slug)
    .single();

  if (user && dbCourse) {
    const { data: enroll } = await supabase
      .from("lms_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", dbCourse.id)
      .eq("status", "active")
      .maybeSingle();

    if (enroll) {
      isEnrolled = true;
    } else {
      const { data: reqs } = await supabase
        .from("lms_enrollment_requests")
        .select("course_ids, selected_all")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (reqs && reqs.length > 0) {
        hasPendingRequest = reqs.some(
          (r) => r.selected_all || (r.course_ids && r.course_ids.includes(dbCourse.id))
        );
      }
    }
  }

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-black/25"><PlayCircle className="text-white" size={54} /></div>
            </div>
            <div className="p-3">
              {!isEnrolled && !hasPendingRequest && (
                <>
                  <div className="text-3xl font-black text-forest dark:text-cream">{formatCurrency(course.price)}</div>
                  <div className="mt-3 rounded-2xl bg-leaf/10 border border-leaf/20 px-4 py-3 text-sm font-semibold text-leaf">
                    💳 Pay using UPI
                  </div>
                  <Link href={`/enroll?course=${course.slug}`} className="mt-3 block">
                    <Button className="w-full"><Lock size={18} /> Request enrollment</Button>
                  </Link>
                </>
              )}

              {hasPendingRequest && (
                <div className="mt-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-600 dark:text-amber-400">
                  <div className="flex items-center gap-2 font-black mb-1">
                    <Clock size={16} /> Verification Pending
                  </div>
                  <p className="text-xs leading-5">
                    Your request has been submitted. Verification is processed within 48 hours. Check status in settings.
                  </p>
                  <Link href="/dashboard/settings" className="mt-3 block">
                    <Button variant="secondary" className="w-full text-xs min-h-9 py-1">View request status</Button>
                  </Link>
                </div>
              )}

              {isEnrolled && (
                <div className="mt-2 space-y-3">
                  <div className="rounded-2xl bg-leaf/10 border border-leaf/20 p-4 text-sm text-leaf">
                    <div className="flex items-center gap-2 font-black mb-1">
                      <CheckCircle2 size={16} /> Enrolled
                    </div>
                    <p className="text-xs leading-5 text-leaf/80">
                      You have active access to this course's content and resources.
                    </p>
                  </div>
                  <Link href={`/learn/${course.slug}/main-video`} className="block">
                    <Button className="w-full"><PlayCircle size={18} /> Start Learning</Button>
                  </Link>
                </div>
              )}

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
