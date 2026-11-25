import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { googleTemplate, inspectGoogle, planGoogle, composeGoogle, runGoogleCli, templateRegistry, checkGoogleCapability, sourceFingerprint } from './google-native.mjs';
import { atomicProduceFile, atomicReplaceDirectory, atomicWriteFileSync, markOutputDirectory, prepareOutputDirectory } from './fs-safe.mjs';
import { nativeViewer, renderPdfPages, verifyNativePages } from './native-render.mjs';
import { bindArtifacts, fileDigest } from './verify-output.mjs';
import { verifyPdf, verifyPptx } from './verify-artifact.mjs';
import { launch } from './verify.mjs';

const approved = (id) => Object.values(templateRegistry.google).some((modes) => Object.values(modes).includes(id));

export async function inspectGoogleCommand(flags, { cli = runGoogleCli, preview = previewGoogleSource } = {}) {
  const template = googleTemplate(flags.domain, flags.mode);
  const source = await cli('udoc', ['slide', 'get', template]);
  const result = inspectGoogle(source, flags.slide === undefined ? undefined : Number(flags.slide));
  if (flags.out) {
    atomicWriteFileSync(resolve(flags.out), JSON.stringify(source, null, 2));
  }
  return { ok: true, ...result, ...(flags.preview ? { preview: await preview(source, flags.preview, { cli }) } : {}) };
}

async function renderReference(pdf, directory, count) {
  const { browser } = await launch();
  try {
    return await renderPdfPages(browser, pdf, directory, count);
  } finally {
    await browser.close();
  }
}

/** Read-only reference images; they do not certify a delivered editable deck. */
export async function previewGoogleSource(source, output, { cli = runGoogleCli, render = renderReference } = {}) {
  const finalDir = prepareOutputDirectory(resolve(output));
  const hash = sourceFingerprint(source);
  return atomicReplaceDirectory(finalDir, async (directory) => {
    markOutputDirectory(directory);
    const pdf = join(directory, 'reference.pdf');
    await atomicProduceFile(pdf, temporary => cli('gdrive', ['file', 'export', source.presentationId,
      '--mime-type', 'application/pdf', '--output', temporary]));
    const after = await cli('udoc', ['slide', 'get', source.presentationId]);
    if (sourceFingerprint(after) !== hash) {
      throw new Error('official source changed during reference export; inspect again');
    }
    const pages = await render(pdf, join(directory, 'pages'), source.slides.length);
    const evidence = { sourceId: source.presentationId, sourceHash: hash, pdfSha256: fileDigest(pdf),
      pdf: join(finalDir, 'reference.pdf'), pages: pages.map((_, index) => ({ slide: index + 1,
        path: join(finalDir, 'pages', `slide-${String(index + 1).padStart(3, '0')}.png`) })) };
    atomicWriteFileSync(join(directory, 'reference.json'), JSON.stringify(evidence, null, 2));
    return evidence;
  }, { validateExisting: prepareOutputDirectory });
}

/** Copy and populate once. Keep a durable receipt even if local rendering fails. */
export async function buildGoogleCommand(planPath, flags, { cli = runGoogleCli, exportDeck = exportGoogleDeck } = {}) {
  if (!planPath || !flags.out) {
    throw new Error('build-google requires <plan.json> and --out <directory>');
  }
  const bytes = readFileSync(planPath);
  if (bytes.length > (4 << 20)) {
    throw new Error('native plan exceeds 4 MiB');
  }
  const plan = JSON.parse(bytes);
  if (!approved(plan.template?.id)) {
    throw new Error('plan must reference an approved native Google template from inspect-google');
  }
  const source = await cli('udoc', ['slide', 'get', plan.template.id]);
  const compiled = planGoogle(source, plan);
  if (flags['dry-run']) {
    return { ok: true, dryRun: true, sourceId: source.presentationId,
      slides: compiled.slideIds.length, requests: compiled.requests,
      note: 'Execution copies the source first and guards edits with the copy’s revision. No file was created.' };
  }
  const output = prepareOutputDirectory(resolve(flags.out));
  const recovery = `${output}.google`;
  // Retrying an ambiguous Drive copy can create duplicates. Require inspection
  // of the durable receipt, then use export-google for a populated draft.
  await checkGoogleCapability(cli);
  mkdirSync(dirname(recovery), { recursive: true });
  try {
    mkdirSync(recovery);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    throw new Error(`Google run already exists at ${recovery}; inspect google-receipt.json before retrying; export-google can re-export its presentation ID`, { cause: error });
  }
  markOutputDirectory(recovery);
  const result = await composeGoogle(source, plan, recovery, { cli });
  try {
    const report = await exportDeck(result.presentationId, output, {
      cli, requiredTextBySlide: result.requiredTextBySlide, expectedSlides: result.slideIds.length,
      sources: { templateId: source.presentationId, templateSourceHash: plan.template.sourceHash, inputSha256: fileDigest(planPath) },
    });
    return { ...report, google: { phase: result.phase, sourceId: result.sourceId,
      presentationId: result.presentationId, url: result.url }, recovery };
  } catch (error) {
    const guidance = `Export failed; use export-google ${result.presentationId} --out <directory>.`;
    throw new Error(`Google draft was populated: ${result.url}. ${guidance} Receipt: ${recovery}. ${error.message}`, { cause: error });
  }
}

