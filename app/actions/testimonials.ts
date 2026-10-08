"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { testimonials as defaultTestimonials } from "@/lib/data";

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

export async function getTestimonialReviews(): Promise<StudentReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lms_student_reviews")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      return defaultTestimonials.map((t) => ({ ...t, rating: 5 }));
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role || "Student Maker",
      quote: row.quote,
      avatar: row.avatar || (row.name ? row.name.substring(0, 2).toUpperCase() : "ST"),
      rating: row.rating || 5,
      created_at: row.created_at,
    }));
  } catch {
    return defaultTestimonials.map((t) => ({ ...t, rating: 5 }));
  }
}

export async function submitTestimonialReview(
  name: string,
  role: string,
  quote: string,
  rating = 5
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

    const payload: any = {
      user_id: user?.id ?? null,
      name: name.trim(),
      role: role.trim() || "Student Maker",
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
    return { success: true, review: data };
  } catch (err: any) {
    return { error: err?.message || "Failed to submit review" };
  }
}
