// The render is not the artifact. These checks read the emitted PDF and PPTX
// bytes, because "it opens" proves nothing: pptxgenjs emits chart XML that
// python-pptx reads, LibreOffice renders, and PowerPoint refuses.

import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { CANVAS, ptToEmu } from './geometry.mjs';
import {
  chartRelationshipTargets,
  chartSummary,
  collapseWhitespace,
  slideTextBlocks,
  presentationSize,
} from './ooxml.mjs';
export { checkPdfFonts } from './artifact-policy.mjs';

const EXPECT_PT = { w: CANVAS.width, h: CANVAS.height };

/** PDF: page count and MediaBox, read from the raw bytes. */
export function verifyPdf(path, expectedPages) {
  const buf = readFileSync(path);
  const text = buf.toString('latin1');
  const findings = [];

  const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (expectedPages !== undefined && pageCount !== expectedPages) {
    findings.push({
      rule: 'pdf-page-count', severity: 'blocker',
      detail: `PDF has ${pageCount} pages, deck has ${expectedPages} slides`,
    });
  }

  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s*\]/g)]
    .map((m) => m.slice(1).map(Number));
  if (!boxes.length) {
    findings.push({ rule: 'pdf-no-mediabox', severity: 'blocker', detail: 'no /MediaBox found' });
  }
  boxes.forEach((b, i) => {
    const w = Math.abs(b[2] - b[0]);
    const h = Math.abs(b[3] - b[1]);
    // Chromium rounds the page box to ~1/72in; 1pt of slack is expected.
    if (Math.abs(w - EXPECT_PT.w) > 1.5 || Math.abs(h - EXPECT_PT.h) > 1.5) {
      findings.push({
        rule: 'pdf-page-size', severity: 'blocker',
        detail: `page ${i + 1} MediaBox is ${w}x${h}pt, expected ${EXPECT_PT.w}x${EXPECT_PT.h}pt`,
      });
    }
  });

  const fonts = [...new Set([...text.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-_,.]+)/g)].map((m) => m[1]))];
  return { pageCount, mediaBoxes: boxes.length, fonts, findings };
}

export function verifyPptx(
  path,
  {
    expectedSlides,
    expectedMedia = 0,
    expectedPictures = 0,
    requiredTextBySlide = [],
    expectedChartsBySlide = [],
  } = {},
) {
  const zip = unzipSync(readFileSync(path));
  const names = Object.keys(zip);
  const findings = [];
  const read = (n) => (zip[n] ? strFromU8(zip[n]) : '');

  checkCanvasSize(read('ppt/presentation.xml'), findings);

  const slideParts = names
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNumber(a) - slideNumber(b));
  if (expectedSlides !== undefined && slideParts.length !== expectedSlides) {
    findings.push({
      rule: 'pptx-slide-count', severity: 'blocker',
      detail: `pptx has ${slideParts.length} slides, deck has ${expectedSlides}`,
    });
  }

  const { shapes, pics, runs, textBlocksBySlide } = scanSlides(slideParts, read, findings);
  if (!runs) {
    findings.push({
      rule: 'pptx-no-text-runs', severity: 'blocker',
      detail: 'no <a:t> runs: the deck contains no editable text (every slide is an image)',
    });
  }

  const media = names.filter((n) => n.startsWith('ppt/media/') && !n.endsWith('/'));
  if (media.length !== expectedMedia) {
    findings.push({
      rule: 'pptx-image-count', severity: 'high',
      detail: `ppt/media/ has ${media.length} files but the emitter reported ${expectedMedia} unique media parts: ${media.slice(0, 6).join(', ')}`,
    });
  }
  if (pics !== expectedPictures) {
    findings.push({
      rule: 'pptx-picture-count', severity: 'high',
      detail: `${pics} <p:pic> elements but ${expectedPictures} image occurrences were declared`,
    });
  }

  for (const n of names.filter((x) => /^ppt\/charts\/chart\d+\.xml$/.test(x))) {
    checkChartPart(n, read(n), findings);
  }

  checkRequiredText(requiredTextBySlide, textBlocksBySlide, findings);
  checkChartRelationships(expectedChartsBySlide, { slideParts, zip, read }, findings);

  const placeholders = /\b(lorem|ipsum|TODO|TBD|xxx+|\[insert)\b/i.exec(textBlocksBySlide.flat().join('\n'));
  if (placeholders) {
    findings.push({
      rule: 'pptx-placeholder-text', severity: 'high',
      detail: `placeholder text survived into the deck: ${placeholders[0]}`,
    });
  }

  return { slides: slideParts.length, shapes, pics, runs, media: media.length, findings };
}