export async function exportGoogleDeck(id, output, {
  cli = runGoogleCli, requiredTextBySlide = [], expectedSlides, sources = {},
} = {}) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{5,128}$/.test(id)) {
    throw new Error('invalid Google presentation ID');
  }
  const source = await cli('udoc', ['slide', 'get', id]);
  inspectGoogle(source);
  if (!source.revisionId) {
    throw new Error('export verification requires edit access so Google returns a revision ID');
  }
  const slides = source.slides.length;
  if (expectedSlides !== undefined && expectedSlides !== slides) {
    throw new Error('Google output slide count differs from the plan');
  }
  const finalDir = prepareOutputDirectory(resolve(output));
  return atomicReplaceDirectory(finalDir, async (directory) => {
    markOutputDirectory(directory);
    const pdf = join(directory, 'dl/deck.pdf');
    const pptx = join(directory, 'dl/deck.pptx');
    for (const [path, mime] of [[pdf, 'application/pdf'], [pptx, 'application/vnd.openxmlformats-officedocument.presentationml.presentation']]) {
      await atomicProduceFile(path, (temporary) => cli('gdrive', ['file', 'export', id, '--mime-type', mime, '--output', temporary]));
    }
    // Detect edits that occurred between the two exports; do not certify PDFs
    // and PPTX downloads from different remote revisions.
    const after = await cli('udoc', ['slide', 'get', id]);
    if (after.revisionId !== source.revisionId) {
      throw new Error('Google deck changed during export; export again from a stable revision');
    }
    const { browser, launcher } = await launch();
    let pages;
    try {
      pages = await renderPdfPages(browser, pdf, join(directory, 'assets/native'), slides);
    } finally {
      await browser.close();
    }
    const zip = unzipSync(readFileSync(pptx));
    const contract = { expectedSlides: slides, requiredTextBySlide,
      expectedMedia: Object.keys(zip).filter((name) => name.startsWith('ppt/media/') && !name.endsWith('/')).length,
      expectedPictures: Object.entries(zip).filter(([name]) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .reduce((count, [, data]) => count + (strFromU8(data).match(/<p:pic(?:\s[^>]*)?>/g) ?? []).length, 0),
    };
    const artifacts = { pdf: verifyPdf(pdf, slides), pptx: verifyPptx(pptx, contract) };
    const findings = [...verifyNativePages(pages, requiredTextBySlide), ...artifacts.pdf.findings, ...artifacts.pptx.findings];
    const blocking = findings.filter((finding) => ['blocker', 'high'].includes(finding.severity));
    const html = join(directory, 'index.html');
    atomicWriteFileSync(html, nativeViewer(source.title ?? 'DEE presentation', slides));
    const report = { ok: blocking.length === 0, slides, outDir: finalDir, launcher, artifacts, blocking,
      rendering: { engine: 'google-slides', source: 'native-google-export', revisionId: source.revisionId },
      google: { presentationId: id, url: `https://docs.google.com/presentation/d/${id}/edit` },
      fidelity: { status: 'requires-visual-review', note: 'Review native Google pages and the editable PPTX in PowerPoint before claiming parity across applications.' },
      nativeTextBySlide: pages.map((page) => page.text), advisory: findings.filter((finding) => !blocking.includes(finding)),
    };
    report.integrity = bindArtifacts(directory, [html, pdf, pptx, ...pages.map((page) => page.path)], contract,
      { ...sources, presentationId: id, revisionId: source.revisionId });
    atomicWriteFileSync(join(directory, '.verify/report.json'), JSON.stringify(report, null, 2));
    return report;
  }, { validateExisting: prepareOutputDirectory });
}
