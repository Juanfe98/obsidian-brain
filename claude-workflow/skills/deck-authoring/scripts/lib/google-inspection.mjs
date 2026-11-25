// Read native coordinates and inherited typography before choosing edit targets.
// Object array order is paint order, not reading order or value/label pairing.
const IDENTITY = [1, 0, 0, 1, 0, 0];
const pt = (value) => {
  if (value?.unit === 'EMU') {
    return value.magnitude / 12700;
  }
  return value?.unit === 'PT' ? value.magnitude ?? 0 : NaN;
};

export function multiplyTransforms(a, b) {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}

function transform(value) {
  if (!value) {
    return IDENTITY;
  }
  return [value.scaleX ?? 0, value.shearY ?? 0, value.shearX ?? 0, value.scaleY ?? 0,
    pt({ magnitude: value.translateX ?? 0, unit: value.unit }),
    pt({ magnitude: value.translateY ?? 0, unit: value.unit })];
}

export function nativeGeometry(elements, parent = IDENTITY, depth = 0) {
  if (!Array.isArray(elements) || elements.length > 2000 || depth > 20) {
    throw new Error('invalid native geometry tree');
  }
  const output = new Map();
  for (const element of elements) {
    const world = multiplyTransforms(parent, transform(element.transform));
    let width = pt(element.size?.width), height = pt(element.size?.height);
    // Google table size is a nominal creation size. Column/row dimensions own
    // its minimum frame; rendered rows can grow when cell content wraps.
    if (element.table?.tableColumns?.length && element.table?.tableRows?.length) {
      width = element.table.tableColumns.reduce((sum, col) => sum + pt(col.columnWidth), 0);
      height = element.table.tableRows.reduce((sum, row) => sum + pt(row.rowHeight), 0);
    }
    const corners = [[0, 0], [width, 0], [0, height], [width, height]]
      .map(([x, y]) => [world[0] * x + world[2] * y + world[4], world[1] * x + world[3] * y + world[5]]);
    const xs = corners.map(([x]) => x), ys = corners.map(([, y]) => y);
    const bounds = [...xs, ...ys].every(Number.isFinite) ? {
      x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    } : null;
    output.set(element.objectId, bounds);
    if (element.elementGroup) {
      for (const [id, child] of nativeGeometry(element.elementGroup.children, world, depth + 1)) {
        output.set(id, child);
      }
    }
  }
  if (output.size > 2000) {
    throw new Error('native geometry exceeds 2000 objects');
  }
  return output;
}

export function styleLookup(source) {
  const result = new Map();
  const add = (elements, depth = 0) => {
    if (depth > 20 || !Array.isArray(elements) || elements.length > 2000) {
      throw new Error('invalid native style tree');
    }
    for (const element of elements) {
      result.set(element.objectId, element);
      if (element.elementGroup) {
        add(element.elementGroup.children, depth + 1);
      }
    }
  };
  for (const kind of ['slides', 'layouts', 'masters']) {
    const pages = source[kind] ?? [];
    if (!Array.isArray(pages) || pages.length > 1000) {
      throw new Error('invalid native style pages');
    }
    for (const page of pages) {
      add(page.pageElements ?? []);
    }
  }
  return result;
}

export function nativeTableCells(table) {
  return (table.tableRows ?? []).flatMap((row, r) => {
    let column = 0;
    return row.tableCells.map((cell) => {
      const start = cell.location?.columnIndex ?? column;
      column = start + (cell.columnSpan ?? 1);
      return { row: r, column: start, rowSpan: cell.rowSpan ?? 1, columnSpan: cell.columnSpan ?? 1, cell };
    });
  });
}

