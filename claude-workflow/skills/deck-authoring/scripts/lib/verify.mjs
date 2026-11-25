// Chromium session: settle deterministically, run the in-page probe, emit the
// PDF, harvest geometry. One browser launch per build.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CANVAS, pxToInches } from './geometry.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROBE = join(HERE, '..', 'probe', 'layout-audit.js');
// cowork-setup.sh unpacks the shared libraries the Cowork VM image lacks here.
const BROWSER_LIBS = join(HERE, '..', '.browser-libs');

/** The browser's environment: `base`, with `libs` first on the loader path when given. */
export function browserEnv(base, libs) {
  if (!libs) {
    return base;
  }
  return { ...base, LD_LIBRARY_PATH: base.LD_LIBRARY_PATH ? `${libs}:${base.LD_LIBRARY_PATH}` : libs };
}

/**
 * The first line of a Playwright launch error. When that line is only the
 * `browserType.launch:` prefix, the cause follows on the next line, often boxed.
 */
export function launchCause(message) {
  const lines = message.split('\n').map((l) => l.replace(/[║╔╗╚╝═]/g, '').trim()).filter(Boolean);
  return lines[0]?.endsWith(':') && lines[1] ? `${lines[0]} ${lines[1]}` : (lines[0] ?? '');
}

/**
 * Launch Chromium, preferring the bundled browser and falling back to the
 * system Chrome channel. The fallback is not cosmetic: playwright's headless
 * default needs a separate `chrome-headless-shell` download, and a cached
 * `chromium-NNNN` alone throws on launch.
 */
export async function launch() {
  const { chromium } = await import('playwright');
  const env = browserEnv(process.env, existsSync(BROWSER_LIBS) ? BROWSER_LIBS : undefined);
  const attempts = [
    { label: 'bundled-chromium', opts: { env } },
    { label: 'system-chrome', opts: { env, channel: 'chrome' } },
  ];
  const errors = [];
  for (const a of attempts) {
    try {
      const browser = await chromium.launch(a.opts);
      return { browser, launcher: a.label };
    } catch (err) {
      errors.push(`${a.label}: ${launchCause(err.message)}`);
    }
  }
  throw new Error(
    `could not launch Chromium.\n  ${errors.join('\n  ')}\n` +
      'Fix: run `aix setup` to provision the mirrored browser, or install Google Chrome; ' +
      'in Claude Cowork run scripts/cowork-setup.sh',
  );
}

/** Deterministic settle. No sleeps: fonts, then images, then two frames. */
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.all(
      imgs.map((i) => new Promise((res) => {
        i.addEventListener('load', res, { once: true });
        i.addEventListener('error', res, { once: true });
      })),
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

export async function auditPage(page, probeOptions = {}) {
  const src = readFileSync(PROBE, 'utf8');
  await page.addScriptTag({ content: src });
  return page.evaluate((opts) => globalThis.__deckAudit(opts), probeOptions);
}

export async function openDeck(browser, htmlPath) {
  const page = await browser.newPage({
    viewport: { width: CANVAS.width, height: CANVAS.height },
    deviceScaleFactor: 1,
  });
  await page.goto(deckUrl(htmlPath, 'artifact'), { waitUntil: 'load' });
  await settle(page);
  return page;
}

export function deckUrl(htmlPath, render = 'viewer') {
  const url = pathToFileURL(htmlPath);
  if (render === 'artifact') {
    url.searchParams.set('render', 'artifact');
  }
  return url.href;
}

/**
 * Slide PDF. All three of screen media, printBackground and an exact page size
 * are required: page.pdf() defaults to PRINT media, where a stock
 * `@media print` rule repaints a dark deck white.
 */
export async function emitPdf(page, outPath) {
  await page.emulateMedia({ media: 'screen' });
  // Chromium lays out CSS at 96 px/in while the DEE template is measured at
  // 72 pt/in. The paired physical page size and 96/72 scale preserve both.
  const CSS_PX_PER_IN = 96;
  const PT_PER_IN = 72;
  await page.pdf({
    path: outPath,
    width: `${pxToInches(CANVAS.width)}in`,
    height: `${pxToInches(CANVAS.height)}in`,
    scale: CSS_PX_PER_IN / PT_PER_IN,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '',
  });
  return outPath;
}

export async function shootSlides(page, dir, { format = 'png' } = {}) {
  const paths = [];
  const slides = await page.locator('.slide').all();
  for (const [i, slide] of slides.entries()) {
    const p = join(dir, `slide-${String(i + 1).padStart(2, '0')}.${format}`);
    await slide.screenshot({ path: p });
    paths.push(p);
  }
  return paths;
}

/**
 * Scale-differential check: identical normalized geometry at deviceScaleFactor
 * 1 and 2 proves no unit bug in the generated CSS. One extra render, no image
 * comparison.
 */
export async function geometryAtScale(browser, htmlPath, deviceScaleFactor) {
  const page = await browser.newPage({
    viewport: { width: CANVAS.width, height: CANVAS.height },
    deviceScaleFactor,
  });
  await page.goto(deckUrl(htmlPath, 'artifact'), { waitUntil: 'load' });
  await settle(page);
  const geo = await page.evaluate(() =>
    [...document.querySelectorAll('.slide')].map((s) => {
      const sb = s.getBoundingClientRect();
      return [...s.querySelectorAll('[data-slot]')].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          slot: el.dataset.slot,
          x: +((r.left - sb.left) / sb.width).toFixed(5),
          y: +((r.top - sb.top) / sb.height).toFixed(5),
          w: +(r.width / sb.width).toFixed(5),
          h: +(r.height / sb.height).toFixed(5),
        };
      });
    }),
  );
  await page.close();
  return geo;
}

export function diffGeometry(a, b) {
  const out = [];
  a.forEach((slide, si) => {
    slide.forEach((el, ei) => {
      const other = b?.[si]?.[ei];
      if (!other) {
        out.push(`slide ${si + 1} slot ${el.slot}: missing at the other scale`);
        return;
      }
      for (const k of ['x', 'y', 'w', 'h']) {
        if (Math.abs(el[k] - other[k]) > 0.0005) {
          out.push(`slide ${si + 1} slot ${el.slot}: ${k} ${el[k]} vs ${other[k]} across device scales`);
        }
      }
    });
  });
  return out;
}