function checkCanvasSize(pres, findings) {
  const sldSz = presentationSize(pres);
  const want = { cx: ptToEmu(EXPECT_PT.w), cy: ptToEmu(EXPECT_PT.h) };
  if (!sldSz) {
    findings.push({ rule: 'pptx-no-sldsz', severity: 'blocker', detail: 'presentation.xml has no <p:sldSz>' });
  } else if (sldSz.cx !== want.cx || sldSz.cy !== want.cy) {
    findings.push({
      rule: 'pptx-canvas-size', severity: 'blocker',
      detail: `sldSz is ${sldSz.cx}x${sldSz.cy} EMU, expected ${want.cx}x${want.cy} (${EXPECT_PT.w}x${EXPECT_PT.h}pt). defineLayout must run before the first addSlide.`,
    });
  }
}

// Counts shapes, pictures and text runs per slide, and records per-slide
// color and stacked-data-label findings followed by one bad-color finding.
function scanSlides(slideParts, read, findings) {
  let shapes = 0;
  let pics = 0;
  let runs = 0;
  const textBlocksBySlide = [];
  const badColors = new Set();
  for (const n of slideParts) {
    const xml = read(n);
    shapes += (xml.match(/<p:sp>/g) || []).length;
    pics += (xml.match(/<p:pic>/g) || []).length;
    const body = slideTextBlocks(xml);
    runs += body.runs;
    textBlocksBySlide.push(body.blocks);
    for (const m of xml.matchAll(/<a:srgbClr val="([^"]*)"/g)) {
      if (!/^[0-9A-Fa-f]{6}$/.test(m[1])) {
        badColors.add(m[1]);
      }
    }
    checkStackedDataLabels(n, xml, findings);
  }
  if (badColors.size) {
    findings.push({
      rule: 'pptx-bad-color', severity: 'blocker',
      detail: `srgbClr values must be 6 hex digits: ${[...badColors].join(', ')}`,
    });
  }
  return { shapes, pics, runs, textBlocksBySlide };
}

function checkStackedDataLabels(n, xml, findings) {
  for (const m of xml.matchAll(/dLblPos val="([^"]*)"/g)) {
    if (m[1] === 'outEnd' && /val="(percent)?[Ss]tacked"/.test(xml)) {
      findings.push({
        rule: 'pptx-stacked-datalabel', severity: 'blocker',
        detail: `${n} uses dataLabelPosition outEnd on a stacked bar; PowerPoint refuses the file`,
      });
    }
  }
}

function checkChartPart(n, xml, findings) {
  if (!/<c:\w+Chart>/.test(xml)) {
    findings.push({
      rule: 'pptx-chart-no-plot', severity: 'blocker',
      detail: `${n} contains no <c:*Chart> plot element at all; addChart() with an unmapped type writes this and still resolves`,
    });
  }
  for (const g of xml.matchAll(/<c:(\w+Chart)>([\s\S]*?)<\/c:\1>/g)) {
    if (!/<c:ser>/.test(g[2])) {
      findings.push({
        rule: 'pptx-chart-no-series', severity: 'blocker',
        detail: `${n} <c:${g[1]}> contains zero <c:ser> elements; the chart frame renders empty`,
      });
    }
  }

  const declared = new Set();
  for (const m of xml.matchAll(/<c:(catAx|valAx|dateAx|serAx)>([\s\S]*?)<\/c:\1>/g)) {
    for (const id of m[2].matchAll(/<c:axId val="(\d+)"/g)) {
      declared.add(id[1]);
    }
  }
  for (const g of xml.matchAll(/<c:(\w+Chart)>([\s\S]*?)<\/c:\1>/g)) {
    checkPlotAxes(n, g, declared, findings);
  }
}

