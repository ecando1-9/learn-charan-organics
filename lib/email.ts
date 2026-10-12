import { Resend } from "resend";

export interface CourseUnlockedItem {
  id: string;
  title: string;
  price?: number;
  slug?: string;
  thumbnail_url?: string | null;
  duration?: string;
}

export interface EnrollmentApprovalEmailParams {
  studentEmail: string;
  studentName: string;
  courses: CourseUnlockedItem[];
  totalAmount: number;
  utrNumber?: string | null;
  requestId?: string;
  appUrl?: string;
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
      ? `COA-${requestId.slice(0, 8).toUpperCase()}`
      : `COA-${Date.now().toString(36).toUpperCase()}`;

    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #dbe7df; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <!-- Thumbnail -->
                  <td width="72" style="vertical-align: top; padding-right: 16px;">
                    <img src="${escapeHtml(thumbnailSrc)}" alt="${escapeHtml(c.title)}" width="72" height="72" style="width: 72px; height: 72px; object-fit: cover; border-radius: 14px; display: block; border: 1px solid #e2ebd8;" />
                  </td>

                  <!-- Details -->
                  <td style="vertical-align: top;">
                    <div style="margin-bottom: 4px;">
                      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 20px;">
                        Course #${index + 1} &bull; Active License
                      </span>
                    </div>
                    <h3 style="margin: 0 0 6px 0; color: #12382a; font-size: 16px; font-weight: 800; line-height: 1.3;">
                      ${escapeHtml(c.title)}
                    </h3>
                    <div style="font-size: 12px; color: #4b5563; line-height: 1.6; margin-bottom: 14px;">
                      &bull; 🎬 <strong>Video Masterclass:</strong> Complete laboratory formulation procedures<br>
                      &bull; 📄 <strong>Formulation Notes:</strong> Printable PDF batch recipe sheets<br>
                      &bull; 🎓 <strong>Accredited Certificate:</strong> Verifiable certificate of completion
                    </div>

                    <!-- Direct Launch CTA Buttons -->
                    <table cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="border-radius: 50px; background-color: #166534;">
                          <a href="${directCourseUrl}" target="_blank" rel="noopener noreferrer" style="padding: 11px 22px; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #ffffff; font-weight: 800; text-decoration: none; display: inline-block; letter-spacing: 0.3px;">
                            &#9654; Start Course & Video Lessons &rarr;
                          </a>
                        </td>
                        <td style="padding-left: 12px;">
                          <a href="${overviewCourseUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #166534; font-weight: 700; text-decoration: underline;">
                            Curriculum & Materials
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Price / Value -->
                  <td width="85" style="vertical-align: top; text-align: right; padding-left: 10px;">
                    <span style="font-size: 15px; font-weight: 900; color: #166534;">
                      ${c.price ? `&#8377;${c.price.toLocaleString("en-IN")}` : "Unlocked"}
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
  <title>Official Enrollment & Course Access - Charan Organics Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f9f6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="640" style="max-width: 640px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e6ece4;">
          
          <!-- Corporate Header Banner -->
          <tr>
            <td style="background-color: #12382a; padding: 36px 32px; text-align: center;">
              <img src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png" alt="Charan Organics Logo" width="70" height="70" style="display: block; margin: 0 auto 14px auto; border-radius: 14px; border: 2px solid rgba(255,255,255,0.2);" />
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Charan Organics Academy</h1>
              <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">Official Enrollment Confirmation & Course License</p>
            </td>
          </tr>

          <!-- Document Sub-Header Bar -->
          <tr>
            <td style="background-color: #0b2b1a; padding: 10px 32px; color: #d1fae5; font-size: 11px; font-weight: 600;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #9cd6ba;">License Reference: <span style="color: #ffffff; font-family: monospace; font-weight: 700;">${invoiceRef}</span></td>
                  <td style="text-align: right; color: #9cd6ba;">Issued: <span style="color: #ffffff; font-weight: 700;">${issueDate}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 20px 32px;">
              
              <!-- Verification Success Pill -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center;">
                <span style="font-size: 22px; margin-right: 12px;">🎉</span>
                <div>
                  <div style="color: #065f46; font-weight: 800; font-size: 14px;">Payment Verified & Course Access Active</div>
                  <div style="color: #047857; font-size: 12px; margin-top: 2px;">Your enrollment has been approved by the academy admissions desk.</div>
                </div>
              </div>

              <!-- Greeting -->
              <h2 style="color: #12382a; margin: 0 0 10px 0; font-size: 20px; font-weight: 800;">
                Dear ${escapeHtml(studentName || "Learner")},
              </h2>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                We are pleased to welcome you to <strong>Charan Organics Academy</strong>. Your course enrollment request has been officially verified and accepted. Your student profile now has full access to the video lessons, downloadable formulation manuals, and course completion certificate.
              </p>

