"use client";

import { useEffect, useState } from "react";
import { Award, BookOpen, CheckCircle2, ChevronRight, Download, Loader2, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { getUserEnrolledCoursesWithProgress, type UserCourseProgress } from "@/app/actions/progress";
import { CertificateModal } from "@/components/certificate-modal";
import { getOrCreateStudentCertificate } from "@/app/actions/certificates";
import { createClient } from "@/lib/supabase/client";

export default function UserCertificatesPage() {
  const [courses, setCourses] = useState<UserCourseProgress[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<UserCourseProgress | null>(null);
  const [selectedCertId, setSelectedCertId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getUserEnrolledCoursesWithProgress().then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setCourses(res.data);
        setUserName(res.userName);
      }
      setLoading(false);
    });
  }, []);

  async function handleOpenCertModal(course: UserCourseProgress) {
    setSelectedCourse(course);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const certRes = await getOrCreateStudentCertificate({
          userId: user.id,
          courseId: course.courseId,
          studentName: userName,
        });
        if (certRes?.certificateNo) {
          setSelectedCertId(certRes.certificateNo);
        }
      }
    } catch {
      // Fallback handled smoothly
    }
    setModalOpen(true);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream flex items-center gap-3">
          <Award className="text-amber-500" size={32} /> My Certificates & Course Progress
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Complete 70% or more of any enrolled course to instantly unlock and download your official Certificate of Completion.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-leaf" size={36} />
        </div>
      ) : error ? (
        <div className="rounded-[2rem] bg-red-50 p-6 text-sm font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-soft dark:bg-white/5 space-y-4">
          <BookOpen className="mx-auto text-ink/30 dark:text-cream/30" size={48} />
          <h2 className="text-xl font-black text-forest dark:text-cream">No Enrolled Courses Found</h2>
          <p className="max-w-md mx-auto text-sm text-ink/60 dark:text-cream/60">
            Once your course enrollment request is approved, your courses and completion certificates will appear here automatically.
          </p>
          <Link href="/courses" className="inline-block">
            <button className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-white hover:bg-leaf transition">
              Browse Catalog & Enroll
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => {
            const isEligible = course.eligibleForCertificate;

            return (
              <div
                key={course.courseId}
                className={`flex flex-col justify-between rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border transition-all ${
                  isEligible
                    ? "border-emerald-500/40 bg-emerald-500/5 dark:border-emerald-500/30"
                    : "border-forest/10 dark:border-white/10"
                }`}
              >
                <div className="space-y-4">
                  {/* Thumbnail & Title */}
                  <div className="flex items-start gap-4">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.courseTitle}
                        className="size-16 rounded-2xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="grid size-16 place-items-center rounded-2xl bg-leaf/10 text-leaf shrink-0">
                        <BookOpen size={28} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase mb-1 ${
                        course.isFree
                          ? "bg-slate-500/15 text-slate-700 dark:bg-white/10 dark:text-cream/80"
                          : isEligible
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"
                      }`}>
                        {course.isFree
                          ? "Free Class (No Certificate)"
                          : isEligible
                          ? "🎉 Certificate Unlocked"
                          : "In Progress"}
                      </span>
                      <h2 className="font-black text-forest dark:text-cream text-base leading-snug line-clamp-2">
                        {course.courseTitle}
                      </h2>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-2 rounded-2xl bg-linen p-4 dark:bg-white/5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-ink/60 dark:text-cream/60">Completion Progress</span>
                      <span className={`font-black text-sm ${isEligible ? "text-emerald-700 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {course.completionPercentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 w-full rounded-full bg-forest/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isEligible
                            ? "bg-emerald-600"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${course.completionPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink/50 dark:text-cream/50 pt-1">
                      <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                      <span>{course.isFree ? "Free class practice" : "70% required for certificate"}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 mt-4 border-t border-forest/10 dark:border-white/10">
                  {course.isFree ? (
                    <div className="space-y-2">
                      <p className="text-xs text-ink/60 dark:text-cream/60 font-semibold text-center">
                        Official certificates are provided for Premium enrolled courses.
                      </p>
                      <Link href={`/learn/${course.courseSlug}/main-video`} className="block">
                        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-2.5 px-5 text-xs font-bold text-white hover:bg-leaf transition">
                          <PlayCircle size={16} /> Watch Lesson <ChevronRight size={14} />
                        </button>
                      </Link>
                    </div>
                  ) : isEligible ? (
                    <button
                      onClick={() => handleOpenCertModal(course)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 px-5 text-sm font-black text-white hover:bg-emerald-700 shadow-md transition scale-100 hover:scale-[1.02]"
                    >
                      <Download size={18} /> Download Certificate
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold text-center">
                        Complete at least 70% of the course to unlock certificate (Current: {course.completionPercentage}%)
                      </p>
                      <Link href={`/learn/${course.courseSlug}/main-video`} className="block">
                        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-2.5 px-5 text-xs font-bold text-white hover:bg-leaf transition">
                          <PlayCircle size={16} /> Continue Learning <ChevronRight size={14} />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCourse && (
        <CertificateModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedCourse(null); }}
          courseTitle={selectedCourse.courseTitle}
          initialName={userName}
          completionPercentage={selectedCourse.completionPercentage}
          initialCertId={selectedCertId}
        />
      )}
    </div>
  );
}
