import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, parse, resolve } from 'node:path';

const OUTPUT_MARKER = '.deck-authoring-output';
const OUTPUT_MARKER_CONTENT = 'managed by AIX deck-authoring\n';

function metadata(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function tempPath(path) {
  return `${path}.aix.tmp`;
}

function backupPath(path) {
  return `${path}.aix.backup`;
}

export function atomicWriteFileSync(path, data, options = undefined) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = tempPath(path);
  rmSync(temp, { recursive: true, force: true });
  const writeOptions = typeof options === 'string'
    ? { encoding: options, flag: 'wx', mode: 0o600 }
    : { ...(options ?? {}), flag: 'wx', mode: options?.mode ?? 0o600 };
  try {
    writeFileSync(temp, data, writeOptions);
    renameSync(temp, path);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

export async function atomicProduceFile(path, producer, { preserveExtension = false } = {}) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = tempPath(path);
  const extension = preserveExtension ? extname(path) : '';
  const producerPath = extension ? `${temp}${extension}` : temp;
  rmSync(temp, { recursive: true, force: true });
  if (producerPath !== temp) {
    rmSync(producerPath, { recursive: true, force: true });
  }
  try {
    const result = await producer(producerPath);
    if (producerPath !== temp) {
      const produced = metadata(producerPath);
      if (!produced?.isFile() || produced.isSymbolicLink()) {
        throw new Error(`producer did not create a regular staged file at ${producerPath}`);
      }
      renameSync(producerPath, temp);
    }
    const staged = metadata(temp);
    if (!staged?.isFile() || staged.isSymbolicLink()) {
      throw new Error(`producer did not create a regular staged file at ${temp}`);
    }
    renameSync(temp, path);
    return result;
  } finally {
    if (producerPath !== temp) {
      rmSync(producerPath, { recursive: true, force: true });
    }
    rmSync(temp, { recursive: true, force: true });
  }
}

function assertReplaceableDirectory(destination, current, validateExisting) {
  if (current && (current.isSymbolicLink() || !current.isDirectory())) {
    throw new Error(
      `directory replacement target must be a real directory, not a file or symlink: ${destination}`,
    );
  }
  if (current && typeof validateExisting !== 'function') {
    throw new Error(
      `refusing to replace existing directory ${destination} without an ownership validator`,
    );
  }
}

export async function atomicReplaceDirectory(
  path,
  producer,
  {
    rename = renameSync,
    validateExisting = undefined,
  } = {},
) {
  const destination = resolve(path);
  mkdirSync(dirname(destination), { recursive: true });
  const temp = tempPath(destination);
  const backup = backupPath(destination);
  if (metadata(temp)) {
    throw new Error(
      `refusing to replace ${destination} while staging directory exists: ${temp}`,
    );
  }
  if (metadata(backup)) {
    throw new Error(
      `refusing to replace ${destination} while recovery backup exists: ${backup}`,
    );
  }
  mkdirSync(temp);
  let stagingOwned = true;
  let originalMoved = false;
  const restoreOriginal = (operationError) => {
    try {
      rename(backup, destination);
      originalMoved = false;
    } catch (restoreError) {
      throw new Error(
        `could not complete directory replacement for ${destination} or restore the prior ` +
        `directory; the prior directory remains recoverable at ${backup} ` +
        `(operation: ${operationError.message}; restore: ${restoreError.message})`,
        { cause: operationError },
      );
    }
  };
  try {
    const result = await producer(temp);
    const staged = metadata(temp);
    if (!staged?.isDirectory() || staged.isSymbolicLink()) {
      throw new Error(`producer did not leave a regular staged directory at ${temp}`);
    }

    const current = metadata(destination);
    assertReplaceableDirectory(destination, current, validateExisting);
    if (metadata(backup)) {
      throw new Error(
        `refusing to replace ${destination} while recovery backup exists: ${backup}`,
      );
    }
    if (current) {
      rename(destination, backup);
      originalMoved = true;
      try {
        // Validate the exact tree moved aside, not a preflight snapshot. A
        // concurrent path swap must be restored rather than deleted.
        validateExisting?.(backup);
      } catch (validationError) {
        restoreOriginal(validationError);
        throw validationError;
      }
    }
    try {
      rename(temp, destination);
      stagingOwned = false;
    } catch (publishError) {
      if (originalMoved) {
        restoreOriginal(publishError);
      }
      throw publishError;
    }
    if (originalMoved) {
      rmSync(backup, { recursive: true, force: true });
      originalMoved = false;
    }
    return result;
  } finally {
    if (stagingOwned) {
      rmSync(temp, { recursive: true, force: true });
    }
  }
}

export function markOutputDirectory(path) {
  const outDir = resolve(path);
  mkdirSync(outDir, { recursive: true });
  atomicWriteFileSync(join(outDir, OUTPUT_MARKER), OUTPUT_MARKER_CONTENT, 'utf8');
  return outDir;
}

function readOwnershipMarker(markerPath, readFile) {
  const marker = metadata(markerPath);
  if (!marker?.isFile() || marker.isSymbolicLink()) {
    return { managed: false, markerReadFailure: null };
  }
  try {
    return { managed: readFile(markerPath, 'utf8') === OUTPUT_MARKER_CONTENT, markerReadFailure: null };
  } catch (error) {
    return { managed: false, markerReadFailure: error?.code ?? 'read error' };
  }
}

export function prepareOutputDirectory(path, { readFile = readFileSync } = {}) {
  const outDir = resolve(path);
  if (outDir === parse(outDir).root) {
    throw new Error(`refusing to use filesystem root as a deck output directory: ${outDir}`);
  }

  const current = metadata(outDir);
  if (current) {
    if (current.isSymbolicLink() || !current.isDirectory()) {
      throw new Error(`deck output must be a real directory, not a file or symlink: ${outDir}`);
    }

    const markerPath = join(outDir, OUTPUT_MARKER);
    const { managed, markerReadFailure } = readOwnershipMarker(markerPath, readFile);
    const entries = readdirSync(outDir);
    if (entries.length > 0 && !managed) {
      throw new Error(
        `refusing to replace non-deck output directory ${outDir}; choose an empty directory or remove: ${
          entries.join(', ')
        }${
          markerReadFailure
            ? `; ownership marker ${markerPath} could not be read (${markerReadFailure})`
            : ''
        }`,
      );
    }
  }

  return outDir;
}
