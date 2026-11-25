#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG_DIR="$HOME/.config/jira-ticket"
CONFIG_FILE="$CONFIG_DIR/jira-ticket.yaml"
SKILLS_DIR="$HOME/.claude/skills"

# Detect shell config file
SHELL="${SHELL:-}"
if [[ "$SHELL" == */zsh ]]; then
  SHELL_CONFIG="$HOME/.zprofile"
elif [[ "$SHELL" == */bash ]]; then
  SHELL_CONFIG="$HOME/.bash_profile"
else
  SHELL_CONFIG="$HOME/.profile"
fi

# --- jira CLI (Rust, cli-universe) ---

aix_hint_fetch="curl -fsSL https://artifactory.global.twdcgrid.net/artifactory/aix-generic/scripts/v1.66.0/install-aix.sh"

if ! command -v jira &>/dev/null; then
  echo "Error: jira CLI (cli-universe) not found."
  echo ""
  echo "Install options:"
  echo "  ${aix_hint_fetch} | bash"
  exit 1
fi

JIRA_VERSION=$(jira --version 2>&1 | head -1)
echo "Found jira CLI: $JIRA_VERSION"

# Verify it's the Rust CLI (has --agent flag)
if ! jira --help 2>&1 | grep -q "\-\-agent"; then
  echo "Warning: jira binary found but does not support --agent flag."
  echo "You may have the old Go CLI (ankitpokhrel/jira-cli) installed."
  echo "Uninstall it: brew uninstall jira-cli"
  echo "Then install the Rust CLI:"
  echo "  ${aix_hint_fetch} | bash"
  exit 1
fi

# --- jq ---

if ! command -v jq &>/dev/null; then
  if command -v brew &>/dev/null; then
    echo "Installing jq..."
    brew install jq
  else
    echo "Error: jq is required but not installed."
    echo "  macOS: brew install jq"
    echo "  Linux: sudo apt-get install jq (or your package manager)"
    exit 1
  fi
fi

# --- Jira Server ---

DEFAULT_SERVER="https://deept.atlassian.net"

# Reads each `export JIRA_SERVER=` line of file $1 as a value without quotes, a
# trailing comment or CR. Prints the last value; exits 0 only if a value differs from $2.
profile_server() {
  awk -v want="${2:-}" -v sq="'" '/^export JIRA_SERVER=/ {
    v = $0; sub(/^export JIRA_SERVER=/, "", v); sub(/\r$/, "", v); sub(/[ \t]+#.*/, "", v)
    sub(/[ \t]+$/, "", v); gsub(/"/, "", v); gsub(sq, "", v)
    last = v; if (v != want) stale = 1
  } END { print last; exit !stale }' "$1"
}

echo ""
# Without JIRA_SERVER, the profile's export is the current server, so a re-run keeps it.
PROFILE_SERVER=""
if [ -z "${JIRA_SERVER:-}" ] && [ -f "$SHELL_CONFIG" ]; then
  PROFILE_SERVER=$(profile_server "$SHELL_CONFIG") || true
fi
CURRENT_SERVER="${JIRA_SERVER:-${PROFILE_SERVER:-$DEFAULT_SERVER}}"
if [ -t 0 ]; then
  read -r -p "Jira server URL [${CURRENT_SERVER}]: " JIRA_SERVER || JIRA_SERVER=""
else
  echo "No terminal available; using ${CURRENT_SERVER} (set JIRA_SERVER to choose another server)."
  JIRA_SERVER=""
fi
JIRA_SERVER="${JIRA_SERVER:-$CURRENT_SERVER}"

# The server goes into a shell profile and a YAML file, so allow only plain URL characters.
SERVER_PATTERN='^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[A-Za-z0-9._~/-]*)?$'
if ! [[ "$JIRA_SERVER" =~ $SERVER_PATTERN ]]; then
  printf 'Error: Jira server must be a plain https URL such as %s (got: %s)\n' "$DEFAULT_SERVER" "$JIRA_SERVER" >&2
  exit 1
fi
# Export now so the sign-in check below asks the chosen server.
export JIRA_SERVER

# Story-points custom-field id is deployment-specific: Cloud (*.atlassian.net)
# uses customfield_10047; Data Center uses customfield_10106. Match it to the
# chosen server so a DC server never gets paired with the Cloud id (or vice versa).
# Hostnames are case-insensitive, so classify a lowercase copy.
SERVER_LOWER=$(printf '%s' "$JIRA_SERVER" | tr '[:upper:]' '[:lower:]')
case "$SERVER_LOWER" in
  *atlassian.net*) STORY_POINTS_FIELD="customfield_10047"; IS_CLOUD=true; LOGIN_CMD="pat-manager login jira" ;;
  *)               STORY_POINTS_FIELD="customfield_10106"; IS_CLOUD=false; LOGIN_CMD="pat-manager login jira --dc" ;;
esac

# --- Authentication ---

# Credentials live in the jira CLI's own store (pat-manager or `jira auth login`).
# This installer never asks for or writes a token to a shell profile.
echo ""
if jira --agent auth status 2>/dev/null | grep -Eq '"authenticated"[[:space:]]*:[[:space:]]*true'; then
  echo "jira CLI is signed in."
else
  echo "jira CLI is not signed in yet."
  if [ "$IS_CLOUD" = true ]; then
    echo "  Sign in (browser, no token paste):  $LOGIN_CMD"
  else
    echo "  Sign in (Data Center):  $LOGIN_CMD"
  fi
fi