function checkPlotAxes(n, g, declared, findings) {
  const refs = [...g[2].matchAll(/<c:axId val="(\d+)"/g)].map((m) => m[1]);
  if (!refs.length) {
    return;
  }
  const live = refs.filter((r) => declared.has(r));
  const dangling = refs.filter((r) => !declared.has(r));
  if (live.length < 2) {
    findings.push({
      rule: 'pptx-chart-axes', severity: 'blocker',
      detail: `${n} <c:${g[1]}> resolves only ${live.length} axis part(s) (needs 2); PowerPoint discards the chart. Dangling axIds: ${dangling.join(', ')}`,
    });
  } else if (dangling.length) {
    findings.push({
      rule: 'pptx-chart-dangling-axid', severity: 'medium',
      detail: `${n} <c:${g[1]}> references axId ${dangling.join(', ')} that no axis part declares; `
        + `harmless while ${live.length} axes resolve, but it is the fault that becomes fatal if an axis is later removed`,
    });
  }
}

function checkRequiredText(requiredTextBySlide, textBlocksBySlide, findings) {
  requiredTextBySlide.forEach((strings, slideIndex) => {
    const blocks = textBlocksBySlide[slideIndex] ?? [];
    for (const text of strings) {
      const needle = collapseWhitespace(text);
      if (needle && !blocks.some((block) => block.includes(needle))) {
        findings.push({
          rule: 'pptx-missing-text', severity: 'blocker',
          detail: `slide ${slideIndex + 1} text is absent from its <a:t> bodies: ${JSON.stringify(needle.slice(0, 60))}`,
        });
      }
    }
  });
}

function checkChartRelationships(expectedChartsBySlide, { slideParts, zip, read }, findings) {
  expectedChartsBySlide.forEach((expectedCharts, slideIndex) => {
    const slidePart = slideParts[slideIndex];
    const relPart = slidePart
      ? `ppt/slides/_rels/${posix.basename(slidePart)}.rels`
      : '';
    const actualParts = chartRelationshipTargets(read(relPart))
      .map((target) => posix.normalize(posix.join('ppt/slides', target)));
    if (actualParts.length !== expectedCharts.length) {
      findings.push({
        rule: 'pptx-chart-count', severity: 'blocker',
        detail: `slide ${slideIndex + 1} has ${actualParts.length} chart relationships, expected ${expectedCharts.length}`,
      });
    }
    expectedCharts.forEach((expected, chartIndex) => {
      const part = actualParts[chartIndex];
      if (!part || !zip[part]) {
        return;
      }
      compareChart(expected, chartSummary(read(part)), slideIndex + 1, findings);
    });
  });
}

function compareChart(expected, actual, slideNumberValue, findings) {
  if (actual.type !== expected.type) {
    findings.push({
      rule: 'pptx-chart-type', severity: 'blocker',
      detail: `slide ${slideNumberValue} chart type is ${actual.type ?? 'missing'}, expected ${expected.type}`,
    });
  }
  if (actual.series.length !== expected.series.length) {
    findings.push({
      rule: 'pptx-chart-series-count', severity: 'blocker',
      detail: `slide ${slideNumberValue} chart has ${actual.series.length} series, expected ${expected.series.length}`,
    });
  }
  expected.series.forEach((series, index) => {
    const found = actual.series[index];
    if (!found) {
      return;
    }
    const expectedName = collapseWhitespace(series.name ?? `Series ${index + 1}`);
    if (found.name !== expectedName) {
      findings.push({
        rule: 'pptx-chart-series-name', severity: 'blocker',
        detail: `slide ${slideNumberValue} series ${index + 1} is ${JSON.stringify(found.name)}, expected ${JSON.stringify(expectedName)}`,
      });
    }
    const categories = expected.categories.map(collapseWhitespace);
    if (!sameArray(found.categories, categories)) {
      findings.push({
        rule: 'pptx-chart-categories', severity: 'blocker',
        detail: `slide ${slideNumberValue} series ${index + 1} categories do not match the IR`,
      });
    }
    if (!sameNumberArray(found.values, series.values)) {
      findings.push({
        rule: 'pptx-chart-values', severity: 'blocker',
        detail: `slide ${slideNumberValue} series ${index + 1} values do not match the IR`,
      });
    }
  });
}

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameNumberArray(left, right) {
  return left.length === right.length
    && left.every((value, index) => Number.isFinite(value) && Math.abs(value - right[index]) < 1e-9);
}

function slideNumber(path) {
  return Number(/slide(\d+)\.xml$/.exec(path)?.[1] ?? Number.MAX_SAFE_INTEGER);
}
