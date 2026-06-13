"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Lock, MessageCircle, PlayCircle } from "lucide-react";
import type { Course, Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function VideoPlayer({ course, lesson }: { course: Course; lesson: Lesson }) {
  const [watermark, setWatermark] = useState({ x: 18, y: 18 });
  const [student, setStudent] = useState({ name: "Student", email: "student" });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;

      setStudent({
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Student",
        email: user.email ?? "student"
      });
    });

    const interval = window.setInterval(() => {
      setWatermark({ x: 8 + Math.random() * 68, y: 10 + Math.random() * 66 });
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="grid min-h-screen bg-[#07140f] text-cream lg:grid-cols-[1fr_360px]">
      <main className="flex flex-col">
        <div className="relative aspect-video bg-black" onContextMenu={(event) => event.preventDefault()}>
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}?rel=0&modestbranding=1&playsinline=1&disablekb=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <div className="pointer-events-none absolute rounded-full bg-white/12 px-4 py-2 text-xs font-bold text-white/70 backdrop-blur transition-all duration-1000" style={{ left: `${watermark.x}%`, top: `${watermark.y}%` }}>
            {student.name} - {student.email}
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-moss">{course.title}</p>
          <h1 className="mt-2 text-2xl font-black">{lesson.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="bg-leaf hover:bg-moss"><CheckCircle2 size={18} /> Mark complete</Button>
            <Button variant="secondary" className="border-white/10 bg-white/10 text-white hover:bg-white/15"><FileText size={18} /> Download notes</Button>
          </div>
          <section className="mt-8 rounded-[2rem] bg-white/8 p-5">
            <h2 className="flex items-center gap-2 text-xl font-black"><MessageCircle size={20} /> Lesson discussion</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4 text-sm"><b>Instructor</b><p className="mt-2 text-cream/70">Post formulation questions here. Instructor replies, likes, reports and pinning are stored in Supabase.</p></div>
              <textarea className="min-h-24 w-full rounded-2xl bg-white/10 p-4 outline-none" placeholder="Ask a question about this lesson" />
            </div>
          </section>
        </div>
      </main>
      <aside className="border-l border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-lg font-black">Lesson playlist</h2>
        <div className="mt-4 space-y-3">
          {course.modules.map((module) => <div key={module.title}><h3 className="mb-2 text-sm font-bold text-moss">{module.title}</h3>{module.lessons.map((item) => <a key={item.slug} href={`/learn/${course.slug}/${item.slug}`} className={`mb-2 flex items-center justify-between rounded-2xl p-3 text-sm font-semibold ${item.slug === lesson.slug ? "bg-leaf text-white" : "bg-white/8 text-cream/75"}`}><span className="flex items-center gap-2">{item.preview ? <PlayCircle size={16} /> : <Lock size={16} />} {item.title}</span><span>{item.duration}</span></a>)}</div>)}
        </div>
      </aside>
    </div>
  );
}
