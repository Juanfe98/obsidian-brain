#!/usr/bin/env node
// deck.mjs - the only entrypoint. JSON on stdout, diagnostics on stderr.
//
//   deck.mjs doctor
//   deck.mjs validate <deck.json> [--theme <id>]
//   deck.mjs build    <deck.json> --out <dir> [--theme <id>] [--mode light|dark] [--strict]
//   deck.mjs verify   <dir>
//   deck.mjs thumbs   <dir>
//   deck.mjs capacity [--theme <id>]

import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANVAS, assertCanvasIdentity, pxToInches } from './lib/geometry.mjs';
import { loadTheme, validateTheme, seriesFor } from './lib/theme.mjs';
import {
  collectChartsBySlide,
  collectVisibleTextBySlide,
  countWords,
  loadCatalog,
  validateDeck,
  validateSpine,
} from './lib/schema.mjs';
import { prepareDeckAssets } from './lib/assets.mjs';
import { renderDeck } from './lib/render-html.mjs';
import { deckToMarkdown } from './lib/preread.mjs';
import {
  CAPACITY_PROBE_WORD_LIMIT,
  capacityProbeText,
} from './lib/capacity.mjs';
import { launch, openDeck, auditPage, emitPdf, shootSlides, geometryAtScale, diffGeometry } from './lib/verify.mjs';
import {
  checkPublishFiles,
  partitionPublishFindings,
  staticManifest,
  validatePublishIdentity,
  validatePublishTitle,
} from './lib/publish.mjs';
import {
  atomicProduceFile,
  atomicReplaceDirectory,
  atomicWriteFileSync,
  markOutputDirectory,
  prepareOutputDirectory,
} from './lib/fs-safe.mjs';
import { emitTelemetry } from './lib/telemetry.mjs';
import { nativeViewer, renderNativePptx, renderPdfPages, verifyNativePages } from './lib/native-render.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SKILL = resolve(HERE, '..');
const CATALOG = join(SKILL, 'layouts', 'catalog.json');

const REPORT_FILE = 'report.json';

const out = (data) => process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);

class DeckExit extends Error {
  constructor(code) {
    super('');
    this.exitCode = code;
  }
}

class StrictBuildFailure extends Error {
  constructor(result) {
    super('strict deck build rejected the staged output');
    this.result = result;
  }
}

async function publishStrictFailureReport(finalOutDir, result) {
  const diagnosticsDir = `${finalOutDir}.failed`;
  const failedResult = {
    ...result,
    diagnostics: {
      directory: diagnosticsDir,
      report: join(diagnosticsDir, '.verify', REPORT_FILE),
    },
  };
  await atomicReplaceDirectory(
    diagnosticsDir,
    async (outDir) => {
      markOutputDirectory(outDir);
      const verifyDir = join(outDir, '.verify');
      mkdirSync(verifyDir, { recursive: true });
      atomicWriteFileSync(
        join(verifyDir, REPORT_FILE),
        JSON.stringify(failedResult, null, 2),
        'utf8',
      );
    },
    { validateExisting: prepareOutputDirectory },
  );
  return failedResult;
}

const die = (message, extra = {}) => {
  process.stdout.write(`${JSON.stringify({ ok: false, error: message, ...extra }, null, 2)}\n`);
  throw new DeckExit(1);
};

const COMMAND_FLAGS = {
  doctor: {},
  validate: { theme: 'value' },
  build: {
    theme: 'value',
    mode: 'value',
    author: 'value',
    'author-id': 'value',
    slug: 'value',
    out: 'value',
    template: 'value',
    reconstruct: 'boolean',
    strict: 'boolean',
    'publish-ready': 'boolean',
  },
  verify: {},
  thumbs: {},
  preread: { out: 'value' },
  capacity: { theme: 'value', mode: 'value' },
  'inspect-google': { domain: 'value', mode: 'value', slide: 'value', out: 'value', preview: 'value' },
  'build-google': { out: 'value', 'dry-run': 'boolean' },
  'export-google': { out: 'value' },
  'inspect-template': { template: 'value', mode: 'value', slide: 'value' },
  'build-native': { template: 'value', mode: 'value', out: 'value' },
};

