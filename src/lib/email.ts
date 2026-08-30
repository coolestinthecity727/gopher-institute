import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = process.env.EMAIL_FROM || "Gopher Institute Foundation <no-reply@gopherinstitute.ac.zw>";

/**
 * Sends a transactional email via Resend. If RESEND_API_KEY isn't set (e.g. local dev),
 * this logs to the console instead of failing, so the rest of the app keeps working
 * without an email provider configured.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`[email:not-configured] Would send "${subject}" to ${to}. Set RESEND_API_KEY to enable sending.`);
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    return result;
  } catch (err) {
    // Email failures should never break the underlying request (application submission,
    // status change, etc.) — log and move on.
    console.error("Failed to send email:", err);
    return { error: true };
  }
}

const wrapper = (title: string, bodyHtml: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fa;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eef2f7;">
      <div style="background:#0c1e3a;padding:24px 28px;">
        <span style="display:inline-block;background:#e8720c;color:#fff;font-weight:800;font-size:12px;padding:6px 12px;border-radius:4px;letter-spacing:0.05em;">GIF</span>
        <span style="color:#fff;font-weight:700;font-size:16px;margin-left:10px;">Gopher Institute Foundation</span>
      </div>
      <div style="padding:28px;color:#142433;font-size:14px;line-height:1.6;">
        <h2 style="margin:0 0 12px;font-size:18px;color:#0c1e3a;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;background:#f6f7fa;color:#7b8797;font-size:11px;">
        Gopher Institute Foundation · In partnership with the Ministry of Vocational Training and Youth Empowerment, Zimbabwe
      </div>
    </div>
  </div>
`;

export function applicationReceivedEmail(params: { fullName: string; applicationNo: string; courseName: string }) {
  return wrapper(
    "Application Received",
    `<p>Dear ${params.fullName},</p>
     <p>Thank you for applying to <strong>${params.courseName}</strong> at Gopher Institute Foundation.
     Your application reference number is:</p>
     <p style="font-size:20px;font-weight:800;color:#e8720c;letter-spacing:0.02em;">${params.applicationNo}</p>
     <p>Keep this number safe — you can use it with the Check Registration portal on our website to track
     your application status. Our admissions team will be in touch with next steps.</p>`
  );
}

const STATUS_MESSAGE: Record<string, string> = {
  UNDER_REVIEW: "Your application is now under review by our admissions team.",
  ACCEPTED: "Congratulations — your application has been accepted! Our registrar will contact you about enrollment.",
  REJECTED: "After careful review, we are unable to offer you a place at this time.",
  ENROLLED: "You have been enrolled. Welcome to Gopher Institute Foundation! Use your student number to create your student portal account.",
};

export function applicationStatusEmail(params: { fullName: string; applicationNo: string; status: string }) {
  const message = STATUS_MESSAGE[params.status] || `Your application status has been updated to ${params.status}.`;
  return wrapper(
    "Application Status Update",
    `<p>Dear ${params.fullName},</p>
     <p>${message}</p>
     <p>Reference number: <strong>${params.applicationNo}</strong></p>`
  );
}

export function certificateIssuedEmail(params: { fullName: string; certificateNo: string; courseName: string; verificationCode: string }) {
  return wrapper(
    "Certificate Issued",
    `<p>Dear ${params.fullName},</p>
     <p>Your certificate for <strong>${params.courseName}</strong> has been issued.</p>
     <p>Certificate No: <strong>${params.certificateNo}</strong><br/>
     Verification Code: <strong>${params.verificationCode}</strong></p>
     <p>Anyone can confirm this certificate is genuine using the Verify Certificate portal on our website.</p>`
  );
}

export function passwordResetEmail(params: { fullName: string; resetUrl: string }) {
  return wrapper(
    "Reset Your Password",
    `<p>Dear ${params.fullName},</p>
     <p>We received a request to reset your Gopher Institute Foundation account password. Click the
     button below to choose a new one. This link expires in 1 hour.</p>
     <p style="margin:20px 0;">
       <a href="${params.resetUrl}" style="background:#e8720c;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:6px;display:inline-block;">Reset Password</a>
     </p>
     <p>If you didn't request this, you can safely ignore this email — your password will not change.</p>`
  );
}
