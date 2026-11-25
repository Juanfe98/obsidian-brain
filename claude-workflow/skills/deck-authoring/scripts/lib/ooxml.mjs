// Pure OOXML value helpers. Deliberately dependency-free so the hermetic test
// suite can import them: CI runs `node --test` WITHOUT installing the skill's
// node_modules, so anything reachable from a test must not pull pptxgenjs.

import { createHash } from 'node:crypto';
import { extname } from 'node:path';

/**
 * pptxgenjs wants "1990B7": no leading '#', exactly 6 hex digits, never 8.
 * Both "#FF0000" and an alpha-baked "00000020" corrupt the file.
 */
export function hex(color) {
  const h = String(color).replace(/^#/, '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(h)) {
    throw new Error(`color must be #rrggbb, got ${JSON.stringify(color)}`);
  }
  return h;
}

export function dedupePptxMediaParts(files) {
  const canonicalByDigest = new Map();
  const redirects = new Map();
  const media = Object.keys(files)
    .filter((name) => name.startsWith('ppt/media/') && !name.endsWith('/'))
    .sort();

  for (const name of media) {
    const digest = createHash('sha256').update(files[name]).digest('hex');
    const key = `${extname(name).toLowerCase()}:${digest}`;
    const canonical = canonicalByDigest.get(key);
    if (canonical) {
      redirects.set(name, canonical);
      delete files[name];
    } else {
      canonicalByDigest.set(key, name);
    }
  }

  if (redirects.size > 0) {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    for (const name of Object.keys(files).filter((entry) => entry.endsWith('.rels'))) {
      const xml = decoder.decode(files[name]);
      const rewritten = xml.replace(/Target="([^"]*\/media\/([^"]+))"/g, (match, target, file) => {
        const canonical = redirects.get(`ppt/media/${file}`);
        if (!canonical) {
          return match;
        }
        const prefix = target.slice(0, target.lastIndexOf('/') + 1);
        return `Target="${prefix}${canonical.slice('ppt/media/'.length)}"`;
      });
      if (rewritten !== xml) {
        files[name] = encoder.encode(rewritten);
      }
    }
  }

  return { uniqueMedia: canonicalByDigest.size, removedDuplicateMedia: redirects.size };
}

/**
 * The five XML predefined entities (XML 1.0 section 4.6). This is the COMPLETE
 * named set: every other name (&nbsp;, &copy;) requires a DTD declaration, and
 * an OPC part may not carry a DTD, so a name outside this table is not an
 * entity at all and must survive decoding unchanged.
 */
const XML_ENTITIES = Object.freeze({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" });

/** XML 1.0 section 2.2 Char: what a numeric reference is allowed to denote. */
const isXmlChar = (n) => n === 0x9 || n === 0xa || n === 0xd
  || (n >= 0x20 && n <= 0xd7ff) || (n >= 0xe000 && n <= 0xfffd)
  || (n >= 0x10000 && n <= 0x10ffff);

// One alternation preserves XML's single-pass entity semantics. Replacing one
// entity name at a time would incorrectly decode nested text such as &amp;lt;.
const XML_REF = /&(?:#([0-9]+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));/g;

/**
 * Raw OOXML character data -> the text a reader sees. Named entities, decimal
 * (&#38;) and hex (&#x26;) character references all resolve; anything that is
 * not a well-formed, in-range reference is left byte-for-byte alone so an
 * undecodable run fails a comparison instead of silently mutating.
 */
export function decodeXmlText(raw) {
  const s = String(raw ?? '');
  if (!s.includes('&')) {
    return s; // the overwhelmingly common case
  }
  return s.replace(XML_REF, (whole, dec, hexDigits, name) => {
    if (name !== undefined) {
      return XML_ENTITIES[name] ?? whole;
    }
    // Range-check BEFORE fromCodePoint, which throws on anything above 0x10FFFF.
    const n = Number.parseInt(dec ?? hexDigits, dec !== undefined ? 10 : 16);
    return isXmlChar(n) ? String.fromCodePoint(n) : whole;
  });
}

/** OOXML wraps lines wherever it likes, so all comparison is on collapsed text. */
export const collapseWhitespace = (s) => String(s).replace(/\s+/g, ' ').trim();

/** Attribute order is not significant; Google exports cy before cx. */
export function presentationSize(xml) {
  const tags = [...xml.matchAll(/<p:sldSz\b([^>]*)>/g)];
  if (tags.length !== 1) {
    return null;
  }
  const dimensions = {};
  for (const [, name, raw] of tags[0][1].matchAll(/(?:^|\s)(cx|cy)\s*=\s*("[^"]*"|'[^']*'|[^\s]+)/g)) {
    if (Object.hasOwn(dimensions, name) || !['"', "'"].includes(raw[0])
        || raw.at(-1) !== raw[0] || !/^[1-9]\d*$/.test(raw.slice(1, -1))) {
      return null;
    }
    const value = Number(raw.slice(1, -1));
    if (!Number.isSafeInteger(value)) {
      return null;
    }
    dimensions[name] = value;
  }
  return dimensions.cx && dimensions.cy ? { cx: dimensions.cx, cy: dimensions.cy } : null;
}

// Three token classes, one scan: run text, a line break, a text-body boundary.
// The `\s` before each attribute list is load-bearing - it is the only thing
// keeping `<a:t ...>` from also matching the sibling elements `<a:tbl>` and
// `<a:tab pos="914400"/>`, whose names merely start with "a:t".
const TEXT_TOKEN = new RegExp([
  /<a:t(?:\s[^>]*)?>(?<text>[\s\S]*?)<\/a:t>/,          // a run's character data
  /(?<lineBreak><a:br(?:\s[^>]*)?\/?>|<\/a:p>)/,        // explicit break, end of paragraph
  /(?<bodyEdge><\/?[pa]:txBody(?:\s[^>]*)?>)/,          // start/end of a text body
].map((r) => r.source).join('|'), 'g');

/**
 * Return decoded text per OOXML text body. Runs rejoin without separators
 * because a run boundary is formatting, while paragraph and `<a:br/>`
 * boundaries contribute whitespace. Keeping bodies separate prevents false
 * matches across unrelated shapes.
 */
export function slideTextBlocks(xml) {
  const blocks = [];
  let runs = 0;
  let pending = '';
  const flush = () => {
    const text = collapseWhitespace(pending);
    if (text) {
      blocks.push(text);
    }
    pending = '';
  };
  for (const { groups } of String(xml).matchAll(TEXT_TOKEN)) {
    if (groups.text !== undefined) {
      runs += 1;
      pending += decodeXmlText(groups.text);
    } else if (groups.lineBreak !== undefined) {
      pending += '\n';
    } else {
      flush();
    }
  }
  flush();
  return { blocks, runs };
}

export function chartSummary(xml) {
  const source = String(xml);
  const chartTag = /<c:(barChart|lineChart|areaChart|pieChart|doughnutChart)\b/.exec(source)?.[1];
  const type = {
    barChart: 'bar',
    lineChart: 'line',
    areaChart: 'area',
    pieChart: 'pie',
    doughnutChart: 'doughnut',
  }[chartTag];
  const series = [...source.matchAll(/<c:ser>([\s\S]*?)<\/c:ser>/g)].map((match) => {
    const body = match[1];
    const tx = /<c:tx>([\s\S]*?)<\/c:tx>/.exec(body)?.[1] ?? '';
    const name = pointValues(tx)[0] ?? decodeXmlText(/<c:v>([\s\S]*?)<\/c:v>/.exec(tx)?.[1] ?? '');
    const cat = /<c:cat>([\s\S]*?)<\/c:cat>/.exec(body)?.[1] ?? '';
    const val = /<c:val>([\s\S]*?)<\/c:val>/.exec(body)?.[1] ?? '';
    return {
      name: collapseWhitespace(name),
      categories: pointValues(cat).map(collapseWhitespace),
      values: pointValues(val).map((value) => Number(value)),
    };
  });
  return { type, series };
}

export function chartRelationshipTargets(xml) {
  return [...String(xml).matchAll(/<Relationship\b([^>]*)\/?>/g)].flatMap((match) => {
    const attrs = match[1];
    const type = /\bType="([^"]+)"/.exec(attrs)?.[1] ?? '';
    const target = /\bTarget="([^"]+)"/.exec(attrs)?.[1] ?? '';
    return type.endsWith('/chart') && target ? [decodeXmlText(target)] : [];
  });
}

function pointValues(xml) {
  return [...String(xml).matchAll(/<c:pt\b[^>]*idx="(\d+)"[^>]*>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>[\s\S]*?<\/c:pt>/g)]
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((match) => decodeXmlText(match[2]));
}