function flags(command, argv) {
  const f = {};
  const positional = [];
  const contract = COMMAND_FLAGS[command];
  if (!contract) {
    return { f, positional: argv };
  }
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    i++;
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (!Object.hasOwn(contract, key)) {
        die(`unknown flag --${key} for ${command}`, {
          allowed: Object.keys(contract).map((name) => `--${name}`),
        });
      }
      const kind = contract[key];
      if (kind === 'boolean') {
        f[key] = true;
        continue;
      }
      const next = argv[i];
      if (!next || next.startsWith('--')) {
        die(`--${key} requires a value`);
      }
      f[key] = next;
      i++;
    } else {
      positional.push(a);
    }
  }
  return { f, positional };
}

/** Theme discovery: project, then user, then the shipped default. */
function resolveTheme(id) {
  const candidates = [
    join(process.cwd(), 'deck', 'themes', `${id}.theme.json`),
    join(homedir(), '.aix', 'deck', 'themes', `${id}.theme.json`),
    join(SKILL, 'themes', `${id}.theme.json`),
  ];
  const hit = candidates.find((p) => existsSync(p));
  if (!hit) {
    die(`unknown theme ${JSON.stringify(id)}`, { searched: candidates });
  }
  return hit;
}

const safeId = (s) => {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(String(s))) {
    die(`unsafe id ${JSON.stringify(s)}: expected /^[a-z0-9][a-z0-9-]{0,62}$/`);
  }
  return s;
};

async function doctor() {
  const report = { ok: true, checks: [] };
  const check = (name, ok, detail) => {
    report.checks.push({ name, ok, detail });
    if (!ok) {
      report.ok = false;
    }
  };

  const major = Number(process.versions.node.split('.')[0]);
  const minor = Number(process.versions.node.split('.')[1]);
  check('node>=22.13', (major === 22 && minor >= 13) || major > 22, `node ${process.versions.node}`);
  try {
    assertCanvasIdentity();
    const inchesDetail = `${pxToInches(CANVAS.width).toFixed(4)}x${pxToInches(CANVAS.height)}in`;
    check('canvas-identity', true, `${CANVAS.width}x${CANVAS.height}px == ${CANVAS.width}x${CANVAS.height}pt == ${inchesDetail}`);
  } catch (err) {
    check('canvas-identity', false, err.message);
  }

  for (const dep of ['playwright', 'pptxgenjs', 'fflate']) {
    try {
      await import(dep);
      check(`dep:${dep}`, true, 'importable');
    } catch (err) {
      check(`dep:${dep}`, false, `${err.message.split('\n')[0]} — run: cd "${join(SKILL, 'scripts')}" && npm ci --install-links --no-audit --no-fund`);
    }
  }

  let browser;
  try {
    const l = await launch();
    browser = l.browser;
    check('chromium', true, `launched via ${l.launcher}`);
  } catch (err) {
    check('chromium', false, err.message);
  }

  // Font resolvability, measured rather than asked: document.fonts.check()
  // returns true for families that are verifiably absent.
  if (browser) {
    const theme = loadTheme(resolveTheme('dee'));
    const families = [theme.pptxFontDisplay, theme.pptxFontBody].filter(Boolean);
    const page = await browser.newPage();
    const res = await page.evaluate((fams) => {
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d');
      const measure = (f) => {
        ctx.font = `48px "${f}", __absent_sentinel__`;
        return ctx.measureText('mmmmmmmmmmlliWWWW@#$%').width;
      };
      const base = measure('__definitely_absent__');
      return fams.map((f) => ({ family: f, present: Math.abs(measure(f) - base) >= 0.5 }));
    }, families);
    for (const r of res) {
      check(
        `font:${r.family}`,
        r.present,
        r.present
          ? 'resolvable in this renderer'
          : 'NOT installed here — install the DEE Avenir fonts before building, or the PDF and measured text geometry are not trustworthy',
      );
    }
    await page.close();
    await browser.close();
  }
  out(report);
  if (!report.ok) {
    throw new DeckExit(1);
  }
}

