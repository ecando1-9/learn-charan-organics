"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, List, MessageCircle, PlayCircle, Lock, X, Loader2 } from "lucide-react";
import type { Course, Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { BunnyPlayer } from "@/components/course/bunny-player";
import { AntiTheft } from "@/components/course/anti-theft";

export function VideoPlayer({ course, lesson }: { course: Course; lesson: Lesson }) {
  const [watermark, setWatermark] = useState({ x: 18, y: 18 });
  const [student, setStudent] = useState({ name: "Student", email: "student" });
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const [videoSource, setVideoSource] = useState<{
    type: "cloudinary" | "youtube" | "bunny";
    videoUrl?: string;
    youtubeVideoId?: string;
    bunnyVideoId?: string;
    bunnyLibraryId?: string;
  } | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  useEffect(() => {
    let active = true;
    setLoadingVideo(true);
    setVideoError(null);
    setVideoSource(null);

    fetch(`/api/video/stream?courseSlug=${encodeURIComponent(course.slug)}&lessonSlug=${encodeURIComponent(lesson.slug)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            window.location.href = "/unauthorized";
            return null;
          }
          return res.json().then((d) => {
            throw new Error(d.error || "Failed to load video");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        setVideoSource(data);
        setLoadingVideo(false);
      })
      .catch((err) => {
        if (!active) return;
        setVideoError(err.message);
        setLoadingVideo(false);
      });

    return () => {
      active = false;
    };
  }, [course.slug, lesson.slug]);

  const PlaylistPanel = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="text-lg font-black">Lesson playlist</h2>
        <button
          onClick={() => setShowPlaylist(false)}
          className="grid size-8 place-items-center rounded-full bg-white/10 text-cream lg:hidden"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {course.modules.map((module) => (
          <div key={module.title}>
            <h3 className="mb-2 text-sm font-bold text-moss">{module.title}</h3>
            {module.lessons.map((item) => (
              <a
                key={item.slug}
                href={`/learn/${course.slug}/${item.slug}`}
                className={`mb-2 flex items-center justify-between rounded-2xl p-3 text-sm font-semibold ${
                  item.slug === lesson.slug
                    ? "bg-leaf text-white"
                    : "bg-white/8 text-cream/75 hover:bg-white/15"
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.preview ? <PlayCircle size={16} /> : <Lock size={16} />}
                  <span className="line-clamp-1">{item.title}</span>
                </span>
                <span className="shrink-0 text-xs">{item.duration}</span>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#07140f] text-cream lg:grid lg:grid-cols-[1fr_360px]">
      {/* Main video area */}
      <main className="flex flex-col">
        {/* Video */}
        <div
          className="relative w-full bg-black flex items-center justify-center"
          style={{ aspectRatio: "16/9" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {loadingVideo ? (
            <div className="text-center space-y-3">
              <Loader2 className="mx-auto animate-spin text-leaf" size={32} />
              <p className="text-sm font-bold text-cream/70">Securing stream...</p>
            </div>
          ) : videoError ? (
            <div className="text-center p-6 max-w-sm">
              <div className="text-clay text-3xl mb-2">⚠️</div>
              <p className="text-sm font-bold text-red-400">{videoError}</p>
            </div>
          ) : videoSource?.type === "cloudinary" ? (
            <video
              className="h-full w-full object-contain"
              src={videoSource.videoUrl}
              controls
              controlsList="nodownload"
              playsInline
              disablePictureInPicture
            />
          ) : videoSource?.type === "bunny" ? (
            <div className="w-full h-full">
              <BunnyPlayer
                bunnyVideoId={videoSource.bunnyVideoId}
                bunnyLibraryId={videoSource.bunnyLibraryId}
                title={lesson.title}
                autoplay={true}
                className="rounded-none h-full"
              />
            </div>
          ) : videoSource?.type === "youtube" ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoSource.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1&disablekb=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-sm text-cream/60">No video source available.</div>
          )}

          <div
            className="pointer-events-none absolute rounded-full bg-white/12 px-4 py-2 text-xs font-bold text-white/70 backdrop-blur transition-all duration-1000"
            style={{ left: `${watermark.x}%`, top: `${watermark.y}%` }}
          >
            {student.name} - {student.email}
          </div>
        </div>

        {/* Mobile: playlist toggle button */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 lg:hidden">
          <p className="flex-1 text-sm font-bold text-moss truncate">{course.title}</p>
          <button
            onClick={() => setShowPlaylist(true)}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-cream hover:bg-white/15 transition"
          >
            <List size={15} /> Lessons
          </button>
        </div>

        {/* Info below video */}
        <div className="p-4 sm:p-6">
          <p className="hidden text-sm font-bold uppercase tracking-[0.18em] text-moss lg:block">{course.title}</p>
          <h1 className="mt-1 text-xl font-black sm:text-2xl">{lesson.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="bg-leaf hover:bg-moss text-sm">
              <CheckCircle2 size={16} /> Mark complete
            </Button>
            {course.pdfUrl && (
              <Button onClick={() => setShowNotes(true)} variant="secondary" className="border-white/10 bg-white/10 text-white hover:bg-white/15 text-sm">
                <FileText size={16} /> View notes (Protected)
              </Button>
            )}
          </div>

          {/* Discussion */}
          <section className="mt-8 rounded-[2rem] bg-white/8 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-lg font-black sm:text-xl">
              <MessageCircle size={20} /> Lesson discussion
            </h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4 text-sm">
                <b>Instructor</b>
                <p className="mt-2 text-cream/70">Post formulation questions here.</p>
              </div>
              <textarea
                className="min-h-24 w-full rounded-2xl bg-white/10 p-4 text-sm outline-none placeholder:text-cream/40"
                placeholder="Ask a question about this lesson"
              />
            </div>
          </section>

          {/* Bottom padding for mobile nav */}
          <div className="h-20 lg:hidden" />
        </div>
      </main>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden border-l border-white/10 bg-white/[0.04] lg:flex lg:flex-col">
        <PlaylistPanel />
      </aside>

      {/* Mobile playlist drawer */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowPlaylist(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] flex flex-col overflow-hidden rounded-t-3xl bg-[#0e1f18] pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <PlaylistPanel />
          </div>
        </div>
      )}

      {/* Secure PDF Modal */}
      {showNotes && course.pdfUrl && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col backdrop-blur-2xl">
          <div className="flex justify-between items-center p-4 border-b border-white/10 text-white">
            <div className="font-bold flex items-center gap-2">
              <Lock size={18} className="text-leaf" /> Protected Document Viewer
            </div>
            <button onClick={() => setShowNotes(false)} className="p-2 hover:bg-white/10 rounded-full transition">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 w-full h-full bg-[#323639] relative">
             {/* 
                Direct native PDF embedding is much more reliable than Google Docs viewer, 
                especially for local testing, private URLs, and large files. 
                #toolbar=0 hides the download/print bar in most modern browsers (Chrome/Edge). 
             */}
             <iframe 
               src={`${course.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
               className="w-full h-full border-0" 
               title="Secure PDF Notes"
             />
          </div>
        </div>
      )}

      {/* Global Anti-Theft Wrapper */}
      <AntiTheft />
    </div>
  );
}
