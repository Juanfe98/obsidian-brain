import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';

const MAX_IMAGE_BYTES = 5 << 20;
const MAX_TOTAL_BYTES = 40 << 20;
const EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export function coverCropGeometry(sourceWidth, sourceHeight, target) {
  const values = [sourceWidth, sourceHeight, target?.x, target?.y, target?.w, target?.h];
  if (!values.every(Number.isFinite) ||
      sourceWidth <= 0 ||
      sourceHeight <= 0 ||
      target.w <= 0 ||
      target.h <= 0) {
    throw new Error(
      `cover crop requires finite positive source and target dimensions ` +
      `(source=${sourceWidth}x${sourceHeight}, target=${target?.w}x${target?.h})`,
    );
  }
  const scale = Math.max(target.w / sourceWidth, target.h / sourceHeight);
  const scaledWidth = sourceWidth * scale;
  const scaledHeight = sourceHeight * scale;
  const cropX = Math.max(0, (scaledWidth - target.w) / 2);
  const cropY = Math.max(0, (scaledHeight - target.h) / 2);
  return {
    x: target.x,
    y: target.y,
    w: scaledWidth,
    h: scaledHeight,
    sizing: {
      type: 'crop',
      x: cropX,
      y: cropY,
      w: target.w,
      h: target.h,
    },
  };
}

export function prepareDeckAssets(deck, catalog, deckPath) {
  const htmlDeck = structuredClone(deck);
  const pptxDeck = structuredClone(deck);
  const root = realpathSync(dirname(resolve(deckPath)));
  const sourceCache = new Map();
  const uniqueByDigest = new Map();
  const occurrences = [];
  let totalBytes = 0;

  const loadAsset = (path, where, source) => {
    const bytes = readImageFile(path, where, source);
    const mime = detectImageMime(bytes);
    const { width, height } = imageDimensions(bytes, mime);
    const digest = createHash('sha256').update(bytes).digest('hex');
    let asset = uniqueByDigest.get(digest);
    if (!asset) {
      const nextTotalBytes = nextImageTotal(totalBytes, bytes.length);
      asset = {
        data: bytes,
        dataUri: `data:${mime};base64,${bytes.toString('base64')}`,
        bytes: bytes.length,
        mime,
        outputName: `${digest}.${EXTENSION[mime]}`,
        width,
        height,
      };
      uniqueByDigest.set(digest, asset);
      totalBytes = nextTotalBytes;
    }
    return asset;
  };

  htmlDeck.slides.forEach((slide, slideIndex) => {
    const layout = catalog.layouts[slide.layout];
    for (const [name, spec] of Object.entries(layout.slots)) {
      if (spec.kind !== 'image' || slide[name] === undefined || slide[name] === null) {
        continue;
      }
      const value = slide[name];
      const source = typeof value === 'string' ? value : value.src;
      const alt = typeof value === 'object' && typeof value.alt === 'string' ? value.alt : '';
      const path = resolveAssetPath(root, source);
      let asset = sourceCache.get(path);
      if (!asset) {
        asset = loadAsset(path, `slides[${slideIndex}].${name}`, source);
        sourceCache.set(path, asset);
      }
      slide[name] = { src: `assets/${asset.outputName}`, alt };
      pptxDeck.slides[slideIndex][name] = {
        src: asset.dataUri,
        alt,
        width: asset.width,
        height: asset.height,
      };
      occurrences.push({
        slide: slideIndex + 1,
        slot: name,
        source,
        outputName: asset.outputName,
        mime: asset.mime,
        bytes: asset.bytes,
        width: asset.width,
        height: asset.height,
      });
    }
  });

  return {
    deck: htmlDeck,
    pptxDeck,
    assets: occurrences,
    uniqueAssets: [...uniqueByDigest.values()],
    totalBytes,
  };
}

function readImageFile(path, where, source) {
  const stat = statSync(path);
  if (!stat.isFile()) {
    throw new Error(`${where} is not a regular file: ${source}`);
  }
  if (stat.size > MAX_IMAGE_BYTES) {
    throw new Error(`${where} is ${stat.size} bytes; image limit is ${MAX_IMAGE_BYTES}`);
  }
  return readFileSync(path);
}

export function nextImageTotal(totalBytes, nextBytes) {
  const nextTotalBytes = totalBytes + nextBytes;
  if (nextTotalBytes > MAX_TOTAL_BYTES) {
    throw new Error(`deck images exceed the ${MAX_TOTAL_BYTES}-byte total limit`);
  }
  return nextTotalBytes;
}

export function detectImageMime(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 4) {
    throw new Error('image is empty or truncated');
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  const head = bytes.subarray(0, 6).toString('ascii');
  if (head === 'GIF87a' || head === 'GIF89a') {
    return 'image/gif';
  }

  const text = bytes.toString('utf8').trimStart();
  if (/^(?:<\?xml[\s\S]*?\?>\s*)?<svg(?:\s|>)/i.test(text)) {
    validateSvg(text);
    return 'image/svg+xml';
  }
  throw new Error('image must be PNG, JPEG, GIF, or self-contained SVG');
}

