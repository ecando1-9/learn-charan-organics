import { Resend } from "resend";
import { PAYMENT_CONFIG } from "@/lib/payment-config";

export interface CourseUnlockedItem {
  id: string;
  title: string;
  price?: number;
  slug?: string;
  thumbnail_url?: string | null;
  duration?: string;
  planName?: string;
}

export interface EnrollmentApprovalEmailParams {
  studentEmail: string;
  studentName: string;
  courses: CourseUnlockedItem[];
  totalAmount: number;
  utrNumber?: string | null;
  requestId?: string;
  appUrl?: string;
  requestedCourseTitles?: string | null;
}

/**
 * Formats the sender address in industry-standard format:
 * "Charan Organics Academy <learn@charanorganics.com>"
 * Supports EMAIL_FROM, RESEND_FROM_EMAIL, and EMAIL_FORM (common typo).
 */
export function getEmailFromAddress(): string {
  const configured =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FORM ||
    "learn@charanorganics.com";

  const trimmed = configured.trim();

  // If already includes a display name, e.g. "Name <email@domain.com>"
  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }

  // If plain email, wrap with the official Academy display name
  return `Charan Organics Academy <${trimmed}>`;
}

export async function sendEnrollmentApprovalEmail({
  studentEmail,
  studentName,
  courses,
  totalAmount,
  utrNumber,
  requestId,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://learn.charanorganics.com"),
  requestedCourseTitles,
}: EnrollmentApprovalEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not configured in environment variables. Email notification skipped.");
    return {
      success: false,
      error: "RESEND_API_KEY not configured. Please add RESEND_API_KEY to your .env.local file.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const fromSender = getEmailFromAddress();

    const invoiceRef = requestId
      ? `COA-ENR-${requestId.slice(0, 8).toUpperCase()}`
      : `COA-ENR-${Date.now().toString(36).toUpperCase()}`;

    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const studentConsoleLink = `${appUrl}/dashboard`;
    const coursesDashboardLink = `${appUrl}/dashboard/courses`;
    const certificatesDashboardLink = `${appUrl}/dashboard/certificates`;
    const communityLink = `${appUrl}/community`;

    // Corporate Course Cards HTML with Direct Action Buttons
    const coursesListHtml = courses
      .map((c, index) => {
        const directCourseUrl = `${appUrl}/learn/${c.slug || c.id}/main-video`;
        const overviewCourseUrl = `${appUrl}/courses/${c.slug || c.id}`;
        const thumbnailSrc =
          c.thumbnail_url ||
          "https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png";

        return `
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #dbe7df; border-radius: 18px; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <tr>
            <td style="padding: 22px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Thumbnail -->
                  <td width="76" style="vertical-align: top; padding-right: 18px;">
                    <img src="${escapeHtml(thumbnailSrc)}" alt="${escapeHtml(c.title)}" width="76" height="76" style="width: 76px; height: 76px; object-fit: cover; border-radius: 16px; display: block; border: 1px solid #dce8dd;" />
                  </td>

                  <!-- Details -->
                  <td style="vertical-align: top;">
                    <div style="margin-bottom: 5px;">
                      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; padding: 3px 9px; border-radius: 20px; border: 1px solid #a7f3d0;">
                        Course #${index + 1} &bull; Verified Active License
                      </span>
                    </div>
                    <h3 style="margin: 0 0 6px 0; color: #0b291b; font-size: 17px; font-weight: 800; line-height: 1.3;">
                      ${escapeHtml(c.title)}
                    </h3>
                    <div style="font-size: 12px; color: #4b5563; line-height: 1.6; margin-bottom: 14px;">
                      &bull; 🎬 <strong>Video Masterclass:</strong> Ultra-HD laboratory formulation procedures<br>
                      &bull; 📄 <strong>Formulation Manual:</strong> Printable PDF batch recipe sheets &amp; safety checklists<br>
                      &bull; 🎓 <strong>Accredited Certificate:</strong> Verifiable digital certificate of completion
                    </div>

                    <!-- Direct Launch CTA Buttons -->
                    <table cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="border-radius: 50px; background-color: #166534;">
                          <a href="${directCourseUrl}" target="_blank" rel="noopener noreferrer" style="padding: 12px 24px; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #ffffff; font-weight: 800; text-decoration: none; display: inline-block; letter-spacing: 0.3px;">
                            &#9654; Launch Course Player &rarr;
                          </a>
                        </td>
                        <td style="padding-left: 14px;">
                          <a href="${overviewCourseUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #166534; font-weight: 700; text-decoration: underline;">
                            View Curriculum &amp; Notes &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Price / Value -->
                  <td width="90" style="vertical-align: top; text-align: right; padding-left: 10px;">
                    <span style="font-size: 15px; font-weight: 900; color: #166534;">
                      ${c.price ? `&#8377;${c.price.toLocaleString("en-IN")}` : "Full Access"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
      })
      .join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Admission & Course License - Charan Organics Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f8f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="640" style="max-width: 640px; background-color: #ffffff; border-radius: 26px; overflow: hidden; box-shadow: 0 6px 24px rgba(0,0,0,0.07); border: 1px solid #e2ebe0;">
          
          <!-- Corporate Header Banner -->
          <tr>
            <td style="background-color: #0b291b; padding: 38px 32px 32px 32px; text-align: center; border-bottom: 3px solid #10b981;">
              <img src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png" alt="Charan Organics Logo" width="76" height="76" style="display: block; margin: 0 auto 14px auto; border-radius: 16px; border: 2px solid rgba(255,255,255,0.25); background-color: #ffffff;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 25px; font-weight: 900; letter-spacing: -0.5px;">Charan Organics Academy</h1>
              <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.4px;">Official Admission Confirmation &amp; Course License</p>
            </td>
          </tr>

          <!-- Document Sub-Header Bar -->
          <tr>
            <td style="background-color: #071f14; padding: 11px 32px; color: #d1fae5; font-size: 11px; font-weight: 600;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #9cd6ba;">Admission Ref: <span style="color: #ffffff; font-family: monospace; font-weight: 700;">${invoiceRef}</span></td>
                  <td style="text-align: right; color: #9cd6ba;">Issued: <span style="color: #ffffff; font-weight: 700;">${issueDate}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 34px 32px 22px 32px;">
              
              <!-- Verification Success Banner -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 16px 20px; margin-bottom: 26px;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="36" style="vertical-align: top; font-size: 26px;">
                      ✅
                    </td>
                    <td style="vertical-align: top; padding-left: 10px;">
                      <div style="color: #065f46; font-weight: 900; font-size: 15px;">Payment Verified &amp; Course Access Unlocked</div>
                      <div style="color: #047857; font-size: 12px; margin-top: 3px; line-height: 1.5;">
                        Your payment has been successfully approved by the admissions desk. Full video masterclasses, downloadable formulation notes, and certificates are now active on your student profile.
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Student Greeting -->
              <h2 style="color: #0b291b; margin: 0 0 10px 0; font-size: 21px; font-weight: 800;">
                Dear ${escapeHtml(studentName || "Learner")},
              </h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.65; margin: 0 0 24px 0;">
                Welcome to <strong>Charan Organics Academy</strong>! We are thrilled to confirm that your enrollment has been officially accepted. You now hold certified student privileges with unrestricted access to your masterclasses, downloadable formula recipe sheets, and private peer community.
              </p>

              <!-- Corporate Enrollment Receipt / Invoice Box -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8faf7; border: 1px solid #dbe7df; border-radius: 18px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 22px; border-bottom: 1px solid #e4ece3; background-color: #eef6ed;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #065f46;">
                            Official Admission &amp; Payment Receipt
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <span style="font-size: 11px; font-family: monospace; color: #374151; font-weight: 800;">
                            ${invoiceRef}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 22px;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 12px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; margin-bottom: 3px;">
                            Enrolled Student
                          </div>
                          <div style="font-size: 15px; font-weight: 800; color: #0b291b;">
                            ${escapeHtml(studentName || "Student")}
                          </div>
                          <div style="font-size: 12px; color: #4b5563; margin-top: 1px;">
                            Username: <strong>${escapeHtml(studentEmail)}</strong>
                          </div>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-left: 12px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; margin-bottom: 3px;">
                            Payment Status
                          </div>
                          <div style="font-size: 14px; font-weight: 800; color: #065f46;">
                            &#10003; Verified &amp; Approved (UPI)
                          </div>
                          <div style="font-size: 12px; color: #4b5563; margin-top: 1px;">
                            ${utrNumber ? `UTR Ref: <strong style="font-family: monospace;">${escapeHtml(utrNumber)}</strong>` : "Verified Bank Transfer"}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #cbdad0;">
                      <tr>
                        <td style="font-size: 13px; font-weight: 700; color: #4b5563;">
                          Total Verified Tuition / Enrollment Fee
                        </td>
                        <td style="text-align: right; font-size: 19px; font-weight: 900; color: #0b291b;">
                          &#8377;${totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Student Console Quick Navigation Bar -->
              <div style="background-color: #ffffff; border: 1px solid #dce8dd; border-radius: 18px; padding: 20px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                <div style="text-align: center; margin-bottom: 16px;">
                  <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #166534;">
                    Student Learning Console
                  </span>
                  <h3 style="margin: 4px 0 0 0; color: #0b291b; font-size: 16px; font-weight: 800;">
                    Manage Your Courses, Notes &amp; Certificates
                  </h3>
                </div>

                <div style="text-align: center; margin-bottom: 18px;">
                  <a href="${studentConsoleLink}" style="background-color: #166534; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 13px 32px; border-radius: 50px; display: inline-block; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.30); letter-spacing: 0.2px;">
                    Open Student Console &rarr;
                  </a>
                </div>

                <!-- 4 Quick Portal Shortcuts -->
                <table width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #edf3ec; padding-top: 14px;">
                  <tr>
                    <td align="center" width="25%" style="padding: 6px;">
                      <a href="${coursesDashboardLink}" style="text-decoration: none; display: block;">
                        <span style="font-size: 18px;">🎓</span>
                        <div style="font-size: 11px; font-weight: 800; color: #0b291b; margin-top: 3px;">My Courses</div>
                      </a>
                    </td>
                    <td align="center" width="25%" style="padding: 6px;">
                      <a href="${coursesDashboardLink}" style="text-decoration: none; display: block;">
                        <span style="font-size: 18px;">📄</span>
                        <div style="font-size: 11px; font-weight: 800; color: #0b291b; margin-top: 3px;">Recipe Notes</div>
                      </a>
                    </td>
                    <td align="center" width="25%" style="padding: 6px;">
                      <a href="${certificatesDashboardLink}" style="text-decoration: none; display: block;">
                        <span style="font-size: 18px;">🏆</span>
                        <div style="font-size: 11px; font-weight: 800; color: #0b291b; margin-top: 3px;">Certificates</div>
                      </a>
                    </td>
                    <td align="center" width="25%" style="padding: 6px;">
                      <a href="${communityLink}" style="text-decoration: none; display: block;">
                        <span style="font-size: 18px;">💬</span>
                        <div style="font-size: 11px; font-weight: 800; color: #0b291b; margin-top: 3px;">Batch Chat</div>
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Unlocked Courses with Direct Launch Links -->
              <div style="margin-bottom: 28px;">
                <div style="margin-bottom: 12px;">
                  <h3 style="margin: 0; color: #0b291b; font-size: 15px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800;">
                    Your Unlocked Masterclasses (${courses.length})
                  </h3>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Click below to launch your video modules and download formula sheets.</p>
                </div>

                ${coursesListHtml}
              </div>

              <!-- 3-Step Corporate Onboarding Guide -->
              <div style="background-color: #ffffff; border: 1px solid #e2ebd8; border-radius: 18px; padding: 22px; margin-bottom: 26px;">
                <h4 style="margin: 0 0 14px 0; color: #0b291b; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">
                  📘 3 Steps to Begin Your Formulation Training
                </h4>
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="30" style="vertical-align: top; font-size: 16px; padding-bottom: 12px;">1️⃣</td>
                    <td style="padding-bottom: 12px; font-size: 13px; color: #374151; line-height: 1.55;">
                      <strong>Sign In to Your Account:</strong> Visit <a href="${appUrl}/login" style="color: #166534; font-weight: 700;">learn.charanorganics.com</a> using your email (<strong>${escapeHtml(studentEmail)}</strong>).
                    </td>
                  </tr>
                  <tr>
                    <td width="30" style="vertical-align: top; font-size: 16px; padding-bottom: 12px;">2️⃣</td>
                    <td style="padding-bottom: 12px; font-size: 13px; color: #374151; line-height: 1.55;">
                      <strong>Watch Lesson Videos &amp; Download PDFs:</strong> Stream HD laboratory demonstrations at your own pace from your phone, tablet, or laptop. Download printable formulation recipe percentages.
                    </td>
                  </tr>
                  <tr>
                    <td width="30" style="vertical-align: top; font-size: 16px;">3️⃣</td>
                    <td style="font-size: 13px; color: #374151; line-height: 1.55;">
                      <strong>Earn Your Certificate &amp; Ask Questions:</strong> Complete lessons to earn your verifiable Certificate of Completion under <a href="${certificatesDashboardLink}" style="color: #166534; font-weight: 700;">Certificates</a> and ask formulation questions in the <a href="${communityLink}" style="color: #166534; font-weight: 700;">Community</a>.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Student Helpline & Support Desk -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7faf5; border-radius: 16px; border: 1px solid #dce8dd; padding: 18px; margin-bottom: 22px;">
                <tr>
                  <td style="font-size: 12px; color: #4b5563; line-height: 1.7; text-align: center;">
                    <strong style="color: #0b291b; font-size: 13px;">Academy Student Support &amp; Faculty Desk</strong><br>
                    WhatsApp Helpline: <a href="https://wa.me/${PAYMENT_CONFIG.supportWhatsapp}" style="color: #166534; font-weight: 800; text-decoration: none;">+91 ${PAYMENT_CONFIG.supportPhone}</a> &nbsp;|&nbsp;
                    Phone: <a href="tel:${PAYMENT_CONFIG.supportPhone}" style="color: #166534; font-weight: 800; text-decoration: none;">+91 ${PAYMENT_CONFIG.supportPhone}</a> &nbsp;|&nbsp;
                    Alternate: <a href="tel:${PAYMENT_CONFIG.upiPhoneNumber}" style="color: #166534; font-weight: 800; text-decoration: none;">+91 ${PAYMENT_CONFIG.upiPhoneNumber}</a><br>
                    Official Email: <a href="mailto:orders@charanorganics.com" style="color: #166534; font-weight: 700; text-decoration: none;">orders@charanorganics.com</a> &nbsp;|&nbsp;
                    Operating Hours: Mon &ndash; Sat, 9:00 AM &ndash; 7:00 PM IST
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Corporate Legal Footer -->
          <tr>
            <td style="background-color: #edf3ec; padding: 28px 32px; border-top: 1px solid #dce8dd; text-align: center;">
              <p style="color: #0b291b; font-size: 13px; font-weight: 800; margin: 0 0 4px 0;">
                Charan Organics Academy
              </p>
              <p style="color: #6b7280; font-size: 11px; line-height: 1.5; margin: 0 0 10px 0;">
                India's Premier Academy for Organic Cosmetic Chemistry, Botanical Extractions, and Soapmaking<br>
                Registered Trademark under The Trademarks Act, 1999 &bull; Commercial License &amp; Formulation Training
              </p>
              <p style="color: #9ca3af; font-size: 10px; margin: 0;">
                This official transmission and course license receipt is issued to ${escapeHtml(studentEmail)}.<br>
                &copy; ${new Date().getFullYear()} Charan Organics Academy. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const data = await resend.emails.send({
      from: fromSender,
      to: [studentEmail],
      subject: `🎓 Enrollment Confirmed: Your Course Access is Active | Charan Organics Academy`,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend] Error sending approval email:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendTestEmail(toEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured in environment." };
  }
  try {
    const resend = new Resend(apiKey);
    const fromSender = getEmailFromAddress();
    const data = await resend.emails.send({
      from: fromSender,
      to: [toEmail],
      subject: "🧪 Test Delivery: Charan Organics Academy Resend Verification",
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 25px; color: #12382a; background-color: #f7f9f6; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #e2ebd8;">
          <h2 style="margin-top: 0; color: #12382a;">Charan Organics Academy</h2>
          <p style="font-size: 15px; color: #2d3748;">
            Hello! This confirms that your Resend email setup is <b>100% active and working</b> from both <b>localhost</b> and production.
          </p>
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin: 15px 0;">
            <p style="margin: 0; font-size: 13px; color: #065f46; font-weight: bold;">
              Sender: ${escapeHtml(fromSender)}
            </p>
          </div>
          <p style="font-size: 13px; color: #718096; margin-bottom: 0;">
            Sent successfully at ${new Date().toLocaleString("en-IN")}.
          </p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (err: any) {
    console.error("[sendTestEmail] Error:", err);
    return { success: false, error: err?.message || "Failed to send test email" };
  }
}
