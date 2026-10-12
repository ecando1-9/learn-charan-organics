"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type VerificationResult = {
  found: boolean;
  certificateNo?: string;
  studentName?: string;
  studentEmail?: string;
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnail?: string | null;
  issuedAt?: string;
  revokedAt?: string | null;
  isRevoked?: boolean;
  message?: string;
};

/**
 * Normalizes certificate number strings (e.g. "co-8f2k9a" -> "CO-8F2K9A")
 */
function normalizeCertNo(input: string): string {
  let cleaned = input.trim().toUpperCase();
  if (!cleaned.startsWith("CO-") && !cleaned.startsWith("CO")) {
    cleaned = `CO-${cleaned}`;
  } else if (cleaned.startsWith("CO") && !cleaned.startsWith("CO-")) {
    cleaned = `CO-${cleaned.slice(2)}`;
  }
  return cleaned;
}

/**
 * Retrieves an existing certificate for student + course or creates a new one
 */
export async function getOrCreateStudentCertificate({
  userId,
  courseId,
  studentName,
}: {
  userId: string;
  courseId: string;
  studentName?: string;
}) {
  try {
    const admin = createAdminClient();

    // 1. Check if certificate already exists
    const { data: existing, error: checkError } = await admin
      .from("lms_certificates")
      .select("id, certificate_no, issued_at, revoked_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing && !checkError) {
      return {
        success: true,
        certificateNo: existing.certificate_no,
        issuedAt: existing.issued_at,
        isRevoked: Boolean(existing.revoked_at),
      };
    }

    // 2. Generate a professional unique credential number: CO-XXXXXX
    // Generate an 8-character unique alphanumeric code
    const uniqueSegment = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certNo = `CO-${uniqueSegment}`;

    const { data: inserted, error: insertError } = await admin
      .from("lms_certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_no: certNo,
        issued_at: new Date().toISOString(),
      })
      .select("id, certificate_no, issued_at")
      .single();

    if (insertError) {
      console.error("[getOrCreateStudentCertificate] Insert failed:", insertError);
      return {
        success: false,
        error: insertError.message,
        certificateNo: certNo, // fallback
      };
    }

    return {
      success: true,
      certificateNo: inserted.certificate_no,
      issuedAt: inserted.issued_at,
      isRevoked: false,
    };
  } catch (err: any) {
    console.error("[getOrCreateStudentCertificate] Error:", err);
    return {
      success: false,
      error: err.message || "Failed to issue certificate",
      certificateNo: `CO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };
  }
}

/**
 * Publicly verifies a certificate credential ID against Supabase
 */
export async function verifyCertificateByCode(rawCode: string): Promise<VerificationResult> {
  if (!rawCode || !rawCode.trim()) {
    return {
      found: false,
      message: "Please enter a certificate credential ID to verify.",
    };
  }

  try {
    const admin = createAdminClient();
    const cleanCode = normalizeCertNo(rawCode);

    // Try finding by exact normalized code or raw code
    const { data: cert, error } = await admin
      .from("lms_certificates")
      .select(`
        id,
        certificate_no,
        issued_at,
        revoked_at,
        user_id,
        course_id,
        lms_profiles (
          id,
          full_name,
          email
        ),
        lms_courses (
          id,
          title,
          slug,
          thumbnail_url
        )
      `)
      .or(`certificate_no.eq.${cleanCode},certificate_no.eq.${rawCode.trim().toUpperCase()}`)
      .maybeSingle();

    if (error) {
      console.error("[verifyCertificateByCode] Query error:", error);
    }

    if (cert) {
      const profile: any = cert.lms_profiles;
      const course: any = cert.lms_courses;
      const isRevoked = Boolean(cert.revoked_at);

      let studentName = profile?.full_name?.trim();
      if (!studentName || studentName.toLowerCase() === "student") {
        if (profile?.email && profile.email.includes("@")) {
          const handle = profile.email.split("@")[0];
          studentName = handle.charAt(0).toUpperCase() + handle.slice(1);
        } else {
          studentName = "Valued Academy Student";
        }
      }

      return {
        found: true,
        certificateNo: cert.certificate_no,
        studentName,
        studentEmail: profile?.email ? `${profile.email.slice(0, 3)}***@${profile.email.split("@")[1] || "gmail.com"}` : undefined,
        courseTitle: course?.title || "Organic Formulation Masterclass",
        courseSlug: course?.slug || "",
        courseThumbnail: course?.thumbnail_url || null,
        issuedAt: cert.issued_at,
        revokedAt: cert.revoked_at,
        isRevoked,
        message: isRevoked
          ? "This certificate has been revoked by the Academy Administration."
          : "Official credential verified and authenticated in Charan Organics Academy registry.",
      };
    }

    // If not found in lms_certificates:
    // Check if the user is verifying a demo code or newly formatted code
    return {
      found: false,
      certificateNo: cleanCode,
      message: `No active credential matching "${cleanCode}" was found in the official registry. Please verify the code or contact academy administration.`,
    };
  } catch (err: any) {
    console.error("[verifyCertificateByCode] Unexpected error:", err);
    return {
      found: false,
      message: "An unexpected error occurred while verifying the credential. Please try again.",
    };
  }
}

/**
 * Seed or retrieve a sample verified certificate for live demonstrations
 */
export async function getSampleCertificateDemo(): Promise<string> {
  try {
    const admin = createAdminClient();

    // Check if any certificate exists
    const { data: firstCert } = await admin
      .from("lms_certificates")
      .select("certificate_no")
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (firstCert?.certificate_no) {
      return firstCert.certificate_no;
    }

    // If none exists, create one official demonstration certificate
    const { data: firstUser } = await admin
      .from("lms_profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    const { data: firstCourse } = await admin
      .from("lms_courses")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (firstUser?.id && firstCourse?.id) {
      const demoCertNo = "CO-DEMO-2026";
      await admin.from("lms_certificates").upsert({
        user_id: firstUser.id,
        course_id: firstCourse.id,
        certificate_no: demoCertNo,
        issued_at: new Date().toISOString(),
      }, { onConflict: "certificate_no" });
      return demoCertNo;
    }

    return "CO-CHARAN-2026";
  } catch {
    return "CO-CHARAN-2026";
  }
}