function inheritedStyle(element, level, lookup, seen = new Set()) {
  const parentId = element?.shape?.placeholder?.parentObjectId;
  if (!parentId) {
    return {};
  }
  if (seen.has(parentId) || seen.size > 20) {
    throw new Error('cyclic or deep native placeholder inheritance');
  }
  const parent = lookup.get(parentId);
  if (!parent) {
    return {};
  }
  const style = inheritedStyle(parent, level, lookup, new Set([...seen, parentId]));
  let selected = true;
  for (const item of parent.shape?.text?.textElements ?? []) {
    if (item.paragraphMarker) {
      selected = (item.paragraphMarker.bullet?.nestingLevel ?? 0) === level;
    }
    // Empty layout placeholders still carry their inherited style on the
    // newline run. Ignoring it invents a different face/weight for sparse runs.
    if (selected && item.textRun) {
      return { ...style, ...item.textRun.style };
    }
  }
  return style;
}

function normalizedStyle(style) {
  const family = style.fontFamily ?? style.weightedFontFamily?.fontFamily;
  return {
    ...(family ? { fontFamily: family } : {}),
    ...(style.fontSize ? { fontSizePt: pt(style.fontSize) } : {}),
    weight: style.weightedFontFamily?.weight ?? 400,
    bold: style.bold ?? false, italic: style.italic ?? false,
    underline: style.underline ?? false, strikethrough: style.strikethrough ?? false,
    ...(style.foregroundColor ? { foregroundColor: style.foregroundColor } : {}),
  };
}

export function inspectText(element, lookup, text = element.shape?.text) {
  const paragraphs = [];
  let level = 0, paragraph = null, offset = 0;
  for (const item of text?.textElements ?? []) {
    if (item.paragraphMarker) {
      level = item.paragraphMarker.bullet?.nestingLevel ?? 0;
      paragraph = { text: '', startIndex: item.startIndex ?? 0, runs: [],
        ...(item.paragraphMarker.bullet ? { bulletLevel: level } : {}) };
      paragraphs.push(paragraph);
    }
    if (!item.textRun) {
      continue;
    }
    if (!paragraph) {
      paragraph = { text: '', startIndex: item.startIndex ?? offset, runs: [] };
      paragraphs.push(paragraph);
    }
    const content = item.textRun.content;
    paragraph.text += content;
    paragraph.runs.push({ text: content, startIndex: item.startIndex ?? offset,
      style: normalizedStyle({ ...inheritedStyle(element, level, lookup), ...item.textRun.style }) });
    offset = (item.startIndex ?? offset) + content.length;
  }
  const signatures = paragraphs.flatMap(p => p.runs).filter(r => r.text.trim()).map(r => JSON.stringify(r.style));
  return { paragraphs, mixedStyles: new Set(signatures).size > 1 };
}

const fontSize = (object) => Math.max(0, ...(object.paragraphs ?? []).flatMap(p => p.runs).map(r => r.style.fontSizePt ?? 0));

export function spatialHints(objects) {
  const visible = objects.filter(o => o.text?.trim() && o.boundsPt && o.placeholderType !== 'SLIDE_NUMBER');
  const metricValues = visible.filter(o => fontSize(o) >= 100 && /^[\d\s.,%+$€£<>≤≥×xKMB−-]+$/u.test(o.text.trim()) && /\d/.test(o.text));
  const metricPairs = metricValues.map(value => {
    const a = value.boundsPt;
    const labels = visible.filter(label => !metricValues.includes(label) && label !== value && label.boundsPt.y > a.y
      && Math.abs(label.boundsPt.x + label.boundsPt.width / 2 - a.x - a.width / 2) < a.width / 3)
      .sort((x, y) => x.boundsPt.y - y.boundsPt.y);
    return { valueId: value.id, labelId: labels[0]?.id ?? null, x: a.x };
  }).sort((a, b) => a.x - b.x).map(({ valueId, labelId }) => ({ valueId, labelId }));
  const headings = visible.filter(o => o.boundsPt.y < 220 && fontSize(o) >= 40)
    .sort((a, b) => a.boundsPt.y - b.boundsPt.y || a.boundsPt.x - b.boundsPt.x);
  return { title: headings[0]?.text.trim() ?? visible[0]?.text.trim() ?? '', metricPairs,
    readingOrder: [...visible].sort((a, b) => a.boundsPt.y - b.boundsPt.y || a.boundsPt.x - b.boundsPt.x).map(o => o.id) };
}
