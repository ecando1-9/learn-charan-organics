"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureLmsProfile } from "@/lib/supabase/profile";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";

async function requireAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("lms_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { error: error.message as string };
  if (profile?.role !== "admin") return { error: "Not authorized" as const };

  return { admin };
}

export async function submitEnrollmentRequest(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    await ensureLmsProfile(user);

    const courseIds = formData.getAll("course_ids") as string[];
    const courseTitles = formData.get("course_titles") as string;
    const amount = Number(formData.get("amount"));
    const utrNumber = (formData.get("utr_number") as string) || null;
    const selectedAll = formData.get("selected_all") === "true";
    const proofFile = formData.get("proof_file") as File | null;

    let paymentProofUrl: string | null = null;

    if (proofFile && proofFile.size > 0) {
      const ext = proofFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, proofFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        paymentProofUrl = urlData.publicUrl;
      }
    }

    const admin = createAdminClient();
    const { error } = await admin.from("lms_enrollment_requests").insert({
      user_id: user.id,
      course_title: courseTitles,
      course_ids: courseIds,
      amount_inr: amount,
      upi_id: "8985482084@hdfc",
      utr_number: utrNumber,
      payment_proof_url: paymentProofUrl,
      selected_all: selectedAll,
      status: "pending",
    });

    if (error) return { error: error.message };
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Could not submit enrollment request." };
  }
}

export async function approveEnrollment(requestId: string) {
  const adminResult = await requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  // Get the request details
  const { data: request, error: reqError } = await admin
    .from("lms_enrollment_requests")
    .select("user_id, course_ids, amount_inr, selected_all")
    .eq("id", requestId)
    .single();

  if (reqError || !request) return { error: "Request not found" };

  let courseIds: string[] = request.course_ids ?? [];

  // If selected_all and no specific ids stored, fetch all published course ids
  if (request.selected_all && courseIds.length === 0) {
    const { data: allCourses } = await admin
      .from("lms_courses")
      .select("id")
      .eq("published", true);
    courseIds = (allCourses ?? []).map((c: { id: string }) => c.id);
  }

  const coursePrices = new Map<string, number>();
  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("lms_courses")
      .select("id, price_inr")
      .in("id", courseIds);

    (courses ?? []).forEach((course: any) => {
      coursePrices.set(course.id, Number(course.price_inr) || 0);
    });
  }

  const courseAmounts = allocateCourseAmounts({
    courseIds,
    totalAmount: Number(request.amount_inr) || 0,
    coursePrices,
    selectedAll: Boolean(request.selected_all),
  });

  // Insert enrollments for each course
  const enrollments = courseIds.map((courseId) => ({
    user_id: request.user_id,
    course_id: courseId,
    status: "active",
    amount_paid_inr: courseAmounts.get(courseId) ?? 0,
  }));

  if (enrollments.length > 0) {
    const { error: enrollError } = await admin
      .from("lms_enrollments")
      .upsert(enrollments, { onConflict: "user_id,course_id" });
    if (enrollError) return { error: enrollError.message };
  }

  // Mark request approved
  const { error: updateError } = await admin
    .from("lms_enrollment_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/students");
  return { success: true };
}

export async function rejectEnrollment(requestId: string, note?: string) {
  const adminResult = await requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  const { error } = await admin
    .from("lms_enrollment_requests")
    .update({
      status: "rejected",
      admin_note: note ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return { error: error.message };
  revalidatePath("/admin/enrollments");
  return { success: true };
}

export async function deEnrollStudent(userId: string, courseIds: string[]) {
  const adminResult = await requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  if (courseIds.length === 0) {
    // If no courseIds provided, de-enroll from all
    const { error } = await admin
      .from("lms_enrollments")
      .delete()
      .eq("user_id", userId);

    if (error) return { error: error.message };
  } else {
    // De-enroll from specific courses
    const { error } = await admin
      .from("lms_enrollments")
      .delete()
      .eq("user_id", userId)
      .in("course_id", courseIds);

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${userId}`);
  return { success: true };
}
