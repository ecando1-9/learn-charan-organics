import { Resend } from "resend";

export interface CourseUnlockedItem {
  id: string;
  title: string;
  price?: number;
  slug?: string;
  duration?: string;
}

export interface EnrollmentApprovalEmailParams {
  studentEmail: string;
  studentName: string;
  courses: CourseUnlockedItem[];
  totalAmount: number;
  utrNumber?: string | null;
  appUrl?: string;
}

export async function sendEnrollmentApprovalEmail({
  studentEmail,
  studentName,
  courses,
  totalAmount,
  utrNumber,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learn.charanorganics.com",
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
    const fromSender = process.env.RESEND_FROM_EMAIL || "Charan Organics Academy <orders@charanorganics.com>";
    const coursesListHtml = courses
      .map(
        (c) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; font-weight: bold; color: #12382a; font-size: 15px;">
            🌿 ${escapeHtml(c.title)}
            <div style="font-size: 12px; font-weight: normal; color: #4b5563; margin-top: 2px;">
              Full Course Access &middot; Formulation Notes &middot; Certificate Included
            </div>
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #166534; font-size: 14px;">
            ${c.price ? `&#8377;${c.price.toLocaleString("en-IN")}` : "Included"}
          </td>
        </tr>
      `
      )
      .join("");

    const coursesLink = `${appUrl}/dashboard/courses`;
    const communityLink = `${appUrl}/community`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course Access Approved - Charan Organics Academy</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f9f6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e6ece4;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #12382a; padding: 35px 30px; text-align: center;">
              <img src="https://res.cloudinary.com/dur6fkyoz/image/upload/v1773331762/charan-emblem-tight_c2mcw3.png" alt="Charan Organics Logo" width="70" height="70" style="display: block; margin: 0 auto 12px auto; border-radius: 14px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Charan Organics Academy</h1>
              <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Official Enrollment Confirmation</p>
            </td>
          </tr>

          <!-- Welcome & Status -->
          <tr>
            <td style="padding: 35px 35px 20px 35px;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">🎉</span>
                <span style="color: #065f46; font-weight: 700; font-size: 14px;">Your payment has been verified! Full course access is now unlocked.</span>
              </div>

              <h2 style="color: #12382a; margin: 0 0 10px 0; font-size: 20px; font-weight: 800;">Hello ${escapeHtml(studentName || "Student")},</h2>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome to Charan Organics Academy! Your enrollment request has been officially approved by our academy team. You now have immediate access to your courses, formulation video lessons, downloadable PDF notes, and student community batch.
              </p>

              <!-- Course Access Details Box -->
              <div style="background-color: #fbfdfa; border: 1px solid #e2ebd8; border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 12px 0; color: #12382a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Unlocked Courses (${courses.length})</h3>
                <table width="100%" cellspacing="0" cellpadding="0">
                  ${coursesListHtml}
                </table>

                <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15px; padding-top: 12px; border-top: 2px dashed #d1e0d7;">
                  <tr>
                    <td style="color: #4b5563; font-size: 14px; font-weight: 600;">Total Amount Verified</td>
                    <td style="text-align: right; color: #12382a; font-size: 17px; font-weight: 900;">&#8377;${totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                  ${
                    utrNumber
                      ? `
                  <tr>
                    <td style="color: #6b7280; font-size: 12px; padding-top: 4px;">UTR / Reference ID</td>
                    <td style="text-align: right; color: #374151; font-size: 12px; font-family: monospace; padding-top: 4px;">${escapeHtml(utrNumber)}</td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </div>

              <!-- Big Primary CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${coursesLink}" style="background-color: #166534; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 16px 36px; border-radius: 50px; display: inline-block; box-shadow: 0 4px 12px rgba(22, 101, 52, 0.35);">
                  Start Learning Now &rarr;
                </a>
                <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">Click above to open your courses on your learning dashboard.</p>
              </div>

              <!-- Key Features Grid -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 10px;">
                    <div style="font-weight: 700; color: #12382a; font-size: 14px; margin-bottom: 4px;">💬 Community Access</div>
                    <div style="color: #4b5563; font-size: 12px; line-height: 1.5;">Join your official batch chat group to connect with mentors and fellow organic formulators.</div>
                    <a href="${communityLink}" style="color: #166534; font-size: 12px; font-weight: 700; text-decoration: none; display: inline-block; margin-top: 4px;">Join Community &rarr;</a>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 10px;">
                    <div style="font-weight: 700; color: #12382a; font-size: 14px; margin-bottom: 4px;">🎓 Official Certificate</div>
                    <div style="color: #4b5563; font-size: 12px; line-height: 1.5;">Complete 70% or more of your course lessons to unlock your verified Certificate of Completion.</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5ee; padding: 25px 30px; border-top: 1px solid #e5ebd9; text-align: center;">
              <p style="color: #4b5563; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
                Have questions or need assistance? Reply directly to this email at <a href="mailto:orders@charanorganics.com" style="color: #166534; font-weight: 700;">orders@charanorganics.com</a>.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
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
      subject: `🎉 Access Unlocked: Welcome to ${courses.length === 1 ? courses[0].title : `${courses.length} Courses`} | Charan Organics Academy`,
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
