// Deck IR validation. The IR is the single source of truth; HTML, PDF and PPTX
// are all derived from it. Validation is layout-aware: a slot that does not
// exist on the chosen layout is an error, not silently ignored, and an
// over-length slot names the field and the overage so the fix is mechanical.

import { readFileSync } from 'node:fs';
import {
  chartValueIsSafe,
  MAX_CHART_VALUE_MAGNITUDE,
} from './chart.mjs';

export const MODES = ['live', 'preread'];

export function loadCatalog(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const isStr = (v) => typeof v === 'string';
const isRecord = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Validate a deck IR against the layout catalog.
 * @returns {string[]} problems; empty means valid.
 */
export function validateDeck(deck, catalog) {
  const e = [];
  if (!isRecord(deck)) {
    return ['deck is not an object'];
  }
  for (const key of Object.keys(deck)) {
    if (!['title', 'mode', 'theme', 'slides'].includes(key)) {
      e.push(`deck has unknown field "${key}"`);
    }
  }
  if (!isStr(deck.title) || !deck.title.trim()) {
    e.push('deck.title is required');
  }
  if (!MODES.includes(deck.mode)) {
    e.push(`deck.mode must be one of ${MODES.join(' | ')} (got ${JSON.stringify(deck.mode)})`);
  }
  if (!isStr(deck.theme) || !deck.theme.trim()) {
    e.push('deck.theme is required (a theme id, e.g. "dee")');
  }
  if (!Array.isArray(deck.slides) || deck.slides.length === 0 || deck.slides.length > 200) {
    e.push('deck.slides must be an array of 1–200 slides');
    return e;
  }

  deck.slides.forEach((slide, i) => {
    const at = `slides[${i}]`;
    if (!isRecord(slide)) {
      e.push(`${at} is not an object`);
      return;
    }
    const L = catalog.layouts[slide.layout];
    if (!L) {
      e.push(`${at}.layout ${JSON.stringify(slide.layout)} is not a known layout (have: ${Object.keys(catalog.layouts).join(', ')})`);
      return;
    }
    if (L.modes && !L.modes.includes(deck.mode)) {
      e.push(`${at} layout "${slide.layout}" is only valid in mode(s) ${L.modes.join('|')}, deck mode is "${deck.mode}"`);
    }

    // unknown slots are an error: a typo must never silently drop content
    const known = new Set([...Object.keys(L.slots), 'layout', 'notes', 'spine', 'background']);
    for (const key of Object.keys(slide)) {
      if (!known.has(key)) {
        e.push(`${at} has unknown slot "${key}" for layout "${slide.layout}" (allowed: ${Object.keys(L.slots).join(', ')})`);
      }
    }
    if (slide.background !== undefined && !['accent', 'surface'].includes(slide.background)) {
      e.push(`${at}.background must be "accent" or "surface" (got ${JSON.stringify(slide.background)})`);
    }

    for (const [name, spec] of Object.entries(L.slots)) {
      const v = slide[name];
      if (v === undefined || v === null || v === '') {
        if (!spec.optional) {
          e.push(`${at}.${name} is required by layout "${slide.layout}"`);
        }
        continue;
      }
      e.push(...validateSlot(`${at}.${name}`, v, spec));
    }
  });

  return e;
}

function validateSlot(at, v, spec) {
  switch (spec.kind) {
    case 'text':
      return validateTextSlot(at, v, spec);
    case 'text-list':
      return validateTextListSlot(at, v, spec);
    case 'card':
      return validateCardSlot(at, v, spec);
    case 'milestone-list':
      return validateMilestoneListSlot(at, v, spec);
    case 'image':
      return validateImageSlot(at, v);
    case 'chart':
      return validateChartSlot(at, v);
    default:
      return [`${at} has unsupported slot kind "${spec.kind}"`];
  }
}

function unknownKeys(at, record, allowed) {
  return Object.keys(record)
    .filter((key) => !allowed.includes(key))
    .map((key) => `${at} has unknown key "${key}" (allowed: ${allowed.join(', ')})`);
}

function validateTextSlot(at, v, spec) {
  if (!isStr(v)) {
    return [`${at} must be a string`];
  }
  if (!v.trim()) {
    return [`${at} must be a non-empty string`];
  }
  if (spec.maxLength && v.length > spec.maxLength) {
    return [`${at} is ${v.length} chars, ${v.length - spec.maxLength} over the ${spec.maxLength} limit`];
  }
  return [];
}

function validateTextListItem(at, item, spec) {
  if (!isStr(item)) {
    return `${at} must be a string`;
  }
  if (!item.trim()) {
    return `${at} must be a non-empty string`;
  }
  if (spec.maxLength && item.length > spec.maxLength) {
    return `${at} is ${item.length} chars, ${item.length - spec.maxLength} over the ${spec.maxLength} limit`;
  }
  return undefined;
}

function validateTextListSlot(at, v, spec) {
  if (!Array.isArray(v)) {
    return [`${at} must be an array of strings`];
  }
  const e = [];
  if (spec.minItems !== undefined && v.length < spec.minItems) {
    e.push(`${at} has ${v.length} items, needs at least ${spec.minItems}`);
  }
  if (spec.maxItems !== undefined && v.length > spec.maxItems) {
    e.push(`${at} has ${v.length} items, ${v.length - spec.maxItems} over the max of ${spec.maxItems}`);
  }
  v.forEach((item, j) => {
    const problem = validateTextListItem(`${at}[${j}]`, item, spec);
    if (problem) {
      e.push(problem);
    }
  });
  return e;
}

function validateCardSlot(at, v, spec) {
  if (!isRecord(v)) {
    return [`${at} must be an object {heading, body}`];
  }
  const e = unknownKeys(at, v, ['heading', 'body']);
  if (!isStr(v.heading) || !v.heading.trim()) {
    e.push(`${at}.heading is required`);
  } else if (spec.headingMax && v.heading.length > spec.headingMax) {
    e.push(`${at}.heading is ${v.heading.length} chars, ${v.heading.length - spec.headingMax} over the ${spec.headingMax} limit`);
  }
  if (v.body !== undefined) {
    if (!isStr(v.body)) {
      e.push(`${at}.body must be a string`);
    } else if (spec.bodyMax && v.body.length > spec.bodyMax) {
      e.push(`${at}.body is ${v.body.length} chars, ${v.body.length - spec.bodyMax} over the ${spec.bodyMax} limit`);
    }
  }
  return e;
}

function validateMilestone(at, m, spec) {
  if (!isRecord(m)) {
    return [`${at} must be an object {label, body}`];
  }
  const e = unknownKeys(at, m, ['label', 'body']);
  if (!isStr(m.label) || !m.label.trim()) {
    e.push(`${at}.label is required`);
  } else if (spec.labelMax && m.label.length > spec.labelMax) {
    e.push(`${at}.label is ${m.label.length} chars, ${m.label.length - spec.labelMax} over the ${spec.labelMax} limit`);
  }
  if (m.body !== undefined) {
    if (!isStr(m.body)) {
      e.push(`${at}.body must be a string`);
    } else if (spec.bodyMax && m.body.length > spec.bodyMax) {
      e.push(`${at}.body is ${m.body.length} chars, ${m.body.length - spec.bodyMax} over the ${spec.bodyMax} limit`);
    }
  }
  return e;
}

function validateMilestoneListSlot(at, v, spec) {
  if (!Array.isArray(v)) {
    return [`${at} must be an array of {label, body}`];
  }
  const e = [];
  if (spec.minItems !== undefined && v.length < spec.minItems) {
    e.push(`${at} has ${v.length} items, needs at least ${spec.minItems}`);
  }
  if (spec.maxItems !== undefined && v.length > spec.maxItems) {
    e.push(`${at} has ${v.length} items, ${v.length - spec.maxItems} over the max of ${spec.maxItems} (a timeline stops being readable past ${spec.maxItems})`);
  }
  v.forEach((m, j) => {
    e.push(...validateMilestone(`${at}[${j}]`, m, spec));
  });
  return e;
}

function validateImageSlot(at, v) {
  if (typeof v === 'string') {
    return [];
  }
  if (!isRecord(v) || !isStr(v.src) || !v.src.trim()) {
    return [`${at} must be a path string or {src, alt}`];
  }
  const e = unknownKeys(at, v, ['src', 'alt']);
  if (v.alt !== undefined && !isStr(v.alt)) {
    e.push(`${at}.alt must be a string`);
  }
  return e;
}

const CHART_TYPES = ['bar', 'line', 'area', 'pie', 'doughnut'];
const isPolarChart = (type) => ['pie', 'doughnut'].includes(type);

function chartTypeProblem(at, type) {
  if (type === 'scatter') {
    return `${at}.type "scatter" is not supported: a scatter plot needs an X value per point, not shared categories. `
      + 'Use "line" for a trend over ordered categories, or plot the relationship outside the deck and pass it as an image slot.';
  }
  return `${at}.type must be one of ${CHART_TYPES.join(' | ')}`;
}

function validateChartCategories(at, v) {
  const e = [];
  if (['line', 'area'].includes(v.type) && v.categories.length < 2) {
    e.push(`${at}.${v.type} needs at least two categories so the rendered trend is visible`);
  }
  v.categories.forEach((category, j) => {
    if (!isStr(category) || !category.trim()) {
      e.push(`${at}.categories[${j}] must be a non-empty string`);
    }
  });
  return e;
}

function chartValueProblem(at, value, type) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return `${at} must be a finite number`;
  }
  if (!chartValueIsSafe(value)) {
    return `${at} magnitude must be <= ${MAX_CHART_VALUE_MAGNITUDE}`;
  }
  if (isPolarChart(type) && value < 0) {
    return `${at} must be >= 0 for ${type}`;
  }
  return undefined;
}

