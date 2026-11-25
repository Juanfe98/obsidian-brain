#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"

if [[ ! -d "$CLAUDE_DIR" ]]; then
  echo "Error: Claude directory not found: $CLAUDE_DIR" >&2
  exit 1
fi

if [[ ! -f "$CLAUDE_DIR/CLAUDE.md" ]]; then
  echo "Error: missing $CLAUDE_DIR/CLAUDE.md" >&2
  exit 1
fi

echo "About to sync from $CLAUDE_DIR to $ROOT_DIR"
echo
printf "This will overwrite this repo's CLAUDE.md, commands/, skills/, and profiles/. Continue? [y/N] "
read -r answer
case "$answer" in
  y|Y|yes|YES) ;;
  *) echo "Aborted."; exit 0 ;;
esac

cp "$CLAUDE_DIR/CLAUDE.md" "$ROOT_DIR/CLAUDE.md"
mkdir -p "$ROOT_DIR/commands" "$ROOT_DIR/skills" "$ROOT_DIR/profiles"
rsync -a --delete "$CLAUDE_DIR/commands/" "$ROOT_DIR/commands/"
rsync -a --delete "$CLAUDE_DIR/skills/" "$ROOT_DIR/skills/"
if [[ -d "$CLAUDE_DIR/profiles" ]]; then
  rsync -a --delete "$CLAUDE_DIR/profiles/" "$ROOT_DIR/profiles/"
fi

echo "Done. Review changes before committing:"
echo "  git -C \"$ROOT_DIR\" status --short"
echo "  git -C \"$ROOT_DIR\" diff -- ."
