import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "yuvapink52@gmail.com";
const COURSE_SLUG = "soap-base-making";
const DIRECT_PAYMENT_REF = "Direct Payment";

const BULK_EMAILS = [
  "Visitmraj@gmail.com",
  "mail4madhavi@gmail.com",
  "ameerunnisa093@gmail.com",
  "Kavithanlg@gmail.com",
  "Vanajachowdary26@gmail.com",
  "dumpanagaaruna@gmail.com",
  "Chavaprasad@gmail.com",
  "jyothsnaetala@gmail.com",
  "bhuvanasreeenterprises999@gmail.com",
  "saggellanarishimha@gmail.com",
  "sandhyarani.sudarsan@gmail.com",
  "Palurivaralakshmi9@gmail.com",
  "manasarayavarapu1@gmail.com",
  "Anjanadevi.rachaputi6@gmail.com",
  "Krothapeta@gmail.com",
  "glakshmidtc@gmail.com",
  "vijayalakshmilollaa@gmail.com",
  TEST_EMAIL,
];

function usage() {
  console.log(`
Usage:
  node --env-file=.env.local scripts/grant-soap-base-access.mjs --test
  node --env-file=.env.local scripts/grant-soap-base-access.mjs --all --confirm

Options:
  --test       Process only ${TEST_EMAIL}.
  --all        Process the full email list.
  --confirm    Required with --all to avoid accidental bulk changes.
  --no-email   Do not send access email.
  --force-email
              Send email even when an existing test request is reused.
`);
}

function normalizeEmail(email) {
  return email.trim().replace(/[.,;]+$/, "").toLowerCase();
}

function fullNameFromEmail(email) {
  const local = email.split("@")[0] || "Student";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase()) || "Student";
}

function generatePassword(email) {
  const local = (email.split("@")[0] || "student").replace(/[^a-z0-9]/gi, "");
  const seed = local.slice(0, 6) || "student";
  return `Charan@${seed}2026`;
}

function parseVariants(rawVariants, basePrice) {
  const variants = Array.isArray(rawVariants) ? rawVariants : [];
  if (variants.length === 0) {
    return [{ id: "6_months", name: "6 Months Access", price: Number(basePrice) || 0, isDefault: true }];
  }

  return variants.map((variant, index) => ({
    id: String(variant.id || `plan_${index + 1}`),
    name: String(variant.name || (index === 0 ? "6 Months Access" : "1 Year Access")),
    price: Number(variant.price_inr ?? variant.price ?? basePrice ?? 0),
    isDefault: Boolean(variant.is_default ?? variant.isDefault ?? index === 0),
  }));
}

function selectSixMonthVariant(course) {
  const variants = parseVariants(course.duration_variants, course.price_inr);
  return (
    variants.find((variant) => /6\s*(month|mo|m)/i.test(variant.name)) ||
    variants.find((variant) => variant.isDefault) ||
    variants[0]
  );
}

