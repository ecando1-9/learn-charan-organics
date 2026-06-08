import { Activity, BookOpen, Clock, IndianRupee, TrendingUp, Users } from "lucide-react";
import { EnrollmentChart, RevenueChart } from "@/components/admin/admin-charts";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const cards = [
    ["Total Students", "0", Users],
    ["Total Courses", "0", BookOpen],
    ["Total Revenue", formatCurrency(0), IndianRupee],
    ["Monthly Revenue", formatCurrency(0), TrendingUp],
    ["Active Learners", "0", Activity],
    ["Total Watch Hours", "0", Clock]
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{cards.map(([label, value, Icon]) => <div key={label as string} className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><Icon className="text-leaf" /><p className="mt-4 text-sm font-bold text-ink/55 dark:text-cream/55">{label as string}</p><p className="text-2xl font-black text-forest dark:text-cream">{value as string}</p></div>)}</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><h2 className="text-xl font-black text-forest dark:text-cream">Revenue analytics</h2><RevenueChart /></section>
        <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><h2 className="text-xl font-black text-forest dark:text-cream">Enrollment analytics</h2><EnrollmentChart /></section>
      </div>
      <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><h2 className="text-xl font-black text-forest dark:text-cream">Recent student activity</h2><div className="mt-4 rounded-2xl bg-linen p-4 text-sm font-semibold text-ink/60 dark:bg-white/5 dark:text-cream/60">No activity yet. Real student activity will appear after enrollments, progress, comments and certificates are stored in Supabase.</div></section>
    </div>
  );
}