# A plaintext token in a shell profile can shadow the stored credential.
# SHELL_CONFIG is always one of these files. The installer never edits them.
for profile in "$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
  if grep -Eq '^[[:space:]]*export[[:space:]]+JIRA_(API_)?TOKEN=' "$profile" 2>/dev/null; then
    echo ""
    echo "Warning: $profile exports JIRA_TOKEN or JIRA_API_TOKEN, which can shadow the stored credential."
    echo "  Remove that line after \`$LOGIN_CMD\` succeeds."
  fi
done

# --- Export JIRA_SERVER for Rust CLI ---

# The Rust CLI reads JIRA_SERVER from env (priority 1), then config.toml, then
# its built-in default. JIRA_SERVER is not a secret. An existing export is set to
# the chosen server, the default included, so an old one cannot override it.
# A failed write is reported and the install goes on; the exit status is 1.
SERVER_LINE="export JIRA_SERVER=\"$JIRA_SERVER\""
PROFILE_OK=true
if grep -q '^export JIRA_SERVER=' "$SHELL_CONFIG" 2>/dev/null; then
  # Rewrite only when an export names another server.
  if profile_server "$SHELL_CONFIG" "$JIRA_SERVER" > /dev/null; then
    # Follow a symlinked profile to its file, so the link itself stays.
    PROFILE_TARGET="$SHELL_CONFIG"
    hops=0
    while [ -L "$PROFILE_TARGET" ] && [ "$hops" -lt 20 ]; do
      PROFILE_LINK=$(readlink "$PROFILE_TARGET")
      case "$PROFILE_LINK" in
        /*) PROFILE_TARGET="$PROFILE_LINK" ;;
        *) PROFILE_TARGET="$(dirname "$PROFILE_TARGET")/$PROFILE_LINK" ;;
      esac
      hops=$((hops + 1))
    done
    # Build the new file beside it with its mode (cp -p), then rename it into
    # place, so the profile is never left half-written. An interrupt removes the copy.
    TMP_PROFILE=""
    trap '[ -z "$TMP_PROFILE" ] || rm -f "$TMP_PROFILE" 2>/dev/null || true' EXIT
    if [ -L "$PROFILE_TARGET" ] || [ ! -w "$PROFILE_TARGET" ] \
      || ! TMP_PROFILE=$(mktemp "${PROFILE_TARGET}.XXXXXX") \
      || ! cp -p "$PROFILE_TARGET" "$TMP_PROFILE" \
      || ! sed "s|^export JIRA_SERVER=.*|$SERVER_LINE|" "$PROFILE_TARGET" > "$TMP_PROFILE" \
      || ! mv -f "$TMP_PROFILE" "$PROFILE_TARGET"; then
      if [ -n "$TMP_PROFILE" ] && [ -e "$TMP_PROFILE" ] && ! rm -f "$TMP_PROFILE" 2>/dev/null; then
        echo "Warning: could not remove the temporary copy $TMP_PROFILE" >&2
      fi
      PROFILE_OK=false
    else
      echo "Updated JIRA_SERVER in $SHELL_CONFIG"
    fi
    TMP_PROFILE=""  # renamed or already handled, so the EXIT trap has nothing left
  fi
elif [ "$JIRA_SERVER" != "$DEFAULT_SERVER" ]; then
  if { echo ""; echo "# Jira server URL (used by jira CLI)"; echo "$SERVER_LINE"; } >> "$SHELL_CONFIG"; then
    echo "Added JIRA_SERVER to $SHELL_CONFIG"
  else
    PROFILE_OK=false
  fi
fi
if [ "$PROFILE_OK" = false ]; then
  echo "Warning: could not update $SHELL_CONFIG. Set this line there yourself:" >&2
  echo "  $SERVER_LINE" >&2
fi

# --- Config bootstrap ---

if [ ! -f "$CONFIG_FILE" ]; then
  mkdir -p "$CONFIG_DIR"
  cat > "$CONFIG_FILE" << EOF
# ~/.config/jira-ticket/jira-ticket.yaml

defaults:
  type: Story
  server: ${JIRA_SERVER}

custom_fields:
  story-points: ${STORY_POINTS_FIELD}
EOF
  echo "Created starter config at $CONFIG_FILE"
  echo "Set your project:      /jira-ticket set the default project to <KEY>"
else
  # Report a stale server; the user's config is never edited.
  CONFIG_SERVER=$(awk -v sq="'" '/^[ \t]*server:/ {
    sub(/^[ \t]*server:[ \t]*/, ""); sub(/\r$/, ""); sub(/^#.*/, ""); sub(/[ \t]+#.*/, "")
    sub(/[ \t]+$/, ""); gsub(/"/, ""); gsub(sq, ""); print; exit
  }' "$CONFIG_FILE") || CONFIG_SERVER=""
  if [ -n "$CONFIG_SERVER" ] && [ "${CONFIG_SERVER%/}" != "${JIRA_SERVER%/}" ]; then
    echo ""
    echo "Note: $CONFIG_FILE has server: $CONFIG_SERVER, but you chose $JIRA_SERVER."
    echo "  The installer leaves that file as it is. Update its server and story-points ($STORY_POINTS_FIELD) yourself if you switched."
  fi
fi

# --- Skill symlink ---

echo ""
echo "Link the skill into Claude Code using skillsrc (recommended):"
echo "  https://github.twdcgrid.net/AIX/skillsrc"
echo ""
echo "Or manually:"
echo "  ln -sfn $SKILL_DIR $SKILLS_DIR/jira-ticket"

if [ "$PROFILE_OK" = false ]; then
  exit 1
fi
