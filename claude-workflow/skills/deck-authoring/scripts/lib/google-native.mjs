// Native Google authoring: copy the approved source, duplicate selected source
// slides, and edit native objects. Planning is pure; CLI effects are injected.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWriteFileSync } from './fs-safe.mjs';
import { createHash } from 'node:crypto';
import { inspectText, nativeGeometry, nativeTableCells, spatialHints, styleLookup } from './google-inspection.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const templateRegistry = JSON.parse(readFileSync(join(HERE, '../../templates/dee.json'), 'utf8'));
const execute = promisify(execFile);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const id = (value) => typeof value === 'string' && /^[A-Za-z0-9_][A-Za-z0-9_.:-]{0,127}$/.test(value);

function fields(value, allowed, where) {
  if (!isRecord(value)) {
    throw new Error(`${where} must be an object`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      throw new Error(`${where} has unknown field ${key}`);
    }
  }
}

export function googleTemplate(domain = 'apps.disney.com', mode = 'light') {
  const template = templateRegistry.google[domain]?.[mode];
  if (!template) {
    throw new Error('select an approved Google domain and light/dark mode');
  }
  return template;
}

function flatten(elements, depth = 0) {
  if (!Array.isArray(elements) || elements.length > 2000 || depth > 20) {
    throw new Error('invalid or oversized native page elements');
  }
  const result = elements.flatMap((element) => {
    if (!isRecord(element) || !id(element.objectId)) {
      throw new Error('invalid native object ID');
    }
    return [element, ...(element.elementGroup ? flatten(element.elementGroup.children, depth + 1) : [])];
  });
  if (result.length > 2000) {
    throw new Error('native slide exceeds 2000 objects');
  }
  return result;
}

const sourceText = (text) => (text?.textElements ?? []).map((element) => element.textRun?.content ?? '').join('');

const ELEMENT_TYPES = [
  ['shape', 'text'],
  ['table', 'table'],
  ['image', 'image'],
  ['sheetsChart', 'sheets-chart'],
  ['elementGroup', 'group'],
];

const elementType = (element) => ELEMENT_TYPES.find(([key]) => element[key])?.[1] ?? 'decoration';

export function inspectGoogle(source, slideNumber) {
  if (!id(source.presentationId) || !Array.isArray(source.slides)
      || !source.slides.length || source.slides.length > 200) {
    throw new Error('invalid native Google presentation');
  }
  if (source.revisionId !== undefined && (typeof source.revisionId !== 'string' || !source.revisionId || source.revisionId.length > 1024)) {
    throw new Error('invalid native revision ID');
  }
  const toPt = (dimension) => {
    if (dimension?.unit === 'PT') {
      return dimension.magnitude;
    }
    return dimension?.unit === 'EMU' ? dimension.magnitude / 12700 : NaN;
  };
  if (Math.abs(toPt(source.pageSize?.width) - 1920) > 1.5
      || Math.abs(toPt(source.pageSize?.height) - 1080) > 1.5
      || !Number.isFinite(toPt(source.pageSize?.width)) || !Number.isFinite(toPt(source.pageSize?.height))) {
    throw new Error('native DEE Google template must use a 1920x1080pt canvas');
  }
  const ids = source.slides.flatMap((slide) => [slide.objectId, ...flatten(slide.pageElements ?? []).map((element) => element.objectId)]);
  if (ids.some((value) => !id(value)) || new Set(ids).size !== ids.length) {
    throw new Error('native source has invalid or duplicate IDs');
  }
  if (slideNumber !== undefined && (!Number.isInteger(slideNumber) || slideNumber < 1 || slideNumber > source.slides.length)) {
    throw new Error('slide must be a one-based index in the source presentation');
  }
  const lookup = styleLookup(source);
  return {
    // Google omits revisionId on read-only official templates. Bind planning
    // to the stable source structure; mutations still require the copy's revision.
    template: { id: source.presentationId, sourceHash: sourceFingerprint(source) },
    pageSize: source.pageSize,
    slides: source.slides.map((slide, index) => {
      const objects = flatten(slide.pageElements ?? []);
      const geometry = nativeGeometry(slide.pageElements ?? []);
      const details = objects.map((element) => ({
        id: element.objectId,
        type: elementType(element),
        ...(element.shape ? { text: sourceText(element.shape.text), ...inspectText(element, lookup),
          ...(element.shape.placeholder?.type ? { placeholderType: element.shape.placeholder.type } : {}) } : {}),
        ...(element.table ? {
          cells: element.table.tableRows.map((row) => row.tableCells.map((cell) => sourceText(cell.text))),
          cellPositions: nativeTableCells(element.table).map(({ cell, ...position }) => ({ ...position, text: sourceText(cell.text) })),
          frameNote: 'Minimum table frame; wrapped cells can expand in the native render.',
        } : {}),
        boundsPt: geometry.get(element.objectId), size: element.size, transform: element.transform,
      }));
      const hints = spatialHints(details);
      return { index: index + 1, id: slide.objectId,
        title: hints.title || objects.map((element) => sourceText(element.shape?.text).trim()).find(Boolean) || '',
        content: { tables: objects.filter(e => e.table).length, images: objects.filter(e => e.image).length,
          groups: objects.filter(e => e.elementGroup).length, connectors: objects.filter(e => e.line).length },
        ...(slideNumber === index + 1 ? { objects: details, readingOrder: hints.readingOrder, metricPairs: hints.metricPairs } : {}),
      };
    }).filter((slide) => slideNumber === undefined || slide.index === slideNumber),
  };
}

