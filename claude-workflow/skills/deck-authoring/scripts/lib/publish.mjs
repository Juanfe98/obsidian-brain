import { statSync } from 'node:fs';

export const AIX_PROTO_MAX_FILE_BYTES = 5 << 20;
export const AIX_PROTO_MAX_APP_BYTES = 50 << 20;
export const AIX_PROTO_MAX_DISPLAY_NAME_CHARS = 120;

export function validatePublishIdentity(author, authorId) {
  const errors = [];
  if (typeof author !== 'string' || !/^[^@\s]+@disney\.com$/i.test(author.trim())) {
    errors.push('author must be a corporate MyID email ending in @disney.com');
  }
  if (typeof authorId !== 'string' || !/^[A-Za-z0-9._-]{2,64}$/.test(authorId.trim())) {
    errors.push('author_id must be a 2-64 character MyID login id');
  }
  return errors;
}

export function validatePublishTitle(title) {
  if (typeof title !== 'string' || !title.trim()) {
    return ['display_name must be a non-empty string'];
  }
  const normalized = title.trim();
  if (normalized.length > AIX_PROTO_MAX_DISPLAY_NAME_CHARS) {
    return [
      `display_name must be ${AIX_PROTO_MAX_DISPLAY_NAME_CHARS} characters or fewer (got ${normalized.length})`,
    ];
  }
  return [];
}

export function staticManifest(name, title, author, authorId) {
  return {
    name,
    display_name: title.trim(),
    tier: 'static',
    access: 'private',
    author: author.trim().toLowerCase(),
    author_id: authorId.trim(),
    _managedBy: 'aix',
  };
}

export function checkPublishFiles(paths) {
  const files = paths.map((path) => ({ path, bytes: statSync(path).size }));
  const findings = files
    .filter((file) => file.bytes > AIX_PROTO_MAX_FILE_BYTES)
    .map((file) => ({
      rule: 'aix-proto-file-cap',
      severity: 'high',
      detail: `${file.path} is ${file.bytes} bytes; aix-proto static files may not exceed ${AIX_PROTO_MAX_FILE_BYTES} bytes`,
    }));
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  if (totalBytes > AIX_PROTO_MAX_APP_BYTES) {
    findings.push({
      rule: 'aix-proto-app-cap',
      severity: 'high',
      detail: `publishable files total ${totalBytes} bytes; aix-proto static apps may not exceed ${AIX_PROTO_MAX_APP_BYTES} bytes`,
    });
  }
  return { files, totalBytes, findings };
}

export function partitionPublishFindings(findings, publishReady) {
  const isBlocking = (finding) =>
    finding.severity === 'blocker' || finding.severity === 'high';
  if (!publishReady) {
    return { blocking: [], advisory: [...findings] };
  }
  return {
    blocking: findings.filter(isBlocking),
    advisory: findings.filter((finding) => !isBlocking(finding)),
  };
}
