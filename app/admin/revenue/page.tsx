import { createClient } from "@/lib/supabase/server";
import { RevenueChart } from "@/components/admin/admin-charts";
import { formatCurrency } from "@/lib/utils";
import { IndianRupee, TrendingUp, CheckCircle2, Clock, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  // Fetch all payment/enrollment requests for revenue analysis
  const { data: rawRequests } = await supabase
    .from("lms_enrollment_requests")
    .select("id, status, amount_inr, course_title, requested_at");

  const requests = rawRequests ?? [];

  const approvedRequests = requests.filter((r) => r.status === "approved");
  const pendingRequests = requests.filter((r) => r.status === "pending");

  const totalConfirmedRevenue = approvedRequests.reduce((sum, r) => sum + (Number(r.amount_inr) || 0), 0);
  const totalPendingRevenue = pendingRequests.reduce((sum, r) => sum + (Number(r.amount_inr) || 0), 0);

  // Group revenue by course
  const courseRevenueMap = new Map<string, { count: number; total: number }>();
  approvedRequests.forEach((r) => {
    const title = r.course_title || "General Enrollment";
    const existing = courseRevenueMap.get(title) || { count: 0, total: 0 };
    courseRevenueMap.set(title, {
      count: existing.count + 1,
      total: existing.total + (Number(r.amount_inr) || 0),
    });
  });

  const courseBreakdown = Array.from(courseRevenueMap.entries()).sort((a, b) => b[1].total - a[1].total);

  // Build monthly data chart
  const monthMap = new Map<string, number>();
  approvedRequests.forEach((r) => {
    if (!r.requested_at) return;
    const date = new Date(r.requested_at);
    const monthKey = date.toLocaleString("default", { month: "short" });
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (Number(r.amount_inr) || 0));
  });

  const chartData = Array.from(monthMap.entries()).map(([month, revenue]) => ({
    month,
    revenue,
    enrollments: approvedRequests.filter((r) => new Date(r.requested_at).toLocaleString("default", { month: "short" }) === month).length,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest dark:text-cream">Revenue Management</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Real-time payment analytics, sales metrics, and course revenue breakdowns.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-leaf font-bold text-xs uppercase">
            <CheckCircle2 size={16} /> Confirmed Revenue
          </div>
          <p className="mt-3 text-3xl font-black text-forest dark:text-cream">{formatCurrency(totalConfirmedRevenue)}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">{approvedRequests.length} approved payments</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">
            <Clock size={16} /> Pending Revenue
          </div>
          <p className="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalPendingRevenue)}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">{pendingRequests.length} pending verification</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-forest dark:text-cream font-bold text-xs uppercase">
            <TrendingUp size={16} /> Avg Order Value
          </div>
          <p className="mt-3 text-3xl font-black text-forest dark:text-cream">
            {formatCurrency(approvedRequests.length > 0 ? Math.round(totalConfirmedRevenue / approvedRequests.length) : 0)}
          </p>
          <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">per approved order</p>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-leaf font-bold text-xs uppercase">
            <IndianRupee size={16} /> Total Paid Transactions
          </div>
          <p className="mt-3 text-3xl font-black text-leaf">{requests.length}</p>
          <p className="mt-1 text-xs text-ink/50 dark:text-cream/50">submitted student orders</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <TrendingUp size={20} className="text-leaf" /> Live Revenue Trajectory
        </h2>
        <RevenueChart data={chartData} />
      </section>

      {/* Course Revenue Breakdown Table */}
      <section className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <BookOpen size={20} className="text-leaf" /> Revenue per Course
        </h2>

        {courseBreakdown.length === 0 ? (
          <p className="text-sm font-semibold text-ink/50 dark:text-cream/50 py-4 text-center">
            No approved course payments recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest/10 dark:border-white/10 text-xs font-black uppercase text-ink/50 dark:text-cream/50">
                  <th className="pb-3 px-3">Course Name</th>
                  <th className="pb-3 px-3">Approved Sales</th>
                  <th className="pb-3 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5 dark:divide-white/5">
                {courseBreakdown.map(([courseTitle, data]) => (
                  <tr key={courseTitle} className="hover:bg-linen/50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-3 font-bold text-forest dark:text-cream">{courseTitle}</td>
                    <td className="py-3.5 px-3 font-semibold text-ink/70 dark:text-cream/70">{data.count} enrollments</td>
                    <td className="py-3.5 px-3 text-right font-black text-leaf">{formatCurrency(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
