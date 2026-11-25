// Convert deck IR into markdown for Drive's native importer.
// This is a transform, not a dump: screen decks support a speaker, while docs
// must stand alone. Dividers become headings, charts become checkable tables,
// and speaker notes become prose.
// Pure and dependency-free for unit testing.

const esc = (s) => String(s).replace(/([|\\])/g, '\\$1');

const bullets = (items) => items.map((i) => `- ${i}`).join('\n');

function imageDescription(image, fallbackAlt) {
  const source = typeof image === 'string' ? image : image?.src;
  if (typeof source !== 'string' || !source.trim()) {
    return '';
  }
  const alt = typeof image === 'object' && typeof image.alt === 'string' && image.alt.trim()
    ? image.alt
    : fallbackAlt;
  const safeAlt = String(alt ?? 'Visual from the source deck')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/([\\`*_[\]<>])/g, '\\$1');
  // Drive receives only the Markdown bytes, not the author's local asset files.
  // Preserve the image's meaning without emitting a relative link that imports
  // as a broken image in the resulting Google Doc.
  return `> **Image:** ${safeAlt}`;
}

function chartTable(chart) {
  const head = ['', ...chart.categories].map(esc).join(' | ');
  const rule = ['---', ...chart.categories.map(() => '---')].join(' | ');
  const rows = chart.series.map((s, i) =>
    [esc(s.name ?? `Series ${i + 1}`), ...s.values.map((v) => (v === null || v === undefined ? '' : String(v)))].join(' | '),
  );
  return [`| ${head} |`, `| ${rule} |`, ...rows.map((r) => `| ${r} |`)].join('\n');
}

const TWO_COLUMN_RULE = '| --- | --- |';

/** A slide heading followed by its optional dek. */
const headed = (slide) => [`### ${slide.title}`, '', ...(slide.dek ? [slide.dek, ''] : [])];

function triFactTable(slide) {
  const rows = [1, 2, 3].map((n) => {
    const value = esc(slide[`value${n}`]);
    const caption = esc(slide[`caption${n}`]);
    return `| **${value}** | ${caption} |`;
  });
  return ['| Metric | Meaning |', TWO_COLUMN_RULE, ...rows, ''];
}

function twoColumnTable(slide) {
  const rows = [];
  for (let r = 0; r < Math.max(slide.left.length, slide.right.length); r++) {
    rows.push(`| ${esc(slide.left[r] ?? '')} | ${esc(slide.right[r] ?? '')} |`);
  }
  return ['| | |', TWO_COLUMN_RULE, ...rows, ''];
}

function cards(slide, L) {
  const lines = [];
  for (const key of Object.keys(L.slots)) {
    const card = slide[key];
    if (!card || typeof card !== 'object' || !card.heading) {
      continue;
    }
    lines.push(`**${card.heading}.** ${card.body ?? ''}`.trim(), '');
  }
  return lines;
}

function timelineTable(slide) {
  const rows = slide.milestones.map((m) => `| ${esc(m.label)} | ${esc(m.body ?? '')} |`);
  return ['| When | What |', TWO_COLUMN_RULE, ...rows, ''];
}

// One markdown renderer per layout; each returns the lines it contributes.
const LAYOUT_MARKDOWN = {
  title: (slide) => (slide.subtitle ? [`*${slide.subtitle}*`, ''] : []),
  'section-divider': (slide) => [`## ${slide.label}`, ''],
  agenda: (slide) => [`## ${slide.title}`, '', ...(slide.dek ? [slide.dek, ''] : []), bullets(slide.items), ''],
  // The one memorable line becomes a blockquote, not a heading: it is a
  // claim, and a doc reader should see it as an assertion.
  statement: (slide) => [`> **${slide.claim}**`, ''],
  'big-fact': (slide) => [`### ${slide.value}`, '', slide.caption, ''],
  'tri-fact': (slide) => [...headed(slide), ...triFactTable(slide)],
  bullets: (slide) => [...headed(slide), bullets(slide.items), ''],
  'two-column': (slide) => [...headed(slide), ...twoColumnTable(slide)],
  quote: (slide) => [`> ${slide.quote}`, '>', `> — ${slide.attribution}`, ''],
  'three-up': (slide, L) => [...headed(slide), ...cards(slide, L)],
  quad: (slide, L) => [...headed(slide), ...cards(slide, L)],
  'chart-takeaway': (slide) => [
    `### ${slide.title}`, '', `**${slide.takeaway}**`, '', chartTable(slide.chart), '',
    ...(slide.insights ? [bullets(slide.insights), ''] : []),
  ],
  timeline: (slide) => [...headed(slide), ...timelineTable(slide)],
  'image-text': (slide) => [`### ${slide.title}`, '', imageDescription(slide.image, slide.title), '', slide.body, ''],
  'large-copy': (slide) => [`### ${slide.title}`, '', slide.body, ''],
  'full-bleed-image': (slide) => [
    imageDescription(slide.image, slide.caption ?? 'Full-bleed image'), '',
    ...(slide.caption ? [`*${slide.caption}*`, ''] : []),
  ],
  'closing-cta': (slide) => ['## The ask', '', `**${slide.ask}**`, ''],
};

/**
 * @returns {string} GitHub-flavored markdown suitable for Drive's importer.
 */
export function deckToMarkdown(deck, catalog) {
  const out = [`# ${deck.title}`, ''];

  for (const slide of deck.slides) {
    const L = catalog.layouts[slide.layout];
    if (!L) {
      continue;
    }
    const render = Object.hasOwn(LAYOUT_MARKDOWN, slide.layout) ? LAYOUT_MARKDOWN[slide.layout] : undefined;
    if (render) {
      out.push(...render(slide, L));
    }

    // Speaker notes are the argument the slide could not hold. In a leave-behind
    // they belong in the prose, which is the whole point of a pre-read.
    if (slide.notes) {
      const n = Array.isArray(slide.notes) ? bullets(slide.notes) : slide.notes;
      out.push(n, '');
    }
  }

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}