function loadDeckFile(path) {
  if (!path) {
    die('a deck JSON path is required');
  }
  if (!existsSync(path)) {
    die(`no such deck file: ${path}`);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    return die(`deck file is not valid JSON: ${err.message}`);
  }
}

function validateCmd(positional, f) {
  const catalog = loadCatalog(CATALOG);
  if (f.theme && !positional[0]) {
    const themeOnly = JSON.parse(readFileSync(resolveTheme(safeId(f.theme)), 'utf8'));
    const themeErrors = validateTheme(themeOnly);
    if (themeErrors.length) {
      die(`theme ${f.theme} is invalid`, { errors: themeErrors });
    }
    out({ ok: true, theme: f.theme, errors: [] });
    return;
  }
  const deck = loadDeckFile(positional[0]);
  const errors = validateDeck(deck, catalog);
  const themeId = safeId(f.theme ?? deck.theme ?? 'dee');
  const theme = JSON.parse(readFileSync(resolveTheme(themeId), 'utf8'));
  errors.push(...validateTheme(theme).map((e) => `theme: ${e}`));
  if (errors.length) {
    die(`deck is invalid (${errors.length} problem${errors.length === 1 ? '' : 's'})`, { errors });
  }
  out({
    ok: true, slides: deck.slides.length, mode: deck.mode, theme: themeId,
    wordsPerSlide: deck.slides.map((s, i) => ({ slide: i + 1, layout: s.layout, words: countWords(s, catalog) })),
  });
}

function assertBuildSource(f) {
  if (!f.template && !f.reconstruct) {
    die('branded builds require --template <official.pptx>; use --reconstruct only for an explicitly template-derived design');
  }
  if (f.template && f.reconstruct) {
    die('--template and --reconstruct are mutually exclusive');
  }
}

function publishIdentity(f) {
  const author = f.author ?? process.env.AIX_PROTO_AUTHOR;
  const authorId = f['author-id'] ?? process.env.AIX_PROTO_AUTHOR_ID;
  const identitySupplied = Boolean(author || authorId);
  if (identitySupplied) {
    const identityErrors = validatePublishIdentity(author, authorId);
    if (identityErrors.length) {
      die('publish identity is invalid', { errors: identityErrors });
    }
  }
  return { author, authorId, identitySupplied };
}

function assertTemplateTheme(templatePath, themeId, themePath) {
  if (templatePath && themeId !== 'dee') {
    die('--template currently supports only the audited dee theme');
  }
  const shippedDeeThemePath = join(SKILL, 'themes', 'dee.theme.json');
  if (templatePath && resolve(themePath) !== resolve(shippedDeeThemePath)) {
    die('--template requires the shipped audited dee theme; remove the project or user dee.theme.json override');
  }
}

async function build(positional, f) {
  const { bindArtifacts, fileDigest } = await import('./lib/verify-output.mjs');
  const deckPath = resolve(positional[0] ?? '');
  const sourceDeck = loadDeckFile(deckPath);
  const catalog = loadCatalog(CATALOG);
  const errors = validateDeck(sourceDeck, catalog);
  if (errors.length) {
    die(`deck is invalid; fix it before building (${errors.length} problems)`, { errors });
  }
  assertBuildSource(f);
  const [pptxEmitter, verifiers] = await Promise.all([
    f.template
      ? import('./lib/emit-template-pptx.mjs')
      : import('./lib/emit-pptx.mjs'),
    import('./lib/verify-artifact.mjs'),
  ]);
  const emitPptx = f.template
    ? pptxEmitter.emitTemplatePptx
    : pptxEmitter.emitPptx;
  const prepared = prepareDeckAssets(sourceDeck, catalog, deckPath);
  const deck = prepared.deck;

  const themeId = safeId(f.theme ?? deck.theme ?? 'dee');
  const themePath = resolveTheme(themeId);
  const mode = f.mode ?? 'light';
  if (!['light', 'dark'].includes(mode)) {
    die(`--mode must be light or dark (got ${mode})`);
  }
  const identity = publishIdentity(f);

  const sourceSlug = basename(deckPath).replace(/\.deck\.json$/i, '').replace(/\.json$/i, '');
  const slug = safeId(f.slug ?? sourceSlug);
  const templatePath = f.template ? resolve(f.template) : null;
  assertTemplateTheme(templatePath, themeId, themePath);
  const theme = loadTheme(themePath);
  const finalOutDir = prepareOutputDirectory(resolve(f.out ?? join(process.cwd(), 'build', slug)));
  const job = {
    f, deckPath, sourceDeck, catalog, prepared, deck, theme, themeId, mode, identity, slug,
    templatePath, finalOutDir, emitPptx, verifiers, bindArtifacts, fileDigest,
  };
  let publishedResult;
  try {
    publishedResult = await atomicReplaceDirectory(
      finalOutDir,
      (outDir) => buildInto(outDir, job),
      { validateExisting: prepareOutputDirectory },
    );
  } catch (error) {
    if (error instanceof StrictBuildFailure) {
      const failedResult = await publishStrictFailureReport(finalOutDir, error.result);
      out(failedResult);
      throw new DeckExit(2);
    }
    throw error;
  }
  out(publishedResult);
}

