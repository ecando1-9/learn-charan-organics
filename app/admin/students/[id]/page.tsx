import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Calendar } from "lucide-react";
import { StudentEnrollmentsManager } from "@/components/admin/student-enrollments-manager";

export const dynamic = "force-dynamic";

type EnrollmentDetail = {
  id: string;
  enrolled_at: string;
  course_id: string;
  amount_paid_inr: number;
  lms_courses: {
    title: string;
    price_inr: number;
  } | null;
};

export default async function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();

  // Fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from("lms_profiles")
    .select("id, full_name, email, role, suspended, created_at")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch active enrollments with course details
  const { data: enrollments } = await supabase
    .from("lms_enrollments")
    .select(`
      id,
      enrolled_at,
      course_id,
      amount_paid_inr,
      lms_courses!course_id(title, price_inr)
    `)
    .eq("user_id", id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  // Format enrollments to match the manager's expected format
  const formattedEnrollments = ((enrollments as unknown as EnrollmentDetail[]) ?? []).map((e) => ({
    id: e.id,
    enrolled_at: e.enrolled_at,
    course_id: e.course_id,
    amount_paid_inr: e.amount_paid_inr,
    course: e.lms_courses ? {
      title: e.lms_courses.title,
      price_inr: e.lms_courses.price_inr
    } : null
  }));

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink/65 hover:text-forest dark:text-cream/65 dark:hover:text-cream transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-[2.5rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-3xl bg-forest/10 text-xl font-black text-forest dark:bg-white/10 dark:text-cream">
            {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-forest dark:text-cream">
              {profile.full_name ?? "No name set"}
            </h2>
            <div className="mt-1 flex flex-wrap gap-y-1 gap-x-4 text-sm text-ink/60 dark:text-cream/60">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
              profile.role === "admin"
                ? "bg-forest text-white animate-pulse"
                : "bg-leaf/10 text-leaf"
            }`}
          >
            {profile.role}
          </span>
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
              profile.suspended
                ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                : "bg-leaf/10 text-leaf"
            }`}
          >
            {profile.suspended ? "Suspended" : "Active"}
          </span>
        </div>
      </div>

      {/* Main Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-forest dark:text-cream">Active Course Access</h3>
          <p className="text-sm text-ink/60 dark:text-cream/60 mt-0.5">
            Manage courses this student has active access to. You can de-enroll them from single or multiple courses.
          </p>
        </div>

        <StudentEnrollmentsManager
          userId={id}
          initialEnrollments={formattedEnrollments}
        />
      </div>
    </div>
  );
}
