// deck IR + catalog + theme -> a REAL editable .pptx: native <p:sp> text boxes,
// native tables and native charts. Nothing is a slide-sized image.
//
// Footguns encoded here, each of which silently corrupts or loses content:
//  - defineLayout MUST precede the first addSlide, or the canvas is the 10x5.625in default
//  - colors are 6 hex digits with NO leading '#' and no alpha
//  - out-of-canvas coordinates are written unclamped: the shape just vanishes
//  - fonts are resolved by NAME on the viewer's machine; nothing is embedded

import PptxGenJS from 'pptxgenjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { unzipSync, zipSync } from 'fflate';
import { CANVAS, pxToInches, milestonePositions } from './geometry.mjs';
import { chartPresentation } from './chart.mjs';
import {
  chartStyleForBackground,
  scrimFor,
  seriesFor,
  valueInkForBackground,
} from './theme.mjs';
import { dedupePptxMediaParts, hex } from './ooxml.mjs';
import { coverCropGeometry } from './assets.mjs';

export { hex };

const IN_W = pxToInches(CANVAS.width); // 26.6667
const IN_H = pxToInches(CANVAS.height); // 15

const inches = (px) => +pxToInches(px).toFixed(4);

/** Font size in points. 1px == 1pt on this canvas, so this is an identity. */
const pt = (px) => +px.toFixed(1);

function assertOnCanvas(where, x, y, w, h) {
  const eps = 0.01;
  if (x < -eps || y < -eps || x + w > IN_W + eps || y + h > IN_H + eps) {
    throw new Error(
      `${where} is outside the ${IN_W}x${IN_H}in canvas (x=${x} y=${y} w=${w} h=${h}); pptxgenjs would write it unclamped and the shape would be invisible`,
    );
  }
}

function assertBleedIntersectsCanvas(where, x, y, w, h) {
  if (w <= 0 || h <= 0 || x + w <= 0 || y + h <= 0 || x >= IN_W || y >= IN_H) {
    throw new Error(`${where} is marked bleed but does not intersect the slide canvas`);
  }
}

export async function emitPptx(deck, catalog, theme, { mode = 'light', outPath }) {
  const m = theme.modes[mode];
  const pres = new PptxGenJS();

  // BEFORE any addSlide. LAYOUT_16x9 is 10x5.625in despite the name.
  pres.defineLayout({ name: 'DEE', width: IN_W, height: IN_H });
  pres.layout = 'DEE';
  pres.title = deck.title;

  // This renderer consumes the explicit display/body faces. The shared theme
  // validator also requires pptxFontFallback for the template-based exporter.
  for (const field of ['pptxFontDisplay', 'pptxFontBody']) {
    if (typeof theme[field] !== 'string' || !theme[field].trim()) {
      throw new Error(`theme.${field} must be a non-empty PowerPoint font face`);
    }
  }
  const display = theme.pptxFontDisplay;
  const body = theme.pptxFontBody;
  const scrim = scrimFor(theme);

  deck.slides.forEach((slide, index) => {
    const L = catalog.layouts[slide.layout];
    const s = pres.addSlide();
    const bgRole = slide.background ?? L.background ?? null;
    s.background = { color: hex(backgroundColor(m, bgRole)) };
    const ink = bgRole === 'accent' ? m.accentInk : m.ink;
    const inkSecondary = bgRole === 'accent' ? m.accentInk : m.inkSecondary;
    const valueInk = valueInkForBackground(m, bgRole);
    const chartStyle = chartStyleForBackground(m, bgRole);
    const series = seriesFor(theme, mode, bgRole).map(hex);

    for (const [name, spec] of Object.entries(L.slots)) {
      const v = slide[name];
      if (v === undefined || v === null || v === '') {
        continue;
      }
      emitSlot({
        s,
        name,
        v,
        spec,
        m,
        ink,
        inkSecondary,
        valueInk,
        chartStyle,
        display,
        body,
        series,
        scrim,
      });
    }

    if (!['title', 'section-divider', 'closing-cta'].includes(slide.layout)) {
      addPageNumber(s, L.pageNumber, index, { m, bgRole, body });
    }
    if (slide.notes) {
      s.addNotes(String(slide.notes));
    }
  });

  await pres.writeFile({ fileName: outPath });
  return { path: outPath, ...dedupePptxMedia(outPath) };
}

function backgroundColor(m, bgRole) {
  if (bgRole === 'accent') {
    return m.accent;
  }
  if (bgRole === 'surface') {
    return m.surface;
  }
  return m.canvas;
}

function addPageNumber(s, pn, index, { m, bgRole, body }) {
  const pageNumberOnImage = Boolean(pn?.onImage);
  const mutedInk = bgRole === 'accent' ? m.accentInk : m.inkMuted;
  s.addText(String(index + 1), {
    x: inches(pn ? pn.x - 60 : 1780), y: inches(pn ? pn.y : 990), w: inches(90), h: inches(40),
    fontSize: pt(24), fontFace: body,
    color: pageNumberOnImage ? 'FFFFFF' : hex(mutedInk),
    shadow: pageNumberOnImage
      ? { type: 'outer', color: '000000', opacity: 0.7, blur: 6, angle: 45, distance: 2 }
      : undefined,
    align: 'right', valign: 'middle', margin: 0,
  });
}

