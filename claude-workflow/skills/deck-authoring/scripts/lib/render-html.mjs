// deck IR x theme x layout catalog -> a responsive 1920x1080 HTML slide viewer.
//
// Absolute positioning from the catalog's px boxes is deliberate: the same
// numbers feed the PPTX emitter, so what Chromium lays out and what PowerPoint
// receives cannot drift. Images use bounded relative assets; there are no
// external requests.

import { CANVAS, milestonePositions } from './geometry.mjs';
import { parseHex } from './color.mjs';
import { chartPresentation } from './chart.mjs';
import {
  chartStyleForBackground,
  cssFontStack,
  scrimFor,
  seriesFor,
} from './theme.mjs';

import { sanitizeHtmlText } from './html.mjs';

const px = (n) => `${+n.toFixed(2)}px`;

export function renderDeck(deck, catalog, theme, { mode = 'light' } = {}) {
  const m = theme.modes[mode];
  const slides = deck.slides
    .map((slide, i) => renderSlide(slide, catalog, theme, m, i))
    .join('\n');
  return `<!doctype html>
<html lang="en" data-mode="${sanitizeHtmlText(mode)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${sanitizeHtmlText(deck.title)}</title>
<script>
document.documentElement.dataset.render =
  new URLSearchParams(location.search).get('render') === 'artifact' ? 'artifact' : 'viewer';
</script>
<style>
${css(theme, m, mode)}
</style>
</head>
<body>
<main class="deck-stage" aria-label="${sanitizeHtmlText(deck.title)}">
<div class="deck-canvas">
${slides}
</div>
</main>
<nav class="deck-controls" aria-label="Slide navigation">
  <button type="button" data-nav="previous" aria-label="Previous slide">‹</button>
  <output class="deck-progress" aria-live="polite"></output>
  <button type="button" data-nav="next" aria-label="Next slide">›</button>
</nav>
${viewerScript()}
</body>
</html>
`;
}

