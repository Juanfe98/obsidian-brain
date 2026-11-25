import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const COMMANDS = new Set([
  'doctor',
  'validate',
  'build',
  'verify',
  'thumbs',
  'preread',
  'capacity',
  'inspect-template',
  'build-native',
  'inspect-google',
  'build-google',
  'export-google',
  'unknown',
]);

function configDir(env) {
  return env.AIX_CONFIG_DIR?.trim() || join(homedir(), '.aix');
}

function configDisablesTelemetry(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return false;
  }
  return yamlDisablesTelemetry(text);
}

// A YAML line without its trailing comment, or '' for comment and blank lines.
function yamlContent(rawLine) {
  if (/^\s*#/.test(rawLine)) {
    return '';
  }
  const line = rawLine.replace(/\s+#.*$/, '');
  return line.trim() ? line : '';
}

function yamlDisablesTelemetry(text) {
  let telemetryIndent;
  let childIndent;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = yamlContent(rawLine);
    if (!line) {
      continue;
    }
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    if (telemetryIndent === undefined) {
      if (indent === 0 && trimmed === 'telemetry:') {
        telemetryIndent = indent;
      }
      continue;
    }
    if (indent <= telemetryIndent) {
      break;
    }
    childIndent ??= indent;
    if (indent === childIndent && /^enabled\s*:\s*(false|no|off)\s*$/i.test(trimmed)) {
      return true;
    }
  }
  return false;
}

export function telemetryEnabled(env = process.env, root = configDir(env)) {
  if (env.DO_NOT_TRACK === '1') {
    return false;
  }
  if (env.AIX_TELEMETRY?.toLowerCase() === 'off') {
    return false;
  }
  if (env.OTEL_SDK_DISABLED?.toLowerCase() === 'true') {
    return false;
  }
  return !configDisablesTelemetry(join(root, 'config.yaml'));
}

export function telemetryEmitArgs({ command, durationMs, exitCode }) {
  const normalizedCommand = COMMANDS.has(command) ? command : 'unknown';
  const normalizedExitCode = Number.isInteger(Number(exitCode))
    ? Number(exitCode)
    : 1;
  return [
    'telemetry',
    'emit',
    '--event',
    normalizedCommand,
    '--tool',
    'deck-authoring',
    '--duration',
    String(Math.max(0, Math.round(Number(durationMs) || 0))),
    '--extra',
    `exit_code=${normalizedExitCode}`,
    ...(normalizedExitCode === 0 ? [] : ['--extra', `error_type=${normalizedExitCode === 2 ? 'usage' : 'error'}`]),
  ];
}

/**
 * Launch the canonical telemetry relay without waiting for delivery.
 *
 * @returns {boolean} true only when the relay process was launched; delivery
 * completion is intentionally unknowable because the child is detached.
 */
export function emitTelemetry(details, options = {}) {
  const env = options.env ?? process.env;
  const root = options.root ?? configDir(env);
  if (!telemetryEnabled(env, root)) {
    return false;
  }

  const launch = options.spawn ?? spawn;
  const aixBinary = options.aixBinary ?? (env.AIX_BIN?.trim() || 'aix');
  try {
    const child = launch(
      aixBinary,
      telemetryEmitArgs(details),
      {
        env: Object.assign({}, env, {
          AIX_CONFIG_DIR: env.AIX_CONFIG_DIR?.trim() || root,
          AIX_NO_UPDATE_CHECK: '1',
        }),
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    // The relay is intentionally short-lived and owns no inherited handles.
    // Once detached, the OS reaps it after exit; deck completion never waits.
    child.once('error', () => {});
    child.unref();
    return true;
  } catch {
    return false;
  }
}
