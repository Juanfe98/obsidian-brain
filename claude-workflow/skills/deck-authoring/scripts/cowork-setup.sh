#!/usr/bin/env bash
# Prepare deck-authoring inside the Claude Cowork Linux VM. Cowork mounts the
# skill read-only and runs none of the host's CLIs, so this copies the skill to
# a writable directory, installs its npm dependencies and the mirrored headless
# Chromium, adds the one library the VM image lacks, and checks that Chromium
# launches. No root is needed; every download comes from Artifactory.
#
# Usage: bash cowork-setup.sh [destination]    (default: $HOME/deck-authoring)
set -euo pipefail

ARTIFACTORY=https://artifactory.global.twdcgrid.net/artifactory
# Keep in sync with LIBXDAMAGE_* in .github/workflows/provision-external-tools.yml.
LIBXDAMAGE_VERSION=1.1.5-2build2
LIBXDAMAGE_ARM64_SHA256=8075485c8a60869c7490834beb3a40ee2f448b94cab00b1dca08e8103d5c5514
LIBXDAMAGE_AMD64_SHA256=a705af86334b9c219e5f50e21e5bc51bfbf8b8189ca88d4fcafff734de81a503

if [[ "$(uname -s)" != Linux ]]; then
  echo "cowork-setup.sh prepares the Cowork Linux VM; on a desktop follow Setup in SKILL.md" >&2
  exit 2
fi

src="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest="${1:-$HOME/deck-authoring}"
mkdir -p "$dest"
dest="$(cd "$dest" && pwd)"
if [[ "$src" != "$dest" ]]; then
  cp -R "$src/." "$dest/"
  chmod -R u+w "$dest" # the source mount is read-only and cp keeps its modes
fi
cd "$dest/scripts"

npm ci --install-links --no-audit --no-fund
# Playwright's host check would advise `sudo ... install-deps`, which the VM
# cannot run; the one library it lacks is installed below instead.
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 \
  PLAYWRIGHT_DOWNLOAD_HOST=https://artifactory.global.twdcgrid.net/artifactory/aix-generic/external/playwright \
  npx playwright install --only-shell chromium

# grep without -q drains ldconfig, so pipefail cannot report a false miss.
if ! ldconfig -p | grep 'libXdamage\.so\.1 ' >/dev/null; then
  arch="$(dpkg --print-architecture)"
  case "$arch" in
    arm64) sha256="$LIBXDAMAGE_ARM64_SHA256" ;;
    amd64) sha256="$LIBXDAMAGE_AMD64_SHA256" ;;
    *)
      echo "no mirrored libxdamage1 for architecture $arch" >&2
      exit 1
      ;;
  esac
  deb="libxdamage1_${LIBXDAMAGE_VERSION}_${arch}.deb"
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  curl --proto =https --tlsv1.2 -fsSL -o "$work/$deb" \
    "$ARTIFACTORY/aix-generic/external/libxdamage1/v$LIBXDAMAGE_VERSION/$deb"
  echo "$sha256  $work/$deb" | sha256sum -c --quiet
  dpkg-deb -x "$work/$deb" "$work/root"
  mkdir -p .browser-libs
  cp -P "$work"/root/usr/lib/*-linux-gnu/libXdamage.so.1* .browser-libs/
fi

# Playwright checks host libraries on the first launch against this process's
# LD_LIBRARY_PATH, not the browser's environment, and records a pass in the
# browser directory. For 30 days later launches skip the check and get
# .browser-libs through lib/verify.mjs; re-running this script refreshes it.
LD_LIBRARY_PATH="$PWD/.browser-libs${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}" node --input-type=module -e "
const { launch } = await import('./lib/verify.mjs');
const { browser, launcher } = await launch();
await browser.close();
console.log('Chromium launches via ' + launcher);"
echo "deck-authoring is ready: cd \"$dest/scripts\""
