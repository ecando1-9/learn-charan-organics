import { AdminConfigNotice } from "@/components/admin/admin-config-notice";
import { createAdminClient, getAdminClientConfigError } from "@/lib/supabase/admin";
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
  const adminConfigError = getAdminClientConfigError();
  if (adminConfigError) {
    return <AdminConfigNotice message={adminConfigError} />;
  }

  const admin = createAdminClient();

  const [requestUsersRes, enrollmentsRes] = await Promise.all([
    admin
      .from("lms_enrollment_requests")
      .select("user_id"),
    admin
      .from("lms_enrollments")
      .select("user_id, status"),
  ]);

  const lmsUserIds = Array.from(
    new Set([
      ...(requestUsersRes.data ?? []).map((r: any) => r.user_id),
      ...(enrollmentsRes.data ?? []).map((e: any) => e.user_id),
    ].filter(Boolean))
  );

  const profilesRes = lmsUserIds.length > 0
    ? await admin
        .from("lms_profiles")
        .select("id, full_name, email, role, suspended, created_at")
        .eq("role", "student")
        .in("id", lmsUserIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const rawProfiles = profilesRes.data ?? [];
  const rawEnrollments = enrollmentsRes.data ?? [];

  const enrollCountMap = new Map<string, number>();
  rawEnrollments.forEach((e: { user_id: string; status?: string }) => {
    if (e.status === "active") {
      enrollCountMap.set(e.user_id, (enrollCountMap.get(e.user_id) ?? 0) + 1);
    }
  });

  const students: Profile[] = rawProfiles.map((p: any) => {
    let name = p.full_name?.trim();
    if (!name || name.toLowerCase() === "student") {
      if (p.email && p.email.includes("@")) {
        const handle = p.email.split("@")[0];
        name = handle.charAt(0).toUpperCase() + handle.slice(1);
      } else {
        name = `Student ${p.id.slice(0, 4)}`;
      }
    }
    return {
      ...p,
      full_name: name,
      enrollment_count: enrollCountMap.get(p.id) ?? 0,
    };
  });

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
