import nodemailer from "nodemailer";

// Using Gmail as the SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.VITE_GMAIL_USER, // e.g. 'abit.fest.2026@gmail.com'
    pass: process.env.VITE_GMAIL_APP_PASSWORD, // 16-character app password
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.VITE_GMAIL_USER || !process.env.VITE_GMAIL_APP_PASSWORD) {
    console.error("No Gmail credentials found, skipping email.");
    return { ok: false, error: "No Gmail credentials" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Festa Updates" <${process.env.VITE_GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log("Email sent successfully: ", info.messageId);
    return { ok: true, id: info.messageId };
  } catch (error: any) {
    console.error("Failed to send email via Nodemailer:", error);
    return { ok: false, error: error.message };
  }
}