function validateChartSeries(at, s, v) {
  if (!isRecord(s)) {
    return [`${at} must be an object {name, values}`];
  }
  const e = unknownKeys(at, s, ['name', 'values']);
  if (s.name !== undefined && (!isStr(s.name) || !s.name.trim())) {
    e.push(`${at}.name must be a non-empty string`);
  }
  if (!Array.isArray(s.values)) {
    e.push(`${at}.values must be an array`);
    return e;
  }
  s.values.forEach((value, k) => {
    const problem = chartValueProblem(`${at}.values[${k}]`, value, v.type);
    if (problem) {
      e.push(problem);
    }
  });
  if (s.values.length !== v.categories.length) {
    e.push(`${at}.values has ${s.values.length} points but there are ${v.categories.length} categories`);
  }
  return e;
}

function validateChartData(at, v) {
  const e = [];
  v.series.forEach((s, j) => {
    e.push(...validateChartSeries(`${at}.series[${j}]`, s, v));
  });
  if (v.series.length > 8) {
    e.push(`${at}.series has ${v.series.length} series; the palette holds 8`);
  }
  if (isPolarChart(v.type) && v.series.length !== 1) {
    e.push(`${at}.${v.type} must contain exactly one series so HTML and PowerPoint show the same data`);
  }
  if (
    isPolarChart(v.type)
    && v.series.length === 1
    && Array.isArray(v.series[0]?.values)
    && !v.series[0].values.some((value) => typeof value === 'number' && value > 0)
  ) {
    e.push(`${at}.${v.type} needs at least one positive value`);
  }
  return e;
}

