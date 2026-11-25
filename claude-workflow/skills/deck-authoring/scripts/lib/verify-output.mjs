import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { atomicWriteFileSync } from './fs-safe.mjs';
import { verifyPdf, verifyPptx } from './verify-artifact.mjs';

export const fileDigest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

function artifactPath(directory, name) {
  if (typeof name !== 'string' || !name || isAbsolute(name) || name.includes('\\')
      || name.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('invalid artifact path in integrity manifest');
  }
  const root = realpathSync(directory);
  const path = join(root, name);
  if (!lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()
      || !realpathSync(path).startsWith(`${root}${sep}`)) {
    throw new Error(`artifact is not a regular file within the build: ${name}`);
  }
  return path;
}

export function bindArtifacts(directory, paths, contract, sources) {
  const files = paths.map((path) => {
    const name = relative(resolve(directory), resolve(path)).split(sep).join('/');
    return { path: name, sha256: fileDigest(artifactPath(directory, name)) };
  });
  const evidence = { version: 1, sources, contract, files };
  atomicWriteFileSync(join(directory, '.verify', 'integrity.json'), JSON.stringify(evidence, null, 2));
  return { version: evidence.version, sources, files };
}

/** A cached successful report is evidence only while all delivered bytes match. */
export function verifyOutput(directory) {
  const failures = [];
  const fail = (rule, detail) => failures.push({ rule, severity: 'blocker', detail });
  let report = {};
  let evidence;
  const artifacts = {};
  try {
    report = JSON.parse(readFileSync(join(directory, '.verify', 'report.json'), 'utf8'));
    evidence = JSON.parse(readFileSync(join(directory, '.verify', 'integrity.json'), 'utf8'));
    if (evidence.version !== 1 || !Array.isArray(evidence.files) || evidence.files.length > 1000
        || !evidence.contract || !Number.isInteger(evidence.contract.expectedSlides)
        || evidence.contract.expectedSlides < 1 || evidence.contract.expectedSlides > 200) {
      throw new Error('unsupported or malformed integrity manifest; rebuild the deck');
    }
    for (const required of ['index.html', 'dl/deck.pdf', 'dl/deck.pptx']) {
      if (!evidence.files.some((file) => file.path === required)) {
        throw new Error(`manifest omits ${required}`);
      }
    }
    for (const file of evidence.files) {
      try {
        const path = artifactPath(directory, file.path);
        if (!/^[a-f0-9]{64}$/.test(file.sha256) || fileDigest(path) !== file.sha256) {
          fail('artifact-changed', `${file.path} differs from the rendered and verified build`);
        }
      } catch (error) {
        fail('artifact-unavailable', `${file.path}: ${error.message}`);
      }
    }
    for (const [kind, inspect] of [
      ['pdf', (path) => verifyPdf(path, evidence.contract.expectedSlides)],
      ['pptx', (path) => verifyPptx(path, evidence.contract)],
    ]) {
      try {
        artifacts[kind] = inspect(artifactPath(directory, `dl/deck.${kind}`));
        failures.push(...artifacts[kind].findings.filter((f) => ['high', 'blocker'].includes(f.severity)));
      } catch (error) {
        fail('artifact-malformed', `${kind}: ${error.message}`);
      }
    }
  } catch (error) {
    fail('verification-evidence', error.message);
  }
  return { ...report, ok: report.ok === true && failures.length === 0,
    verifiedCurrentArtifacts: failures.length === 0, artifacts,
    blocking: [...(Array.isArray(report.blocking) ? report.blocking : []), ...failures] };
}
