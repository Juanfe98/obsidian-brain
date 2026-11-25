// Pure color math. WCAG 2.2 relative luminance and contrast, unrounded:
// 4.499:1 must FAIL a 4.5:1 floor, so callers compare the raw ratio.

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

export function parseHex(hex) {
  if (typeof hex !== 'string' || !HEX6.test(hex)) {
    throw new Error(`not a #rrggbb hex color: ${JSON.stringify(hex)}`);
  }
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG 2.2 SC 1.4.3: large text is >=18pt, or >=14pt bold. */
export function textFloor(sizePt, bold = false) {
  return sizePt >= 18 || (bold && sizePt >= 14) ? 3.0 : 4.5;
}

/** Scale each channel by `f`, clamped. Used to derive a legible tint of a brand hue. */
export function scale(hex, f) {
  const { r, g, b } = parseHex(hex);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
