#!/usr/bin/env python3
"""Assemble a single-file HTML presentation from a slides fragment.

    python3 build_deck.py path/to/talk.slides.html [-o path/to/talk.html]

The slides file starts with a header comment, then the <section class="slide"> elements:

    <!-- deck
    title: Shipping the Visit API
    theme: midnight          # midnight | paper | pricesmart | keynote
    logo: pricesmart         # pricesmart | none | path/to/logo.png
    lang: en
    duration: 20             # minutes, drives the pace bar in presenter view (optional)
    -->
    <section class="slide" data-layout="title">...</section>

At build time:
  * <img data-inline="path"> gets its src replaced by a data: URI (re-read on every build).
    "skill:" paths resolve inside this skill's assets/ folder, others relative to the slides file.
  * <div class="archify" data-archify-file="path.html"></div> gets the Archify HTML embedded
    as a base64 payload that the engine loads into an iframe.
The output is one self-contained .html file (fonts and libraries still come from CDNs).
Standard library only.
"""
from __future__ import annotations

import argparse
import base64
import html
import mimetypes
import re
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
ENGINE = SKILL_DIR / "assets" / "engine.html"
THEMES = {"midnight", "paper", "pricesmart", "keynote"}
HEADER_RE = re.compile(r"^\s*<!--\s*deck\b(.*?)-->", re.S)
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
IMG_RE = re.compile(r"<img\b[^>]*\bdata-inline=\"([^\"]+)\"[^>]*>", re.S)
ARCHIFY_RE = re.compile(
    r"(<div\b[^>]*\bdata-archify-file=\"([^\"]+)\"[^>]*>)(.*?)(</div>)", re.S
)


def fail(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def parse_header(text: str) -> tuple[dict[str, str], str]:
    m = HEADER_RE.match(text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        line = line.split("#", 1)[0].strip()
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip().lower()] = v.strip()
    return meta, text[m.end():]


def resolve(path: str, base: Path) -> Path:
    if path.startswith("skill:"):
        p = SKILL_DIR / "assets" / path[len("skill:"):]
    else:
        p = Path(path).expanduser()
        if not p.is_absolute():
            p = base / p
    if not p.is_file():
        fail(f"file not found: {path} (resolved to {p})")
    return p


def data_uri(p: Path) -> str:
    mime = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


def inline_images(body: str, base: Path) -> tuple[str, int]:
    count = 0

    def sub(m: re.Match) -> str:
        nonlocal count
        tag = m.group(0)
        uri = data_uri(resolve(m.group(1), base))
        tag = re.sub(r"\ssrc=\"[^\"]*\"", "", tag)
        count += 1
        return tag[:4] + f' src="{uri}"' + tag[4:]

    return IMG_RE.sub(sub, body), count


def embed_archify(body: str, base: Path) -> tuple[str, int]:
    count = 0

    def sub(m: re.Match) -> str:
        nonlocal count
        payload = base64.b64encode(resolve(m.group(2), base).read_bytes()).decode()
        count += 1
        return f'{m.group(1)}<script type="text/plain" class="archify-payload">{payload}</script>{m.group(4)}'

    return ARCHIFY_RE.sub(sub, body), count


def brand_logo(logo: str, meta: dict[str, str], base: Path) -> str:
    if not logo or logo == "none":
        return ""
    if logo == "pricesmart":
        light = resolve("skill:brand/pricesmart-on-light.png", base)
        dark = resolve("skill:brand/pricesmart-on-dark.png", base)
        alt = "PriceSmart"
    else:
        light = resolve(logo, base)
        dark = resolve(meta["logo-dark"], base) if meta.get("logo-dark") else light
        alt = meta.get("logo-alt", "Logo")
    return (
        f'<img class="logo-on-light" alt="{html.escape(alt)}" src="{data_uri(light)}">'
        f'<img class="logo-on-dark" alt="{html.escape(alt)}" src="{data_uri(dark)}">'
    )


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slides", type=Path, help="the .slides.html source file")
    ap.add_argument("-o", "--out", type=Path, help="output .html (default: next to the source, without .slides)")
    args = ap.parse_args()

    src = args.slides.resolve()
    if not src.is_file():
        fail(f"slides file not found: {src}")
    base = src.parent
    meta, body = parse_header(src.read_text(encoding="utf-8"))

    theme = meta.get("theme", "midnight")
    if theme not in THEMES:
        fail(f"unknown theme '{theme}', use one of: {', '.join(sorted(THEMES))}")
    title = meta.get("title", "Presentation")
    n_slides = len(re.findall(r"<section\b[^>]*\bclass=\"[^\"]*\bslide\b", body))
    if n_slides == 0:
        fail('no <section class="slide"> elements found')

    body = COMMENT_RE.sub("", body)  # author notes; also keeps commented-out examples from being resolved
    body, n_img = inline_images(body, base)
    body, n_arch = embed_archify(body, base)

    out_html = ENGINE.read_text(encoding="utf-8")
    replacements = {
        "<!--@LANG@-->": html.escape(meta.get("lang", "en")),
        "<!--@THEME@-->": theme,
        "<!--@TITLE@-->": html.escape(title),
        "<!--@DURATION@-->": html.escape(meta.get("duration", "")),
        "<!--@BRAND_LOGO@-->": brand_logo(meta.get("logo", "none"), meta, base),
    }
    for marker, value in replacements.items():
        out_html = out_html.replace(marker, value)
    out_html = out_html.replace("<!--@SLIDES@-->", body.strip(), 1)

    out = args.out.resolve() if args.out else base / (src.name.replace(".slides.html", ".html") if src.name.endswith(".slides.html") else src.stem + ".deck.html")
    if out == src:
        fail("output would overwrite the slides source; pass -o")
    out.write_text(out_html, encoding="utf-8")
    kb = out.stat().st_size / 1024
    print(f"built {out} — {n_slides} slides, theme {theme}, {n_img} inlined images, {n_arch} archify diagrams, {kb:.0f} KB")


if __name__ == "__main__":
    main()
