// Deterministic per-event color so each ticket / QR gets its own identity.
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function eventHue(id: string): number {
  return hashStr(id) % 360;
}

export function eventColors(id: string) {
  const h = eventHue(id);
  const h2 = (h + 40) % 360;
  return {
    hue: h,
    primary: `hsl(${h} 90% 58%)`,
    secondary: `hsl(${h2} 92% 60%)`,
    soft: `hsl(${h} 90% 58% / 0.18)`,
    gradient: `linear-gradient(135deg, hsl(${h} 92% 60%), hsl(${h2} 92% 62%))`,
    glow: `0 0 28px hsl(${h} 92% 60% / 0.55), 0 0 60px hsl(${h2} 92% 62% / 0.35)`,
  };
}