async function buildInto(outDir, job) {
  const { deck, catalog, theme, themeId, mode, prepared, finalOutDir } = job;
  markOutputDirectory(outDir);
  const publicPath = (path) => join(finalOutDir, relative(outDir, path));
  const verifyDir = join(outDir, '.verify');
  const assetDir = join(outDir, 'assets');
  mkdirSync(verifyDir, { recursive: true });
  mkdirSync(join(outDir, 'dl'), { recursive: true });
  mkdirSync(assetDir, { recursive: true });
  const assetPaths = prepared.uniqueAssets.map((asset) => {
    const path = join(assetDir, asset.outputName);
    atomicWriteFileSync(path, asset.data);
    return path;
  });

  const html = renderDeck(deck, catalog, theme, { mode });
  const htmlPath = join(outDir, 'index.html');
  atomicWriteFileSync(htmlPath, html, 'utf8');

  const { browser, launcher } = await launch();
  const result = {
    ok: true,
    launcher,
    outDir: finalOutDir,
    html: publicPath(htmlPath),
    mode,
    theme: themeId,
    slides: deck.slides.length,
    narrativeAdvice: validateSpine(deck, catalog),
    assets: {
      occurrences: prepared.assets.length,
      unique: prepared.uniqueAssets.length,
      bytes: prepared.totalBytes,
      files: prepared.assets,
    },
  };
  const ctx = {
    outDir,
    publicPath,
    verifyDir,
    assetDir,
    assetPaths,
    htmlPath,
    pdfPath: join(outDir, 'dl', 'deck.pdf'),
    pptxPath: join(outDir, 'dl', 'deck.pptx'),
    manifestPath: join(outDir, 'manifest.json'),
    browser,
    result,
  };
  try {
    return await buildArtifacts(job, ctx);
  } finally {
    await browser.close();
  }
}

function allowedColors(theme, mode) {
  return [
    ...Object.values(theme.modes[mode]),
    ...seriesFor(theme, mode),
    ...seriesFor(theme, mode, 'accent'),
    '#FFFFFF', '#000000',
  ].filter((v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v));
}

