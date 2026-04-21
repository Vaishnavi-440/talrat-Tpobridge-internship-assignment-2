import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail({
  toEmail,
  toName,
  fromName,
  fromEmail,
  message,
  profileSlug,
}: {
  toEmail: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  message: string;
  profileSlug: string;
}) {
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const fromLabel = process.env.RESEND_FROM_NAME ?? "Talrat";

  const { data, error } = await resend.emails.send({
    from: `${fromLabel} <${fromAddress}>`,
    to: toEmail,
    replyTo: fromEmail,
    subject: `New message from ${fromName} via your Talrat profile`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="background:#020617;padding:24px;border-radius:10px;margin-bottom:24px;text-align:center;">
          <span style="font-size:24px;font-weight:800;color:#f59e0b;">talrat</span>
          <p style="color:#64748b;font-size:13px;margin:4px 0 0;">New profile enquiry</p>
        </div>

        <div style="background:white;padding:24px;border-radius:10px;border:1px solid #e2e8f0;">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 16px;">
            Hi ${toName}, someone reached out!
          </h2>

          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">From</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${fromName}</p>
            <p style="margin:4px 0 0;color:#64748b;font-size:14px;">${fromEmail}</p>
          </div>

          <div style="margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
            <p style="margin:0;color:#1e293b;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>

          <a href="mailto:${fromEmail}?subject=Re: Your enquiry via Talrat"
            style="display:inline-block;background:#f59e0b;color:#0f172a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Reply to ${fromName}
          </a>
        </div>

        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
          Sent via <a href="https://talrat.com/p/${profileSlug}" style="color:#f59e0b;">talrat.com/p/${profileSlug}</a>
        </p>
      </div>
    `,
  });

  if (error) throw new Error(error.message);
  return data;
}