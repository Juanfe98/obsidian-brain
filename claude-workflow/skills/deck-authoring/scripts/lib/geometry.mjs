// Unit conversions and the canvas contract.
//
// The DEE template canvas is 1920x1080 POINTS (sldSz cx=24384000 cy=13716000),
// which is exactly 2x the standard 960x540pt 16:9 slide. Because we render HTML
// at 1920x1080 CSS px, 1pt == 1px exactly and no scaling factor is ever applied
// to a text size or a coordinate. That identity is the whole reason this canvas
// was chosen, so it is asserted rather than assumed.

export const EMU_PER_PT = 12700;
export const PT_PER_INCH = 72;

export const CANVAS = Object.freeze({
  width: 1920, // px == pt
  height: 1080,
  emuWidth: 24384000,
  emuHeight: 13716000,
});

// A size on this canvas is visually equivalent to half that on a standard
// 960x540pt deck, so legibility rules stated in "points on a normal slide"
// double here. Kosslyn's >20pt floor becomes 40.
export const STANDARD_SLIDE_SCALE = 2;
export const MIN_BODY_PX = 40;
export const MIN_CAPTION_PX = 24;

export const ptToEmu = (pt) => Math.round(pt * EMU_PER_PT);
export const emuToPt = (emu) => emu / EMU_PER_PT;
export const ptToInches = (pt) => pt / PT_PER_INCH;
export const pxToPt = (px) => px; // identity on this canvas, by construction
export const pxToInches = (px) => px / PT_PER_INCH;

/** Visual equivalent on a standard 960x540pt deck, for legibility reasoning. */
export const standardEquivalentPt = (px) => px / STANDARD_SLIDE_SCALE;

/** Distribute additional timeline stops inside the catalog's existing span. */
export function milestonePositions(spec, count) {
  if (!Number.isInteger(count) || count < spec.minItems || count > spec.maxItems) {
    throw new Error('timeline milestone count is outside the layout bounds');
  }
  if (count <= spec.positions.length) {
    return spec.positions.slice(0, count);
  }
  const first = spec.positions[0];
  const last = spec.positions.at(-1);
  const step = (last.x - first.x) / (count - 1);
  return Array.from({ length: count }, (_, index) => ({
    x: first.x + step * index,
    y: first.y,
    w: Math.min(first.w, step - 24),
  }));
}

export function assertCanvasIdentity() {
  const wPt = CANVAS.emuWidth / EMU_PER_PT;
  const hPt = CANVAS.emuHeight / EMU_PER_PT;
  if (wPt !== CANVAS.width || hPt !== CANVAS.height) {
    throw new Error(`canvas identity broken: EMU says ${wPt}x${hPt}pt, canvas says ${CANVAS.width}x${CANVAS.height}`);
  }
  if (Math.abs(CANVAS.width / CANVAS.height - 16 / 9) > 1e-9) {
    throw new Error('canvas is not 16:9');
  }
  return true;
}