export function dedupePptxMedia(path) {
  const files = unzipSync(readFileSync(path));
  const result = dedupePptxMediaParts(files);
  if (result.removedDuplicateMedia > 0) {
    writeFileSync(path, zipSync(files, { level: 6 }));
  }
  return result;
}

function emitSlot(ctx) {
  const { name, spec } = ctx;
  const geo = spec.x !== undefined
    ? { x: inches(spec.x), y: inches(spec.y), w: inches(spec.w), h: inches(spec.h) }
    : null;
  if (geo) {
    if (spec.bleed) {
      assertBleedIntersectsCanvas(`slot ${name}`, geo.x, geo.y, geo.w, geo.h);
    } else {
      assertOnCanvas(`slot ${name}`, geo.x, geo.y, geo.w, geo.h);
    }
  }

  switch (spec.kind) {
    case 'text':
      emitText(ctx, geo);
      break;
    case 'text-list':
      emitTextList(ctx, geo);
      break;
    case 'card':
      emitCard(ctx, geo);
      break;
    case 'milestone-list':
      emitMilestones(ctx);
      break;
    case 'image':
      emitImage(ctx, geo);
      break;
    case 'chart':
      emitChart(ctx, geo);
      break;
    default:
      throw new Error(`emit-pptx: unsupported slot kind ${spec.kind}`);
  }
}

function textInk({ name, ink, inkSecondary, valueInk }) {
  const isValue = name === 'value' || /^value\d$/.test(name);
  if (isValue) {
    return valueInk;
  }
  const isMuted = ['dek', 'takeaway', 'attribution'].includes(name) || /^caption/.test(name);
  return isMuted ? inkSecondary : ink;
}

function emitText(ctx, geo) {
  const { s, name, v, spec, display, body, scrim } = ctx;
  if (spec.onImage) {
    s.addShape('roundRect', {
      ...geo,
      fill: { color: hex(scrim.color), transparency: Math.round((1 - scrim.opacity) * 100) },
      line: { width: 0 },
      rectRadius: 0.06,
    });
    s.addText(String(v), {
      ...geo,
      fontSize: pt(spec.sizePx), fontFace: body, color: 'FFFFFF',
      align: spec.align === 'center' ? 'center' : 'left', valign: 'middle',
      margin: [16, 24, 16, 24], isTextBox: true, shrinkText: false,
    });
    return;
  }
  const isValue = name === 'value' || /^value\d$/.test(name);
  s.addText(String(v), {
    ...geo,
    fontSize: pt(spec.sizePx),
    fontFace: spec.sizePx >= 54 || isValue ? display : body,
    color: hex(textInk(ctx)),
    align: spec.align === 'center' ? 'center' : 'left',
    valign: spec.align === 'center' ? 'middle' : 'top',
    lineSpacingMultiple: textLineSpacing(name, spec),
    margin: 0,
    // Do NOT enable shrink-to-fit: it silently breaks the type ramp and the
    // legibility floor. Overflow is caught by the verify pass instead.
    shrinkText: false,
    isTextBox: true,
  });
}

function emitTextList({ s, v, spec, ink, body }, geo) {
  s.addText(
    v.map((t) => ({ text: String(t), options: { bullet: { indent: 24 }, breakLine: true } })),
    {
      ...geo,
      fontSize: pt(spec.sizePx),
      fontFace: body,
      color: hex(ink),
      lineSpacingMultiple: 1.3,
      paraSpaceAfter: pt(spec.sizePx * 0.5),
      margin: 0,
      shrinkText: false,
      isTextBox: true,
    },
  );
}

function emitCard({ s, v, spec, m, display, body }, geo) {
  s.addShape('roundRect', {
    ...geo,
    fill: { color: hex(m.surface) },
    line: { color: hex(m.surface), width: 0 },
    rectRadius: 0.22,
  });
  const padX = inches(48);
  const padY = inches(48);
  const inner = { x: geo.x + padX, y: geo.y + padY, w: geo.w - padX * 2 };
  s.addText(String(v.heading), {
    ...inner, h: inches(spec.headingPx * 1.3),
    fontSize: pt(spec.headingPx), fontFace: display, color: hex(m.ink),
    margin: 0, isTextBox: true, shrinkText: false,
  });
  if (v.body) {
    s.addText(String(v.body), {
      ...inner,
      y: inner.y + inches(spec.headingPx * 1.3 + 24),
      h: geo.h - padY * 2 - inches(spec.headingPx * 1.3 + 24),
      fontSize: pt(spec.bodyPx), fontFace: body, color: hex(m.inkSecondary),
      lineSpacingMultiple: 1.35, margin: 0, isTextBox: true, shrinkText: false,
    });
  }
}