function replacementRequests(objectId, original, replacement, cellLocation, find) {
  if (typeof replacement !== 'string' || replacement.length > 10000 || replacement.includes('\0')) {
    throw new Error('replacement text must be a string of at most 10000 UTF-16 units without NUL');
  }
  let start = 0;
  let length = original.endsWith('\n') ? original.length - 1 : original.length;
  if (find !== undefined) {
    if (typeof find !== 'string' || !find) {
      throw new Error('find must be non-empty');
    }
    const editable = original.slice(0, length);
    start = editable.indexOf(find);
    if (start < 0 || editable.indexOf(find, start + 1) >= 0) {
      throw new Error('find must match exactly once within its native object, excluding the final newline');
    }
    length = find.length;
  }
  const cell = cellLocation ? { cellLocation } : {};
  const requests = [];
  // Insert BEFORE deleting so Google inherits the neighboring source run and
  // paragraph style. JS offsets already use the UTF-16 units required by Slides.
  if (replacement) {
    requests.push({ insertText: { objectId, text: replacement, insertionIndex: start, ...cell } });
  }
  if (length) {
    requests.push({ deleteText: { objectId,
      textRange: { type: 'FIXED_RANGE', startIndex: start + replacement.length, endIndex: start + replacement.length + length }, ...cell } });
  }
  return { requests, text: original.slice(0, start) + replacement + original.slice(start + length) };
}

const EDIT_FIELDS = { text: ['text', 'find'], 'table-cell': ['text', 'find', 'row', 'column'],
  image: ['url', 'fit'], 'refresh-chart': [], delete: [] };

export function planGoogle(source, plan) {
  validatePlanHeader(source, plan);
  const sourceSlides = new Map(source.slides.map((slide) => [slide.objectId, slide]));
  const lookup = styleLookup(source);
  const allIds = new Set(source.slides.flatMap((slide) => [slide.objectId, ...flatten(slide.pageElements ?? []).map((element) => element.objectId)]));
  const requests = [];
  const requiredTextBySlide = [];
  const slideIds = [];
  for (const [index, slide] of plan.slides.entries()) {
    const planned = planSlide({ sourceSlides, allIds, lookup, requests }, index, slide);
    slideIds.push(planned.slideId);
    requiredTextBySlide.push(planned.requiredText);
  }
  // Google requires IDs within each move to already be in presentation order.
  // Duplicates start immediately after their source, so arbitrary selections
  // (especially repeated sources) cannot be moved in one target-ordered batch.
  // Moving one slide at a time to the front, last to first, preserves our order.
  for (const slideId of [...slideIds].reverse()) {
    requests.push({ updateSlidesPosition: { slideObjectIds: [slideId], insertionIndex: 0 } });
  }
  requests.push(...source.slides.map((slide) => ({ deleteObject: { objectId: slide.objectId } })));
  if (requests.length > 1000) {
    throw new Error('composition exceeds the 1000-request atomic batch limit');
  }
  if (Buffer.byteLength(JSON.stringify(requests)) > (4 << 20) - 4096) {
    throw new Error('composition exceeds the 4 MiB atomic batch limit');
  }
  return { requests, requiredTextBySlide, slideIds };
}

