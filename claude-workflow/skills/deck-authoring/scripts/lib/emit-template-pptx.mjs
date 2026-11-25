import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'emit-template-pptx.py');
const ARTIFACTORY_PYPI =
  'https://artifactory.global.twdcgrid.net/artifactory/api/pypi/aix-pypi/simple';
const MAX_SVG_RASTER_EDGE = 4096;

export async function rasterizeTemplateSvgImages(deck, catalog, browser) {
  const output = structuredClone(deck);
  const cache = new Map();

  for (const slide of output.slides) {
    const layout = catalog.layouts[slide.layout];
    for (const [name, spec] of Object.entries(layout.slots)) {
      if (spec.kind !== 'image') {
        continue;
      }
      const value = slide[name];
      if (
        !value
        || typeof value !== 'object'
        || typeof value.src !== 'string'
        || !/^data:image\/svg\+xml;base64,/i.test(value.src)
      ) {
        continue;
      }
      if (!browser?.newPage) {
        throw new Error(
          `official-template SVG rasterization requires the active Chromium browser (${slide.layout}.${name})`,
        );
      }

      const viewport = svgRasterViewport(value, spec);
      const cacheKey = `${value.src}\0${viewport.width}x${viewport.height}`;
      let png = cache.get(cacheKey);
      if (!png) {
        const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
        try {
          const pageCss = `html,body{margin:0;width:${viewport.width}px;height:${viewport.height}px;overflow:hidden;background:transparent}`
            + 'img{display:block;width:100%;height:100%}';
          await page.setContent(`<style>${pageCss}</style><img alt="">`, { waitUntil: 'load' });
          await page.evaluate((source) => {
            document.images[0].src = source;
          }, value.src);
          await page.waitForFunction(
            () => document.images.length === 1
              && document.images[0].complete
              && document.images[0].naturalWidth > 0,
          );
          png = Buffer.from(await page.screenshot({
            type: 'png',
            omitBackground: true,
          })).toString('base64');
          cache.set(cacheKey, png);
        } finally {
          await page.close();
        }
      }
      value.src = `data:image/png;base64,${png}`;
    }
  }
  return output;
}

function svgRasterViewport(value, spec) {
  const sourceWidth = Number(value.width);
  const sourceHeight = Number(value.height);
  if (
    !Number.isFinite(sourceWidth)
    || !Number.isFinite(sourceHeight)
    || sourceWidth <= 0
    || sourceHeight <= 0
  ) {
    throw new Error(
      `official-template SVG rasterization requires finite positive dimensions (got ${value.width}x${value.height})`,
    );
  }
  const desiredEdge = Math.max(spec.w, spec.h) * 2;
  let scale = Math.max(1, desiredEdge / Math.max(sourceWidth, sourceHeight));
  const scaledEdge = Math.max(sourceWidth * scale, sourceHeight * scale);
  if (scaledEdge > MAX_SVG_RASTER_EDGE) {
    scale *= MAX_SVG_RASTER_EDGE / scaledEdge;
  }
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

export async function emitTemplatePptx(
  deck,
  catalog,
  theme,
  {
    mode = 'light',
    outPath,
    templatePath,
    env = process.env,
    spawn = spawnSync,
    browser,
  },
) {
  let templateIsFile = false;
  try {
    templateIsFile = Boolean(templatePath) && statSync(templatePath).isFile();
  } catch {
    templateIsFile = false;
  }
  if (!templateIsFile) {
    throw new Error(`--template must name a readable official DEE .pptx file: ${templatePath}`);
  }
  const templateDeck = await rasterizeTemplateSvgImages(deck, catalog, browser);
  return runPythonTemplate({ deck: templateDeck, catalog, theme }, {
    script: SCRIPT, args: ['--template', templatePath, '--output', outPath, '--mode', mode],
    outPath, env, spawn,
  });
}

function pythonCandidates(configured) {
  if (configured) {
    return [[configured, []]];
  }
  return process.platform === 'win32'
    ? [['py', ['-3']], ['python', []], ['python3', []]]
    : [['python3', []], ['python', []]];
}

export function runPythonTemplate(payload, { script, args = [], outPath, env = process.env, spawn = spawnSync }) {
  const request = JSON.stringify(payload);
  const candidates = pythonCandidates(env.DECK_PYTHON?.trim());
  const failures = [];
  for (const [binary, prefix] of candidates) {
    const result = spawn(
      binary,
      [
        ...prefix,
        script,
        ...args,
      ],
      {
        encoding: 'utf8',
        input: request,
        // native-template.py importlib-loads emit-template-pptx.py at module
        // scope, which caches bytecode beside both shipped scripts (#5256).
        env: Object.assign({}, env, { PYTHONDONTWRITEBYTECODE: '1' }),
        maxBuffer: 8 << 20,
        timeout: 120_000,
        windowsHide: true,
      },
    );
    if (result.error?.code === 'ENOENT') {
      failures.push(`${binary}: not found`);
      continue;
    }
    if (result.error) {
      throw new Error(`official-template emitter could not run ${binary}: ${result.error.message}`);
    }
    if (result.status !== 0) {
      const detail = result.stderr.trim() || `exit ${result.status}`;
      if (!/python-pptx .*required|Python 3\.9\+ is required|No module named/.test(result.stderr)) {
        throw new Error(`official-template adapter failed: ${detail}`);
      }
      failures.push(`${binary}: ${detail}`);
      continue;
    }
    try {
      return { path: outPath, ...JSON.parse(result.stdout) };
    } catch (error) {
      throw new Error(`official-template emitter returned invalid JSON: ${error.message}`);
    }
  }
  const installCommand = process.platform === 'win32'
    ? `$env:PIP_INDEX_URL="${ARTIFACTORY_PYPI}"; py -3 -m pip install --user python-pptx==1.0.2`
    : `PIP_INDEX_URL=${ARTIFACTORY_PYPI} python3 -m pip install --user python-pptx==1.0.2`;
  throw new Error(
    `official-template emission requires Python 3.9+ and python-pptx 1.0.2. ` +
    `Install from Artifactory with: ${installCommand}. ${failures.join('; ')}`,
  );
}
