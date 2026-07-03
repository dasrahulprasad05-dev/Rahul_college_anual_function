// email-templates.ts
// Branded HTML email templates for Festa (Neon Carnival palette — gold + neon pink + dark bg).
// Each function returns { subject, html } ready to pass to the Resend API.

const BRAND = {
  name: "Festa",
  tagline: "College Annual Function",
  primary: "#F5B301", // gold
  accent: "#FF3D8A", // neon pink
  bg: "#0B0B12",
  card: "#141420",
  text: "#F4F4F7",
  muted: "#9A9AAE",
};

function shell(preheader: string, inner: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${BRAND.name}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${BRAND.card};border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.08)">
      <tr><td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.accent} 100%);padding:28px 32px;text-align:center">
        <div style="font-size:28px;font-weight:900;letter-spacing:.5px;color:#0B0B12;font-family:'Archivo Black',Impact,sans-serif">${BRAND.name}</div>
        <div style="font-size:12px;color:#0B0B12;opacity:.75;margin-top:2px;letter-spacing:2px;text-transform:uppercase">${BRAND.tagline}</div>
      </td></tr>
      <tr><td style="padding:32px;color:${BRAND.text};background:${BRAND.card}">${inner}</td></tr>
      <tr><td style="padding:20px 32px;background:${BRAND.bg};text-align:center;color:${BRAND.muted};font-size:12px">
        You're receiving this because you have a ${BRAND.name} account.<br/>
        © ${new Date().getFullYear()} ${BRAND.name} · ${BRAND.tagline}
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

function button(url: string, label: string) {
  return `<div style="text-align:center;margin:28px 0">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:#0B0B12;text-decoration:none;font-weight:800;padding:14px 32px;border-radius:12px;font-size:15px;letter-spacing:.3px">${label}</a>
  </div>`;
}

// ── Welcome email (sent on first sign-in after verification) ─────────────────
export function welcomeEmail(name: string) {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${BRAND.text}">Welcome to ${BRAND.name}, ${name || "friend"} 🎉</h1>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-size:15px;line-height:1.6">
      Your account is verified and ready to roll. Browse events, grab your QR-coded tickets, and just flash them at the gate — no lines, no paper.
    </p>
    <ul style="color:${BRAND.muted};font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 8px">
      <li>🎟️ Book tickets to Tech, Cultural, Sports &amp; Workshop events</li>
      <li>📱 Each ticket gets a unique QR code</li>
      <li>⚡ Instant check-in at the venue</li>
    </ul>`;
  return {
    subject: `Welcome to ${BRAND.name} 🎉`,
    html: shell("Your Festa account is ready — start booking events", inner),
  };
}

// ── Email verification (sent during signup to confirm email address) ──────────
export function verificationEmail(name: string, confirmUrl: string) {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${BRAND.text}">Verify your email, ${name || "there"} ✨</h1>
    <p style="margin:0 0 8px;color:${BRAND.muted};font-size:15px;line-height:1.6">
      One quick tap to confirm this email and unlock your ${BRAND.name} account.
    </p>
    ${button(confirmUrl, "Verify email & continue")}
    <p style="margin:16px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6">
      Or paste this link into your browser:<br/>
      <a href="${confirmUrl}" style="color:${BRAND.primary};word-break:break-all">${confirmUrl}</a>
    </p>
    <p style="margin:24px 0 0;color:${BRAND.muted};font-size:12px">
      Didn't sign up? You can safely ignore this email.
    </p>`;
  return {
    subject: `Verify your ${BRAND.name} account`,
    html: shell("Confirm your email to activate your Festa account", inner),
  };
}

// ── Password reset (sent when user requests forgot password) ─────────────────
export function passwordResetEmail(name: string, resetUrl: string) {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${BRAND.text}">Reset your password 🔐</h1>
    <p style="margin:0 0 8px;color:${BRAND.muted};font-size:15px;line-height:1.6">
      Hey ${name || "there"}, we got a request to reset your ${BRAND.name} password. Tap below to set a new one — the link expires in 1 hour.
    </p>
    ${button(resetUrl, "Set a new password")}
    <p style="margin:16px 0 0;color:${BRAND.muted};font-size:12px;line-height:1.6">
      Or paste this link into your browser:<br/>
      <a href="${resetUrl}" style="color:${BRAND.primary};word-break:break-all">${resetUrl}</a>
    </p>
    <p style="margin:24px 0 0;color:${BRAND.muted};font-size:12px">
      Didn't request this? Ignore this email — your password stays unchanged.
    </p>`;
  return {
    subject: `Reset your ${BRAND.name} password`,
    html: shell("Reset your Festa password", inner),
  };
}

// ── Scan Confirmation (sent when a ticket is checked in) ─────────────────
export function scanConfirmationEmail(eventName: string, itemName: string, venue: string) {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${BRAND.text}">You're checked in! ✅</h1>
    <p style="margin:0 0 8px;color:${BRAND.muted};font-size:15px;line-height:1.6">
      Your ticket for <strong>${itemName}</strong> at <strong>${eventName}</strong> has been successfully scanned.
    </p>
    <div style="background:#0B0B12;padding:16px;border-radius:12px;margin:24px 0;border:1px solid rgba(255,255,255,0.1)">
      <p style="margin:0 0 8px;color:${BRAND.muted};font-size:14px">📍 <strong>Venue:</strong> ${venue}</p>
      <p style="margin:0;color:${BRAND.muted};font-size:14px">⏰ <strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <p style="margin:24px 0 0;color:${BRAND.text};font-size:15px;font-weight:600">
      Enjoy the event! 🎉
    </p>`;
  return {
    subject: `Ticket Checked In: ${itemName} at ${eventName}`,
    html: shell(`You're checked in to ${itemName}`, inner),
  };
}
