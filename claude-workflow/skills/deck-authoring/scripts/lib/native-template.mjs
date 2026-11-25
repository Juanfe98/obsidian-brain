import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, strFromU8 } from 'fflate';
import { runPythonTemplate } from './emit-template-pptx.mjs';
import { prepareDeckAssets } from './assets.mjs';
import { atomicProduceFile, atomicReplaceDirectory, atomicWriteFileSync, markOutputDirectory, prepareOutputDirectory } from './fs-safe.mjs';
import { nativeViewer, renderNativePptx, renderPdfPages, verifyNativePages } from './native-render.mjs';
import { bindArtifacts, fileDigest } from './verify-output.mjs';
import { verifyPdf, verifyPptx } from './verify-artifact.mjs';
import { launch } from './verify.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'native-template.py');

function templateOptions(flags) {
  if (!flags.template || !['light', 'dark'].includes(flags.mode ?? 'light')) {
    throw new Error('--template <official.pptx> and --mode light|dark are required');
  }
  return { templatePath: resolve(flags.template), mode: flags.mode ?? 'light' };
}

export function inspectNativeTemplate(flags) {
  return { ok: true, ...runPythonTemplate({ operation: 'inspect', ...templateOptions(flags),
    ...(flags.slide ? { slide: Number(flags.slide) } : {}) }, { script: SCRIPT }) };
}

function prepareImages(plan, path) {
  const result = structuredClone(plan);
  if (!Array.isArray(result.slides) || result.slides.length > 200) {
    throw new Error('native plan requires at most 200 slides');
  }
  const images = [];
  for (const slide of result.slides) {
    if (!Array.isArray(slide.edits) || slide.edits.length > 500) {
      throw new Error('native slide edits must be an array of at most 500 entries');
    }
    for (const edit of slide.edits) {
      if (edit.kind === 'image') {
        images.push(edit);
      }
    }
  }
  const pseudoDeck = { slides: images.map((edit) => ({ layout: 'image', image: edit.image })) };
  const catalog = { layouts: { image: { slots: { image: { kind: 'image' } } } } };
  const prepared = prepareDeckAssets(pseudoDeck, catalog, path);
  prepared.pptxDeck.slides.forEach((slide, index) => {
    if (slide.image.src.startsWith('data:image/svg+xml')) {
      throw new Error('native image replacement requires PNG, JPEG or GIF; rasterize SVG before use');
    }
    images[index].image = slide.image;
  });
  return result;
}

export async function buildNativeTemplate(planPath, flags) {
  if (!planPath || !flags.out) {
    throw new Error('build-native requires <plan.json> and --out <directory>');
  }
  const bytes = readFileSync(planPath);
  if (bytes.length > (4 << 20)) {
    throw new Error('native plan exceeds 4 MiB');
  }
  const plan = prepareImages(JSON.parse(bytes), planPath);
  const options = templateOptions(flags);
  const finalDir = prepareOutputDirectory(resolve(flags.out));
  return atomicReplaceDirectory(finalDir, async (directory) => {
    markOutputDirectory(directory);
    const pptx = join(directory, 'dl/deck.pptx');
    const pdf = join(directory, 'dl/deck.pdf');
    const emitted = await atomicProduceFile(pptx, (outPath) => runPythonTemplate({
      operation: 'compose', ...options, plan, outPath,
    }, { script: SCRIPT, outPath }), { preserveExtension: true });
    const rendering = await atomicProduceFile(pdf, (outPath) => renderNativePptx(pptx, outPath), { preserveExtension: true });
    const { browser } = await launch();
    let pages;
    try {
      pages = await renderPdfPages(browser, pdf, join(directory, 'assets/native'), emitted.slides);
    } finally {
      await browser.close();
    }
    const zip = unzipSync(readFileSync(pptx));
    const contract = { expectedSlides: emitted.slides, requiredTextBySlide: emitted.requiredTextBySlide,
      expectedMedia: emitted.totalMedia,
      expectedPictures: Object.entries(zip).filter(([name]) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .reduce((count, [, data]) => count + (strFromU8(data).match(/<p:pic(?:\s[^>]*)?>/g) ?? []).length, 0) };
    const artifacts = { pdf: verifyPdf(pdf, emitted.slides), pptx: verifyPptx(pptx, contract) };
    const findings = [...verifyNativePages(pages, emitted.requiredTextBySlide), ...artifacts.pdf.findings, ...artifacts.pptx.findings];
    const blocking = findings.filter((f) => ['high', 'blocker'].includes(f.severity));
    const html = join(directory, 'index.html');
    atomicWriteFileSync(html, nativeViewer(plan.title, emitted.slides));
    const template = Object.fromEntries(Object.entries(emitted).filter(([key]) => key !== 'path'));
    const report = { ok: blocking.length === 0, slides: emitted.slides, outDir: finalDir, template,
      rendering, artifacts, blocking, advisory: findings.filter((f) => !blocking.includes(f)),
      fidelity: { status: 'requires-visual-review', note: 'Inspect every native page and confirm the PPTX in PowerPoint before delivery.' },
      nativeTextBySlide: pages.map((page) => page.text) };
    report.integrity = bindArtifacts(directory, [html, pdf, pptx, ...pages.map((page) => page.path)], contract,
      { templateSha256: fileDigest(options.templatePath), inputSha256: fileDigest(planPath) });
    atomicWriteFileSync(join(directory, '.verify/report.json'), JSON.stringify(report, null, 2));
    return report;
  }, { validateExisting: prepareOutputDirectory });
}
