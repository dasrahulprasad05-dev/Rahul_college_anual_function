import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

// Change this once you have a verified sending domain in Resend.
// While unverified, Resend only delivers to the account owner's email address.
const FROM_ADDRESS = "Festa <onboarding@resend.dev>";

type Input = { ticketId: string };

export const sendTicketConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Input) => {
    if (!data?.ticketId || typeof data.ticketId !== "string") {
      throw new Error("ticketId is required");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("id, qr_token, price_cents, user_id, items(name, event_id, events(name, event_date, venue))")
      .eq("id", data.ticketId)
      .eq("user_id", userId)
      .single();
    if (error || !ticket) throw new Error(error?.message ?? "Ticket not found");

    const { data: userInfo } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();
    const recipient = userInfo?.email;
    if (!recipient) throw new Error("No email on profile");

    const item = (ticket as { items: { name: string; events: { name: string; event_date: string; venue: string | null } } }).items;
    const ev = item.events;

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      throw new Error("Email service not configured");
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(ticket.qr_token)}`;
    const priceLine = ticket.price_cents ? `₹${(ticket.price_cents / 100).toFixed(2)}` : "Free";
    const dateStr = new Date(ev.event_date).toLocaleDateString(undefined, { dateStyle: "full" });

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;margin:0;padding:24px;color:#111">
  <div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px">Ticket confirmed 🎉</h1>
    <p style="margin:0 0 20px;color:#555">Hey ${userInfo?.full_name || "there"}, your booking is locked in.</p>
    <div style="background:#fafafa;border-radius:12px;padding:16px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:700">${ev.name}</div>
      <div style="color:#555;margin-top:4px">${item.name}</div>
      <div style="color:#555;margin-top:8px;font-size:14px">${dateStr}${ev.venue ? " · " + ev.venue : ""}</div>
      <div style="color:#555;margin-top:4px;font-size:14px">Amount: ${priceLine}</div>
    </div>
    <div style="text-align:center;padding:12px 0">
      <img src="${qrUrl}" alt="QR code" width="220" height="220" style="border:8px solid #fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)" />
      <div style="margin-top:8px;font-size:12px;color:#888">Show this QR at the gate</div>
    </div>
    <p style="font-size:12px;color:#999;margin-top:24px;text-align:center">Festa · College Annual Function</p>
  </div>
</body></html>`;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [recipient],
        subject: `Your ticket for ${ev.name}`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error", res.status, errBody);
      return { ok: false as const, error: `Resend ${res.status}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true as const, id: json.id };
  });
