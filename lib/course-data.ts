import { unstable_noStore as noStore } from "next/cache";
import type { Course, CourseLevel, Lesson, Module } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type DbCourse = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  price_inr: number;
  is_free: boolean;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  duration_minutes: number;
  featured: boolean;
};

type DbCategory = {
  id: string;
  name: string;
};

type DbModule = {
  id: string;
  title: string;
  sort_order: number;
};

type DbLesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

function toLevel(level: DbCourse["level"]): CourseLevel {
  if (level === "advanced") return "Advanced";
  if (level === "intermediate") return "Intermediate";
  return "Beginner";
}

function youtubeIdFromUrl(url: string | null) {
  if (!url) return "";
  return url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1]
    ?? url.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1]
    ?? url;
}

function defaultThumbnail(course: DbCourse) {
  const videoId = youtubeIdFromUrl(course.youtube_url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";
}

function buildCourse(course: DbCourse, categoryName: string, modules: Module[] = []): Course {
  return {
    slug: course.slug,
    title: course.title,
    category: categoryName || course.title,
    instructor: "Charan Organics Academy",
    rating: 0,
    students: 0,
    duration: course.duration_minutes > 0 ? `${course.duration_minutes} min` : "Video lesson",
    level: toLevel(course.level),
    language: course.language,
    price: course.price_inr,
    thumbnail: course.thumbnail_url || defaultThumbnail(course),
    youtubeUrl: course.youtube_url || undefined,
    pdfUrl: course.pdf_url || undefined,
    description: course.description,
    outcomes: [
      `Understand the complete ${course.title.toLowerCase()} making process`,
      "Learn ingredient purpose, measurements and safety handling",
      "Follow a practical manufacturing workflow",
      "Prepare notes for future batch production"
    ],
    materials: ["Ingredients as explained in video", "Digital weighing scale", "Mixing tools", "Clean containers", "Notebook for formulation notes"],
    modules,
    featured: course.featured,
    trending: false
  };
}

async function getCategoryMap(categoryIds: string[]) {
  if (categoryIds.length === 0) return new Map<string, string>();

  const supabase = await createClient();
  const { data } = await supabase
    .from("lms_course_categories")
    .select("id,name")
    .in("id", categoryIds);

  return new Map((data as DbCategory[] | null)?.map((category) => [category.id, category.name]) ?? []);
}

export async function getPublishedCourses() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lms_courses")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  const dbCourses = data as DbCourse[];
  const categoryMap = await getCategoryMap(dbCourses.map((course) => course.category_id).filter(Boolean) as string[]);
  return dbCourses.map((course) => buildCourse(course, course.category_id ? categoryMap.get(course.category_id) ?? course.title : course.title));
}

export async function getCourseBySlug(slug: string, includeProtectedVideo = false) {
  noStore();
  const supabase = await createClient();
  const { data: courseData, error } = await supabase
    .from("lms_courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !courseData) return null;

  const course = courseData as DbCourse;
  const categoryMap = await getCategoryMap(course.category_id ? [course.category_id] : []);
  const { data: moduleData } = await supabase
    .from("lms_modules")
    .select("id,title,sort_order")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const dbModules = (moduleData ?? []) as DbModule[];
  const moduleIds = dbModules.map((module) => module.id);
  const { data: lessonData } = moduleIds.length
    ? await supabase
      .from("lms_lessons")
      .select("id,module_id,title,slug,description,sort_order")
      .in("module_id", moduleIds)
      .order("sort_order", { ascending: true })
    : { data: [] };

  const dbLessons = (lessonData ?? []) as DbLesson[];
  const lessonIds = dbLessons.map((lesson) => lesson.id);
  const videoMap = new Map<string, string>();

  if (includeProtectedVideo && lessonIds.length) {
    const { data: videoData } = await supabase
      .from("lms_videos")
      .select("lesson_id,youtube_video_id")
      .in("lesson_id", lessonIds);

    (videoData ?? []).forEach((video: { lesson_id: string; youtube_video_id: string }) => {
      videoMap.set(video.lesson_id, video.youtube_video_id);
    });
  }

  const modules = dbModules.map<Module>((module) => ({
    title: module.title,
    lessons: dbLessons
      .filter((lesson) => lesson.module_id === module.id)
      .map<Lesson>((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        duration: "Video lesson",
        videoId: includeProtectedVideo ? videoMap.get(lesson.id) ?? "" : "",
        resources: course.pdf_url ? ["PDF notes available"] : ["PDF notes can be attached by admin"]
      }))
  }));

  return buildCourse(course, course.category_id ? categoryMap.get(course.category_id) ?? course.title : course.title, modules);
}
