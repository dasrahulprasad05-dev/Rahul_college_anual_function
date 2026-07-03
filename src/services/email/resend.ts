import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Festa <onboarding@resend.dev>"; // Update to actual domain later

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("No RESEND_API_KEY found, skipping email.");
    return { ok: false, error: "No API key" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
    });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { ok: false, error: error.message };
  }
}
