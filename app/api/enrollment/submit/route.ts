import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureLmsProfile } from "@/lib/supabase/profile";
import { PAYMENT_CONFIG } from "@/lib/payment-config";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please sign in or register to link your enrollment to your student account." },
        { status: 401 }
      );
    }

    await ensureLmsProfile(user);

    const formData = await request.formData();
    const courseIds = formData.getAll("course_ids") as string[];
    const courseTitles = (formData.get("course_titles") as string) || "Course Masterclass";
    const amount = Number(formData.get("amount")) || 0;
    const utrNumber = ((formData.get("utr_number") as string) || "").trim() || null;
    const selectedAll = formData.get("selected_all") === "true";
    const proofFile = formData.get("proof_file") as File | null;

    if (courseIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one course to enroll." },
        { status: 400 }
      );
    }

    if (!utrNumber && (!proofFile || proofFile.size === 0)) {
      return NextResponse.json(
        { success: false, error: "Please enter your 12-digit UPI / UTR number or attach a payment screenshot." },
        { status: 400 }
      );
    }

    let paymentProofUrl: string | null = null;
    const admin = createAdminClient();

    // Upload screenshot if provided
    if (proofFile && proofFile.size > 0) {
      try {
        const ext = proofFile.name.split(".").pop() || "jpg";
        const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
        const path = `${user.id}/${Date.now()}.${sanitizedExt}`;

        const arrayBuffer = await proofFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await admin.storage
          .from("payment-proofs")
          .upload(path, buffer, {
            contentType: proofFile.type || "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.warn("[api/enrollment/submit] Storage upload notice:", uploadError.message);
        } else {
          const { data: urlData } = admin.storage.from("payment-proofs").getPublicUrl(path);
          paymentProofUrl = urlData.publicUrl;
        }
      } catch (uploadEx: any) {
        console.warn("[api/enrollment/submit] File upload exception:", uploadEx?.message || uploadEx);
      }
    }

    // Insert enrollment request into database
    const { error: insertError } = await admin.from("lms_enrollment_requests").insert({
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

    if (insertError) {
      console.error("[api/enrollment/submit] DB insert error:", insertError.message);
      return NextResponse.json(
        { success: false, error: insertError.message || "Could not save enrollment request." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment request submitted successfully!",
      utr: utrNumber,
    });
  } catch (error: any) {
    console.error("[api/enrollment/submit] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "An unexpected error occurred while submitting." },
      { status: 500 }
    );
  }
}
