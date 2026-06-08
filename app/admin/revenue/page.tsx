import { RevenueChart } from "@/components/admin/admin-charts";

export default function AdminRevenuePage() {
  return <div><h1 className="text-3xl font-black text-forest dark:text-cream">Revenue Management</h1><section className="mt-6 rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><RevenueChart /></section></div>;
}
