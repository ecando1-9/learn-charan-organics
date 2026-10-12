"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StudentReview {
  id?: string;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating?: number;
  created_at?: string;
  isNew?: boolean;
}

export async function getTestimonialReviews(courseFilter?: string): Promise<StudentReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lms_student_reviews")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return [];
    }

    const reviews: StudentReview[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role || "Student Maker",
      quote: row.quote,
      avatar: row.avatar || (row.name ? row.name.substring(0, 2).toUpperCase() : "ST"),
      rating: row.rating || 5,
      created_at: row.created_at,
    }));

    if (courseFilter && courseFilter.trim()) {
      const q = courseFilter.toLowerCase().trim();
      // Only match reviews that actually belong to this course
      const matched = reviews.filter(
        (r) => r.role?.toLowerCase().includes(q) || r.quote?.toLowerCase().includes(q)
      );
      return matched;
    }

    // Return all real database reviews (used on Home Page)
    return reviews;
  } catch {
    return [];
  }
}

export async function submitTestimonialReview(
  name: string,
  role: string,
  quote: string,
  rating = 5,
  courseTitle?: string,
  courseSlug?: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const initials = name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const formattedRole = courseTitle && courseTitle.trim()
      ? `${role.trim() || "Student"} • ${courseTitle.trim()}`
      : role.trim() || "Student Maker";

    const payload: any = {
      user_id: user?.id ?? null,
      name: name.trim(),
      role: formattedRole,
      quote: quote.trim(),
      rating,
      avatar: initials || "ST",
      published: true,
    };

    const { data, error } = await supabase
      .from("lms_student_reviews")
      .insert(payload)
      .select()
      .single();

    if (error) return { error: error.message };

    revalidatePath("/");
    if (courseSlug) {
      revalidatePath(`/courses/${courseSlug}`);
    }
    return { success: true, review: data };
  } catch (err: any) {
    return { error: err?.message || "Failed to submit review" };
  }
}
