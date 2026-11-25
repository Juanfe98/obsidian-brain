#!/usr/bin/env python3
"""Render a built deck in headless Chrome: layout report, per-slide screenshots, optional PDF.

    python3 check_deck.py talk.html                 # report + screenshots in .check/ next to the deck
    python3 check_deck.py talk.html --slides 3,7-9  # only some slides
    python3 check_deck.py talk.html --pdf           # also write talk.pdf (one slide per page)
    python3 check_deck.py talk.html --no-shots      # report only

The deck engine has a ?check mode that reveals every step, disables animation and writes a JSON
report of overflowing, colliding or dense slides into the DOM; this script reads it back.
Needs Google Chrome (or Chromium) and network access for fonts / Mermaid / highlight.js.
Standard library only.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome",
]
REPORT_RE = re.compile(r'<script type="application/json" id="deck-report">(.*?)</script>', re.S)


def find_chrome() -> str:
    for c in CANDIDATES:
        p = c if Path(c).is_file() else shutil.which(c)
        if p:
            return p
    sys.exit("error: Chrome/Chromium not found")


def chrome(binary: str, *args: str, budget: int, until_file: Path | None = None, timeout: float = 90) -> str:
    """Run headless Chrome and return stdout.

    On macOS headless Chrome often writes its output and then never exits, so instead of waiting
    for the process we stop it once the output is complete: the closing </html> for --dump-dom,
    or a written, size-stable file for --screenshot / --print-to-pdf. Chrome runs in its own
    process group and the whole group is killed at the end, so no helper process outlives the
    script and keeps a caller's pipe open; past `timeout` it is killed regardless.
    """
    with tempfile.TemporaryDirectory() as profile, tempfile.TemporaryFile("w+") as out:
        cmd = [binary, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
               "--no-default-browser-check", f"--user-data-dir={profile}", "--window-size=1920,1080",
               "--force-device-scale-factor=1", f"--virtual-time-budget={budget}", *args]
        proc = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.DEVNULL,
                                text=True, start_new_session=True)
        deadline = time.monotonic() + timeout
        last_size = -1
        try:
            while proc.poll() is None and time.monotonic() < deadline:
                time.sleep(0.4)
                if until_file is None:
                    out.seek(0)
                    if "</html>" in out.read():
                        break
                elif until_file.is_file():
                    size = until_file.stat().st_size
                    if size > 0 and size == last_size:
                        break
                    last_size = size
        finally:
            try:
                os.killpg(proc.pid, signal.SIGKILL)  # Chrome and every helper it spawned
            except ProcessLookupError:
                pass
            proc.wait()
        out.seek(0)
        return out.read()


def parse_ranges(spec: str, total: int) -> list[int]:
    out: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-")
            out.update(range(int(a), int(b) + 1))
        elif part:
            out.add(int(part))
    return sorted(i for i in out if 1 <= i <= total)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("deck", type=Path)
    ap.add_argument("--out", type=Path, help="screenshot folder (default: .check/ next to the deck)")
    ap.add_argument("--slides", help="e.g. 1,3-5 (default: all)")
    ap.add_argument("--no-shots", action="store_true")
    ap.add_argument("--pdf", action="store_true")
    ap.add_argument("--budget", type=int, default=8000, help="ms of virtual time to let fonts/libraries load")
    args = ap.parse_args()

    deck = args.deck.resolve()
    if not deck.is_file():
        sys.exit(f"error: {deck} not found")
    binary = find_chrome()
    url = deck.as_uri()

    dom = chrome(binary, "--dump-dom", f"{url}?check#/1", budget=args.budget)
    m = REPORT_RE.search(dom)
    if not m:
        sys.exit("error: no layout report produced — the deck may have a script error, or raise --budget")
    report = json.loads(m.group(1))
    total = report["total"]
    picked = parse_ranges(args.slides, total) if args.slides else list(range(1, total + 1))

    print(f"{deck.name}: {total} slides, theme {report['theme']}")
    flagged = 0
    for s in report["slides"]:
        if s["slide"] not in picked:
            continue
        mark = "!!" if s["issues"] else "ok"
        notes = "" if s["hasNotes"] else "  (no speaker notes)"
        print(f"  [{mark}] {s['slide']:>2} {s['layout'] or '-':<10} {s['title'][:60]}{notes}")
        for issue in s["issues"]:
            print(f"         - {issue}")
        flagged += bool(s["issues"])
    print(f"{flagged} slide(s) with layout issues" if flagged else "no layout issues found")

    if not args.no_shots:
        shots = (args.out or deck.parent / ".check").resolve()
        shots.mkdir(parents=True, exist_ok=True)
        stem = deck.stem

        def shoot(i: int) -> Path:
            path = shots / f"{stem}-{i:02d}.png"
            path.unlink(missing_ok=True)
            chrome(binary, f"--screenshot={path}", f"{url}?check#/{i}", budget=args.budget, until_file=path)
            return path

        with ThreadPoolExecutor(max_workers=4) as pool:
            paths = list(pool.map(shoot, picked))
        missing = [p for p in paths if not p.is_file()]
        print(f"screenshots: {shots} ({len(paths) - len(missing)} written)")
        if missing:
            print("  missing: " + ", ".join(p.name for p in missing))

    if args.pdf:
        pdf = deck.with_suffix(".pdf")
        pdf.unlink(missing_ok=True)
        chrome(binary, f"--print-to-pdf={pdf}", "--no-pdf-header-footer", f"{url}?check", budget=args.budget, until_file=pdf)
        print(f"pdf: {pdf}" if pdf.is_file() else "pdf: failed")


if __name__ == "__main__":
    main()