function emitMilestones({ s, v, spec, m, ink, inkSecondary, valueInk, display, body }) {
  const pos = milestonePositions(spec, v.length);
  const axisY = pos[0].y - 40;
  // Axis ends at the last dot (see render-html): a full-slot width leaves
  // a dangling rule past the final milestone.
  s.addShape('rect', {
    x: inches(pos[0].x + 12), y: inches(axisY),
    w: inches(pos.at(-1).x - pos[0].x + 12), h: inches(4),
    fill: { color: hex(m.rule) }, line: { width: 0 },
  });
  v.forEach((mst, i) => {
    const p = pos[i];
    s.addShape('ellipse', {
      x: inches(p.x), y: inches(axisY - 10), w: inches(24), h: inches(24),
      fill: { color: hex(valueInk) }, line: { width: 0 },
    });
    s.addText(String(mst.label), {
      x: inches(p.x), y: inches(p.y), w: inches(p.w), h: inches(spec.labelPx * 1.4),
      fontSize: pt(spec.labelPx), fontFace: display, color: hex(ink),
      margin: 0, isTextBox: true, shrinkText: false,
    });
    if (mst.body) {
      s.addText(String(mst.body), {
        x: inches(p.x), y: inches(p.y + spec.labelPx * 1.4 + 12), w: inches(p.w), h: inches(spec.bodyPx * 3),
        fontSize: pt(spec.bodyPx), fontFace: body, color: hex(inkSecondary),
        lineSpacingMultiple: 1.25, margin: 0, isTextBox: true, shrinkText: false,
      });
    }
  });
}

function emitImage({ s, v }, geo) {
  const src = typeof v === 'string' ? v : v.src;
  const source = src.startsWith('data:') ? { data: src } : { path: src };
  const altText = typeof v === 'object' && typeof v.alt === 'string' ? v.alt : '';
  const width = typeof v === 'object' ? v.width : undefined;
  const height = typeof v === 'object' ? v.height : undefined;
  s.addImage({
    ...source,
    ...coverCropGeometry(width, height, geo),
    altText,
  });
}

function dataLabelPosition(type, presentation) {
  if (type === 'bar') {
    return 'outEnd';
  }
  return presentation.polar ? 'bestFit' : undefined;
}

function emitChart({ s, v, m, chartStyle, body, series }, geo) {
  const type = { bar: 'bar', line: 'line', area: 'area', pie: 'pie', doughnut: 'doughnut' }[v.type];
  if (!type) {
    throw new Error(`emit-pptx: unsupported chart type ${JSON.stringify(v.type)}`);
  }
  const presentation = chartPresentation(v);
  const data = v.series.map((ser, i) => ({
    name: ser.name ?? `Series ${i + 1}`,
    labels: v.categories,
    values: ser.values,
  }));
  const noteHeight = presentation.zoomed ? inches(36) : 0;
  const chartGeo = { ...geo, h: geo.h - noteHeight };
  s.addChart(type, data, {
    ...chartGeo,
    chartColors: series,
    showLegend: presentation.showLegend,
    legendPos: presentation.polar ? 'r' : 'b',
    legendFontFace: body,
    legendFontSize: pt(24),
    legendColor: hex(chartStyle.ink),
    showPercent: presentation.polar,
    showValue: false,
    catAxisLabelFontSize: pt(24),
    valAxisLabelFontSize: pt(24),
    catAxisLabelFontFace: body,
    valAxisLabelFontFace: body,
    catAxisLabelColor: hex(chartStyle.muted),
    valAxisLabelColor: hex(chartStyle.muted),
    catAxisLineColor: hex(chartStyle.rule),
    catAxisLineShow: !presentation.polar,
    valAxisLineShow: false,
    valGridLine: { style: 'none' },
    chartArea: { fill: { transparency: 100 }, border: { color: hex(m.canvas), transparency: 100 } },
    plotArea: { fill: { transparency: 100 }, border: { color: hex(m.canvas), transparency: 100 } },
    dataLabelColor: hex(chartStyle.ink),
    dataLabelFontFace: body,
    dataLabelFontSize: pt(24),
    dataLabelPosition: dataLabelPosition(type, presentation),
    barGrouping: 'clustered',
    ...(presentation.polar ? {} : {
      valAxisMinVal: presentation.min,
      valAxisMaxVal: presentation.max,
    }),
  });
  if (presentation.zoomed) {
    s.addText(presentation.axisNote, {
      x: geo.x,
      y: geo.y + geo.h - noteHeight,
      w: geo.w,
      h: noteHeight,
      fontSize: pt(24),
      fontFace: body,
      color: hex(chartStyle.muted),
      margin: 0,
      isTextBox: true,
      shrinkText: false,
    });
  }
}

function textLineSpacing(name, spec) {
  if (name === 'value' || /^value\d$/.test(name)) {
    return 1;
  }
  if (spec.sizePx >= 96) {
    return 1.05;
  }
  if (spec.sizePx >= 54) {
    return 1.1;
  }
  if (name === 'dek' || name === 'takeaway' || name === 'attribution' || /^caption/.test(name)) {
    return 1.3;
  }
  return 1.35;
}