              <!-- Corporate Enrollment Receipt / Invoice Box -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7faf5; border: 1px solid #dbe7df; border-radius: 16px; margin-bottom: 26px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e6ece4; background-color: #eef5eb;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #065f46;">
                            Official Enrollment Receipt
                          </span>
                        </td>
                        <td style="text-align: right;">
                          <span style="font-size: 11px; font-family: monospace; color: #4b5563; font-weight: 700;">
                            ${invoiceRef}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 10px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; margin-bottom: 3px;">
                            Enrolled Student
                          </div>
                          <div style="font-size: 14px; font-weight: 800; color: #12382a;">
                            ${escapeHtml(studentName || "Student")}
                          </div>
                          <div style="font-size: 12px; color: #4b5563;">
                            ${escapeHtml(studentEmail)}
                          </div>
                        </td>
                        <td width="50%" style="vertical-align: top; padding-left: 10px;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 700; margin-bottom: 3px;">
                            Payment Status
                          </div>
                          <div style="font-size: 14px; font-weight: 800; color: #065f46;">
                            &#10003; Verified & Approved (UPI)
                          </div>
                          <div style="font-size: 12px; color: #4b5563;">
                            ${utrNumber ? `UTR: <span style="font-family: monospace; font-weight: 700;">${escapeHtml(utrNumber)}</span>` : "Verified Bank Transfer"}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbdad0;">
                      <tr>
                        <td style="font-size: 13px; font-weight: 700; color: #4b5563;">
                          Total Verified Payment
                        </td>
                        <td style="text-align: right; font-size: 18px; font-weight: 900; color: #12382a;">
                          &#8377;${totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Unlocked Courses with Direct Launch Links -->
              <div style="margin-bottom: 26px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h3 style="margin: 0; color: #12382a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800;">
                    Your Unlocked Courses (${courses.length})
                  </h3>
                  <span style="font-size: 11px; color: #166534; font-weight: 700;">
                    Instant 1-Click Access
                  </span>
                </div>

                ${coursesListHtml}
              </div>

              <!-- Primary Dashboard CTA -->
              <div style="text-align: center; margin: 30px 0 28px 0;">
                <a href="${coursesDashboardLink}" style="background-color: #166534; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 15px 36px; border-radius: 50px; display: inline-block; box-shadow: 0 4px 14px rgba(22, 101, 52, 0.35); letter-spacing: 0.2px;">
                  Open Student Learning Dashboard &rarr;
                </a>
                <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0 0;">Access all your courses, formulation materials, and certificates in one place.</p>
              </div>

              <!-- Learning Guide / How It Works -->
              <div style="background-color: #ffffff; border: 1px solid #e5ebd9; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #12382a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                  📘 Learning Guide & Certification Flow
                </h4>
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="28" style="vertical-align: top; font-size: 15px; padding-bottom: 10px;">1️⃣</td>
                    <td style="padding-bottom: 10px; font-size: 13px; color: #374151; line-height: 1.5;">
                      <strong>Direct Video Modules:</strong> Click the "Start Course" button on any course above to stream high-definition laboratory formulation lessons.
                    </td>
                  </tr>
                  <tr>
                    <td width="28" style="vertical-align: top; font-size: 15px; padding-bottom: 10px;">2️⃣</td>
                    <td style="padding-bottom: 10px; font-size: 13px; color: #374151; line-height: 1.5;">
                      <strong>Download PDF Formulation Notes:</strong> Access printable formula cards, INCI percentages, and troubleshooting sheets inside your lessons.
                    </td>
                  </tr>
                  <tr>
                    <td width="28" style="vertical-align: top; font-size: 15px; padding-bottom: 10px;">3️⃣</td>
                    <td style="padding-bottom: 10px; font-size: 13px; color: #374151; line-height: 1.5;">
                      <strong>Accredited Certificate:</strong> Complete your video masterclass to unlock your verifiable Certificate of Completion under <a href="${certificatesDashboardLink}" style="color: #166534; font-weight: 700;">Certificates</a>.
                    </td>
                  </tr>
                  <tr>
                    <td width="28" style="vertical-align: top; font-size: 15px;">4️⃣</td>
                    <td style="font-size: 13px; color: #374151; line-height: 1.5;">
                      <strong>Batch Community Chat:</strong> Connect with fellow organic formulators and mentors in the <a href="${communityLink}" style="color: #166534; font-weight: 700;">Student Community</a>.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Student Helpline & Support Desk -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7faf5; border-radius: 14px; border: 1px solid #e2ebd8; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #4b5563; line-height: 1.6; text-align: center;">
                    <strong style="color: #12382a;">Academy Student Helpline & Support:</strong><br>
                    WhatsApp Support: <a href="https://wa.me/918247838125" style="color: #166534; font-weight: 700; text-decoration: none;">+91 8247838125</a> &nbsp;|&nbsp;
                    Phone: <a href="tel:8247838125" style="color: #166534; font-weight: 700; text-decoration: none;">8247838125</a> &nbsp;|&nbsp;
                    Email: <a href="mailto:orders@charanorganics.com" style="color: #166534; font-weight: 700; text-decoration: none;">orders@charanorganics.com</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Corporate Legal Footer -->
          <tr>
            <td style="background-color: #f1f5ee; padding: 26px 32px; border-top: 1px solid #e2ebd8; text-align: center;">
              <p style="color: #12382a; font-size: 12px; font-weight: 800; margin: 0 0 4px 0;">
                Charan Organics Academy
              </p>
              <p style="color: #6b7280; font-size: 11px; line-height: 1.5; margin: 0 0 10px 0;">
                India's Premier Academy for Organic Cosmetic Chemistry, Ayurvedic Extraction, and Soapmaking<br>
                Registered Trademark under The Trademarks Act, 1999
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
      subject: `🎉 Course Access Granted: ${courses.length === 1 ? courses[0].title : `${courses.length} Masterclasses`} | Charan Organics Academy`,
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