async function buildArtifacts(job, ctx) {
  const { deck, catalog, theme, mode, prepared, templatePath } = job;
  const { verifyPdf, checkPdfFonts, verifyPptx } = job.verifiers;
  const { publicPath, verifyDir, htmlPath, pdfPath, pptxPath, browser, result } = ctx;
  const page = await openDeck(browser, htmlPath);
  const audit = await auditPage(page, { allowedColors: allowedColors(theme, mode) });
  atomicWriteFileSync(join(verifyDir, 'audit.json'), JSON.stringify(audit, null, 2), 'utf8');
  result.audit = {
    ok: audit.ok,
    counts: audit.counts ?? {},
    findings: audit.findings?.length ?? 0,
  };

  if (!templatePath) {
    await atomicProduceFile(pdfPath, (stagedPath) => emitPdf(page, stagedPath));
  }
  result.pdf = publicPath(pdfPath);
  await page.close();

  const g1 = await geometryAtScale(browser, htmlPath, 1);
  const g2 = await geometryAtScale(browser, htmlPath, 2);
  const scaleDiff = diffGeometry(g1, g2);
  result.scaleDifferential = scaleDiff.length
    ? { ok: false, problems: scaleDiff }
    : { ok: true };

  const pptxOutput = await emitBuildPptx(job, ctx);
  result.pptx = publicPath(pptxPath);
  result.assets.pptxMedia = pptxOutput.totalMedia ?? pptxOutput.uniqueMedia;
  result.assets.removedDuplicatePptxMedia = pptxOutput.removedDuplicateMedia ?? 0;
  if (templatePath) {
    await renderTemplateNative(job, ctx, pptxOutput);
  } else {
    result.rendering = { engine: 'chromium', source: 'reconstructed-html' };
  }

  const pdfInfo = verifyPdf(pdfPath, deck.slides.length);
  if (!templatePath) {
    pdfInfo.findings.push(...checkPdfFonts(
      pdfInfo.fonts,
      [theme.pptxFontDisplay, theme.pptxFontBody].filter(Boolean),
    ));
  }
  const artifactContract = {
    expectedSlides: deck.slides.length,
    expectedMedia: pptxOutput.totalMedia ?? pptxOutput.uniqueMedia,
    expectedPictures: prepared.assets.length,
    requiredTextBySlide: collectVisibleTextBySlide(deck, catalog),
    expectedChartsBySlide: collectChartsBySlide(deck, catalog),
  };
  const pptxInfo = verifyPptx(pptxPath, artifactContract);
  result.artifacts = { pdf: pdfInfo, pptx: pptxInfo };
  atomicWriteFileSync(
    join(verifyDir, 'artifacts.json'),
    JSON.stringify(result.artifacts, null, 2),
    'utf8',
  );

  const publishFindings = recordPublishState(job, ctx);
  return finishBuild(job, ctx, { audit, pdfInfo, pptxInfo, scaleDiff, publishFindings, artifactContract });
}

function emitBuildPptx(job, ctx) {
  const { catalog, theme, mode, prepared, templatePath, emitPptx } = job;
  const { publicPath, pptxPath, browser } = ctx;
  return atomicProduceFile(
    pptxPath,
    async (stagedPath) => {
      const output = await emitPptx(
        prepared.pptxDeck,
        catalog,
        theme,
        {
          mode,
          outPath: stagedPath,
          ...(templatePath ? { templatePath, browser } : {}),
        },
      );
      return { ...output, path: publicPath(pptxPath) };
    },
    { preserveExtension: true },
  );
}

async function renderTemplateNative(job, ctx, pptxOutput) {
  const { deck, catalog, sourceDeck } = job;
  const { assetDir, assetPaths, htmlPath, pdfPath, pptxPath, browser, result } = ctx;
  result.template = {
    mode: pptxOutput.templateMode,
    sha256: pptxOutput.sha256,
    masters: pptxOutput.masterCount,
    layouts: pptxOutput.layoutCount,
    requiredLayouts: pptxOutput.requiredLayouts,
    preservedParts: pptxOutput.preservedParts,
    latentPlaceholders: pptxOutput.latentPlaceholders,
  };
  result.rendering = await atomicProduceFile(pdfPath,
    (stagedPath) => renderNativePptx(pptxPath, stagedPath), { preserveExtension: true });
  const pages = await renderPdfPages(browser, pdfPath, join(assetDir, 'native'), deck.slides.length);
  assetPaths.push(...pages.map((entry) => entry.path));
  atomicWriteFileSync(htmlPath, nativeViewer(sourceDeck.title, deck.slides.length), 'utf8');
  // Browser geometry above concerns the reconstructed composition only.
  // Native text fit and artwork must be reviewed in these actual pages.
  result.audit = { scope: 'reconstructed-guidance', ...result.audit };
  result.nativeTextBySlide = pages.map((entry) => entry.text);
  result.nativeFindings = verifyNativePages(pages, collectVisibleTextBySlide(deck, catalog));
  result.fidelity = { status: 'requires-visual-review',
    note: 'Inspect the rendered native pages; Keynote and LibreOffice previews also require checking the PPTX in PowerPoint.' };
}

