import { createClient } from "@/lib/supabase/server";
import { StudentsClient } from "@/components/admin/students-client";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  suspended: boolean;
  created_at: string;
  enrollment_count: number;
};

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  // Only fetch users who have at least one LMS enrollment request OR enrollment
  // This excludes ecommerce-only users accidentally added to lms_profiles
  const [requestUsersRes, enrollmentsRes] = await Promise.all([
    supabase
      .from("lms_enrollment_requests")
      .select("user_id")
      .order("requested_at", { ascending: false }),
    supabase
      .from("lms_enrollments")
      .select("user_id")
      .eq("status", "active"),
  ]);

  // Build a unique set of user IDs who have LMS activity
  const lmsUserIds = new Set<string>();
  (requestUsersRes.data ?? []).forEach((r: { user_id: string }) => lmsUserIds.add(r.user_id));
  (enrollmentsRes.data ?? []).forEach((e: { user_id: string }) => lmsUserIds.add(e.user_id));

  const enrollCountMap = new Map<string, number>();
  (enrollmentsRes.data ?? []).forEach((e: { user_id: string }) => {
    enrollCountMap.set(e.user_id, (enrollCountMap.get(e.user_id) ?? 0) + 1);
  });

  // Fetch profiles only for LMS users
  let students: Profile[] = [];
  if (lmsUserIds.size > 0) {
    const { data: profiles } = await supabase
      .from("lms_profiles")
      .select("id,full_name,email,role,suspended,created_at")
      .in("id", [...lmsUserIds])
      .order("created_at", { ascending: false });

    students = (profiles ?? []).map((p) => ({
      ...p,
      enrollment_count: enrollCountMap.get(p.id) ?? 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Student Management</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Monitor student signups, check active enrollments, and manage access settings.
        </p>
      </div>
      <StudentsClient initialStudents={students} />
    </div>
  );
}
