#!/usr/bin/env bash
set -euo pipefail

# install.sh
# Sets up the jira-audit skill. Verifies that the jira-ticket skill is
# installed and configured, then optionally copies the example config
# to the user's project.

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

echo "======================================"
echo "  jira-audit Skill Installer"
echo "======================================"
echo ""

# --- Verify skill files exist ---

if [ ! -f "$SKILL_DIR/SKILL.md" ]; then
  echo "Error: SKILL.md not found at $SKILL_DIR/SKILL.md"
  echo "Run this script from the jira-audit skill directory."
  exit 1
fi
echo "✓ SKILL.md found"

if [ ! -f "$SKILL_DIR/references/audit-checks.md" ]; then
  echo "⚠ references/audit-checks.md not found"
  echo "  The audit checklist may not function properly."
  echo ""
else
  echo "✓ Audit checks reference found"
fi

# --- Check jira-ticket dependency ---

echo ""
echo "Checking jira-ticket dependency..."

JIRA_TICKET_FOUND=false

# Check common locations for jira-ticket skill
JIRA_TICKET_LOCATIONS=(
  "$SKILLS_DIR/jira-ticket"
  "$SKILL_DIR/../jira-ticket"
  "$HOME/.claude/skills/jira-ticket"
)

for location in "${JIRA_TICKET_LOCATIONS[@]}"; do
  if [ -f "$location/SKILL.md" ]; then
    echo "✓ jira-ticket skill found at $location"
    JIRA_TICKET_FOUND=true
    JIRA_TICKET_DIR="$location"
    break
  fi
done

if [ "$JIRA_TICKET_FOUND" = false ]; then
  echo "⚠ jira-ticket skill not found in expected locations."
  echo ""
  echo "  The jira-audit skill depends on jira-ticket for all Jira API"
  echo "  interactions. Please install jira-ticket first:"
  echo ""
  echo "  If using skillsrc:"
  echo "    devx ai skills add jira-ticket"
  echo ""
  echo "  Or manually:"
  echo "    bash <path-to-jira-ticket>/scripts/install.sh"
  echo ""
  read -p "Continue without jira-ticket? [y/N]: " CONTINUE
  CONTINUE="${CONTINUE:-N}"
  if [[ ! "$CONTINUE" =~ ^[Yy] ]]; then
    echo "Aborting. Install jira-ticket first, then re-run this script."
    exit 1
  fi
fi

# --- Verify jira-ticket is configured ---

if [ "$JIRA_TICKET_FOUND" = true ]; then
  JIRA_CONFIG="$HOME/.config/jira-ticket/jira-ticket.yaml"
  if [ -f "$JIRA_CONFIG" ]; then
    echo "✓ jira-ticket config found at $JIRA_CONFIG"
  else
    echo "⚠ jira-ticket config not found at $JIRA_CONFIG"
    echo "  Run the jira-ticket installer to configure it:"
    echo "    bash ${JIRA_TICKET_DIR:-<jira-ticket-dir>}/scripts/install.sh"
  fi
fi

# --- Check JIRA_API_TOKEN ---

echo ""
if [ -n "${JIRA_API_TOKEN:-}" ]; then
  echo "✓ JIRA_API_TOKEN is set in current environment"
else
  # Detect shell config file
  if [[ "$SHELL" == */zsh ]]; then
    SHELL_CONFIG="$HOME/.zprofile"
  elif [[ "$SHELL" == */bash ]]; then
    SHELL_CONFIG="$HOME/.bash_profile"
  else
    SHELL_CONFIG="$HOME/.profile"
  fi

  if grep -q "JIRA_API_TOKEN" "$SHELL_CONFIG" 2>/dev/null; then
    echo "✓ JIRA_API_TOKEN found in $SHELL_CONFIG (not loaded in current shell)"
    echo "  Start a new shell session or run: source $SHELL_CONFIG"
  else
    echo "⚠ JIRA_API_TOKEN not found in environment or shell config."
    echo "  The jira-audit skill needs this token (via jira-ticket) to access Jira."
    echo "  Set it up by running the jira-ticket installer."
  fi
fi

# --- Optional: copy example config ---

echo ""
echo "Configuration (optional)"
echo "------------------------"
echo "The jira-audit skill supports a .jira-audit.yaml config file in your"
echo "project root to customize checks, severities, and thresholds."
echo ""
read -p "Copy example config to current directory? [y/N]: " COPY_CONFIG
COPY_CONFIG="${COPY_CONFIG:-N}"

if [[ "$COPY_CONFIG" =~ ^[Yy] ]]; then
  TARGET_DIR="${PROJECT_DIR:-$(pwd)}"
  if [ -f "$TARGET_DIR/.jira-audit.yaml" ]; then
    echo "⚠ .jira-audit.yaml already exists in $TARGET_DIR"
    read -p "Overwrite? [y/N]: " OVERWRITE
    OVERWRITE="${OVERWRITE:-N}"
    if [[ ! "$OVERWRITE" =~ ^[Yy] ]]; then
      echo "Keeping existing config."
    else
      cp "$SKILL_DIR/.jira-audit.example.yaml" "$TARGET_DIR/.jira-audit.yaml"
      echo "✓ Copied .jira-audit.yaml to $TARGET_DIR"
    fi
  else
    cp "$SKILL_DIR/.jira-audit.example.yaml" "$TARGET_DIR/.jira-audit.yaml"
    echo "✓ Copied .jira-audit.yaml to $TARGET_DIR"
  fi
  echo "  Edit this file to customize audit behavior for your team."
else
  echo "Skipped. You can copy it later:"
  echo "  cp $SKILL_DIR/.jira-audit.example.yaml ./.jira-audit.yaml"
fi

# --- Link skill into Claude Code ---

echo ""
echo "======================================"
echo "  Installation complete!"
echo "======================================"
echo ""
echo "Skill directory: $SKILL_DIR"
echo ""
echo "Link the skill into Claude Code using skillsrc (recommended):"
echo "  https://github.twdcgrid.net/AIAdvance/skillsrc"
echo ""
echo "Or manually:"
echo "  ln -sfn $SKILL_DIR $SKILLS_DIR/jira-audit"
echo ""
echo "Usage (start a new Claude Code session first):"
echo "  'Audit this sprint'"
echo "  'Check ticket quality for PROJECT-123'"
echo "  'Help me clean up the FD backlog'"
echo "  'Are these tickets ready for development?'"
echo ""
echo "Configuration:"
echo "  Team config: .jira-audit.yaml (in project root)"
echo "  Example:     $SKILL_DIR/.jira-audit.example.yaml"
echo "  Checks ref:  $SKILL_DIR/references/audit-checks.md"
echo ""
