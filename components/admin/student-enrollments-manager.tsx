"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserMinus, ShieldAlert, GraduationCap, CheckSquare, Square, Loader2 } from "lucide-react";
import { deEnrollStudent } from "@/app/actions/enrollment";
import { formatCurrency } from "@/lib/utils";

type Enrollment = {
  id: string;
  enrolled_at: string;
  course_id: string;
  amount_paid_inr: number;
  course: {
    title: string;
    price_inr: number;
  } | null;
};

type Props = {
  userId: string;
  initialEnrollments: Enrollment[];
};

export function StudentEnrollmentsManager({ userId, initialEnrollments }: Props) {
  const router = useRouter();
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Toggle single selection
  const handleToggleSelect = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedCourseIds.length === initialEnrollments.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(initialEnrollments.map((e) => e.course_id));
    }
  };

  // Handle single de-enrollment
  const handleDeEnrollSingle = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to remove access to "${courseTitle}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deEnrollStudent(userId, [courseId]);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Successfully de-enrolled from "${courseTitle}".`);
        setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
        router.refresh();
      }
    });
  };

  // Handle de-enroll selected
  const handleDeEnrollSelected = async () => {
    if (selectedCourseIds.length === 0) return;

    if (!confirm(`Are you sure you want to remove access to the ${selectedCourseIds.length} selected course(s)?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await deEnrollStudent(userId, selectedCourseIds);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Successfully de-enrolled from the selected ${selectedCourseIds.length} course(s).`);
        setSelectedCourseIds([]);
        router.refresh();
      }
    });
  };

  // Handle de-enroll all
  const handleDeEnrollAll = async () => {
    if (initialEnrollments.length === 0) return;

    if (
      !confirm(
        "CRITICAL WARNING: Are you sure you want to de-enroll this student from ALL active courses? This will immediately revoke all access."
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      // Empty array to server action deletes all enrollments for this user
      const res = await deEnrollStudent(userId, []);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Successfully de-enrolled from all courses.");
        setSelectedCourseIds([]);
        router.refresh();
      }
    });
  };

  const isAllSelected =
    initialEnrollments.length > 0 &&
    selectedCourseIds.length === initialEnrollments.length;

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl bg-leaf/10 p-4 text-sm font-semibold text-leaf border border-leaf/10">
          <GraduationCap size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {initialEnrollments.length === 0 ? (
        <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <UserMinus size={48} className="mx-auto text-ink/20 dark:text-cream/20 mb-4" />
          <h3 className="text-xl font-black text-forest dark:text-cream">No Active Enrollments</h3>
          <p className="mt-2 text-sm text-ink/65 dark:text-cream/65 max-w-md mx-auto">
            This student is not currently enrolled in any courses. Approve enrollment requests to give them course access.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-ink/75 hover:bg-linen dark:text-cream/75 dark:hover:bg-white/10 transition"
              >
                {isAllSelected ? (
                  <CheckSquare size={18} className="text-leaf" />
                ) : (
                  <Square size={18} className="text-ink/40 dark:text-cream/40" />
                )}
                <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
              </button>
              <span className="text-xs text-ink/45 dark:text-cream/45 font-bold">
                {selectedCourseIds.length} of {initialEnrollments.length} selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDeEnrollSelected}
                disabled={selectedCourseIds.length === 0 || isPending}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition active:scale-95 ${
                  selectedCourseIds.length === 0 || isPending
                    ? "bg-ink/10 text-ink/40 cursor-not-allowed dark:bg-white/5 dark:text-cream/20"
                    : "bg-clay/10 text-clay hover:bg-clay/20"
                }`}
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserMinus size={14} />
                )}
                De-enroll Selected
              </button>

              <button
                onClick={handleDeEnrollAll}
                disabled={isPending}
                className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 transition active:scale-95 disabled:bg-ink/10 disabled:text-ink/40 disabled:cursor-not-allowed dark:disabled:bg-white/5"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                De-enroll From All
              </button>
            </div>
          </div>

          {/* Grid of Course Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialEnrollments.map((enrollment) => {
              const courseTitle = enrollment.course?.title ?? "Unknown Course";
              const isSelected = selectedCourseIds.includes(enrollment.course_id);

              return (
                <div
                  key={enrollment.id}
                  className={`relative flex flex-col rounded-[2rem] bg-white p-5 shadow-soft border transition dark:bg-white/5 ${
                    isSelected
                      ? "border-clay/40 bg-clay/5 dark:border-clay/40"
                      : "border-forest/5 dark:border-white/5"
                  }`}
                >
                  {/* Card Header with Checkbox */}
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => handleToggleSelect(enrollment.course_id)}
                      disabled={isPending}
                      className="text-forest hover:opacity-85 dark:text-cream transition"
                    >
                      {isSelected ? (
                        <CheckSquare size={22} className="text-clay" />
                      ) : (
                        <Square size={22} className="text-ink/20 dark:text-cream/20" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeEnrollSingle(enrollment.course_id, courseTitle)}
                      disabled={isPending}
                      className="rounded-xl p-2 text-ink/40 hover:bg-clay/10 hover:text-clay dark:text-cream/40 transition active:scale-95 disabled:opacity-50"
                      title="De-enroll student from this course"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>

                  {/* Course Details */}
                  <div className="mt-4 flex-1">
                    <h4 className="font-black text-forest dark:text-cream leading-tight">
                      {courseTitle}
                    </h4>
                    <p className="mt-2 text-xs text-ink/50 dark:text-cream/50">
                      Enrolled:{" "}
                      <span className="font-bold text-ink/75 dark:text-cream/75">
                        {new Date(enrollment.enrolled_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="my-4 border-t border-forest/10 dark:border-white/10" />

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-ink/40 dark:text-cream/40 tracking-wider">
                        Amount Paid
                      </p>
                      <p className="text-sm font-black text-forest dark:text-cream">
                        {formatCurrency(enrollment.amount_paid_inr)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