function validatePlanHeader(source, plan) {
  inspectGoogle(source);
  fields(plan, ['title', 'template', 'slides'], 'plan');
  fields(plan.template, ['id', 'sourceHash'], 'template');
  if (plan.template.id !== source.presentationId || plan.template.sourceHash !== sourceFingerprint(source)) {
    throw new Error('native source changed; inspect the template and rebuild the plan');
  }
  if (typeof plan.title !== 'string' || !plan.title.trim() || plan.title.length > 200) {
    throw new Error('plan.title must contain 1–200 characters');
  }
  if (!Array.isArray(plan.slides) || !plan.slides.length || plan.slides.length > 200) {
    throw new Error('plan requires 1–200 slides');
  }
}

// Appends the duplicate and edit requests for one planned slide to
// context.requests; returns the duplicate's slide ID and its required text.
function planSlide({ sourceSlides, allIds, lookup, requests }, index, slide) {
  fields(slide, ['sourceSlideId', 'edits'], `slides[${index}]`);
  const original = sourceSlides.get(slide.sourceSlideId);
  if (!original) {
    throw new Error(`source slide ${slide.sourceSlideId} is absent`);
  }
  const elements = new Map(flatten(original.pageElements ?? []).map((element) => [element.objectId, element]));
  if (elements.size + 1 > 2000) {
    throw new Error('native slide exceeds the 2000 duplicate-ID limit including the slide itself');
  }
  if (!Array.isArray(slide.edits) || slide.edits.length > 500) {
    throw new Error('each slide requires an edits array of at most 500 entries');
  }
  const objectIds = {};
  for (const [number, originalId] of [original.objectId, ...elements.keys()].entries()) {
    const newId = `aix_native_${index}_${number}`;
    if (allIds.has(newId)) {
      throw new Error('source object IDs conflict with the output namespace');
    }
    objectIds[originalId] = newId;
  }
  requests.push({ duplicateObject: { objectId: original.objectId, objectIds } });
  const state = {
    slide,
    elements,
    objectIds,
    lookup,
    requests,
    touched: new Map(),
    textStates: new Map(),
    deleted: new Set(slide.edits.filter((edit) => edit?.kind === 'delete').map((edit) => edit.objectId)),
  };
  for (const edit of slide.edits) {
    planEdit(state, edit);
  }
  return {
    slideId: objectIds[original.objectId],
    requiredText: [...state.textStates.values()].map((text) => text.trim()).filter(Boolean),
  };
}

function planEdit(state, edit) {
  const { elements, objectIds, lookup, touched, deleted } = state;
  if (!isRecord(edit) || !Object.hasOwn(EDIT_FIELDS, edit.kind)) {
    throw new Error('unknown native edit kind');
  }
  fields(edit, ['kind', 'objectId', ...EDIT_FIELDS[edit.kind]], 'edit');
  const element = elements.get(edit.objectId);
  if (!element) {
    throw new Error(`edit object ${edit.objectId} is not on selected source slide`);
  }
  if (edit.kind !== 'delete' && deleted.has(edit.objectId)) {
    throw new Error('cannot edit a deleted object');
  }
  const key = `${edit.objectId}:${edit.row ?? ''}:${edit.column ?? ''}`;
  const prior = touched.get(key);
  if (prior && (typeof prior.find !== 'string' || typeof edit.find !== 'string')) {
    throw new Error('repeated text-object or table-cell edits must use targeted find replacements');
  }
  touched.set(key, edit);
  const objectId = objectIds[edit.objectId];
  if (edit.kind === 'text' && element.shape && edit.find === undefined && inspectText(element, lookup).mixedStyles) {
    throw new Error(`object ${edit.objectId} has mixed source text styles; use separate targeted find replacements for its heading/body or emphasized runs`);
  }
  applyEdit(state, { edit, element, key, objectId });
}

