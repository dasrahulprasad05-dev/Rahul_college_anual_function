import { createServerFn } from "@tanstack/react-start";
import { sendEmail } from "./resend";
import { welcomeEmail } from "@/services/email/email-templates";

type Input = {
  recipient: string;
  fullName: string;
};

// Called after a user creates an account or signs in for the first time.
// Since we don't have server middleware to easily verify tokens here, 
// the client will call this and track if it sent the email.
export const sendWelcomeIfFirstTime = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }) => {
    const { subject, html } = welcomeEmail(data.fullName);
    const res = await sendEmail(data.recipient, subject, html);
    if (!res.ok) return { ok: false as const, reason: res.error };
    return { ok: true as const };
  });

// Stubs for backward compatibility during migration
// auth.tsx handles these directly via Firebase now
export const sendSignupVerification = createServerFn({ method: "POST" }).handler(async () => ({ ok: true as const }));
export const sendPasswordReset = createServerFn({ method: "POST" }).handler(async () => ({ ok: true as const }));
