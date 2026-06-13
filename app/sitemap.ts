import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/course-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://learn.charanorganics.com";
  const staticRoutes = ["", "/courses", "/about", "/instructors", "/testimonials", "/faq", "/contact", "/blog", "/privacy", "/terms"];
  const courses = await getPublishedCourses();

  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...courses.map((course) => ({ url: `${base}/courses/${course.slug}`, lastModified: new Date() }))
  ];
}
