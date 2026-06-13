"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitEnrollmentRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Auto-create profile if it doesn't exist (fixes foreign key error for new users)
  await supabase.from("lms_profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

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

  const { error } = await supabase.from("lms_enrollment_requests").insert({
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
}

export async function approveEnrollment(requestId: string) {
  const supabase = await createClient();

  // Get the request details
  const { data: request, error: reqError } = await supabase
    .from("lms_enrollment_requests")
    .select("user_id, course_ids, amount_inr, selected_all")
    .eq("id", requestId)
    .single();

  if (reqError || !request) return { error: "Request not found" };

  let courseIds: string[] = request.course_ids ?? [];

  // If selected_all and no specific ids stored, fetch all published course ids
  if (request.selected_all && courseIds.length === 0) {
    const { data: allCourses } = await supabase
      .from("lms_courses")
      .select("id")
      .eq("published", true);
    courseIds = (allCourses ?? []).map((c: { id: string }) => c.id);
  }

  // Insert enrollments for each course
  const enrollments = courseIds.map((courseId) => ({
    user_id: request.user_id,
    course_id: courseId,
    status: "active",
    amount_paid_inr: request.amount_inr,
  }));

  if (enrollments.length > 0) {
    const { error: enrollError } = await supabase
      .from("lms_enrollments")
      .upsert(enrollments, { onConflict: "user_id,course_id" });
    if (enrollError) return { error: enrollError.message };
  }

  // Mark request approved
  const { error: updateError } = await supabase
    .from("lms_enrollment_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/students");
  return { success: true };
}

export async function rejectEnrollment(requestId: string, note?: string) {
  const supabase = await createClient();

  const { error } = await supabase
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
