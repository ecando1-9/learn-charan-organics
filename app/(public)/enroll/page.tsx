import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MessageCircle, Zap, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseDurationVariants } from "@/lib/course-variants";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
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
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.warn("[EnrollPage] Could not fetch user session:", err);
  }

  // If not logged in, never show checkout page — ask for login first!
  if (!user) {
    const enrollTarget = `/enroll${course ? `?course=${encodeURIComponent(course)}${plan ? `&plan=${encodeURIComponent(plan)}` : ""}` : ""}`;
    redirect(`/login?redirectTo=${encodeURIComponent(enrollTarget)}`);
  }

  // 1.5 Admin client and pending enrollment requests for this user
  const admin = createAdminClient();
  let pendingRequests: any[] = [];
  try {
    const { data: reqs } = await admin
      .from("lms_enrollment_requests")
      .select("id, status, course_title, course_ids, selected_all, amount_inr, requested_at, utr_number")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("requested_at", { ascending: false });
    pendingRequests = reqs || [];
  } catch (err) {
    console.warn("[EnrollPage] Could not fetch pending enrollment requests:", err);
  }

  // 2. Fetch courses on the server
  let rawCourses: any[] = [];
  try {
    const { data } = await supabase
      .from("lms_courses")
      .select("id, title, slug, description, thumbnail_url, youtube_url, price_inr, duration_variants, is_free, level, duration_minutes, published")
      .order("sort_order", { ascending: true });
    rawCourses = data ?? [];
  } catch (err) {
    console.warn("[EnrollPage] Could not fetch courses:", err);
  }

  let allCourses = (rawCourses ?? []).map((c: any) => {
    const basePrice = Number(c.price_inr) || 0;
    const variants = parseDurationVariants(c.duration_variants, basePrice);
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnail_url: c.thumbnail_url,
      youtube_url: c.youtube_url,
      price_inr: basePrice,
      duration_variants: c.duration_variants,
      is_free: Boolean(c.is_free),
      level: c.level,
      duration_minutes: c.duration_minutes,
      published: c.published,
      variants,
    };
  });

  // Fail-safe: if specific course slug was passed but wasn't in bulk query, fetch directly
  if (course && !allCourses.some((c) => c.slug === course)) {
    const { data: directCourse } = await supabase
      .from("lms_courses")
      .select("id, title, slug, description, thumbnail_url, youtube_url, price_inr, duration_variants, is_free, level, duration_minutes, published")
      .eq("slug", course)
      .maybeSingle();

    if (directCourse) {
      const basePrice = Number(directCourse.price_inr) || 0;
      allCourses.push({
        id: directCourse.id,
        title: directCourse.title,
        slug: directCourse.slug,
        description: directCourse.description,
        thumbnail_url: directCourse.thumbnail_url,
        youtube_url: directCourse.youtube_url,
        price_inr: basePrice,
        duration_variants: directCourse.duration_variants,
        is_free: Boolean(directCourse.is_free),
        level: directCourse.level,
        duration_minutes: directCourse.duration_minutes,
        published: directCourse.published,
        variants: parseDurationVariants(directCourse.duration_variants, basePrice),
      });
    }
  }

  // If a specific course was requested, check if already free or already pending
  if (course) {
    const matched = allCourses.find((c) => c.slug === course);
    if (matched) {
      if (matched.is_free || matched.price_inr === 0) {
        redirect(`/learn/${matched.slug}/main-video`);
      }

      // If already enrolled (approved), redirect directly to course player
      const { data: alreadyEnrolled } = await admin
        .from("lms_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", matched.id)
        .eq("status", "active")
        .maybeSingle();

      if (alreadyEnrolled) {
        redirect(`/learn/${matched.slug}/main-video`);
      }

      // Check if user already submitted an access request for this course
      const matchingPending = pendingRequests.find(
        (r) =>
          r.selected_all ||
          (r.course_ids && r.course_ids.includes(matched.id))
      );

      if (matchingPending) {
        return (
          <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-linen/50 dark:bg-[#07140f] flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[2.5rem] bg-white dark:bg-[#0e1f18] p-6 sm:p-9 shadow-2xl border-2 border-amber-400/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
                    Verification in Progress
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-forest dark:text-cream mt-1">
                    Course Access Request Already Submitted
                  </h1>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold text-sm text-forest dark:text-cream">
                  {matchingPending.course_title}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/20 text-[11px]">
                  <div>
                    <span className="opacity-70">Amount Paid:</span>{" "}
                    <strong>₹{matchingPending.amount_inr}</strong>
                  </div>
                  <div>
                    <span className="opacity-70">Reference / UTR:</span>{" "}
                    <strong className="truncate block font-mono font-bold">{matchingPending.utr_number || "Payment Proof Attached"}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="opacity-70">Submitted On:</span>{" "}
                    <span>
                      {new Date(matchingPending.requested_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] pt-1 text-ink/70 dark:text-cream/70 leading-relaxed">
                  Your payment details were received and are being verified by our admissions desk. Once verified, this course will automatically appear in your <strong>My Learning</strong> portal.
                </p>
              </div>

              {/* Direct WhatsApp Instant Access Box */}
              <div className="rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-forest dark:text-cream font-black text-sm sm:text-base">
                  <Zap size={18} className="text-leaf" />
                  <span>Want Immediate Access?</span>
                </div>
                <p className="text-xs text-ink/75 dark:text-cream/75 leading-relaxed">
                  Need to start studying right away? Chat directly with our admissions desk on WhatsApp. Share your payment screenshot to get this course unlocked in <strong>under 5 minutes</strong>!
                </p>
                <a
                  href={`https://wa.me/${PAYMENT_CONFIG.supportWhatsapp}?text=${encodeURIComponent(
                    `Hello Charan Organics Academy, I have already submitted payment for "${matchingPending.course_title}" (UTR: ${matchingPending.utr_number || "Payment Proof Attached"}). Please unlock immediate access for me.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 font-black text-sm shadow-lg transition active:scale-95"
                >
                  <MessageCircle size={18} />
                  <span>Unlock Immediate Access on WhatsApp</span>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/dashboard#access-requests" className="flex-1">
                  <Button variant="secondary" className="w-full text-xs font-bold py-2.5">
                    <Clock size={14} className="mr-1.5" /> Check Request Status
                  </Button>
                </Link>
                <Link href="/courses" className="flex-1">
                  <Button variant="secondary" className="w-full text-xs font-bold py-2.5">
                    <BookOpen size={14} className="mr-1.5" /> Browse Other Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      }
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
      description: c.description,
      thumbnail_url: c.thumbnail_url,
      youtube_url: c.youtube_url,
      price_inr: c.price_inr,
      duration_variants: c.duration_variants,
      is_free: c.is_free,
      level: c.level,
      duration_minutes: c.duration_minutes,
      variants: c.variants,
    }));

  return (
    <CourseCheckout
      initialCourses={paidCourses}
      initialPreselectSlug={course}
      initialPlanId={plan}
      userEmail={user?.email || null}
      isAuthenticated={Boolean(user)}
      pendingRequests={pendingRequests}
    />
  );
}
