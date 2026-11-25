// Theme loading + validation. A theme is data; this module is the only place
// that decides whether a brand's colors are usable, so the answer is identical
// for the HTML renderer, the PPTX emitter and the CI test.

import { readFileSync } from 'node:fs';
import { contrast, parseHex } from './color.mjs';

export const MODES = ['light', 'dark'];

// Contrast floors. `ink` uses AAA (7.0) rather than AA because slide body text
// is read at distance in a lit room; the rest are WCAG 2.2 AA minimums.
export const FLOORS = {
  ink: 7.0,
  inkSecondary: 4.5,
  inkMuted: 3.5,
  accent: 4.5, // accent used AS TEXT
  positive: 3.0, // non-text graphical (SC 1.4.11)
  negative: 3.0,
  warning: 3.0,
  series: 3.0,
  accentInk: 4.5, // ink placed ON the accent fill
};

const ROLES = [
  'canvas',
  'surface',
  'ink',
  'inkSecondary',
  'inkMuted',
  'rule',
  'accent',
  'accentInk',
  'positive',
  'negative',
  'warning',
  'codeBg',
  'codeInk',
];

const isColor = (value) => {
  try {
    parseHex(value);
    return true;
  } catch {
    return false;
  }
};

export function cssFontStack(value, field = 'font stack') {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a non-empty CSS font-family list`);
  }
  if (/[\u0000-\u001f\u007f\\;{}<>]/.test(value)) {
    throw new Error(`${field} contains characters that are not allowed in a CSS font-family list`);
  }

  const families = [];
  let token = '';
  let quote = null;
  for (const char of value) {
    if (quote) {
      token += char;
      if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      token += char;
      continue;
    }
    if (char === ',') {
      families.push(token.trim());
      token = '';
      continue;
    }
    token += char;
  }
  if (quote) {
    throw new Error(`${field} contains an unterminated quoted family`);
  }
  families.push(token.trim());

  if (families.some((family) => {
    if (!family) {
      return true;
    }
    const first = family[0];
    if (first === "'" || first === '"') {
      return family.at(-1) !== first || family.length < 3;
    }
    return !/^[A-Za-z][A-Za-z0-9-]*$/.test(family);
  })) {
    throw new Error(
      `${field} must use quoted family names or single CSS identifiers; multi-word names like "Arial Narrow" must be quoted`,
    );
  }
  return families.join(', ');
}

export function loadTheme(path) {
  const theme = JSON.parse(readFileSync(path, 'utf8'));
  const errors = validateTheme(theme);
  if (errors.length) {
    throw new Error(`theme ${theme.id ?? path} is invalid:\n  ${errors.join('\n  ')}`);
  }
  return theme;
}

/** Returns a list of human-readable problems; empty means the theme is usable. */
export function validateTheme(theme) {
  if (!theme || typeof theme !== 'object') {
    return ['theme is not an object'];
  }
  const errors = [];
  if (!theme.id) {
    errors.push('missing id');
  }
  errors.push(...validateThemeFonts(theme));
  for (const mode of MODES) {
    errors.push(...validateThemeMode(mode, theme.modes?.[mode]));
  }
  errors.push(...validateThemeGeometry(theme));
  errors.push(...validateScrim(theme.onImageScrim));
  return errors;
}

function validateThemeFonts(theme) {
  const errors = [];
  for (const field of ['fontDisplay', 'fontBody', 'fontMono']) {
    try {
      cssFontStack(theme[field], field);
    } catch (error) {
      errors.push(error.message);
    }
  }
  for (const field of ['pptxFontDisplay', 'pptxFontBody', 'pptxFontFallback']) {
    if (typeof theme[field] !== 'string' || !theme[field].trim()) {
      errors.push(`${field} must be a non-empty PowerPoint font face`);
    }
  }
  return errors;
}

function validateThemeMode(mode, m) {
  if (!m) {
    return [`missing modes.${mode}`];
  }
  const errors = [];
  for (const role of ROLES) {
    if (!m[role]) {
      errors.push(`modes.${mode} missing role ${role}`);
    } else if (!isColor(m[role])) {
      errors.push(`modes.${mode}.${role} must be a #rrggbb color`);
    }
  }
  const modeHasInvalidRole = ROLES.some((role) => !isColor(m[role]));
  if (modeHasInvalidRole) {
    return errors;
  }
  errors.push(...validateModeContrast(mode, m));
  for (const [field, background] of [['series', 'canvas'], ['seriesOnAccent', 'accent']]) {
    errors.push(...validateModeSeries(mode, m, field, background));
  }
  return errors;
}

