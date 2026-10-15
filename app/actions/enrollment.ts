"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureLmsProfile } from "@/lib/supabase/profile";
import { allocateCourseAmounts } from "@/lib/enrollment-amounts";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { sendEnrollmentApprovalEmail } from "@/lib/email";

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

    const MAX_PROOF_SIZE = 2 * 1024 * 1024; // 2 MB
    if (proofFile && proofFile.size > MAX_PROOF_SIZE) {
      return { error: "Your file has more than 2 MB. Max 2 MB allowed." };
    }

    let paymentProofUrl: string | null = null;
    const admin = createAdminClient();

    if (proofFile && proofFile.size > 0) {
      const ext = proofFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from("payment-proofs")
        .upload(path, proofFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = admin.storage.from("payment-proofs").getPublicUrl(path);
        paymentProofUrl = urlData.publicUrl;
      }
    }

    const { error } = await admin.from("lms_enrollment_requests").insert({
      user_id: user.id,
      course_title: courseTitles,
      course_ids: courseIds,
      amount_inr: amount,
      upi_id: PAYMENT_CONFIG.upiId,
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
    .select("user_id, course_id, course_ids, amount_inr, selected_all, utr_number, course_title")
    .eq("id", requestId)
    .single();

  if (reqError || !request) return { error: "Request not found" };
  if (!request.user_id) return { error: "User ID missing for request" };

  let courseIds: string[] = request.course_ids ?? [];
  if (courseIds.length === 0 && request.course_id) {
    courseIds = [request.course_id];
  }

  // If selected_all and no specific ids stored, fetch all published course ids
  if (request.selected_all && courseIds.length === 0) {
    const { data: allCourses } = await admin
      .from("lms_courses")
      .select("id")
      .eq("published", true);
    courseIds = (allCourses ?? []).map((c: { id: string }) => c.id);
  }

  // Fallback: If still no courseIds, search published courses by course_title match
  if (courseIds.length === 0 && request.course_title) {
    const { data: allCourses } = await admin
      .from("lms_courses")
      .select("id, title");
    if (allCourses) {
      courseIds = allCourses
        .filter((c: any) =>
          request.course_title.toLowerCase().includes(c.title.toLowerCase())
        )
        .map((c: any) => c.id);
    }
  }

  const coursePrices = new Map<string, number>();
  let fetchedCourses: any[] = [];
  if (courseIds.length > 0) {
    const { data: courses } = await admin
      .from("lms_courses")
      .select("id, title, slug, price_inr, thumbnail_url")
      .in("id", courseIds);

    fetchedCourses = courses ?? [];
    fetchedCourses.forEach((course: any) => {
      coursePrices.set(course.id, Number(course.price_inr) || 0);
    });
  }

  // If fetchedCourses is still empty, fallback to published courses
  if (fetchedCourses.length === 0 && (request.selected_all || request.course_title)) {
    const { data: fallbackCourses } = await admin
      .from("lms_courses")
      .select("id, title, slug, price_inr, thumbnail_url")
      .eq("published", true);

    if (fallbackCourses && fallbackCourses.length > 0) {
      if (request.selected_all) {
        fetchedCourses = fallbackCourses;
      } else {
        fetchedCourses = fallbackCourses.filter((c: any) =>
          request.course_title?.toLowerCase().includes(c.title.toLowerCase())
        );
        if (fetchedCourses.length === 0) {
          fetchedCourses = [fallbackCourses[0]];
        }
      }
      fetchedCourses.forEach((course: any) => {
        coursePrices.set(course.id, Number(course.price_inr) || 0);
      });
      courseIds = fetchedCourses.map((c: any) => c.id);
    }
  }

  const validCourseIds = fetchedCourses.map((c: any) => c.id);

  const courseAmounts = allocateCourseAmounts({
    courseIds: validCourseIds,
    totalAmount: Number(request.amount_inr) || 0,
    coursePrices,
    selectedAll: Boolean(request.selected_all),
  });

  // Insert or update enrollments for each valid course
  if (validCourseIds.length > 0) {
    const enrollments = validCourseIds.map((courseId) => ({
      user_id: request.user_id,
      course_id: courseId,
      status: "active",
      amount_paid_inr: courseAmounts.get(courseId) ?? 0,
      enrolled_at: new Date().toISOString(),
    }));

    const { error: enrollError } = await admin
      .from("lms_enrollments")
      .upsert(enrollments, { onConflict: "user_id,course_id" });

    if (enrollError) {
      console.error("[approveEnrollment] Upsert error:", enrollError);
      return { error: enrollError.message };
    }

    // Explicitly guarantee active status on all rows
    await admin
      .from("lms_enrollments")
      .update({ status: "active", enrolled_at: new Date().toISOString() })
      .eq("user_id", request.user_id)
      .in("course_id", validCourseIds);
  }

  // Mark request approved
  const { error: updateError } = await admin
    .from("lms_enrollment_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) return { error: updateError.message };

  // Also clean up any other duplicate pending requests for this user that cover these same approved courses
  try {
    const { data: otherPending } = await admin
      .from("lms_enrollment_requests")
      .select("id, course_ids, course_title, selected_all")
      .eq("user_id", request.user_id)
      .eq("status", "pending")
      .neq("id", requestId);

    if (otherPending && otherPending.length > 0) {
      const validSet = new Set(validCourseIds);
      const otherIdsToApprove: string[] = [];
      otherPending.forEach((op: any) => {
        if (op.selected_all && request.selected_all) {
          otherIdsToApprove.push(op.id);
        } else if (Array.isArray(op.course_ids) && op.course_ids.length > 0) {
          const allCovered = op.course_ids.every((cid: string) => validSet.has(cid));
          if (allCovered) otherIdsToApprove.push(op.id);
        } else if (
          op.course_title &&
          request.course_title &&
          op.course_title.toLowerCase().trim() === request.course_title.toLowerCase().trim()
        ) {
          otherIdsToApprove.push(op.id);
        }
      });

      if (otherIdsToApprove.length > 0) {
        await admin
          .from("lms_enrollment_requests")
          .update({
            status: "approved",
            admin_note: "Auto-approved with primary request " + requestId,
            reviewed_at: new Date().toISOString(),
          })
          .in("id", otherIdsToApprove);
      }
    }
  } catch (cleanErr) {
    console.warn("[approveEnrollment] Auto-resolving duplicate requests warning:", cleanErr);
  }

  // Fetch student profile for email
  const { data: profile } = await admin
    .from("lms_profiles")
    .select("full_name, email")
    .eq("id", request.user_id)
    .maybeSingle();

  let studentEmail = profile?.email;
  let studentName = profile?.full_name;

  if (!studentEmail && request.user_id) {
    try {
      const { data: authUserData } = await admin.auth.admin.getUserById(request.user_id);
      studentEmail = authUserData?.user?.email ?? null;
      if (!studentName && authUserData?.user?.user_metadata) {
        studentName = (authUserData.user.user_metadata.full_name || authUserData.user.user_metadata.name) as string;
      }
    } catch (authErr) {
      console.error("[Enrollment] Error fetching auth user email:", authErr);
    }
  }

  if (studentEmail) {
    try {
      const emailResult = await sendEnrollmentApprovalEmail({
        studentEmail,
        studentName: studentName || studentEmail.split("@")[0] || "Valued Learner",
        courses: fetchedCourses.map((c: any) => ({
          id: c.id,
          title: c.title,
          price: Number(c.price_inr) || 0,
          slug: c.slug,
          thumbnail_url: c.thumbnail_url || null,
        })),
        totalAmount: Number(request.amount_inr) || 0,
        utrNumber: request.utr_number,
        requestId,
        requestedCourseTitles: request.course_title,
      });
      if (!emailResult.success) {
        console.warn("[Enrollment] Email dispatch warning:", emailResult.error);
      }
    } catch (emailErr) {
      console.error("[Email Notification] Could not send approval email:", emailErr);
    }
  }

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  if (request.user_id) {
    revalidatePath(`/admin/students/${request.user_id}`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/certificates");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/enroll");

  fetchedCourses.forEach((c: any) => {
    if (c.slug) {
      revalidatePath(`/courses/${c.slug}`);
      revalidatePath(`/learn/${c.slug}/main-video`);
    }
  });

  return { success: true };
}

export async function rejectEnrollment(requestId: string, note?: string) {
  const adminResult = await requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  // Check request before rejecting to see if it was previously approved
  const { data: request } = await admin
    .from("lms_enrollment_requests")
    .select("user_id, course_ids, status")
    .eq("id", requestId)
    .single();

  // If this request was already approved, revoke access from lms_enrollments!
  if (request && request.status === "approved" && request.user_id) {
    let courseIds: string[] = request.course_ids ?? [];
    if (courseIds.length > 0) {
      await admin
        .from("lms_enrollments")
        .update({ status: "revoked" })
        .eq("user_id", request.user_id)
        .in("course_id", courseIds);
    }
  }

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
  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/certificates");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/enroll");
  return { success: true };
}

export async function deEnrollStudent(userId: string, courseIds: string[]) {
  const adminResult = await requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  if (courseIds.length === 0) {
    // If no courseIds provided, revoke access for all courses
    const { error } = await admin
      .from("lms_enrollments")
      .update({ status: "revoked" })
      .eq("user_id", userId);

    if (error) return { error: error.message };
  } else {
    // Revoke access for specific courses
    const { error } = await admin
      .from("lms_enrollments")
      .update({ status: "revoked" })
      .eq("user_id", userId)
      .in("course_id", courseIds);

    if (error) return { error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${userId}`);
  revalidatePath("/admin/enrollments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/certificates");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/enroll");
  return { success: true };
}

export async function checkCoursePendingStatus(courseSlugOrId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isPending: false };

    const admin = createAdminClient();
    let courseId = courseSlugOrId;
    let courseTitle = "";
    const { data: courseRow } = await admin
      .from("lms_courses")
      .select("id, title")
      .or(`slug.eq.${courseSlugOrId},id.eq.${courseSlugOrId}`)
      .maybeSingle();

    if (courseRow) {
      courseId = courseRow.id;
      courseTitle = courseRow.title;
    }

    // 1. If user is ALREADY ENROLLED and active, return isEnrolled: true immediately
    const { data: activeEnrollment } = await admin
      .from("lms_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();

    if (activeEnrollment) {
      return { isPending: false, isEnrolled: true };
    }

    const { data: reqs } = await admin
      .from("lms_enrollment_requests")
      .select("id, course_ids, course_title, selected_all, utr_number, amount_inr, requested_at")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("requested_at", { ascending: false });

    if (!reqs || reqs.length === 0) return { isPending: false, isEnrolled: false };

    const matched = reqs.find(
      (r: any) =>
        r.selected_all ||
        (Array.isArray(r.course_ids) && r.course_ids.includes(courseId)) ||
        (courseTitle &&
          typeof r.course_title === "string" &&
          r.course_title.toLowerCase().includes(courseTitle.toLowerCase()))
    );

    if (matched) {
      return {
        isPending: true,
        isEnrolled: false,
        utrNumber: matched.utr_number || "Payment proof submitted",
        amount: matched.amount_inr,
        courseTitle: matched.course_title,
        requestedAt: matched.requested_at,
      };
    }

    return { isPending: false, isEnrolled: false };
  } catch (err) {
    console.warn("[checkCoursePendingStatus] Error:", err);
    return { isPending: false, isEnrolled: false };
  }
}