function publishedPaths(ctx, identitySupplied) {
  const { htmlPath, pdfPath, pptxPath, assetPaths, manifestPath } = ctx;
  return [
    htmlPath,
    pdfPath,
    pptxPath,
    ...assetPaths,
    ...(identitySupplied ? [manifestPath] : []),
  ];
}

// Writes the aix-proto manifest when an identity was supplied and records
// result.publish; returns the publish findings that gate the build.
function recordPublishState(job, ctx) {
  const { f, slug, sourceDeck, finalOutDir } = job;
  const { author, authorId, identitySupplied } = job.identity;
  const { outDir, publicPath, manifestPath, result } = ctx;
  if (identitySupplied) {
    atomicWriteFileSync(
      manifestPath,
      `${JSON.stringify(staticManifest(slug, sourceDeck.title, author, authorId), null, 2)}\n`,
      'utf8',
    );
  }
  const publishInfo = checkPublishFiles(publishedPaths(ctx, identitySupplied));
  const publishFiles = publishInfo.files.map((file) => ({
    ...file,
    path: publicPath(file.path),
  }));
  const publishFindings = publishInfo.findings.map((finding) => ({
    ...finding,
    detail: finding.detail.replaceAll(outDir, finalOutDir),
  }));
  if (identitySupplied) {
    for (const detail of validatePublishTitle(sourceDeck.title)) {
      publishFindings.push({
        rule: 'aix-proto-display-name',
        severity: 'high',
        detail,
      });
    }
  }
  if (!identitySupplied && f['publish-ready']) {
    publishFindings.push({
      rule: 'aix-proto-owner',
      severity: 'blocker',
      detail: 'publish-ready build requires --author <name@disney.com> and --author-id <MyID>',
    });
  }
  result.publish = {
    ready: false,
    manifest: identitySupplied ? publicPath(manifestPath) : null,
    identity: identitySupplied ? 'validated' : 'not supplied',
    files: publishFiles,
    totalBytes: publishInfo.totalBytes,
    findings: publishFindings,
    next: identitySupplied
      ? null
      : 'rebuild with --author <name@disney.com> --author-id <MyID> --publish-ready before aix-proto publish',
  };
  return publishFindings;
}

function finishBuild(job, ctx, { audit, pdfInfo, pptxInfo, scaleDiff, publishFindings, artifactContract }) {
  const { f, deckPath, templatePath, bindArtifacts, fileDigest } = job;
  const { identitySupplied } = job.identity;
  const { outDir, verifyDir, result } = ctx;
  // Only blocker/high stop a build, from every source. Artifact findings carry
  // their own severity, so a medium there must not gate the same as a corrupt
  // canvas; the full list still lands in report.json.
  const isBlocking = (x) => x.severity === 'blocker' || x.severity === 'high';
  const publishGate = partitionPublishFindings(
    publishFindings,
    Boolean(f['publish-ready']),
  );
  const blocking = [
    ...(!templatePath ? (audit.findings ?? []).filter(isBlocking) : []),
    ...pdfInfo.findings.filter(isBlocking),
    ...pptxInfo.findings.filter(isBlocking),
    ...(result.nativeFindings ?? []).filter(isBlocking),
    ...publishGate.blocking,
    ...scaleDiff.map((d) => ({
      rule: 'scale-differential',
      severity: 'blocker',
      detail: d,
    })),
  ];
  result.advisory = [
    ...(audit.findings ?? []).filter((x) => !isBlocking(x)),
    ...pdfInfo.findings.filter((x) => !isBlocking(x)),
    ...pptxInfo.findings.filter((x) => !isBlocking(x)),
    ...publishGate.advisory,
  ];
  result.blocking = blocking;
  result.ok = blocking.length === 0;
  result.publish.ready = identitySupplied && publishFindings.length === 0 && result.ok;
  result.published = result.ok || !f.strict;
  result.integrity = bindArtifacts(outDir, publishedPaths(ctx, identitySupplied), artifactContract, {
    inputSha256: fileDigest(deckPath),
    ...(templatePath ? { templateSha256: fileDigest(templatePath) } : {}),
  });
  atomicWriteFileSync(
    join(verifyDir, REPORT_FILE),
    JSON.stringify(result, null, 2),
    'utf8',
  );
  if (!result.published) {
    throw new StrictBuildFailure(result);
  }
  return result;
}