function applyEdit(state, { edit, element, key, objectId }) {
  const { slide, requests, textStates } = state;
  if (edit.kind === 'delete') {
    assertNoDescendantEdits(slide, element);
    requests.push({ deleteObject: { objectId } });
    return;
  }
  if (edit.kind === 'text' && element.shape) {
    const replacement = replacementRequests(objectId, textStates.get(key) ?? sourceText(element.shape.text), edit.text, undefined, edit.find);
    requests.push(...replacement.requests);
    textStates.set(key, replacement.text);
    return;
  }
  if (edit.kind === 'table-cell' && element.table) {
    const replacement = tableCellReplacement(edit, element, textStates.get(key), objectId);
    requests.push(...replacement.requests);
    textStates.set(key, replacement.text);
    return;
  }
  if (edit.kind === 'image' && element.image) {
    requests.push(imageRequest(edit, objectId));
    return;
  }
  if (edit.kind === 'refresh-chart' && element.sheetsChart) {
    requests.push({ refreshSheetsChart: { objectId } });
    return;
  }
  throw new Error(`edit ${edit.kind} is incompatible with its native source object`);
}

function assertNoDescendantEdits(slide, element) {
  if (!element.elementGroup) {
    return;
  }
  const descendants = new Set(flatten(element.elementGroup.children).map((child) => child.objectId));
  if (slide.edits.some((other) => descendants.has(other.objectId))) {
    throw new Error('cannot edit a descendant of a deleted group');
  }
}

function tableCellReplacement(edit, element, priorText, objectId) {
  if (!Number.isInteger(edit.row) || edit.row < 0 || !Number.isInteger(edit.column) || edit.column < 0) {
    throw new Error('table row/column must be nonnegative integers');
  }
  const cell = nativeTableCells(element.table).find(c => c.row === edit.row && c.column === edit.column)?.cell;
  if (!cell) {
    throw new Error('table edit must target an existing native cell anchor, not a covered merged cell');
  }
  return replacementRequests(objectId, priorText ?? sourceText(cell.text), edit.text,
    { rowIndex: edit.row, columnIndex: edit.column }, edit.find);
}

function imageRequest(edit, objectId) {
  if (typeof edit.url !== 'string' || edit.url.length > 2048) {
    throw new Error('image URL must be a string of at most 2048 characters');
  }
  const url = new URL(edit.url);
  if (url.protocol !== 'https:' || url.username || url.password || !['cover', 'contain', undefined].includes(edit.fit)) {
    throw new Error('images require an HTTPS URL and cover/contain fit');
  }
  return { replaceImage: { imageObjectId: objectId, url: url.href,
    imageReplaceMethod: edit.fit === 'contain' ? 'CENTER_INSIDE' : 'CENTER_CROP' } };
}

export async function runGoogleCli(binary, args, { run = execute } = {}) {
  const command = binary === 'udoc' ? process.env.DECK_UDOC || binary : process.env.DECK_GDRIVE || binary;
  let result;
  try {
    result = await run(command, ['--agent', '--no-cache', ...(binary === 'udoc' ? ['--no-sanitize', '--full', '--provider', 'google'] : []), ...args],
      { timeout: 120_000, maxBuffer: 32 << 20, windowsHide: true,
        env: { ...process.env, NO_CACHE: '1', AIX_NO_BROWSER: '1' } });
  } catch (error) {
    // Agent-mode CLIs return the actionable API error on stdout even when the
    // process exits nonzero. Preserve that diagnosis without replaying a write.
    let failure;
    try {
      failure = JSON.parse(error.stdout);
    } catch {
      throw error;
    }
    if (failure?.status !== 'error') {
      throw error;
    }
    throw googleCliError(binary, failure, error);
  }
  const response = JSON.parse(result.stdout);
  if (response.status !== 'success') {
    throw googleCliError(binary, response);
  }
  return response.data;
}

