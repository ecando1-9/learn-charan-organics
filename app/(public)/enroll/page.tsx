import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseDurationVariants } from "@/lib/course-variants";
import { CourseCheckout, type CheckoutCourse } from "@/components/course/course-checkout";

export const metadata: Metadata = {
  title: "Enroll in Courses | Charan Organics Academy",
  description:
    "Enroll in certified organic cosmetic formulation masterclasses. Instant UPI payment with verified 24-hour course access.",
};

export const dynamic = "force-dynamic";

export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; plan?: string }>;
}) {
  const { course, plan } = await searchParams;
  const supabase = await createClient();

  // 1. Check user auth status on the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, never show checkout page — ask for login first!
  if (!user) {
    const enrollTarget = `/enroll${course ? `?course=${encodeURIComponent(course)}${plan ? `&plan=${encodeURIComponent(plan)}` : ""}` : ""}`;
    redirect(`/login?redirectTo=${encodeURIComponent(enrollTarget)}`);
  }

  // 2. Fetch courses on the server
  const { data: rawCourses } = await supabase
    .from("lms_courses")
    .select("id, title, slug, thumbnail_url, youtube_url, price_inr, duration_variants, is_free, published")
    .order("sort_order", { ascending: true });

  let allCourses = (rawCourses ?? []).map((c: any) => {
    const basePrice = Number(c.price_inr) || 0;
    const variants = parseDurationVariants(c.duration_variants, basePrice);
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnail_url: c.thumbnail_url,
      youtube_url: c.youtube_url,
      price_inr: basePrice,
      duration_variants: c.duration_variants,
      is_free: Boolean(c.is_free),
      published: c.published,
      variants,
    };
  });

  // Fail-safe: if specific course slug was passed but wasn't in bulk query, fetch directly
  if (course && !allCourses.some((c) => c.slug === course)) {
    const { data: directCourse } = await supabase
      .from("lms_courses")
      .select("id, title, slug, thumbnail_url, youtube_url, price_inr, duration_variants, is_free, published")
      .eq("slug", course)
      .maybeSingle();

    if (directCourse) {
      const basePrice = Number(directCourse.price_inr) || 0;
      allCourses.push({
        id: directCourse.id,
        title: directCourse.title,
        slug: directCourse.slug,
        thumbnail_url: directCourse.thumbnail_url,
        youtube_url: directCourse.youtube_url,
        price_inr: basePrice,
        duration_variants: directCourse.duration_variants,
        is_free: Boolean(directCourse.is_free),
        published: directCourse.published,
        variants: parseDurationVariants(directCourse.duration_variants, basePrice),
      });
    }
  }

  // If a specific free course was requested, redirect directly to video player
  if (course) {
    const matched = allCourses.find((c) => c.slug === course);
    if (matched && (matched.is_free || matched.price_inr === 0)) {
      redirect(`/learn/${matched.slug}/main-video`);
    }
  }

  // Filter to paid courses for enrollment
  const paidCourses: CheckoutCourse[] = allCourses
    .filter((c) => {
      if (course && c.slug === course) return true;
      return c.published !== false && !c.is_free && c.price_inr > 0;
    })
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnail_url: c.thumbnail_url,
      youtube_url: c.youtube_url,
      price_inr: c.price_inr,
      duration_variants: c.duration_variants,
      is_free: c.is_free,
      variants: c.variants,
    }));

  return (
    <CourseCheckout
      initialCourses={paidCourses}
      initialPreselectSlug={course}
      initialPlanId={plan}
      userEmail={user?.email || null}
      isAuthenticated={Boolean(user)}
    />
  );
}