function css(theme, m, mode) {
  const g = theme.grid;
  const scrim = scrimFor(theme);
  const fontDisplay = cssFontStack(theme.fontDisplay, 'fontDisplay');
  const fontBody = cssFontStack(theme.fontBody, 'fontBody');
  const fontMono = cssFontStack(theme.fontMono, 'fontMono');
  const { r, g: green, b } = parseHex(scrim.color);
  const scrimCss = `rgba(${r},${green},${b},${scrim.opacity})`;
  return `:root{
  --deck-canvas:${m.canvas}; --deck-surface:${m.surface};
  --deck-ink:${m.ink}; --deck-ink-secondary:${m.inkSecondary}; --deck-ink-muted:${m.inkMuted};
  --deck-rule:${m.rule}; --deck-accent:${m.accent}; --deck-accent-ink:${m.accentInk};
  --deck-positive:${m.positive}; --deck-negative:${m.negative}; --deck-warning:${m.warning};
  --deck-code-bg:${m.codeBg}; --deck-code-ink:${m.codeInk}; --deck-radius:${g ? theme.radius : 16}px;
  --deck-font-display:${fontDisplay}; --deck-font-body:${fontBody}; --deck-font-mono:${fontMono};
${seriesFor(theme, mode).map((c, i) => `  --deck-series-${i + 1}:${c};`).join('\n')}
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{
  margin:0; padding:0;
  background:#111; -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
@page{margin:0}
.deck-stage{margin:0}
.deck-canvas{width:${CANVAS.width}px}
.slide{
  position:relative; width:${CANVAS.width}px; height:${CANVAS.height}px;
  overflow:hidden; background:var(--deck-canvas); color:var(--deck-ink);
  font-family:var(--deck-font-body); page-break-after:always; break-after:page;
}
.slide[data-bg="accent"]{background:var(--deck-accent); color:var(--deck-accent-ink)}
.slide[data-bg="surface"]{background:var(--deck-surface)}
.slot{position:absolute}
.slot[data-kind="text"]{display:flex; flex-direction:column; justify-content:flex-start}
.t-display{font-family:var(--deck-font-display); font-weight:500; line-height:1.05; letter-spacing:-0.015em}
.t-title{font-family:var(--deck-font-display); font-weight:500; line-height:1.1}
.t-body{line-height:1.35}
.t-dek{color:var(--deck-ink-secondary); line-height:1.3}
.t-caption{color:var(--deck-ink-muted); line-height:1.3}
.slide[data-bg="accent"] .t-dek,.slide[data-bg="accent"] .t-caption{color:var(--deck-accent-ink); opacity:.85}
ul.items{list-style:none; display:flex; flex-direction:column; gap:24px}
ul.items>li{position:relative; padding-left:44px; line-height:1.3}
ul.items>li::before{
  content:""; position:absolute; left:0; top:.42em;
  width:16px; height:16px; border-radius:50%; background:var(--deck-accent);
}
.slide[data-bg="accent"] ul.items>li::before{background:var(--deck-accent-ink)}
.card{background:var(--deck-surface); border-radius:var(--deck-radius); padding:48px; display:flex; flex-direction:column; gap:24px; overflow:hidden}
.card .c-heading{font-family:var(--deck-font-display); font-weight:500; line-height:1.15; color:var(--deck-ink)}
.card .c-body{color:var(--deck-ink-secondary); line-height:1.35}
.value{font-family:var(--deck-font-display); font-weight:500; line-height:1; letter-spacing:-0.02em; color:var(--deck-accent)}
.slide[data-bg="accent"] .value{color:var(--deck-accent-ink)}
.rule{position:absolute; background:var(--deck-rule)}
img.fill{width:100%; height:100%; object-fit:cover; display:block}
.milestone{position:absolute}
.milestone .m-label{font-family:var(--deck-font-display); font-weight:500; line-height:1.2}
.milestone .m-body{color:var(--deck-ink-secondary); line-height:1.25}
.tl-axis{position:absolute; height:4px; background:var(--deck-rule)}
.tl-dot{position:absolute; width:24px; height:24px; border-radius:50%; background:var(--deck-accent)}
.slide[data-bg="accent"] .tl-dot{background:var(--deck-accent-ink)}
.chart{position:absolute}
.on-image{
  color:#FFFFFF; text-shadow:0 2px 8px rgba(0,0,0,.55);
  background:${scrimCss};
  padding:16px 24px; border-radius:8px; display:flex; align-items:center;
}
.pagenum.on-photo{color:#FFFFFF; text-shadow:0 2px 6px rgba(0,0,0,.7)}
.pagenum{position:absolute; right:44px; bottom:44px; font-size:24px; color:var(--deck-ink-muted)}
.slide[data-bg="accent"] .pagenum{color:var(--deck-accent-ink); opacity:.7}
.deck-controls{
  position:fixed; z-index:20; left:50%; bottom:18px; transform:translateX(-50%);
  display:flex; align-items:center; gap:16px; padding:8px 12px;
  color:#fff; background:rgba(2,8,29,.82); border-radius:999px;
  font:600 16px/1 system-ui,sans-serif;
}
.deck-controls button{
  width:36px; height:36px; border:1px solid rgba(255,255,255,.35); border-radius:50%;
  color:inherit; background:transparent; font:28px/1 system-ui,sans-serif; cursor:pointer;
}
.deck-controls button:focus-visible{outline:3px solid #02D6E8;outline-offset:2px}
.deck-progress{min-width:72px;text-align:center}
html[data-render="viewer"],html[data-render="viewer"] body{
  width:100%;height:100%;overflow:hidden;
}
html[data-render="viewer"] .deck-stage{
  position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;
}
html[data-render="viewer"] .deck-canvas{
  position:relative;height:${CANVAS.height}px;transform-origin:center center;
}
html[data-render="viewer"] .slide{position:absolute;inset:0;display:none;break-after:auto}
html[data-render="viewer"] .slide.is-active{display:block}
html[data-render="artifact"],html[data-render="artifact"] body{
  width:${CANVAS.width}px;min-height:${CANVAS.height}px;overflow-x:hidden;overflow-y:visible;
}
html[data-render="artifact"] .deck-stage{position:static;width:${CANVAS.width}px}
html[data-render="artifact"] .deck-canvas{height:auto;transform:none!important}
html[data-render="artifact"] .slide{display:block}
html[data-render="artifact"] .deck-controls{display:none}`;
}

function box(spec) {
  return `left:${px(spec.x)};top:${px(spec.y)};width:${px(spec.w)};height:${px(spec.h)}`;
}

