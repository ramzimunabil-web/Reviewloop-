import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "ReviewLoop <onboarding@resend.dev>";

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendArgs) {
  if (!resend) {
    console.log(`[email:dev] To: ${to} | ${subject}\n${html}`);
    return { id: "dev-noop" };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}

export function reviewRequestEmail(opts: {
  businessName: string;
  customerName: string;
  link: string;
  brandColor: string;
  message: string;
}) {
  const { businessName, link, brandColor, message } = opts;
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#15130f">
    <div style="text-align:center;padding:8px 0 20px"><strong style="font-size:18px">${businessName}</strong></div>
    <div style="background:#faf6ef;border:1px solid #e0d5c2;border-radius:16px;padding:28px;text-align:center">
      <p style="font-size:16px;line-height:1.5;margin:0 0 22px">${message}</p>
      <a href="${link}" style="display:inline-block;background:${brandColor};color:#fff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:10px;font-size:16px">Leave a quick review</a>
      <p style="font-size:12px;color:#8a8270;margin:22px 0 0">It takes about 20 seconds. Thank you!</p>
    </div>
    <p style="font-size:11px;color:#a39c8a;text-align:center;margin-top:18px">Sent via ReviewLoop on behalf of ${businessName}.</p>
  </div>`;
}
