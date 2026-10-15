import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2, Clock, Globe2, Lock, PlayCircle, Sparkles, FileText, Award, Download,
} from "lucide-react";
import { getCourseBySlug } from "@/lib/course-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourseReviews } from "@/components/course/course-reviews";
import { CourseEnrollWidget } from "@/components/course/course-enroll-widget";

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

  // Fetch the raw course to get price_inr reliably
  const { data: dbCourse } = await supabase
    .from("lms_courses")
    .select("id, price_inr")
    .eq("slug", slug)
    .single();

  const isFree = course.price === 0 || (dbCourse && Number(dbCourse.price_inr) === 0);

  let isEnrolled = false;
  let hasPendingRequest = false;
  let isAdmin = false;

  if (user && dbCourse) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("lms_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";

    const { data: enroll } = await supabase
      .from("lms_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", dbCourse.id)
      .eq("status", "active")
      .maybeSingle();

    if (enroll) {
      isEnrolled = true;
    } else if (!isFree) {
      // Only check pending requests for paid courses
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

  const hasAccess = isEnrolled || isFree || isAdmin;
  const pdfResources = (course.pdfResources && course.pdfResources.length > 0)
    ? course.pdfResources
    : (course.pdfUrl ? [{ id: "pdf_1", title: `${course.title} Formulation Guide`, url: course.pdfUrl }] : []);
  const hasPdf = pdfResources.length > 0;

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="bg-forest text-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          {/* Left: course meta */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold">{course.category}</span>
              {isFree ? (
                <span className="rounded-full bg-leaf px-4 py-1.5 text-sm font-black text-white">
                  🎁 FREE Course
                </span>
              ) : (
                <span className="rounded-full bg-amber-500 px-4 py-1.5 text-sm font-black text-white">
                  ✨ Premium Course
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-cream/75">{course.description}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-cream/80">
              <span className="flex items-center gap-1.5">
                <PlayCircle size={17} />
                {isFree ? "Free video class" : "1 protected video"}
              </span>
              <span className="flex items-center gap-1.5"><Clock size={17} /> {course.duration}</span>
              <span className="flex items-center gap-1.5"><Globe2 size={17} /> {course.language}</span>
            </div>
            <p className="mt-4 text-sm text-cream/60">
              Instructor: <strong className="text-cream">{course.instructor}</strong>
            </p>
          </div>

          {/* Right: Course card / action card */}
          <aside className="glass h-fit rounded-[2rem] p-4 text-forest dark:text-cream lg:sticky lg:top-24">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <div className="grid size-14 place-items-center rounded-full bg-white/90 text-forest shadow-lg">
                  <PlayCircle size={28} className="translate-x-0.5" />
                </div>
              </div>
              {isFree && (
                <span className="absolute top-3 left-3 rounded-full bg-leaf px-3 py-1 text-xs font-black text-white shadow">
                  FREE
                </span>
              )}
            </div>

            <div className="p-3 space-y-3 mt-1">
              {/* ── FREE COURSE: direct play, no enrollment ── */}
              {isFree && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-leaf/10 border border-leaf/20 p-4 text-sm text-leaf">
                    <div className="flex items-center gap-2 font-black mb-1">
                      <CheckCircle2 size={16} /> Free — No payment needed
                    </div>
                    <p className="text-xs leading-5 text-leaf/80">
                      This is a free class. Click below to watch it directly — no sign-up or payment required.
                    </p>
                  </div>
                  <Link href={`/learn/${course.slug}/main-video`} className="block">
                    <Button className="w-full gap-2 text-base py-3">
                      <PlayCircle size={20} /> Watch Free Class
                    </Button>
                  </Link>
                </div>
              )}

              {/* ── PAID COURSE: not enrolled, no pending ── */}
              {!isFree && !isEnrolled && !hasPendingRequest && (
                <CourseEnrollWidget
                  slug={course.slug}
                  basePrice={course.price}
                  variants={course.durationVariants}
                  isAuthenticated={Boolean(user)}
                />
              )}

              {/* ── PAID COURSE: pending approval ── */}
              {!isFree && hasPendingRequest && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-2 font-black mb-1">
                      <Clock size={16} /> Payment Verification Pending
                    </div>
                    <p className="text-xs leading-5">
                      Your payment has been submitted. Admin will verify and unlock access within 48 hours.
                    </p>
                  </div>
                  <Link href="/dashboard#access-requests" className="block">
                    <Button variant="secondary" className="w-full text-xs min-h-9 py-1 font-bold">
                      View Request Status
                    </Button>
                  </Link>
                </div>
              )}

              {/* ── ENROLLED (paid or free enrolled user) ── */}
              {isEnrolled && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-leaf/10 border border-leaf/20 p-4 text-sm text-leaf">
                    <div className="flex items-center gap-2 font-black mb-1">
                      <CheckCircle2 size={16} /> Enrolled & Active
                    </div>
                    <p className="text-xs leading-5 text-leaf/80">
                      You have full access to this course content and resources.
                    </p>
                  </div>
                  <Link href={`/learn/${course.slug}/main-video`} className="block">
                    <Button className="w-full gap-2">
                      <PlayCircle size={18} /> Start Learning
                    </Button>
                  </Link>
                </div>
              )}

              {/* ── Course includes (context-aware) ── */}
              <div className="mt-2 grid gap-2 text-xs font-semibold text-forest dark:text-cream border-t border-forest/10 dark:border-white/10 pt-3">
                <span className="flex items-center gap-2">
                  <PlayCircle size={15} className="text-leaf shrink-0" />
                  {isFree ? "1 free video lesson" : "1 HD protected video lesson"}
                </span>
                {hasPdf && (
                  <span className="flex items-center gap-2">
                    <FileText size={15} className="text-leaf shrink-0" />
                    {pdfResources.length > 1
                      ? `${pdfResources.length} formulation PDFs & guides included`
                      : "PDF notes & formula sheet included"}
                  </span>
                )}
                {!isFree && (
                  <>
                    <span className="flex items-center gap-2">
                      <Award size={15} className="text-leaf shrink-0" /> Course completion certificate
                    </span>
                    <span className="flex items-center gap-2">
                      <Sparkles size={15} className="text-amber-500 shrink-0" /> Premium video — no ads
                    </span>
                  </>
                )}
                {isFree && (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-leaf shrink-0" /> No login or payment needed
                  </span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Lower Content ── */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* What you'll learn */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
                <h2 className="text-2xl font-black text-forest dark:text-cream">What you will learn</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <div key={outcome} className="flex gap-3 text-sm font-semibold text-ink/75 dark:text-cream/75">
                      <CheckCircle2 className="shrink-0 text-leaf mt-0.5" size={17} /> {outcome}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulation Notes & Multiple PDF Materials Section */}
            {hasPdf && (
              <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forest/10 dark:border-white/10 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-leaf/10 text-leaf">
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-forest dark:text-cream">
                          Formulation Guides & PDF Materials
                        </h2>
                        {hasAccess ? (
                          <span className="rounded-full bg-leaf/15 px-2.5 py-0.5 text-[10px] font-black text-leaf">
                            Unlocked ({pdfResources.length}) ✅
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                            🔒 Enrolled Only ({pdfResources.length} {pdfResources.length === 1 ? "PDF" : "PDFs"})
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink/65 dark:text-cream/65 leading-relaxed">
                        {hasAccess
                          ? "Official batch measurements, formulation percentages, raw material sourcing, and safety checklists. 1-click download available for enrolled students."
                          : "Official batch measurements, formula percentages, raw material handling, and safety specifications. Strictly unlocked upon enrollment."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PDF Materials Grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {pdfResources.map((pdf, idx) => (
                    <div
                      key={pdf.id || idx}
                      className="flex flex-col justify-between rounded-2xl border border-forest/10 bg-linen/40 p-4 dark:border-white/10 dark:bg-white/5 space-y-3 hover:border-leaf/30 transition shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-full bg-forest/10 text-[10px] font-black text-forest dark:bg-white/10 dark:text-cream shrink-0">
                            {idx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-forest dark:text-cream leading-tight">
                            {pdf.title}
                          </h3>
                        </div>
                        {pdf.description && (
                          <p className="text-xs text-ink/60 dark:text-cream/60 pl-8 leading-relaxed">
                            {pdf.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 pl-8 flex items-center gap-2">
                        {hasAccess ? (
                          <a
                            href={`/api/courses/${course.slug}/pdf?id=${encodeURIComponent(pdf.id)}&download=true`}
                            download={pdf.title ? `${pdf.title}.pdf` : `${course.title}-notes.pdf`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-leaf transition active:scale-95"
                          >
                            <Download size={13} /> Download PDF
                          </a>
                        ) : (
                          <Link
                            href={`/enroll?course=${course.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest dark:bg-white/10 dark:text-cream px-3.5 py-1.5 text-xs font-bold transition"
                          >
                            <Lock size={12} /> Unlock with Enrollment
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
                <h2 className="text-2xl font-black text-forest dark:text-cream">Curriculum</h2>
                <div className="mt-5 divide-y divide-forest/10 dark:divide-white/10">
                  {course.modules.map((module, idx) => (
                    <div key={`${module.title}-${idx}`} className="py-4">
                      <h3 className="font-black text-forest dark:text-cream">{module.title}</h3>
                      {module.lessons.map((lesson) => (
                        <div key={lesson.slug}
                          className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-linen p-3 text-sm dark:bg-white/5">
                          <span className="flex items-center gap-2">
                            <PlayCircle size={17} className="text-leaf shrink-0" /> {lesson.title}
                          </span>
                          <span className="text-ink/55 dark:text-cream/55 text-xs">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Reviews & Experiences */}
            <CourseReviews courseTitle={course.title} courseSlug={course.slug} />
          </div>

          {/* Materials */}
          {course.materials && course.materials.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-forest dark:text-cream">Materials required</h2>
              {course.materials.map((material) => (
                <div key={material}
                  className="rounded-2xl border border-forest/10 bg-white p-4 text-sm font-semibold dark:border-white/10 dark:bg-white/5">
                  {material}
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
