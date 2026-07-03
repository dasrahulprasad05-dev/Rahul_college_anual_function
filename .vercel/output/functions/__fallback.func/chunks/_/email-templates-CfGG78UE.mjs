var BRAND = {
  name: "Festa",
  tagline: "College Annual Function",
  primary: "#F5B301",
  accent: "#FF3D8A",
  bg: "#0B0B12",
  card: "#141420",
  text: "#F4F4F7",
  muted: "#9A9AAE"
};
function shell(preheader, inner) {
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
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${BRAND.name} \xB7 ${BRAND.tagline}
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}
function scanConfirmationEmail(eventName, itemName, venue) {
  const inner = `
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:${BRAND.text}">You're checked in! \u2705</h1>
    <p style="margin:0 0 8px;color:${BRAND.muted};font-size:15px;line-height:1.6">
      Your ticket for <strong>${itemName}</strong> at <strong>${eventName}</strong> has been successfully scanned.
    </p>
    <div style="background:#0B0B12;padding:16px;border-radius:12px;margin:24px 0;border:1px solid rgba(255,255,255,0.1)">
      <p style="margin:0 0 8px;color:${BRAND.muted};font-size:14px">\u{1F4CD} <strong>Venue:</strong> ${venue}</p>
      <p style="margin:0;color:${BRAND.muted};font-size:14px">\u23F0 <strong>Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
    </div>
    <p style="margin:24px 0 0;color:${BRAND.text};font-size:15px;font-weight:600">
      Enjoy the event! \u{1F389}
    </p>`;
  return {
    subject: `Ticket Checked In: ${itemName} at ${eventName}`,
    html: shell(`You're checked in to ${itemName}`, inner)
  };
}

export { scanConfirmationEmail };
//# sourceMappingURL=email-templates-CfGG78UE.mjs.map
