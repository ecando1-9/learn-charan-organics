import type { MetadataRoute } from "next";
import { courses } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://learn.charanorganics.com";
  const staticRoutes = ["", "/courses", "/about", "/instructors", "/testimonials", "/faq", "/contact", "/blog", "/privacy", "/terms"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...courses.map((course) => ({ url: `${base}/courses/${course.slug}`, lastModified: new Date() }))
  ];
}