function validateChartSlot(at, v) {
  if (!isRecord(v)) {
    return [`${at} must be a chart object`];
  }
  const e = unknownKeys(at, v, ['type', 'categories', 'series']);
  if (!CHART_TYPES.includes(v.type)) {
    e.push(chartTypeProblem(at, v.type));
  }
  if (!Array.isArray(v.series) || !v.series.length) {
    e.push(`${at}.series must be a non-empty array`);
  }
  if (!Array.isArray(v.categories) || !v.categories.length) {
    e.push(`${at}.categories must be a non-empty array`);
  }
  if (Array.isArray(v.categories)) {
    e.push(...validateChartCategories(at, v));
  }
  if (Array.isArray(v.series) && Array.isArray(v.categories)) {
    e.push(...validateChartData(at, v));
  }
  return e;
}

function slotTextValues(kind, value) {
  if (kind === 'text' && isStr(value)) {
    return [value];
  }
  if (kind === 'text-list' && Array.isArray(value)) {
    return value;
  }
  if (kind === 'card' && isRecord(value)) {
    return [value.heading, value.body];
  }
  if (kind === 'milestone-list' && Array.isArray(value)) {
    return value.flatMap((milestone) => isRecord(milestone) ? [milestone.label, milestone.body] : []);
  }
  return [];
}