function renderSlide(slide, catalog, theme, m, index) {
  const L = catalog.layouts[slide.layout];
  const bg = slide.background ?? L.background ?? null;
  const parts = [];

  for (const [name, spec] of Object.entries(L.slots)) {
    const v = slide[name];
    if (v === undefined || v === null || v === '') {
      continue;
    }
    parts.push(renderSlot(name, v, spec, theme, m, bg));
  }

  const numbered = !['title', 'section-divider', 'closing-cta'].includes(slide.layout);
  if (numbered) {
    const pn = L.pageNumber;
    const onPhoto = Boolean(pn && pn.onImage);
    const style = pn ? `left:${px(pn.x)};top:${px(pn.y)};right:auto;bottom:auto` : '';
    const photoClass = onPhoto ? ' on-photo' : '';
    const scrimAttr = onPhoto ? ' data-scrim="text-shadow"' : '';
    const styleAttr = style ? ` style="${style}"` : '';
    parts.push(
      `  <div class="pagenum${photoClass}"${scrimAttr} data-role="secondary"${styleAttr}>${index + 1}</div>`,
    );
  }

  const bgAttr = bg ? ` data-bg="${sanitizeHtmlText(bg)}"` : '';
  return `<section class="slide" data-layout="${sanitizeHtmlText(slide.layout)}"${bgAttr} data-index="${index + 1}">
${parts.filter(Boolean).join('\n')}
</section>`;
}

function renderSlot(name, v, spec, theme, m, background) {
  const common = `data-slot="${sanitizeHtmlText(name)}" data-kind="${sanitizeHtmlText(spec.kind)}"`;
  const bleed = spec.bleed ? ' data-bleed' : '';
  const align = spec.align === 'center' ? 'text-align:center;align-items:center;' : '';

  switch (spec.kind) {
    case 'text':
      return renderTextSlot(name, v, spec, { common, bleed, align });
    case 'text-list': {
      const items = v.map((t) => `<li>${sanitizeHtmlText(t)}</li>`).join('');
      const role = spec.secondary ? ' data-role="secondary"' : '';
      return `  <div class="slot" ${common}${role} style="${box(spec)};font-size:${px(spec.sizePx)}"><ul class="items">${items}</ul></div>`;
    }
    case 'card': {
      const heading = `<div class="c-heading" style="font-size:${px(spec.headingPx)}">${sanitizeHtmlText(v.heading)}</div>`;
      const body = v.body ? `<div class="c-body" style="font-size:${px(spec.bodyPx)}">${sanitizeHtmlText(v.body)}</div>` : '';
      return `  <div class="slot card" ${common} style="${box(spec)}">${heading}${body}</div>`;
    }
    case 'milestone-list':
      return renderMilestones(v, spec);
    case 'image': {
      const src = typeof v === 'string' ? v : v.src;
      const alt = typeof v === 'string' ? '' : (v.alt ?? '');
      return `  <div class="slot" ${common}${bleed} style="${box(spec)}"><img class="fill" src="${sanitizeHtmlText(src)}" alt="${sanitizeHtmlText(alt)}"></div>`;
    }
    case 'chart': {
      // Layout-only placeholder: the geometry is harvested and the chart is
      // emitted as a NATIVE pptx chart. Rendered here as an inline SVG so the
      // HTML and PDF show real data.
      return `  <div class="slot chart" ${common} style="${box(spec)}">${renderChartSvg(v, spec, theme, m, background)}</div>`;
    }
    default:
      return '';
  }
}

function renderTextSlot(name, v, spec, { common, bleed, align }) {
  const cls = `${textClass(name, spec)}${spec.onImage ? ' on-image' : ''}`;
  const role = /^caption/.test(name) ? ' data-role="caption"' : '';
  const scrim = spec.onImage ? ' data-scrim="0.72"' : '';
  return `  <div class="slot ${cls}" ${common}${role}${scrim}${bleed} style="${box(spec)};${align}font-size:${px(spec.sizePx)}">${sanitizeHtmlText(v)}</div>`;
}

