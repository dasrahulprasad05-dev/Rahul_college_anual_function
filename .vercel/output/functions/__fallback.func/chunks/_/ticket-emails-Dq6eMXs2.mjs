import { T as TSS_SERVER_FUNCTION, b as createServerFn } from './server-BaZlr8n8.mjs';
import nodemailer from 'nodemailer';
import 'node:async_hooks';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import '@tanstack/react-router';
import 'react/jsx-runtime';
import '@tanstack/react-router/ssr/server';
import 'rou3';
import 'srvx';
import 'seroval';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';

var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.VITE_GMAIL_USER,
    pass: process.env.VITE_GMAIL_APP_PASSWORD
  }
});
async function sendEmail(to, subject, html) {
  if (!process.env.VITE_GMAIL_USER || !process.env.VITE_GMAIL_APP_PASSWORD) {
    console.error("No Gmail credentials found, skipping email.");
    return {
      ok: false,
      error: "No Gmail credentials"
    };
  }
  try {
    const info = await transporter.sendMail({
      from: `"Festa Updates" <${process.env.VITE_GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("Email sent successfully: ", info.messageId);
    return {
      ok: true,
      id: info.messageId
    };
  } catch (error) {
    console.error("Failed to send email via Nodemailer:", error);
    return {
      ok: false,
      error: error.message
    };
  }
}
var sendTicketConfirmation_createServerFn_handler = createServerRpc({
  id: "c0d8d04ebe61932401adcceeaa9c81f295042937a3a78c99ab31e9f621e45945",
  name: "sendTicketConfirmation",
  filename: "src/services/email/ticket-emails.ts"
}, (opts) => sendTicketConfirmation.__executeServer(opts));
var sendTicketConfirmation = createServerFn({ method: "POST" }).validator((data) => data).handler(sendTicketConfirmation_createServerFn_handler, async ({ data }) => {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(data.qrToken)}`;
  const priceLine = data.priceCents ? `\u20B9${(data.priceCents / 100).toFixed(2)}` : "Free";
  const dateObj = new Date(data.eventDate);
  const dateStr = isNaN(dateObj.getTime()) ? data.eventDate : dateObj.toDateString();
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;margin:0;padding:24px;color:#111">
  <div style="max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:16px;padding:28px">
    <h1 style="margin:0 0 4px;font-size:22px">Ticket confirmed \u{1F389}</h1>
    <p style="margin:0 0 20px;color:#555">Hey ${data.fullName || "there"}, your booking is locked in.</p>
    <div style="background:#fafafa;border-radius:12px;padding:16px;margin-bottom:20px">
      <div style="font-size:18px;font-weight:700">${data.eventName}</div>
      <div style="color:#555;margin-top:4px">${data.itemName}</div>
      <div style="color:#555;margin-top:8px;font-size:14px">${dateStr}${data.venue ? " \xB7 " + data.venue : ""}</div>
      <div style="color:#555;margin-top:4px;font-size:14px">Amount: ${priceLine}</div>
    </div>
    <div style="text-align:center;padding:12px 0">
      <img src="${qrImageUrl}" alt="QR code" width="220" height="220" style="border:8px solid #fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.08)" />
      <div style="margin-top:8px;font-size:12px;color:#888">Show this QR at the gate</div>
    </div>
    <p style="font-size:12px;color:#999;margin-top:24px;text-align:center">Festa \xB7 College Annual Function</p>
  </div>
</body></html>`;
  const res = await sendEmail(data.recipient, `Your ticket for ${data.eventName}`, html);
  if (!res.ok) {
    console.error("Resend error", res.error);
    return {
      ok: false,
      error: res.error
    };
  }
  return {
    ok: true,
    id: res.id
  };
});
var sendScanConfirmation_createServerFn_handler = createServerRpc({
  id: "a93969aae98d5e42b2b702cf4effb13c056aaf935b99873d1abd06d2c5aaa239",
  name: "sendScanConfirmation",
  filename: "src/services/email/ticket-emails.ts"
}, (opts) => sendScanConfirmation.__executeServer(opts));
var sendScanConfirmation = createServerFn({ method: "POST" }).validator((data) => data).handler(sendScanConfirmation_createServerFn_handler, async ({ data }) => {
  const { scanConfirmationEmail } = await import('./email-templates-CfGG78UE.mjs');
  const { subject, html } = scanConfirmationEmail(data.eventName, data.itemName, data.venue);
  const res = await sendEmail(data.recipient, subject, html);
  if (!res.ok) {
    console.error("Resend error", res.error);
    return {
      ok: false,
      error: res.error
    };
  }
  return {
    ok: true,
    id: res.id
  };
});

export { sendScanConfirmation_createServerFn_handler, sendTicketConfirmation_createServerFn_handler };
//# sourceMappingURL=ticket-emails-Dq6eMXs2.mjs.map