async function verifyCmd(positional) {
  const { verifyOutput } = await import('./lib/verify-output.mjs');
  const dir = resolve(positional[0] ?? '.');
  const report = verifyOutput(dir);
  out(report);
  if (!report.ok) {
    throw new DeckExit(2);
  }
}

async function thumbs(positional) {
  const { verifyOutput } = await import('./lib/verify-output.mjs');
  const dir = resolve(positional[0] ?? '.');
  const report = verifyOutput(dir);
  if (!report.ok) {
    die('current artifacts failed verification; rebuild before creating thumbnails', { blocking: report.blocking });
  }
  const htmlPath = join(dir, 'index.html');
  if (!existsSync(htmlPath)) {
    die(`no index.html in ${dir}`);
  }
  const shotDir = join(dir, '.verify', 'thumbs');
  prepareOutputDirectory(shotDir);
  const { browser } = await launch();
  try {
    const page = await openDeck(browser, htmlPath);
    const stagedPaths = await atomicReplaceDirectory(
      shotDir,
      async (stagedDir) => {
        markOutputDirectory(stagedDir);
        if (['delivered-pptx', 'native-google-export'].includes(report.rendering?.source)) {
          return (await renderPdfPages(browser, join(dir, 'dl', 'deck.pdf'), stagedDir, report.slides))
            .map((entry) => entry.path);
        }
        return shootSlides(page, stagedDir);
      },
      { validateExisting: prepareOutputDirectory },
    );
    const paths = stagedPaths.map((path) => join(shotDir, basename(path)));
    out({ ok: true, count: paths.length, paths });
  } finally {
    await browser.close();
  }
}

// A deck and a leave-behind doc are different artifacts. This transforms the IR
// into markdown for Drive's NATIVE importer (`udoc doc create --format markdown`),
// which keeps tables and nested lists. The upload carries only Markdown bytes,
// so local images become explicit alt-text callouts rather than broken links.
function preread(positional, f) {
  const deck = loadDeckFile(positional[0]);
  const catalog = loadCatalog(CATALOG);
  const errors = validateDeck(deck, catalog);
  if (errors.length) {
    die(`deck is invalid; fix it before exporting (${errors.length} problems)`, { errors });
  }
  const md = deckToMarkdown(deck, catalog);
  if (f.out) {
    const p = resolve(f.out);
    mkdirSync(dirname(p), { recursive: true });
    atomicWriteFileSync(p, md, 'utf8');
    out({ ok: true, path: p, bytes: md.length, lines: md.split('\n').length });
  } else {
    process.stdout.write(md);
  }
}

// Measure each prose slot's real word budget at design typography, so the
// content generator is constrained BEFORE it writes. Without this the repair
// loop cannot converge without shrinking type.
async function capacity(f) {
  const catalog = loadCatalog(CATALOG);
  const themeId = safeId(f.theme ?? 'dee');
  const theme = loadTheme(resolveTheme(themeId));
  const mode = f.mode ?? 'light';
  const fill = capacityProbeText();

  const { browser } = await launch();
  const budgets = {};
  try {
    const page = await browser.newPage({ viewport: { width: CANVAS.width, height: CANVAS.height } });
    for (const [lid, L] of Object.entries(catalog.layouts)) {
      budgets[lid] = {};
      for (const [name, spec] of Object.entries(L.slots)) {
        const size = spec.sizePx ?? spec.bodyPx ?? spec.labelPx;
        if (!size || !['text', 'text-list', 'card'].includes(spec.kind) || !spec.w) {
          continue;
        }
        const measurement = await page.evaluate(
          ({ w, h, sizePx, probeText, family }) => {
            const d = document.createElement('div');
            d.style.cssText = `position:absolute;left:0;top:0;width:${w}px;font:${sizePx}px ${family};line-height:1.3;visibility:hidden`;
            d.textContent = probeText;
            document.body.append(d);
            const words = probeText.split(' ');
            // binary search the largest word count that fits the box height
            let lo = 0;
            let hi = words.length;
            while (lo < hi) {
              const mid = Math.ceil((lo + hi) / 2);
              d.textContent = words.slice(0, mid).join(' ');
              if (d.getBoundingClientRect().height <= h) {
                lo = mid;
              } else {
                hi = mid - 1;
              }
            }
            d.remove();
            return { capacityWords: lo, saturated: lo === words.length };
          },
          { w: spec.w, h: spec.h ?? 200, sizePx: size, probeText: fill, family: theme.fontBody },
        );
        if (measurement.saturated) {
          throw new Error(
            `capacity probe saturated at ${CAPACITY_PROBE_WORD_LIMIT} words for ${lid}.${name}`,
          );
        }
        budgets[lid][name] = {
          sizePx: size,
          boxPx: [spec.w, spec.h],
          capacityWords: measurement.capacityWords,
        };
      }
    }
    await page.close();
  } finally {
    await browser.close();
  }
  out({ ok: true, theme: themeId, mode, note: 'capacityWords is the max words that fit the slot at design typography; constrain generated content to it', budgets });
}

