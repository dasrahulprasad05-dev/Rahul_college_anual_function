import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { welcomeEmail, verificationEmail, passwordResetEmail } from "./email-templates";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM_ADDRESS = "Festa <onboarding@resend.dev>"; // Change to verified domain to send to any recipient

async function sendViaResend(to: string, subject: string, html: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) throw new Error("Email service not configured");

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error", res.status, body);
    return { ok: false as const, error: `Resend ${res.status}: ${body}` };
  }
  const json = (await res.json()) as { id?: string };
  return { ok: true as const, id: json.id };
}

// PUBLIC: called from signup form. Creates the user and emails a custom verification link.
export const sendSignupVerification = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string; fullName?: string; redirectTo: string }) => {
    if (!data?.email || !data?.password || !data?.redirectTo) throw new Error("Missing fields");
    if (data.password.length < 6) throw new Error("Password too short");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: data.email,
      password: data.password,
      options: {
        redirectTo: data.redirectTo,
        data: { full_name: data.fullName ?? "" },
      },
    });
    if (error) throw new Error(error.message);
    const confirmUrl = link.properties?.action_link;
    if (!confirmUrl) throw new Error("Could not generate verification link");

    const { subject, html } = verificationEmail(data.fullName ?? "", confirmUrl);
    const r = await sendViaResend(data.email, subject, html);
    if (!r.ok) throw new Error(r.error);
    return { ok: true as const };
  });

// PUBLIC: called from forgot-password form. Emails a custom recovery link.
export const sendPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; redirectTo: string }) => {
    if (!data?.email || !data?.redirectTo) throw new Error("Missing fields");
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: { redirectTo: data.redirectTo },
    });
    // Do not leak existence of accounts: return ok even on error
    if (error || !link?.properties?.action_link) {
      console.warn("recovery link generation failed", error?.message);
      return { ok: true as const };
    }

    // Try to fetch profile name
    let name = "";
    const { data: prof } = await supabaseAdmin
      .from("profiles").select("full_name").eq("email", data.email).maybeSingle();
    if (prof?.full_name) name = prof.full_name;

    const { subject, html } = passwordResetEmail(name, link.properties.action_link);
    await sendViaResend(data.email, subject, html);
    return { ok: true as const };
  });

// AUTHENTICATED: called on first sign-in after verification. Sends welcome once.
export const sendWelcomeIfFirstTime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: prof, error } = await supabase
      .from("profiles").select("email, full_name, welcomed_at").eq("id", userId).single();
    if (error || !prof?.email) return { ok: false as const, reason: "no-profile" };
    if (prof.welcomed_at) return { ok: true as const, skipped: true };

    const { subject, html } = welcomeEmail(prof.full_name ?? "");
    const r = await sendViaResend(prof.email, subject, html);
    if (!r.ok) return { ok: false as const, reason: r.error };

    await supabase.from("profiles").update({ welcomed_at: new Date().toISOString() }).eq("id", userId);
    return { ok: true as const };
  });
