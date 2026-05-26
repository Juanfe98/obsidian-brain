#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"

if [[ ! -f "$ROOT_DIR/CLAUDE.md" ]]; then
  echo "Error: missing $ROOT_DIR/CLAUDE.md" >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/commands" ]]; then
  echo "Error: missing $ROOT_DIR/commands" >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/skills" ]]; then
  echo "Error: missing $ROOT_DIR/skills" >&2
  exit 1
fi

mkdir -p "$CLAUDE_DIR/commands" "$CLAUDE_DIR/skills"

echo "About to install this repo's Claude setup to: $CLAUDE_DIR"
echo
printf "This will overwrite CLAUDE.md, commands/, and skills/ in %s. Continue? [y/N] " "$CLAUDE_DIR"
read -r answer
case "$answer" in
  y|Y|yes|YES) ;;
  *) echo "Aborted."; exit 0 ;;
esac

cp "$ROOT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
rsync -a --delete "$ROOT_DIR/commands/" "$CLAUDE_DIR/commands/"
rsync -a --delete "$ROOT_DIR/skills/" "$CLAUDE_DIR/skills/"

echo "Installed Claude setup to $CLAUDE_DIR"
