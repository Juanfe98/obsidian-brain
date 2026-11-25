// Render the delivered native file. Never use the reconstructed HTML as proof
// of native fidelity. All process arguments are passed without a shell.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { copyFileSync, mkdtempSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { atomicWriteFileSync } from './fs-safe.mjs';
import { sanitizeHtmlText } from './html.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const execute = promisify(execFile);
const MAX_PDF_BYTES = 100 * 1024 * 1024;

function platformRenderer() {
  if (process.platform === 'darwin') {
    return 'keynote';
  }
  return process.platform === 'win32' ? 'powerpoint' : 'libreoffice';
}

const NATIVE_VIEWER_CSS = 'body{margin:0;background:#111;color:white;font:16px system-ui}nav{padding:12px}a{color:white;margin-right:20px}'
  + 'section{margin:0 auto 16px;max-width:1920px}img{display:block;width:100%;height:auto}';

export async function renderNativePptx(input, output, {
  renderer = process.env.DECK_RENDERER || platformRenderer(),
  run = execute,
} = {}) {
  const options = { timeout: 130_000, maxBuffer: 2 << 20, windowsHide: true };
  const source = resolve(input);
  const target = resolve(output);
  let result;
  if (renderer === 'keynote') {
    const work = mkdtempSync(join(tmpdir(), 'deck-keynote-'));
    try {
      const documentName = basename(work);
      const ownedCopy = join(work, `${documentName}.pptx`);
      copyFileSync(source, ownedCopy);
      // LaunchServices grants Keynote sandbox access to this exact file.
      // AppleScript open alone can misleadingly report an invalid PPTX.
      await run('open', ['-g', '-a', 'Keynote', ownedCopy], options);
      result = await run('osascript', [join(HERE, 'render-keynote.applescript'), documentName, target], options);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  } else if (renderer === 'powerpoint') {
    result = await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-File',
      join(HERE, 'render-powerpoint.ps1'), '-InputPath', source, '-OutputPath', target], options);
  } else if (renderer === 'libreoffice') {
    const work = mkdtempSync(join(tmpdir(), 'deck-native-render-'));
    try {
      result = await run('soffice', [
        `-env:UserInstallation=${pathToFileURL(join(work, 'profile')).href}`,
        '--headless', '--convert-to', 'pdf', '--outdir', work, source,
      ], options);
      renameSync(join(work, `${basename(source, '.pptx')}.pdf`), target);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  } else {
    throw new Error('DECK_RENDERER must be keynote, powerpoint, or libreoffice');
  }
  return { engine: renderer, detail: result.stdout.trim(), source: 'delivered-pptx' };
}

/** Rasterize actual PDF pages in the existing Chromium, with no external I/O. */
export async function renderPdfPages(browser, pdfPath, directory, expectedPages) {
  const bytes = readFileSync(pdfPath);
  if (bytes.length > MAX_PDF_BYTES || !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error('native renderer must produce a PDF smaller than 100 MiB');
  }
  const moduleDir = dirname(fileURLToPath(import.meta.resolve('pdfjs-dist/build/pdf.mjs')));
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const paths = [];
  // Closing the owned context cancels PDF.js work as well as the awaiting RPC.
  const deadline = setTimeout(() => {
    context.close().catch(() => {});
  }, 120_000);
  try {
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== 'https://deck-render.invalid') {
        return route.abort();
      }
      if (url.pathname === '/') {
        return route.fulfill({ contentType: 'text/html', body: '<html><body style="margin:0"><canvas></canvas></body></html>' });
      }
      if (['/pdf.mjs', '/pdf.worker.mjs'].includes(url.pathname)) {
        return route.fulfill({ contentType: 'text/javascript', body: readFileSync(join(moduleDir, url.pathname.slice(1))) });
      }
      return route.abort();
    });
    const page = await context.newPage();
    await page.goto('https://deck-render.invalid/');
    const info = await page.evaluate(async (encoded) => {
      const pdfjs = await import('/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      const data = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
      window.nativePdf = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: false }).promise;
      return { pages: window.nativePdf.numPages };
    }, bytes.toString('base64'));
    if (info.pages !== expectedPages || info.pages > 200) {
      throw new Error(`native PDF has ${info.pages} pages; expected ${expectedPages} (maximum 200)`);
    }
    for (let number = 1; number <= info.pages; number++) {
      const data = await page.evaluate(async (index) => {
        const pdfPage = await window.nativePdf.getPage(index);
        const size = pdfPage.getViewport({ scale: 1 });
        if (Math.abs(size.width - 1920) > 1.5 || Math.abs(size.height - 1080) > 1.5) {
          throw new Error(`native page ${index} must be 1920x1080pt; got ${size.width}x${size.height}`);
        }
        const viewport = pdfPage.getViewport({ scale: 1 });
        const canvas = document.querySelector('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const text = await pdfPage.getTextContent();
        const outside = text.items.filter((item) => item.str?.trim() &&
          (item.transform[4] < -2 || item.transform[4] + item.width > size.width + 2
            || item.transform[5] < -2 || item.transform[5] > size.height + 2));
        return { png: canvas.toDataURL('image/png').split(',')[1],
          text: text.items.map((item) => item.str).join(' '), outside: outside.map((item) => item.str) };
      }, number);
      const path = join(directory, `slide-${String(number).padStart(3, '0')}.png`);
      atomicWriteFileSync(path, Buffer.from(data.png, 'base64'));
      paths.push({ path, text: data.text, outside: data.outside });
    }
    return paths;
  } finally {
    clearTimeout(deadline);
    await context.close();
  }
}

export function verifyNativePages(pages, requiredTextBySlide = []) {
  const normalized = (text) => text.normalize('NFKC').replace(/[\s\u00ad]+/gu, '');
  const findings = [];
  pages.forEach((page, index) => {
    for (const text of requiredTextBySlide[index] ?? []) {
      // PDF extraction includes generated bullet/number glyphs between native
      // paragraphs. Require each authored paragraph in order, retaining exact
      // punctuation inside it; a whole-object substring rejects valid lists.
      let cursor = 0;
      const rendered = normalized(page.text);
      const present = text.split(/\r\n|[\n\r\v]/u).filter((paragraph) => paragraph.trim()).every((paragraph) => {
        const expected = normalized(paragraph);
        const start = rendered.indexOf(expected, cursor);
        if (start < 0) {
          return false;
        }
        cursor = start + expected.length;
        return true;
      });
      if (text && !present) {
        findings.push({
          rule: 'native-missing-text', severity: 'high',
          detail: `slide ${index + 1}: expected text is not visible in the native PDF: ${text.slice(0, 80)}`,
        });
      }
    }
    if (page.outside?.length) {
      findings.push({ rule: 'native-text-outside-canvas', severity: 'high',
        detail: `slide ${index + 1}: text extends outside the native canvas: ${page.outside.join(' ').slice(0, 100)}` });
    }
  });
  return findings;
}

export function nativeViewer(title, count) {
  const escaped = sanitizeHtmlText(title);
  const slides = Array.from({ length: count }, (_, i) =>
    `<section id="slide-${i + 1}"><img src="assets/native/slide-${String(i + 1).padStart(3, '0')}.png" alt="Slide ${i + 1}" width="1920" height="1080"></section>`).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escaped}</title>
<style>${NATIVE_VIEWER_CSS}</style>
<nav>${escaped} · <a href="dl/deck.pdf">PDF</a><a href="dl/deck.pptx">Editable PowerPoint</a></nav>${slides}</html>`;
}