const [cmd, ...rest] = process.argv.slice(2);
const startedAt = Date.now();
let exitCode = 0;
try {
  const { f, positional } = flags(cmd, rest);
  switch (cmd) {
    case 'doctor':
      await doctor();
      break;
    case 'validate':
      validateCmd(positional, f);
      break;
    case 'build':
      await build(positional, f);
      break;
    case 'verify':
      await verifyCmd(positional);
      break;
    case 'thumbs':
      await thumbs(positional);
      break;
    case 'preread':
      preread(positional, f);
      break;
    case 'capacity':
      await capacity(f);
      break;
    case 'inspect-template':
    case 'build-native': {
      const native = await import('./lib/native-template.mjs');
      const result = cmd === 'inspect-template' ? native.inspectNativeTemplate(f)
        : await native.buildNativeTemplate(positional[0], f);
      out(result);
      if (!result.ok) {
        throw new DeckExit(2);
      }
      break;
    }
    case 'inspect-google':
    case 'build-google':
    case 'export-google': {
      const google = await import('./lib/google-build.mjs');
      if (cmd === 'export-google' && !f.out) {
        die('export-google requires --out <directory>');
      }
      let result;
      if (cmd === 'inspect-google') {
        result = await google.inspectGoogleCommand(f);
      } else if (cmd === 'build-google') {
        result = await google.buildGoogleCommand(positional[0], f);
      } else {
        result = await google.exportGoogleDeck(positional[0], f.out);
      }
      out(result);
      if (!result.ok) {
        throw new DeckExit(2);
      }
      break;
    }
    default:
      die(`unknown command ${JSON.stringify(cmd ?? '')}`, {
        usage: [
          'doctor',
          'validate <deck.json>',
          'build <deck.json> --out <dir> (--template official.pptx | --reconstruct) [--author <name@disney.com> --author-id <MyID> --publish-ready]',
          'inspect-google [--domain apps.disney.com|disneystreaming.com] [--mode light|dark] [--slide N] [--out snapshot.json] [--preview reference-dir]',
          'build-google <plan.json> --out <dir> [--dry-run]',
          'export-google <presentation-id> --out <dir>',
          'inspect-template --template official.pptx [--mode light|dark] [--slide N]',
          'build-native <plan.json> --template official.pptx --out <dir> [--mode light|dark]',
          'verify <dir>',
          'thumbs <dir>',
          'preread <deck.json> [--out file.md]',
          'capacity',
        ],
      });
  }
} catch (err) {
  if (err instanceof DeckExit) {
    exitCode = err.exitCode;
  } else {
    exitCode = 1;
    const message = err instanceof Error ? err.message : String(err);
    out({
      ok: false,
      error: message,
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 4) : undefined,
    });
  }
}
emitTelemetry({
  command: cmd ?? 'unknown',
  durationMs: Date.now() - startedAt,
  exitCode,
});
process.exitCode = exitCode;