function renderMilestones(v, spec) {
  const pos = milestonePositions(spec, v.length);
  const axisY = pos[0].y - 40;
  // End the axis at the LAST DOT, not at the last slot's right edge: the slot
  // is a full text column, so using its width leaves a dangling rule.
  const axisW = pos.at(-1).x - pos[0].x + 24;
  const axis = `  <div class="tl-axis" style="left:${px(pos[0].x + 12)};top:${px(axisY)};width:${px(axisW - 12)}"></div>`;
  const stops = v
    .map((mst, i) => {
      const p = pos[i];
      const dot = `  <div class="tl-dot" style="left:${px(p.x)};top:${px(axisY - 10)}"></div>`;
      const label = `<div class="m-label" style="font-size:${px(spec.labelPx)}">${sanitizeHtmlText(mst.label)}</div>`;
      const body = mst.body ? `<div class="m-body" data-role="secondary" style="font-size:${px(spec.bodyPx)};margin-top:12px">${sanitizeHtmlText(mst.body)}</div>` : '';
      const style = `left:${px(p.x)};top:${px(p.y)};width:${px(p.w)}`;
      return `${dot}\n  <div class="slot milestone" data-slot="milestone-${i + 1}" data-kind="text" data-role="secondary" style="${style}">${label}${body}</div>`;
    })
    .join('\n');
  return `${axis}\n${stops}`;
}

function textClass(name, spec) {
  // Order matters: a value slot is accent-colored at ANY size, so it must be
  // matched before the size-based display tier.
  if (name === 'value' || /^value\d$/.test(name)) {
    return 'value';
  }
  if (spec.sizePx >= 96) {
    return 't-display';
  }
  if (name === 'dek' || name === 'takeaway' || name === 'attribution') {
    return 't-dek';
  }
  if (name === 'caption' || /^caption\d$/.test(name)) {
    return 't-caption';
  }
  if (spec.sizePx >= 54) {
    return 't-title';
  }
  return 't-body';
}

