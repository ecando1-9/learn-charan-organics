import { createClient } from "@/lib/supabase/server";
import { AdminLogsViewer } from "@/components/admin/admin-logs-viewer";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("lms_audit_logs")
    .select(`
      id, user_id, user_email, action, details, ip_address, created_at
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">System Security</p>
        <h1 className="text-3xl font-black text-forest dark:text-cream">System Audit & Activity Logs</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Real-time audit log of all admin edits, course changes, video play events, community updates and user activities.
        </p>
      </div>

      <AdminLogsViewer logs={logs ?? []} />
    </div>
  );
}
