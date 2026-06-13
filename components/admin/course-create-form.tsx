"use client";

import { useState } from "react";
import { Link2, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getYoutubeId(url: string) {
  const trimmed = url.trim();
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]+)/);
  return shortMatch?.[1] ?? watchMatch?.[1] ?? embedMatch?.[1] ?? trimmed;
}

export function CourseCreateForm() {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [price, setPrice] = useState("10000");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const supabase = createClient();
    const courseSlug = slugify(title);
    const videoId = getYoutubeId(youtubeUrl);

    const { data: category, error: categoryError } = await supabase
      .from("lms_course_categories")
      .upsert({ name: title, slug: courseSlug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (categoryError) {
      setMessage(categoryError.message);
      return;
    }

    const { data: course, error: courseError } = await supabase
      .from("lms_courses")
      .upsert({
        category_id: category.id,
        title,
        slug: courseSlug,
        description,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        youtube_url: youtubeUrl,
        pdf_url: pdfUrl || null,
        price_inr: Number(price) || 0,
        published: true
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (courseError) {
      setMessage(courseError.message);
      return;
    }

    const { data: module, error: moduleError } = await supabase
      .from("lms_modules")
      .insert({ course_id: course.id, title: "Course Video", sort_order: 1 })
      .select("id")
      .single();

    if (moduleError) {
      setMessage(moduleError.message);
      return;
    }

    const { data: lesson, error: lessonError } = await supabase
      .from("lms_lessons")
      .insert({ module_id: module.id, title, slug: "main-video", description, sort_order: 1, published: true })
      .select("id")
      .single();

    if (lessonError) {
      setMessage(lessonError.message);
      return;
    }

    const { error: videoError } = await supabase
      .from("lms_videos")
      .insert({ lesson_id: lesson.id, youtube_video_id: videoId });

    if (videoError) {
      setMessage(videoError.message);
      return;
    }

    if (pdfUrl) {
      const { error: pdfError } = await supabase
        .from("lms_pdf_resources")
        .insert({ lesson_id: lesson.id, course_id: course.id, title: `${title} notes`, storage_path: pdfUrl });

      if (pdfError) {
        setMessage(pdfError.message);
        return;
      }
    }

    setMessage("Course added. It is now stored in Supabase and ready for admin-managed enrollment.");
    setTitle("");
    setYoutubeUrl("");
    setPdfUrl("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-soft dark:bg-white/5">
      <div>
        <h2 className="text-xl font-black text-forest dark:text-cream">Add Course</h2>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">Add course name, YouTube link, PDF link and price. Admin approval controls student access.</p>
      </div>
      <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-2xl bg-linen p-4 outline-none dark:bg-white/10" placeholder="Course name" />
      <label className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
        <Link2 size={18} className="text-leaf" />
        <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="min-h-12 w-full bg-transparent outline-none" placeholder="YouTube unlisted link" />
      </label>
      <label className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
        <Upload size={18} className="text-leaf" />
        <input value={pdfUrl} onChange={(event) => setPdfUrl(event.target.value)} className="min-h-12 w-full bg-transparent outline-none" placeholder="PDF notes/resource link" />
      </label>
      <input value={price} onChange={(event) => setPrice(event.target.value)} className="rounded-2xl bg-linen p-4 outline-none dark:bg-white/10" placeholder="Price in INR" />
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 rounded-2xl bg-linen p-4 outline-none dark:bg-white/10" placeholder="Professional course description" />
      <Button><Plus size={18} /> Add course</Button>
      {message && <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-forest dark:bg-white/10 dark:text-cream">{message}</p>}
    </form>
  );
}