export function imageDimensions(bytes, mime = detectImageMime(bytes)) {
  if (!Buffer.isBuffer(bytes)) {
    throw new Error('image bytes must be a Buffer');
  }
  let dimensions;
  switch (mime) {
    case 'image/png':
      if (bytes.length < 24 || bytes.subarray(12, 16).toString('ascii') !== 'IHDR') {
        throw new Error('PNG is missing a complete IHDR dimension block');
      }
      dimensions = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
      break;
    case 'image/gif':
      if (bytes.length < 10) {
        throw new Error('GIF is missing its logical-screen dimensions');
      }
      dimensions = { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
      break;
    case 'image/jpeg':
      dimensions = jpegDimensions(bytes);
      break;
    case 'image/svg+xml':
      dimensions = svgDimensions(bytes.toString('utf8'));
      break;
    default:
      throw new Error(`unsupported image mime type for dimensions: ${mime}`);
  }
  if (
    !Number.isFinite(dimensions.width)
    || !Number.isFinite(dimensions.height)
    || dimensions.width <= 0
    || dimensions.height <= 0
  ) {
    throw new Error(`image dimensions must be finite and positive (got ${dimensions.width}x${dimensions.height})`);
  }
  return dimensions;
}

const JPEG_START_OF_FRAME = new Set([
  0xc0, 0xc1, 0xc2, 0xc3,
  0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb,
  0xcd, 0xce, 0xcf,
]);

// Markers that carry no length field: SOI, TEM and RST0-RST7.
function isStandaloneJpegMarker(marker) {
  return marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
}

function skipJpegFill(bytes, offset) {
  let next = offset;
  while (next < bytes.length && bytes[next] === 0xff) {
    next++;
  }
  return next;
}

// Length of the segment after `marker`, or 0 when parsing must stop: end of
// image, start of scan, or a truncated or invalid length field.
function jpegSegmentLength(bytes, marker, offset) {
  if (marker === 0xd9 || marker === 0xda || offset + 2 > bytes.length) {
    return 0;
  }
  const length = bytes.readUInt16BE(offset);
  return length < 2 || offset + length > bytes.length ? 0 : length;
}

function jpegDimensions(bytes) {
  let offset = 2;
  while (offset < bytes.length) {
    offset = skipJpegFill(bytes, offset);
    if (offset >= bytes.length) {
      break;
    }
    const marker = bytes[offset];
    offset++;
    if (isStandaloneJpegMarker(marker)) {
      continue;
    }
    const length = jpegSegmentLength(bytes, marker, offset);
    if (!length) {
      break;
    }
    if (JPEG_START_OF_FRAME.has(marker)) {
      if (length < 7) {
        break;
      }
      return {
        width: bytes.readUInt16BE(offset + 5),
        height: bytes.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }
  throw new Error('JPEG is missing a complete start-of-frame dimension block');
}

function svgDimensions(text) {
  const root = text.match(/<svg\b([^>]*)>/i)?.[1] ?? '';
  const attrs = new Map();
  for (const match of root.matchAll(/\b(width|height|viewBox)\s*=\s*(["'])(.*?)\2/gi)) {
    attrs.set(match[1].toLowerCase(), match[3].trim());
  }

  const viewBox = attrs.get('viewbox')
    ?.split(/[\s,]+/)
    .map(Number);
  const hasViewBox = viewBox?.length === 4
    && viewBox.every(Number.isFinite)
    && viewBox[2] > 0
    && viewBox[3] > 0;
  const width = svgLengthInPixels(attrs.get('width'));
  const height = svgLengthInPixels(attrs.get('height'));
  if (width && height) {
    return { width, height };
  }
  if (hasViewBox && width) {
    return { width, height: width * viewBox[3] / viewBox[2] };
  }
  if (hasViewBox && height) {
    return { width: height * viewBox[2] / viewBox[3], height };
  }
  if (hasViewBox) {
    return { width: viewBox[2], height: viewBox[3] };
  }
  // SVG's replaced-element fallback when neither an intrinsic size nor ratio
  // exists. Matching the browser's 300x150 default keeps HTML and PPTX cover
  // behavior aligned for minimal self-contained SVGs.
  return { width: width ?? 300, height: height ?? 150 };
}

function svgLengthInPixels(raw) {
  if (typeof raw !== 'string') {
    return null;
  }
  const match = raw.match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+))(px|pt|pc|in|cm|mm|q)?$/i);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  const factor = {
    px: 1,
    pt: 96 / 72,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    q: 96 / 101.6,
  }[(match[2] ?? 'px').toLowerCase()];
  return value > 0 ? value * factor : null;
}

function resolveAssetPath(root, source) {
  if (typeof source !== 'string' || !source.trim()) {
    throw new Error('image source must be a non-empty relative path');
  }
  if (isAbsolute(source) || /^[a-z][a-z0-9+.-]*:/i.test(source) || /^[a-z]:[\\/]/i.test(source)) {
    throw new Error(`image source must be relative to the deck file: ${source}`);
  }
  const path = realpathSync(resolve(root, source));
  const rel = relative(root, path);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`image source escapes the deck directory: ${source}`);
  }
  return path;
}

function validateSvg(text) {
  if (/<!doctype|<!entity|<(?:script|foreignObject|iframe|object|embed)\b/i.test(text)) {
    throw new Error('SVG contains executable or externally parsed content');
  }
  if (/\son[a-z]+\s*=/i.test(text)) {
    throw new Error('SVG event handlers are not allowed');
  }
  if (/\b(?:href|src)\s*=\s*["'](?!#|data:image\/(?:png|jpeg|gif);base64,)/i.test(text)) {
    throw new Error('SVG external references are not allowed');
  }
  if (/url\(\s*["']?(?!#|data:image\/(?:png|jpeg|gif);base64,)/i.test(text)) {
    throw new Error('SVG external CSS URLs are not allowed');
  }
  if (/@import\b/i.test(text)) {
    throw new Error('SVG CSS @import is not allowed');
  }
}
