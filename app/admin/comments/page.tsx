import Link from "next/link";
import { MessageSquare, Users2, ShieldCheck, CheckCircle2, Pin, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCommentsPage() {
  const sampleComments = [
    {
      id: "1",
      author: "Priyadarshini Rao",
      course: "Diploma in Herbal Cosmetic Product Making",
      time: "2 hours ago",
      text: "Can I substitute Sweet Almond Oil with Jojoba Oil in the night cream recipe without altering the preservative percentage?",
      status: "Answered",
      pinned: true,
    },
    {
      id: "2",
      author: "Karthik Subramanian",
      course: "Ayurvedic Hair Care & Taila Formulation",
      time: "5 hours ago",
      text: "How do we ensure the Taila Paka water-phase is 100% evaporated during the wick test?",
      status: "Needs Instructor Reply",
      pinned: false,
    },
    {
      id: "3",
      author: "Sunita Deshmukh",
      course: "Cold Process & Melt-and-Pour Soap Mastery",
      time: "1 day ago",
      text: "My soap batter traced in less than 3 minutes using clove essential oil. Is clove an acceleration agent?",
      status: "Answered",
      pinned: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
            Student Interaction
          </p>
          <h1 className="text-3xl font-black text-forest dark:text-cream">
            Course Comments & Q&A Moderation
          </h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
            Moderate student questions, pin verified instructor replies, and manage live lesson discussions.
          </p>
        </div>
        <Link href="/admin/community">
          <Button className="rounded-full bg-forest text-white hover:bg-leaf text-xs font-bold">
            <Users2 size={15} /> Batch Community Chat
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <p className="text-xs font-bold uppercase text-ink/50 dark:text-cream/50">Total Questions</p>
          <p className="mt-2 text-3xl font-black text-forest dark:text-cream">24</p>
          <p className="text-xs text-leaf font-bold mt-1">Active this month</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <p className="text-xs font-bold uppercase text-ink/50 dark:text-cream/50">Instructor Response Rate</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">96%</p>
          <p className="text-xs text-ink/50 dark:text-cream/50 mt-1">Average reply under 4 hours</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10">
          <p className="text-xs font-bold uppercase text-ink/50 dark:text-cream/50">Community Health</p>
          <p className="mt-2 text-3xl font-black text-forest dark:text-cream">100% Clean</p>
          <p className="text-xs text-leaf font-bold mt-1">0 Spam alerts active</p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5 border border-forest/10 dark:border-white/10 space-y-4">
        <h2 className="text-xl font-black text-forest dark:text-cream flex items-center gap-2">
          <MessageSquare size={20} className="text-leaf" /> Recent Course Discussions
        </h2>

        <div className="space-y-4">
          {sampleComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-forest/10 p-4 sm:p-5 dark:border-white/10 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-full bg-forest/10 text-xs font-black text-forest dark:bg-white/10 dark:text-cream">
                    {comment.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <span className="font-bold text-forest dark:text-cream text-sm">
                      {comment.author}
                    </span>
                    <span className="text-xs text-ink/50 dark:text-cream/50 ml-2">
                      {comment.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold rounded-full bg-linen px-2.5 py-1 text-forest dark:bg-white/10 dark:text-cream">
                    📚 {comment.course}
                  </span>
                  {comment.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 text-[11px] font-black">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ink/75 dark:text-cream/75 leading-relaxed bg-linen/50 dark:bg-white/5 p-3 rounded-xl">
                &ldquo;{comment.text}&rdquo;
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className={`font-bold ${comment.status === "Answered" ? "text-emerald-600" : "text-amber-600"}`}>
                  Status: {comment.status}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" className="rounded-xl text-xs py-1.5 px-3 min-h-0 h-8">
                    Reply
                  </Button>
                  <Button variant="ghost" className="rounded-xl text-xs py-1.5 px-3 min-h-0 h-8 border border-forest/15">
                    Pin
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
