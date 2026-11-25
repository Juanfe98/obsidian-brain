// Runs INSIDE the page via page.evaluate. Returns typed layout defects. No LLM.
//
// Every technique here replaces a naive one that was empirically shown to miss
// real defects; the replacement is noted at each rule. Do not "simplify" these
// back to the obvious version.
//
// Severity: blocker (ship-stopping) | high | medium | nit.

// The helpers live in this IIFE so injecting the probe defines only
// globalThis.__deckAudit and leaves the deck page's globals untouched.
(function () {
  const GENERIC = new Set([
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    '-apple-system', 'blinkmacsystemfont', 'inherit', 'initial',
  ]);

  // SHOW_TEXT alone also collects <script>/<style>/<template> contents, which
  // are never rendered - auditing them reports phantom 16px "undersized text".
  const NON_RENDERED = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'TITLE']);

  const desc = (el) => {
    if (!el) {
      return null;
    }
    const slot = el.dataset && el.dataset.slot ? `[data-slot="${el.dataset.slot}"]` : '';
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList && el.classList.length ? `.${[...el.classList].join('.')}` : '';
    return el.tagName.toLowerCase() + id + cls + slot;
  };

  const parseRGB = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) {
      return null;
    }
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const chan = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const lum = ([r, g, b]) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  const ratio = (fg, bg) => {
    const a = lum(fg);
    const b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
  const toHex = (c) =>
    `#${c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

  // The backdrop is the COMPOSITED ancestor chain. Reading an element's own
  // background-color returns rgba(0,0,0,0) for most text and would compute
  // every contrast against black.
  const effectiveBg = (el) => {
    let cur = el;
    let acc = null;
    while (cur) {
      const c = parseRGB(getComputedStyle(cur).backgroundColor);
      if (c && c[3] > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc[3] >= 0.999) {
          return acc;
        }
      }
      cur = cur.parentElement;
    }
    const white = [255, 255, 255, 1];
    return acc ? over(acc, white) : white;
  };

  // Is this text sitting over IMAGE pixels rather than a CSS background? If so,
  // its contrast is not computable here: the backdrop is arbitrary photo data,
  // and compositing the CSS chain silently falls back to white and invents a
  // ratio. Such text must instead carry a scrim (data-scrim), which the author
  // is responsible for making opaque enough; we report it as unverified.
  const overImagePixels = (el, slideSel) => {
    const slide = el.closest && el.closest(slideSel);
    if (!slide) {
      return false;
    }
    const r = el.getBoundingClientRect();
    for (const img of slide.querySelectorAll('img')) {
      const ir = img.getBoundingClientRect();
      const overlaps =
        Math.min(r.right, ir.right) - Math.max(r.left, ir.left) > 1 &&
        Math.min(r.bottom, ir.bottom) - Math.max(r.top, ir.top) > 1;
      if (!overlaps) {
        continue;
      }
      // An opaque CSS background between the text and the image shields it.
      let cur = el;
      let shielded = false;
      while (cur && cur !== slide) {
        const c = parseRGB(getComputedStyle(cur).backgroundColor);
        if (c && c[3] >= 0.999) {
          shielded = true;
          break;
        }
        cur = cur.parentElement;
      }
      if (!shielded) {
        return true;
      }
    }
    return false;
  };

  const familyMeasurer = () => {
    let _cv;
    return (family) => {
      _cv = _cv || document.createElement('canvas');
      const ctx = _cv.getContext('2d');
      ctx.font = `48px "${family}", __deck_sentinel_absent__`;
      return ctx.measureText('mmmmmmmmmmlliWWWW@#$%').width;
    };
  };

  const visibleElements = (slide) => [...slide.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number.parseFloat(cs.opacity) === 0) {
      return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

  // ---- 1. clipped box overflow ---------------------------------------
  function checkBoxOverflow({ o, add, at }, visible) {
    for (const el of visible) {
      const cs = getComputedStyle(el);
      const dY = el.scrollHeight - el.clientHeight;
      const dX = el.scrollWidth - el.clientWidth;
      if (cs.overflowY !== 'visible' && dY > o.overflowTol) {
        add(at({ rule: 'overflow-y', severity: 'blocker', el: desc(el), overflowPx: Math.round(dY) }));
      }
      if (cs.overflowX !== 'visible' && dX > o.overflowTol) {
        add(at({ rule: 'overflow-x', severity: 'blocker', el: desc(el), overflowPx: Math.round(dX) }));
      }
    }
  }

  // ---- 2. text ink escaping its box or the canvas --------------------
  // scrollHeight-clientHeight returns 0 on a fixed-height overflow:visible
  // box that is spilling text; Range ink measurement catches it.
  function textRuns(slide) {
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (!n.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        for (let p = n.parentElement; p && p !== slide; p = p.parentElement) {
          if (NON_RENDERED.has(p.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const runs = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      runs.push(n);
    }
    return runs;
  }

  const inkBox = (node) => {
    const r = document.createRange();
    r.selectNodeContents(node);
    const rects = [...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0);
    if (!rects.length) {
      return null;
    }
    return {
      rects,
      lines: rects.length,
      top: Math.min(...rects.map((x) => x.top)),
      bottom: Math.max(...rects.map((x) => x.bottom)),
      left: Math.min(...rects.map((x) => x.left)),
      right: Math.max(...rects.map((x) => x.right)),
    };
  };

  const lastLineWords = (node) => {
    const text = node.nodeValue;
    const r = document.createRange();
    let lastTop = -Infinity;
    let count = 0;
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
      r.setStart(node, m.index);
      r.setEnd(node, m.index + m[0].length);
      const rect = r.getBoundingClientRect();
      if (rect.height === 0) {
        continue;
      }
      if (rect.top > lastTop + 1) {
        lastTop = rect.top;
        count = 1;
      } else {
        count++;
      }
    }
    return count;
  };

  function checkTextRun(ctx, node) {
    const { o, add, at, sb } = ctx;
    const box = inkBox(node);
    if (!box) {
      return;
    }
    const parent = node.parentElement;
    const pcs = getComputedStyle(parent);
    const text = node.nodeValue.trim().slice(0, 60);

    checkTextFit(ctx, { box, parent, pcs, text });

    if (box.right - sb.right > o.overflowTol || box.bottom - sb.bottom > o.overflowTol ||
        sb.left - box.left > o.overflowTol || sb.top - box.top > o.overflowTol) {
      add(at({ rule: 'text-off-canvas', severity: 'blocker', el: desc(parent), text }));
    }

    // ellipsis truncation is an X-axis fact; a Y-only check passes every
    // truncated headline
    const pAll = parent.scrollWidth - parent.clientWidth;
    if (pcs.textOverflow === 'ellipsis' && pAll > o.overflowTol) {
      add(at({ rule: 'text-truncated', severity: 'blocker', el: desc(parent), text,
               hiddenPx: Math.round(pAll) }));
    }

    if (box.lines >= 2) {
      checkWidowLine(ctx, node, box, parent);
    }
  }

  function checkTextFit({ o, add, at }, { box, parent, pcs, text }) {
    const pr = parent.getBoundingClientRect();
    if (pcs.overflow !== 'visible') {
      const cutBottom = box.bottom - pr.bottom;
      const cutRight = box.right - pr.right;
      if (cutBottom > o.overflowTol || cutRight > o.overflowTol) {
        add(at({ rule: 'text-clipped', severity: 'blocker', el: desc(parent), text,
                 cutBottomPx: Math.round(Math.max(0, cutBottom)),
                 cutRightPx: Math.round(Math.max(0, cutRight)), lines: box.lines }));
      }
    } else {
      // Unclipped spill still reads as broken; report it against the slot box.
      const spill = box.bottom - pr.bottom;
      if (spill > o.overflowTol && parent.dataset && parent.dataset.slot) {
        add(at({ rule: 'text-overflow', severity: 'blocker', el: desc(parent), text,
                 overflowPx: Math.round(spill), lines: box.lines,
                 fitRatio: +((box.bottom - box.top) / Math.max(1, pr.height)).toFixed(3) }));
      }
    }
  }

  function checkWidowLine({ o, add, at }, node, box, parent) {
    const last = box.rects[box.rects.length - 1];
    const widest = Math.max(...box.rects.map((x) => x.width));
    const frac = last.width / widest;
    const words = lastLineWords(node);
    if (frac < o.minLastLineFrac || words < o.minLastLineWords) {
      add(at({ rule: 'widow-line', severity: 'nit', el: desc(parent),
               lines: box.lines, lastLineFrac: +frac.toFixed(3), lastLineWords: words }));
    }
  }

  // ---- 3. safe area, off-canvas, grid --------------------------------
  function checkPlacement(ctx, visible) {
    const { o, add, at, sb } = ctx;
    const safe = {
      left: sb.left + o.safeX, top: sb.top + o.safeY,
      right: sb.right - o.safeX, bottom: sb.bottom - o.safeY,
    };
    for (const el of visible) {
      const r = el.getBoundingClientRect();
      // The exemption is INHERITED: a full-bleed slot is a wrapper div carrying
      // data-bleed, and the <img> that fills it is bleeding by design. Reading
      // only the element's own dataset flagged every bleed image as a blocker.
      const bleed = el.closest && el.closest('[data-bleed]') !== null;
      const outCanvas = Math.max(0, r.right - sb.right, sb.left - r.left, r.bottom - sb.bottom, sb.top - r.top);
      const outSafe = Math.max(0, r.right - safe.right, safe.left - r.left, r.bottom - safe.bottom, safe.top - r.top);
      if (outCanvas > o.overflowTol && !bleed) {
        add(at({ rule: 'off-canvas', severity: 'blocker', el: desc(el), byPx: Math.round(outCanvas) }));
      } else if (outSafe > o.overflowTol && !bleed) {
        add(at({ rule: 'outside-safe-area', severity: 'high', el: desc(el), byPx: Math.round(outSafe) }));
      }
      if (el.dataset && el.dataset.slot) {
        checkGrid(ctx, el, r);
      }
    }
  }

  // modular distance to the nearest gridline: v % grid reports a 7px error
  // one pixel BEFORE a gridline
  const offGrid = (v, grid) => {
    const m = Math.abs(((v % grid) + grid) % grid);
    return Math.min(m, grid - m);
  };

  function checkGrid({ o, add, at, sb }, el, r) {
    const dx = offGrid(r.left - sb.left, o.grid);
    const dy = offGrid(r.top - sb.top, o.grid);
    if (dx > o.gridTol || dy > o.gridTol) {
      add(at({ rule: 'off-grid', severity: 'nit', el: desc(el), grid: o.grid,
               dx: +dx.toFixed(2), dy: +dy.toFixed(2) }));
    }
  }

  // ---- 4. type floor -------------------------------------------------
  function checkTypeFloor({ o, add, at }, runs) {
    for (const node of runs) {
      const el = node.parentElement;
      const cs = getComputedStyle(el);
      const px = Number.parseFloat(cs.fontSize);
      // data-role="secondary" opts an element into the lower floor. It is for
      // brand furniture the template itself sets small (slide numbers, timeline
      // sub-labels, captions) - never for prose.
      // A secondary marker anywhere up the chain applies: the <li> inside a
      // secondary rail, or the sub-label inside a milestone, inherits the tier.
      const secondary =
        el.closest &&
        (el.closest('[data-kind="chart"]') ||
          el.closest('[data-role="secondary"]') ||
          el.closest('[data-role="caption"]') ||
          el.closest('[data-slot^="caption"]'));
      const floor = secondary ? o.minCaptionPx : o.minBodyPx;
      if (px < floor) {
        add(at({ rule: 'undersized-text', severity: 'high', el: desc(el), fontPx: px, floorPx: floor,
                 standardEquivalentPt: +(px / 2).toFixed(1),
                 text: node.nodeValue.trim().slice(0, 40) }));
      }
    }
  }

  // ---- 5. contrast ---------------------------------------------------
  function checkRunContrast(ctx, node) {
    const { o, add, at } = ctx;
    const el = node.parentElement;
    const cs = getComputedStyle(el);
    const fg = parseRGB(cs.color);
    if (!fg) {
      return;
    }
    if (overImagePixels(el, o.slideSel)) {
      reportTextOverImage(ctx, node, el, cs);
      return;
    }
    const bg = effectiveBg(el);
    const eff = fg[3] < 1 ? over(fg, bg) : fg;
    const px = Number.parseFloat(cs.fontSize);
    const bold = (Number.parseInt(cs.fontWeight, 10) || 400) >= 700;
    // SC 1.4.3 large text: >=18pt or >=14pt bold. 1pt == 1px here.
    const large = px >= 18 || (bold && px >= 14);
    const need = large ? 3.0 : 4.5;
    const got = ratio(eff, bg);
    if (got < need) {
      add(at({ rule: 'low-contrast', severity: 'high', el: desc(el), fontPx: px, large,
               fg: toHex(eff), bg: toHex(bg), ratio: +got.toFixed(3), required: need,
               text: node.nodeValue.trim().slice(0, 40) }));
    }
  }

  function reportTextOverImage({ add, at }, node, el, cs) {
    const scrim = el.closest('[data-scrim]');
    add(at({
      rule: scrim ? 'contrast-over-image-scrimmed' : 'contrast-over-image',
      severity: scrim ? 'nit' : 'high',
      el: desc(el), fontPx: Number.parseFloat(cs.fontSize),
      text: node.nodeValue.trim().slice(0, 40),
      note: scrim
        ? 'text over image pixels, on a declared scrim: contrast is not computable here, so the scrim alpha is the guarantee'
        : 'text over image pixels with no scrim: contrast is NOT computable and the backdrop is arbitrary. Put it on a scrim (data-scrim) or move it off the image.',
    }));
  }

  // ---- 6. image integrity -------------------------------------------
  function checkImages({ o, add, at, slide }) {
    for (const img of slide.querySelectorAll('img')) {
      const { naturalWidth: nw, naturalHeight: nh } = img;
      if (!nw || !nh) {
        add(at({ rule: 'image-not-loaded', severity: 'blocker', el: desc(img),
                 src: (img.currentSrc || img.src || '').slice(0, 120) }));
        continue;
      }
      const fit = getComputedStyle(img).objectFit;
      // cover/contain do not distort; a naive check reports them as skewed
      if (fit === 'fill' || fit === 'none') {
        const r = img.getBoundingClientRect();
        const want = nw / nh;
        const got = r.width / r.height;
        const skew = Math.abs(got - want) / want;
        if (skew > o.aspectTol) {
          add(at({ rule: 'image-aspect-distorted', severity: 'high', el: desc(img), objectFit: fit,
                   natural: `${nw}x${nh}`, rendered: `${Math.round(r.width)}x${Math.round(r.height)}`,
                   skewPct: +(skew * 100).toFixed(1) }));
        }
      }
    }
  }

  // ---- 7. occlusion --------------------------------------------------
  // elementFromPoint answers "who paints on top"; z-index strings are
  // per-stacking-context and usually 'auto'
  function checkOcclusion(ctx, visible) {
    const opaque = visible.filter((el) => {
      const c = parseRGB(getComputedStyle(el).backgroundColor);
      return c && c[3] > 0.9;
    });
    for (let i = 0; i < opaque.length; i++) {
      for (let j = i + 1; j < opaque.length; j++) {
        if (opaque[i].contains(opaque[j]) || opaque[j].contains(opaque[i])) {
          continue;
        }
        checkOverlap(ctx, opaque[i], opaque[j]);
      }
    }
  }

  function checkOverlap({ add, at }, first, second) {
    const A = first.getBoundingClientRect();
    const B = second.getBoundingClientRect();
    const w = Math.min(A.right, B.right) - Math.max(A.left, B.left);
    const h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 2 && h > 2) {
      const frac = (w * h) / Math.min(A.width * A.height, B.width * B.height);
      const cx = Math.max(A.left, B.left) + w / 2;
      const cy = Math.max(A.top, B.top) + h / 2;
      const topEl = document.elementFromPoint(cx, cy);
      add(at({ rule: 'opaque-overlap', severity: frac > 0.25 ? 'blocker' : 'medium',
               a: desc(first), b: desc(second), overlapFrac: +frac.toFixed(3),
               paintsOnTop: desc(topEl) }));
    }
  }

  // ---- 8. font substitution -----------------------------------------
  function checkFontSubstitution({ add, at }, visible, fonts) {
    const { faces, sentinel, familiesChecked, measureFamily } = fonts;
    for (const el of visible) {
      const cs = getComputedStyle(el);
      const first = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
      if (!first || GENERIC.has(first.toLowerCase()) || familiesChecked.has(first)) {
        continue;
      }
      familiesChecked.add(first);
      const declared = faces.filter((f) => f.family === first);
      if (declared.length) {
        continue; // covered by the webfont-failed preflight
      }
      if (Math.abs(measureFamily(first) - sentinel) < 0.5) {
        add(at({ rule: 'font-substituted', severity: 'high', family: first,
                 note: 'metrics identical to a nonexistent family, so the font is not installed and the renderer substituted it' }));
      }
    }
  }

  // ---- 9. brand palette purity --------------------------------------
  function checkPalette({ o, add, at }, visible) {
    const allowed = new Set(o.allowedColors.map((c) => c.toUpperCase()));
    const seen = new Set();
    for (const el of visible) {
      const cs = getComputedStyle(el);
      for (const [prop, raw] of [['color', cs.color], ['background-color', cs.backgroundColor]]) {
        const c = parseRGB(raw);
        if (!c || c[3] === 0) {
          continue;
        }
        const hex = toHex(c);
        const key = `${prop}:${hex}`;
        if (seen.has(key) || allowed.has(hex)) {
          continue;
        }
        seen.add(key);
        add(at({ rule: 'off-brand-color', severity: 'medium', el: desc(el), prop, color: hex,
                 note: 'not in the theme palette' }));
      }
    }
  }

  function auditSlide({ o, add, fonts }, slide, slideIndex) {
    const sb = slide.getBoundingClientRect();
    const at = (extra) => Object.assign({ slide: slideIndex + 1 }, extra);
    const ctx = { o, add, at, slide, sb };
    const visible = visibleElements(slide);
    checkBoxOverflow(ctx, visible);
    const runs = textRuns(slide);
    for (const node of runs) {
      checkTextRun(ctx, node);
    }
    checkPlacement(ctx, visible);
    checkTypeFloor(ctx, runs);
    for (const node of runs) {
      checkRunContrast(ctx, node);
    }
    checkImages(ctx);
    checkOcclusion(ctx, visible);
    checkFontSubstitution(ctx, visible, fonts);
    if (o.allowedColors) {
      checkPalette(ctx, visible);
    }
  }

  globalThis.__deckAudit = function (options) {
    const o = Object.assign(
      {
        slideSel: '.slide',
        canvas: { width: 1920, height: 1080 },
        // Safe inset is derived from the OFFICIAL DEE template, not from EBU R95.
        // Across all 51 layouts the tightest non-picture slot sits at x=49.3,
        // y=74.6, and the widest reaches x+w=1875.8 - so the brand's own margin is
        // ~44px, and an EBU 96px inset would flag the official template itself.
        safeX: 44,
        safeY: 44,
        grid: 8,
        gridTol: 0.5,
        // Type floors, in px == pt on this canvas. The DEE template's own body
        // ramp is 36-48px with 20-24px used for dense furniture (timeline stops,
        // slide numbers), so a blanket 40px floor would reject the brand. Prose
        // must clear 36; explicitly-marked secondary text may go to 20.
        minBodyPx: 36,
        minCaptionPx: 20,
        overflowTol: 1,
        aspectTol: 0.02,
        minLastLineFrac: 0.15,
        minLastLineWords: 2,
        allowedColors: null, // brand palette purity, when supplied
      },
      options || {},
    );

    const findings = [];
    const add = (f) => findings.push(f);
    const measureFamily = familyMeasurer();

    const slides = [...document.querySelectorAll(o.slideSel)];
    if (!slides.length) {
      return { ok: false, error: `no ${o.slideSel} found`, findings };
    }

    // ---- font preflight, once per document -------------------------------
    // document.fonts.status === 'loaded' is a LIE: it reports loaded while the
    // only FontFace has status 'error'. And document.fonts.check() returns true
    // for families that are verifiably absent. Both were measured.
    const faces = [...document.fonts].map((f) => ({
      family: f.family.replace(/^["']|["']$/g, ''),
      status: f.status,
      weight: f.weight,
    }));
    for (const f of faces) {
      if (f.status === 'error') {
        add({ rule: 'webfont-failed', severity: 'blocker', family: f.family, weight: f.weight,
              note: 'FontFace.status === "error"; document.fonts.status still reports "loaded"' });
      }
    }

    const fonts = {
      faces,
      sentinel: measureFamily('__deck_definitely_absent__'),
      familiesChecked: new Set(),
      measureFamily,
    };
    slides.forEach((slide, slideIndex) => {
      auditSlide({ o, add, fonts }, slide, slideIndex);
    });

    const counts = findings.reduce((m, f) => {
      m[f.severity] = (m[f.severity] || 0) + 1;
      return m;
    }, {});
    return {
      ok: !findings.some((f) => f.severity === 'blocker' || f.severity === 'high'),
      slides: slides.length,
      fontsStatus: document.fonts.status,
      fontFaces: faces,
      counts,
      findings,
    };
  };
})();