function validateModeContrast(mode, m) {
  const errors = [];
  for (const [role, floor] of Object.entries(FLOORS)) {
    if (role === 'series' || role === 'accentInk') {
      continue;
    }
    for (const base of ['canvas', 'surface']) {
      const ratio = contrast(m[role], m[base]);
      if (ratio < floor) {
        errors.push(
          `modes.${mode}.${role} ${m[role]} on ${base} ${m[base]} is ${ratio.toFixed(3)}:1, needs ${floor}:1`,
        );
      }
    }
  }
  const onAccent = contrast(m.accentInk, m.accent);
  if (onAccent < FLOORS.accentInk) {
    errors.push(
      `modes.${mode}.accentInk ${m.accentInk} on accent ${m.accent} is ${onAccent.toFixed(3)}:1, needs ${FLOORS.accentInk}:1`,
    );
  }
  const onCode = contrast(m.codeInk, m.codeBg);
  if (onCode < 4.5) {
    errors.push(
      `modes.${mode}.codeInk on codeBg is ${onCode.toFixed(3)}:1, needs 4.5:1`,
    );
  }
  return errors;
}

function validateModeSeries(mode, m, field, background) {
  const series = m[field];
  if (!Array.isArray(series) || series.length < 4) {
    return [`modes.${mode} needs a ${field}[] of at least 4 colors`];
  }
  const errors = [];
  series.forEach((c, i) => {
    if (!isColor(c)) {
      errors.push(`modes.${mode}.${field}[${i}] must be a #rrggbb color`);
      return;
    }
    const ratio = contrast(c, m[background]);
    if (ratio < FLOORS.series) {
      errors.push(
        `modes.${mode} ${field}[${i}] ${c} on ${background} ${m[background]} is ${ratio.toFixed(3)}:1, needs ${FLOORS.series}:1`,
      );
    }
  });
  const dupes = series.filter((c, i) => series.indexOf(c) !== i);
  if (dupes.length) {
    errors.push(`modes.${mode} ${field} has duplicates: ${[...new Set(dupes)].join(', ')}`);
  }
  return errors;
}

function validateThemeGeometry(theme) {
  const errors = [];
  if (!theme.canvas || theme.canvas.width !== 1920 || theme.canvas.height !== 1080) {
    errors.push('canvas must be exactly 1920x1080 (the DEE template is 1920x1080pt, so 1pt = 1px)');
  }
  const body = theme.type?.body;
  if (typeof body !== 'number' || body < 40) {
    errors.push(`type.body must be >= 40 (got ${body}); 40px is the projection legibility floor`);
  }
  if (typeof theme.radius !== 'number' || !Number.isFinite(theme.radius) || theme.radius < 0 || theme.radius > 128) {
    errors.push(`radius must be a finite number from 0 to 128 (got ${theme.radius})`);
  }
  return errors;
}

function validateScrim(scrim) {
  if (!scrim || typeof scrim !== 'object' || Array.isArray(scrim)) {
    return ['onImageScrim must be an object {color, opacity}'];
  }
  const errors = [];
  if (!isColor(scrim.color)) {
    errors.push('onImageScrim.color must be a #rrggbb color');
  }
  if (typeof scrim.opacity !== 'number' || scrim.opacity < 0 || scrim.opacity > 1) {
    errors.push(`onImageScrim.opacity must be between 0 and 1 (got ${scrim.opacity})`);
  }
  if (isColor(scrim.color) && typeof scrim.opacity === 'number') {
    const worstCase = compositeOnWhite(scrim.color, scrim.opacity);
    const ratio = contrast('#FFFFFF', worstCase);
    if (ratio < 4.5) {
      errors.push(`onImageScrim leaves white text at ${ratio.toFixed(3)}:1 over white pixels, needs 4.5:1`);
    }
  }
  return errors;
}

export function seriesFor(theme, mode, background = null) {
  const modeTheme = theme.modes?.[mode];
  if (background === 'accent') {
    return modeTheme?.seriesOnAccent ?? modeTheme?.series ?? theme.series;
  }
  return modeTheme?.series ?? theme.series;
}

export function scrimFor(theme) {
  return theme.onImageScrim;
}

export function valueInkForBackground(mode, background) {
  return background === 'accent' ? mode.accentInk : mode.accent;
}

export function chartStyleForBackground(mode, background) {
  if (background === 'accent') {
    return {
      background: mode.accent,
      ink: mode.accentInk,
      muted: mode.accentInk,
      rule: mode.accentInk,
    };
  }
  return {
    background: background === 'surface' ? mode.surface : mode.canvas,
    ink: mode.ink,
    muted: mode.inkMuted,
    rule: mode.rule,
  };
}

function compositeOnWhite(color, opacity) {
  const { r, g, b } = parseHex(color);
  const channel = (value) => Math.round(value * opacity + 255 * (1 - opacity));
  return `#${[channel(r), channel(g), channel(b)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}