function visibleTextValues(slide, layout) {
  const values = [];
  if (!isRecord(slide) || !isRecord(layout?.slots)) {
    return values;
  }
  for (const [name, spec] of Object.entries(layout.slots)) {
    const value = slide[name];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    values.push(...slotTextValues(spec.kind, value));
  }
  return values.filter(isStr);
}

export function collectVisibleTextBySlide(deck, catalog) {
  return deck.slides.map((slide) => {
    const layout = catalog.layouts[slide.layout];
    const values = visibleTextValues(slide, layout);
    return [...new Set(values.filter(isStr).map((value) => value.trim()).filter(Boolean))];
  });
}

export function collectChartsBySlide(deck, catalog) {
  return deck.slides.map((slide) => {
    const layout = catalog.layouts[slide.layout];
    return Object.entries(layout.slots)
      .filter(([name, spec]) => spec.kind === 'chart' && isRecord(slide[name]))
      .map(([name]) => slide[name]);
  });
}

// Deck-level narrative contracts. These are what stop a "deck" from being a
// pile of slides, and they are cheap to check.
export function validateSpine(deck, catalog) {
  const e = [];
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  const layouts = slides.map((slide) => isRecord(slide) ? slide.layout : undefined);

  if (layouts[0] !== 'title') {
    e.push('slides[0] must use the "title" layout');
  }
  if (layouts.filter((l) => l === 'title').length > 1) {
    e.push('a deck has exactly one "title" slide');
  }

  if (layouts.at(-1) !== 'closing-cta') {
    e.push(`the last slide must use "closing-cta" (got "${layouts.at(-1)}")`);
  }
  if (layouts.filter((l) => l === 'closing-cta').length > 1) {
    e.push('a deck has exactly one "closing-cta" slide');
  }

  const dividers = layouts.filter((l) => l === 'section-divider').length;
  if (slides.length >= 8 && (dividers < 2 || dividers > 5)) {
    e.push(`a deck of ${slides.length} slides needs 2-5 "section-divider" slides (has ${dividers})`);
  }

  for (let i = 1; i < layouts.length; i++) {
    if (layouts[i] === layouts[i - 1] && layouts[i] !== 'bullets') {
      e.push(`slides[${i}] repeats the "${layouts[i]}" layout used by slides[${i - 1}]; vary the form`);
    }
  }

  if (deck.mode === 'live') {
    slides.forEach((s, i) => {
      if (!isRecord(s)) {
        return;
      }
      const n = countWords(s, catalog);
      if (n > 40) {
        e.push(`slides[${i}] carries ${n} words; a live slide caps at 40 (Mayer)`);
      }
    });
  }

  // an agenda promises sections; the deck must deliver them
  const agenda = slides.find((s) => isRecord(s) && s.layout === 'agenda');
  if (agenda && Array.isArray(agenda.items) && dividers > 0 && agenda.items.length !== dividers) {
    e.push(`the agenda lists ${agenda.items.length} items but the deck has ${dividers} section-dividers; they must correspond`);
  }
  return e;
}

export function countWords(slide, catalog) {
  if (!isRecord(slide)) {
    return 0;
  }
  const layout = catalog?.layouts?.[slide.layout];
  return visibleTextValues(slide, layout).reduce((total, value) => total + words(value), 0);
}
