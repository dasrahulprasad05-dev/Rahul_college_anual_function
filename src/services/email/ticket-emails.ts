import { createServerFn } from "@tanstack/react-start";
import { sendEmail } from "./resend";
import { z } from "zod";

type Input = {
  recipient: string;
  fullName: string;
  eventName: string;
  itemName: string;
  eventDate: string;
  venue: string;
  priceCents: number;
  qrToken: string;
};

export const sendTicketConfirmation = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => data)
  .handler(async ({ data }) => {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(data.qrToken)}`;
    const priceLine = data.priceCents ? `₹${(data.priceCents / 100).toFixed(2)}` : "Free";
    
    // Formatting date string without relying on locale since it's server side
    const dateObj = new Date(data.eventDate);
    const dateStr = isNaN(dateObj.getTime()) ? data.eventDate : dateObj.toDateString();

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;margin:0;padding:24px;color:#111">
  <div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px">Ticket confirmed 🎉</h1>
    <p style="margin:0 0 20px;color:#555">Hey ${data.fullName || "there"}, your booking is locked in.</p>
    <div style="background:#fafafa;border-radius:12px;padding:16px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:700">${data.eventName}</div>
      <div style="color:#555;margin-top:4px">${data.itemName}</div>
      <div style="color:#555;margin-top:8px;font-size:14px">${dateStr}${data.venue ? " · " + data.venue : ""}</div>
      <div style="color:#555;margin-top:4px;font-size:14px">Amount: ${priceLine}</div>
    </div>
    <div style="text-align:center;padding:12px 0">
      <img src="${qrImageUrl}" alt="QR code" width="220" height="220" style="border:8px solid #fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)" />
      <div style="margin-top:8px;font-size:12px;color:#888">Show this QR at the gate</div>
    </div>
    <p style="font-size:12px;color:#999;margin-top:24px;text-align:center">Festa · College Annual Function</p>
  </div>
</body></html>`;

    const res = await sendEmail(data.recipient, `Your ticket for ${data.eventName}`, html);
    if (!res.ok) {
      console.error("Resend error", res.error);
      return { ok: false as const, error: res.error };
    }
    return { ok: true as const, id: res.id };
  });
