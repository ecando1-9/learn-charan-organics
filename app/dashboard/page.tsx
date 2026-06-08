import Link from "next/link";
import { Award, BookOpen, Clock, Download, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active courses", "0", BookOpen],
          ["Completed", "0", Award],
          ["Watch hours", "0", Clock],
          ["Wishlist", "0", Heart]
        ].map(([label, value, Icon]) => <div key={label as string} className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><Icon className="text-leaf" /><p className="mt-4 text-sm font-bold text-ink/55 dark:text-cream/55">{label as string}</p><p className="text-3xl font-black text-forest dark:text-cream">{value as string}</p></div>)}
      </div>

      <section className="rounded-[2rem] bg-forest p-6 text-cream shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-moss">Continue Learning</p>
        <h2 className="mt-2 text-2xl font-black">No active lesson yet</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-cream/70">Enrolled courses and recently watched lessons will appear here after the student starts learning.</p>
        <div className="mt-5"><Link href="/courses"><Button className="bg-white text-forest hover:bg-cream">Browse courses</Button></Link></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
          <h2 className="text-xl font-black text-forest dark:text-cream">My Courses</h2>
          <div className="mt-5 rounded-2xl bg-linen p-6 text-sm leading-6 text-ink/65 dark:bg-white/5 dark:text-cream/65">
            No enrolled courses yet. Course access from Supabase enrollments will be listed here.
          </div>
        </section>
        <section className="space-y-4">
          {[
            ["Downloaded PDFs", "0 resources", Download],
            ["Learning streak", "0 active days", TrendingUp],
            ["Certificates eligible", "0 courses", Award]
          ].map(([title, text, Icon]) => <div key={title as string} className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5"><Icon className="text-clay" /><h3 className="mt-3 font-black">{title as string}</h3><p className="text-sm text-ink/60 dark:text-cream/60">{text as string}</p></div>)}
        </section>
      </div>
    </div>
  );
}