function getEmailFromAddress() {
  const configured =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FORM ||
    "learn@charanorganics.com";

  const trimmed = configured.trim();
  return trimmed.includes("<") && trimmed.includes(">")
    ? trimmed
    : `Charan Organics Academy <${trimmed}>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendAccessEmail({ email, password, course, variant, requestId }) {
  if (process.argv.includes("--no-email")) {
    return { skipped: true, reason: "--no-email" };
  }

  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "RESEND_API_KEY missing" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://learn.charanorganics.com");
  const loginUrl = `${appUrl}/login`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const coursesUrl = `${appUrl}/dashboard/courses`;
  const communityUrl = `${appUrl}/community`;
  const courseUrl = `${appUrl}/learn/${course.slug}/main-video`;
  const invoiceRef = `COA-ENR-${requestId.slice(0, 8).toUpperCase()}`;
  const studentName = fullNameFromEmail(email);
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: [email],
      subject: "Enrollment Confirmed: Soap Base Making Access Activated | Charan Organics Academy",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Access Activated - Charan Organics Academy</title>
</head>
<body style="margin:0;padding:0;background:#f4f8f3;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f8f3;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #dce8dd;border-radius:22px;overflow:hidden;box-shadow:0 8px 26px rgba(12,45,28,0.08);">
          <tr>
            <td style="background:#0b291b;padding:34px 30px;text-align:center;border-bottom:4px solid #16a34a;">
              <div style="display:inline-block;background:#ffffff;border-radius:16px;padding:10px;margin-bottom:14px;">
                <img src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png" alt="Charan Organics Academy" width="64" height="64" style="display:block;border-radius:12px;">
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.25;font-weight:900;">Charan Organics Academy</h1>
              <p style="margin:7px 0 0;color:#bbf7d0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;">Official Course Access Confirmation</p>
            </td>
          </tr>

          <tr>
            <td style="background:#071f14;padding:11px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size:12px;color:#d1fae5;">Admission Ref: <strong style="color:#ffffff;font-family:monospace;">${invoiceRef}</strong></td>
                  <td align="right" style="font-size:12px;color:#d1fae5;">Issued: <strong style="color:#ffffff;">${escapeHtml(issueDate)}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 30px 24px;">
              <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:16px;padding:18px 20px;margin-bottom:24px;">
                <div style="font-size:16px;font-weight:900;color:#065f46;margin-bottom:4px;">Payment Verified and Course Access Activated</div>
                <div style="font-size:13px;line-height:1.6;color:#047857;">Your payment has been accepted as <strong>${DIRECT_PAYMENT_REF}</strong>. Your Soap Base Making class is now active in your student dashboard.</div>
              </div>

              <h2 style="margin:0 0 10px;color:#0b291b;font-size:21px;font-weight:900;">Dear ${escapeHtml(studentName)},</h2>
              <p style="margin:0 0 22px;color:#4b5563;font-size:14px;line-height:1.7;">Welcome to Charan Organics Academy. Your enrollment for <strong>${escapeHtml(course.title)}</strong> has been approved under the <strong>${escapeHtml(variant.name)}</strong> plan. Please use the login details below to access your video class, formulation notes, and student dashboard.</p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8faf7;border:1px solid #dbe7df;border-radius:16px;margin-bottom:22px;">
                <tr>
                  <td style="padding:14px 20px;background:#eef6ed;border-bottom:1px solid #dbe7df;">
                    <strong style="font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:.7px;">Student Login Credentials</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size:12px;color:#6b7280;padding-bottom:6px;">Login Email</td>
                        <td align="right" style="font-size:14px;color:#0b291b;font-weight:800;padding-bottom:6px;">${escapeHtml(email)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#6b7280;padding-bottom:6px;">Password</td>
                        <td align="right" style="font-size:14px;color:#0b291b;font-weight:900;font-family:monospace;padding-bottom:6px;">${escapeHtml(password)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#6b7280;">Access Plan</td>
                        <td align="right" style="font-size:14px;color:#0b291b;font-weight:800;">${escapeHtml(variant.name)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #dbe7df;border-radius:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:12px;color:#166534;font-weight:900;text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px;">Approved Course</div>
                    <div style="font-size:18px;color:#0b291b;font-weight:900;margin-bottom:6px;">${escapeHtml(course.title)}</div>
                    <div style="font-size:13px;color:#4b5563;margin-bottom:16px;">Includes course videos, formulation learning material, dashboard access, and certificate workflow after completion.</div>
                    <a href="${courseUrl}" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:13px 24px;border-radius:999px;">Open Course Player &rarr;</a>
                    <a href="${coursesUrl}" style="display:inline-block;color:#166534;text-decoration:underline;font-size:13px;font-weight:800;margin-left:14px;">View My Courses</a>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin:24px 0 26px;">
                <a href="${loginUrl}" style="display:inline-block;background:#0b291b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;padding:14px 34px;border-radius:999px;">Login to Student Dashboard</a>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7faf5;border:1px solid #dce8dd;border-radius:16px;">
                <tr>
                  <td style="padding:18px;text-align:center;font-size:12px;line-height:1.7;color:#4b5563;">
                    <strong style="display:block;color:#0b291b;font-size:13px;margin-bottom:4px;">Need help accessing your course?</strong>
                    Dashboard: <a href="${dashboardUrl}" style="color:#166534;font-weight:800;text-decoration:none;">${dashboardUrl}</a><br>
                    Community: <a href="${communityUrl}" style="color:#166534;font-weight:800;text-decoration:none;">${communityUrl}</a><br>
                    Support Email: <a href="mailto:orders@charanorganics.com" style="color:#166534;font-weight:800;text-decoration:none;">orders@charanorganics.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#edf3ec;padding:24px 30px;text-align:center;border-top:1px solid #dce8dd;">
              <p style="margin:0 0 4px;color:#0b291b;font-size:13px;font-weight:900;">Charan Organics Academy</p>
              <p style="margin:0;color:#6b7280;font-size:11px;line-height:1.5;">This official course access email is issued to ${escapeHtml(email)} for ${escapeHtml(course.title)}.<br>&copy; ${new Date().getFullYear()} Charan Organics Academy. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || body?.error?.message || `Resend API failed with ${response.status}`);
  }
  return body;
}

async function getUserByEmail(admin, email) {
  const perPage = 1000;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
  }
  return null;
}

async function upsertUser(admin, email, password) {
  const existing = await getUserByEmail(admin, email);
  const fullName = fullNameFromEmail(email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        full_name: existing.user_metadata?.full_name || fullName,
      },
    });
    if (error) throw error;
    return { user: data.user, created: false };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return { user: data.user, created: true };
}

async function grantAccess(admin, email) {
  const password = generatePassword(email);
  const { user, created } = await upsertUser(admin, email, password);
  const fullName = fullNameFromEmail(email);

  const { error: profileError } = await admin.from("lms_profiles").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || fullName,
    email,
    role: "student",
    suspended: false,
  });
  if (profileError) throw profileError;

  const { data: course, error: courseError } = await admin
    .from("lms_courses")
    .select("id, title, slug, price_inr, thumbnail_url, duration_variants, published")
    .eq("slug", COURSE_SLUG)
    .single();
  if (courseError) throw courseError;
  if (!course?.published) {
    throw new Error(`Course ${COURSE_SLUG} exists but is not published.`);
  }

  const variant = selectSixMonthVariant(course);
  const amount = Number(variant.price) || Number(course.price_inr) || 0;
  const courseTitle = `${course.title} - ${variant.name}`;

  const { data: existingRequest, error: existingRequestError } = await admin
    .from("lms_enrollment_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "approved")
    .or(`utr_number.eq.${DIRECT_PAYMENT_REF},payment_reference.eq.${DIRECT_PAYMENT_REF}`)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingRequestError) throw existingRequestError;

  let request = existingRequest;
  const requestReused = Boolean(existingRequest);
  if (!request) {
    const { data: insertedRequest, error: requestError } = await admin
      .from("lms_enrollment_requests")
      .insert({
        user_id: user.id,
        course_id: course.id,
        course_title: courseTitle,
        course_ids: [course.id],
        amount_inr: amount,
        upi_id: "direct-payment",
        utr_number: DIRECT_PAYMENT_REF,
        payment_reference: DIRECT_PAYMENT_REF,
        selected_all: false,
        status: "approved",
        reviewed_at: new Date().toISOString(),
        admin_note: `${variant.name} granted by bulk admin script.`,
      })
    .select("id")
    .single();
    if (requestError) throw requestError;
    request = insertedRequest;
  }

  const { error: enrollError } = await admin.from("lms_enrollments").upsert(
    {
      user_id: user.id,
      course_id: course.id,
      status: "active",
      amount_paid_inr: amount,
      enrolled_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
  if (enrollError) throw enrollError;

  const emailResult =
    email === TEST_EMAIL && requestReused && !process.argv.includes("--force-email")
      ? { skipped: true, reason: "test email already processed" }
      : await sendAccessEmail({
          email,
          password,
          course,
          variant,
          requestId: request.id,
        });

  return {
    email,
    password,
    userId: user.id,
    created,
    course: course.title,
    plan: variant.name,
    amount,
    requestId: request.id,
    requestReused,
    emailSent: Boolean(emailResult?.id),
    emailSkipped: emailResult?.skipped ? emailResult.reason : null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const runTest = args.includes("--test");
  const runAll = args.includes("--all");
  const confirmed = args.includes("--confirm");

  if ((!runTest && !runAll) || (runTest && runAll) || (runAll && !confirmed)) {
    usage();
    process.exit(runAll && !confirmed ? 1 : 0);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const emails = (runTest ? [TEST_EMAIL] : BULK_EMAILS).map(normalizeEmail);
  const results = [];

  for (const email of emails) {
    try {
      results.push(await grantAccess(admin, email));
      console.log(`OK ${email}`);
    } catch (error) {
      results.push({ email, error: error?.message || String(error) });
      console.error(`ERROR ${email}: ${error?.message || error}`);
      if (runTest) process.exitCode = 1;
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