function googleCliError(binary, response, cause) {
  const code = typeof response?.error_code === 'string' ? response.error_code.slice(0, 128) : 'unknown error';
  const detail = typeof response?.error_message === 'string' ? `: ${response.error_message.slice(0, 2048)}` : '';
  return new Error(`${binary} failed (${code})${detail}`, { cause });
}

export function sourceFingerprint(source) {
  const canonical = (value) => {
    if (Array.isArray(value)) {
      return value.map(canonical);
    }
    if (!isRecord(value)) {
      return value;
    }
    return Object.fromEntries(Object.keys(value).filter((key) => !['contentUrl', 'thumbnailUrl', 'revisionId'].includes(key))
      .sort().map((key) => [key, canonical(value[key])]));
  };
  return createHash('sha256').update(JSON.stringify(canonical({ pageSize: source.pageSize,
    slides: source.slides.map(({ objectId, pageElements, pageProperties, slideProperties }) => ({
      objectId, pageElements, pageProperties, layoutObjectId: slideProperties?.layoutObjectId,
      masterObjectId: slideProperties?.masterObjectId,
    })), layouts: source.layouts, masters: source.masters }))).digest('hex');
}

export async function checkGoogleCapability(cli = runGoogleCli) {
  const schema = await cli('udoc', ['agent', 'schema']);
  if (!schema.commands?.some((command) => command.path === 'slide batch-update <id>')) {
    throw new Error('installed udoc lacks slide batch-update; update CLI Universe before creating a Google draft');
  }
}

export async function composeGoogle(source, plan, directory, { cli = runGoogleCli } = {}) {
  const compiled = planGoogle(source, plan);
  await checkGoogleCapability(cli);
  const receiptPath = join(directory, 'google-receipt.json');
  const pending = { phase: 'copy-requested', sourceId: source.presentationId, title: plan.title };
  atomicWriteFileSync(receiptPath, JSON.stringify(pending, null, 2));
  let copy;
  try {
    copy = await cli('udoc', ['doc', 'copy', source.presentationId, '--title', plan.title]);
    if (!id(copy?.id) || copy.id === source.presentationId) {
      throw new Error('copy did not return a distinct native presentation ID');
    }
  } catch (error) {
    atomicWriteFileSync(receiptPath, JSON.stringify({ ...pending, phase: 'copy-unknown' }, null, 2));
    throw new Error(`Drive copy response was not confirmed. Search Drive for the new draft title before retrying; receipt: ${receiptPath}`, { cause: error });
  }
  const receipt = { phase: 'copied', sourceId: source.presentationId, presentationId: copy.id,
    url: `https://docs.google.com/presentation/d/${copy.id}/edit` };
  atomicWriteFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  try {
    const copied = await cli('udoc', ['slide', 'get', copy.id]);
    inspectGoogle(copied);
    if (!copied.revisionId) {
      throw new Error('new copy did not grant edit access or return its required revision ID');
    }
    if (sourceFingerprint(source) !== sourceFingerprint(copied)) {
      throw new Error('source changed during copy or native IDs/styles were not retained; inspect the draft');
    }
    const batch = { requests: compiled.requests, writeControl: { requiredRevisionId: copied.revisionId } };
    const batchPath = join(directory, 'google-batch.json');
    atomicWriteFileSync(batchPath, JSON.stringify(batch, null, 2));
    await cli('udoc', ['slide', 'batch-update', copy.id, '--file', realpathSync(batchPath)]);
    receipt.phase = 'populated';
    atomicWriteFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    return { ...receipt, ...compiled };
  } catch (error) {
    receipt.phase = 'needs-inspection';
    atomicWriteFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    throw new Error(`native Google draft ${copy.id} may be partially completed; inspect it before retrying. Source unchanged. ${error.message}`, { cause: error });
  }
}