// Minimal, dependency-free chart SVG. Direct labels, no legend, no gridlines
// beyond a baseline: one message per chart.
function renderChartSvg(chart, spec, theme, m, background) {
  // Pie and doughnut are not cartesian: they have no axes, no category row and
  // no trend line. Sending them down the shared path drew a POLYLINE while the
  // pptx correctly emitted <c:pieChart>, so the two outputs disagreed.
  if (chart.type === 'pie' || chart.type === 'doughnut') {
    return renderPieSvg(chart, spec, theme, m, background);
  }
  const W = spec.w;
  const H = spec.h;
  const presentation = chartPresentation(chart);
  const pad = { l: 8, r: 24, t: 8, b: presentation.showLegend ? 132 : 96 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const series = chart.series;
  const cats = chart.categories;
  const zeroBased = chart.type === 'bar';
  const max = presentation.max;
  const min = presentation.min;
  const span = max - min || 1;
  const y = (v) => pad.t + plotH - ((v - min) / span) * plotH;
  const mode = m === theme.modes.dark ? 'dark' : 'light';
  const colors = seriesFor(theme, mode, background);
  const chartStyle = chartStyleForBackground(m, background);
  const parts = [];

  const axisFloorY = zeroBased ? y(Math.max(0, min)) : pad.t + plotH;
  const areaFloorY =
    chart.type === 'area' && min < 0 && max > 0
      ? y(0)
      : axisFloorY;
  parts.push(`<line x1="${pad.l}" y1="${axisFloorY.toFixed(1)}" x2="${pad.l + plotW}" y2="${axisFloorY.toFixed(1)}" stroke="${chartStyle.rule}" stroke-width="3"/>`);
  if (presentation.zoomed) {
    const noteY = (pad.t + plotH + 76).toFixed(1);
    const note = sanitizeHtmlText(presentation.axisNote);
    parts.push(`<text x="${pad.l}" y="${noteY}" font-size="24" fill="${chartStyle.muted}" font-family="var(--deck-font-body)">${note}</text>`);
  }

  if (chart.type === 'bar') {
    const groupW = plotW / cats.length;
    const barW = (groupW * 0.62) / series.length;
    cats.forEach((c, ci) => {
      series.forEach((s, si) => {
        const v = s.values[ci];
        if (typeof v !== 'number') {
          return;
        }
        const x = pad.l + ci * groupW + groupW * 0.19 + si * barW;
        const top = Math.min(y(v), y(0));
        const h = Math.abs(y(v) - y(0));
        parts.push(`<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${(barW * 0.88).toFixed(1)}" height="${h.toFixed(1)}" fill="${colors[si % colors.length]}" rx="4"/>`);
      });
    });
  } else {
    const step = cats.length > 1 ? plotW / (cats.length - 1) : 0;
    series.forEach((s, si) => {
      const pts = s.values
        .map((v, i) => (typeof v === 'number' ? `${(pad.l + i * step).toFixed(1)},${y(v).toFixed(1)}` : null))
        .filter(Boolean)
        .join(' ');
      const color = colors[si % colors.length];
      if (chart.type === 'area') {
        const floorY = areaFloorY.toFixed(1);
        const lastX = (pad.l + (cats.length - 1) * step).toFixed(1);
        parts.push(`<polygon points="${pad.l},${floorY} ${pts} ${lastX},${floorY}" fill="${color}" opacity="0.18"/>`);
      }
      parts.push(`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`);
    });
  }

  const lineStepX = cats.length > 1 ? plotW / (cats.length - 1) : 0;
  const stepX = chart.type === 'bar' ? plotW / cats.length : lineStepX;
  cats.forEach((c, i) => {
    const cx = chart.type === 'bar' ? pad.l + i * stepX + stepX / 2 : pad.l + i * stepX;
    // A middle-anchored label at the first/last category overhangs the plot box
    // by half its width, which pushes it outside the slide's safe area. Anchor
    // the end labels inward instead of centering them.
    const first = i === 0;
    const last = i === cats.length - 1;
    let anchor = 'middle';
    if (first) {
      anchor = 'start';
    } else if (last) {
      anchor = 'end';
    }
    const labelY = (pad.t + plotH + 44).toFixed(1);
    parts.push(
      `<text x="${cx.toFixed(1)}" y="${labelY}" font-size="28" fill="${chartStyle.muted}" text-anchor="${anchor}" `
      + `font-family="var(--deck-font-body)">${sanitizeHtmlText(c)}</text>`,
    );
  });
  if (presentation.showLegend) {
    parts.push(renderLegend(series, colors, W, H, chartStyle.ink));
  }

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${sanitizeHtmlText(chart.title ?? 'chart')}">${parts.join('')}</svg>`;
}

function renderLegend(series, colors, width, height, ink) {
  const itemWidth = width / series.length;
  return series.map((entry, index) => {
    const x = index * itemWidth + 12;
    const y = height - 26;
    const label = sanitizeHtmlText(entry.name ?? `Series ${index + 1}`);
    return (
      `<rect x="${x.toFixed(1)}" y="${(y - 18).toFixed(1)}" width="22" height="22" rx="5" fill="${colors[index % colors.length]}"/>` +
      `<text x="${(x + 34).toFixed(1)}" y="${y.toFixed(1)}" font-size="24" fill="${ink}" font-family="var(--deck-font-body)">${label}</text>`
    );
  }).join('');
}

// Pie/doughnut. PowerPoint plots only the FIRST series for these types, so the
// HTML does the same rather than inventing a multi-ring chart the pptx cannot
// express. Slices are real SVG arcs with a direct percentage label; no legend.
function renderPieSvg(chart, spec, theme, m, background) {
  const W = spec.w;
  const H = spec.h;
  const mode = m === theme.modes.dark ? 'dark' : 'light';
  const colors = seriesFor(theme, mode, background);
  const chartStyle = chartStyleForBackground(m, background);
  const labelGutter = 340; // room for the direct labels beside the disc
  const cx = (W - labelGutter) / 2;
  const cy = H / 2;
  const R = Math.max(40, Math.min((W - labelGutter) / 2, H / 2) - 24);
  const rInner = chart.type === 'doughnut' ? R * 0.58 : 0;

  const labelFrame = { W, H, gutter: labelGutter, cy, ink: chartStyle.ink };
  const src = chart.series[0];
  const raw = (src?.values ?? []).map((v) => (typeof v === 'number' && v > 0 ? v : 0));
  const total = raw.reduce((a, b) => a + b, 0);
  const parts = [];

  if (total <= 0) {
    // Nothing to draw: say so rather than emit an empty disc that reads as a bug.
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="no positive values">`
      + `<text x="${(W / 2).toFixed(1)}" y="${(H / 2).toFixed(1)}" font-size="36" fill="${chartStyle.muted}" text-anchor="middle" `
      + 'font-family="var(--deck-font-body)">No positive values to plot</text></svg>';
  }

  // A single slice at exactly 360deg is the arc-math trap: start and end points
  // coincide, so the path collapses to nothing. Draw a full circle instead.
  const positive = raw.filter((v) => v > 0).length;
  if (positive === 1) {
    const i = raw.findIndex((v) => v > 0);
    const color = colors[i % colors.length];
    parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="${color}"/>`);
    if (rInner > 0) {
      parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rInner.toFixed(1)}" fill="${chartStyle.background}"/>`);
    }
    parts.push(pieLabel(labelFrame, color, `${sanitizeHtmlText(chart.categories[i] ?? '')} 100%`, 0, 1));
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${sanitizeHtmlText(chart.title ?? 'pie chart')}">${parts.join('')}</svg>`;
  }

  const pt = (angle, r) => {
    const a = (angle - 90) * (Math.PI / 180); // 0deg at 12 o'clock
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  let start = 0;
  let labelRow = 0;
  const labelRows = raw.filter((value) => value > 0).length;
  raw.forEach((v, i) => {
    if (v <= 0) {
      return;
    }
    const sweep = (v / total) * 360;
    const end = start + sweep;
    const large = sweep > 180 ? 1 : 0;
    const [x0, y0] = pt(start, R);
    const [x1, y1] = pt(end, R);
    const color = colors[i % colors.length];
    let d;
    if (rInner > 0) {
      const [ix1, iy1] = pt(end, rInner);
      const [ix0, iy0] = pt(start, rInner);
      d = `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R.toFixed(1)} ${R.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} `
        + `L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${rInner.toFixed(1)} ${rInner.toFixed(1)} 0 ${large} 0 ${ix0.toFixed(1)} ${iy0.toFixed(1)} Z`;
    } else {
      d = `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R.toFixed(1)} ${R.toFixed(1)} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
    }
    parts.push(`<path d="${d}" fill="${color}"/>`);
    const pctNum = (v / total) * 100;
    const pct = pctNum >= 10 ? Math.round(pctNum) : pctNum.toFixed(1);
    parts.push(pieLabel(labelFrame, color, `${sanitizeHtmlText(chart.categories[i] ?? '')} ${pct}%`, labelRow, labelRows));
    labelRow++;
    start = end;
  });

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${sanitizeHtmlText(chart.title ?? 'pie chart')}">${parts.join('')}</svg>`;
}

// Direct labels in a stacked rail beside the disc: a legend forces the reader to
// look twice, and a leader line into a thin slice is unreadable at 28px.
function pieLabel({ W, H, gutter, cy, ink }, color, text, row, rows) {
  const x = W - gutter + 16;
  const labelMargin = 40;
  const rowH = rows > 1
    ? Math.min(46, (H - 2 * labelMargin) / (rows - 1))
    : 0;
  const y = rows > 1 ? labelMargin + row * rowH : cy;
  return (
    `<rect x="${x.toFixed(1)}" y="${(y - 22).toFixed(1)}" width="24" height="24" rx="6" fill="${color}"/>` +
    `<text x="${(x + 38).toFixed(1)}" y="${y.toFixed(1)}" font-size="28" fill="${ink}" font-family="var(--deck-font-body)">${text}</text>`
  );
}

function viewerScript() {
  return `<script>
(() => {
  if (document.documentElement.dataset.render === 'artifact') return;
  const canvas = document.querySelector('.deck-canvas');
  const slides = [...document.querySelectorAll('.slide')];
  const progress = document.querySelector('.deck-progress');
  let current = Math.max(0, Math.min(slides.length - 1, Number((location.hash.match(/slide-(\\d+)/) || [])[1] || 1) - 1));
  let wheelLocked = false;

  const fit = () => {
    const scale = Math.min(innerWidth / ${CANVAS.width}, innerHeight / ${CANVAS.height});
    canvas.style.transform = \`scale(\${scale})\`;
  };
  const show = (next) => {
    current = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    progress.textContent = \`\${current + 1} / \${slides.length}\`;
    try { history.replaceState(null, '', \`#slide-\${current + 1}\`); } catch {}
  };
  const advance = (delta) => show(current + delta);

  document.querySelector('[data-nav="previous"]').addEventListener('click', () => advance(-1));
  document.querySelector('[data-nav="next"]').addEventListener('click', () => advance(1));
  addEventListener('resize', fit);
  addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      advance(1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      advance(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      show(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      show(slides.length - 1);
    }
  });
  addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) < 20 || wheelLocked) return;
    event.preventDefault();
    wheelLocked = true;
    advance(event.deltaY > 0 ? 1 : -1);
    setTimeout(() => { wheelLocked = false; }, 350);
  }, { passive: false });

  let touchX = null;
  addEventListener('touchstart', (event) => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
  addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const end = event.changedTouches[0]?.clientX ?? touchX;
    if (Math.abs(end - touchX) > 50) advance(end < touchX ? 1 : -1);
    touchX = null;
  }, { passive: true });

  fit();
  show(current);
})();
</script>`;
}
