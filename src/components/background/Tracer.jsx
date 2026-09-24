import { useEffect, useRef } from 'react';
import { createBoard, createColony, findSpot, messageList, CONTEXTUAL, RATES } from './tracing';

/**
 * The ants.
 *
 * A few small hot points that have the whole page as their ground.
 * They roam it — leg after leg, across whatever is clear — and now and
 * then find room and write a message: a caption in a speech bubble, a
 * word beneath. Then they move on and leave it. A message may be taken
 * down only once it is finished and its author has walked away from
 * it; any ant that comes across such a message erases it, cell by
 * cell, and roams on. They are not together, but they cross paths.
 *
 * The one thing they never touch is the reading. Every heading,
 * paragraph, button, figure and form on the page is measured and
 * marked off before the ants are let out, with a margin, and nothing
 * is ever written inside those marks. Everything is on the page, not
 * on the glass: the ink sits in tiles set into the document, so it
 * scrolls with the copy like a mark on the paper, and the ants cross
 * the board behind the type on their way between things.
 *
 * The first message is about whoever is looking: their OS, or their
 * browser. After that, a shuffled pool — their screen, the time, the
 * day, how long they've been here, how far the ants have walked — and
 * the things this site is made of. Read locally; goes nowhere.
 *
 * The decisions — font, layout, the colony — live in ./tracing, which
 * has no DOM in it and runs in Node. This file owns the page, the
 * pixels and the clock.
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const rgbOf = hex => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

/* Where the reading is. Everything here is off limits, with a margin.
   Text is measured by its line boxes, not its element box — a heading
   is a block that spans the whole sheet, but its glyphs cover a third
   of that, and the rest is ground. Boxes (buttons, figures, forms,
   plates) are measured as boxes. */
const TEXT = ['main h1', 'main h2', 'main h3', 'main p', 'main li', 'main dt', 'main dd', 'main label',
  'main a:not(.btn)', 'main .section-kicker', 'main .reel-hint'].join(', ');
const BOXES = ['main .btn', 'main button', 'main form', 'main input', 'main textarea', 'main figure',
  'main svg', 'main img', 'main .plate', 'main .case', 'main .reply-card', '.colophon'].join(', ');

/* The sections a place-bound message can name — see CONTEXTUAL in
   ./tracing. Their bounds are measured with the rest of the page. */
const SECTIONS = ['home', 'about', 'work', 'skills', 'contact'];

/* Ink tiles: the page is far too big for one canvas, and mostly empty.
   A tile is a whole number of cells on a side, so no cell ever straddles
   an edge and loses a sliver to the neighbouring tile. */
const TILE_CELLS = 100;

/** How often the tiles are repainted from the engine's own record. */
const RECONCILE_MS = 4000;

/** How often a place-bound message checks whether it is wanted. */
const ANNOUNCE_MS = 900;

/* What the ants know about the visitor. Read locally; goes nowhere. */
function aboutTheVisitor() {
  const ua = navigator.userAgent || '';
  const os =
    /Android/.test(ua) ? 'ANDROID' :
    /iPhone|iPad|iPod/.test(ua) ? 'IOS' :
    /Mac/.test(ua) ? 'MACOS' :
    /Win/.test(ua) ? 'WINDOWS' :
    /CrOS/.test(ua) ? 'CHROMEOS' :
    /Linux/.test(ua) ? 'LINUX' : null;
  const browser =
    navigator.brave ? 'BRAVE' :
    /Firefox/.test(ua) ? 'FIREFOX' :
    /Edg\//.test(ua) ? 'EDGE' :
    /OPR|Opera/.test(ua) ? 'OPERA' :
    /Chrome/.test(ua) ? 'CHROME' :
    /Safari/.test(ua) ? 'SAFARI' : null;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const day = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()];
  return {
    os, browser, day,
    time: `${hh}:${mm}`,
    screenSize: `${window.screen.width} X ${window.screen.height}`
  };
}

export default function Tracer({
  ink = null,        // the trail: the cool drum — read from --blue unless given
  hot = null,        // the ants: the hot drum — read from --red unless given
  cell = 5,          // css px
  mark = 0.18,       // opacity of a traced cell
  rates = RATES,
  ants = 3,          // the opening cast
  maxAnts = 6        // with reinforcements, as the visitor scrolls deeper
}) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const root = document.getElementById('root');
    if (!layer || !root) return;

    const tokens = getComputedStyle(document.documentElement);
    const inkHex = ink || tokens.getPropertyValue('--blue').trim() || '#62c2b1';
    const hotHex = hot || tokens.getPropertyValue('--red').trim() || '#cf7248';
    const FILL_MARK = `rgba(${rgbOf(inkHex)}, ${mark})`;
    const loadedAt = performance.now();
    const reduced = prefersReducedMotion();

    let disposed = false;
    let deployed = 0;
    let colony = null;
    let reconcile = null;
    let lastReconcile = 0;
    let sprites = [];
    let list = [];
    let ix = -1;
    let walkedBefore = 0;
    /** Section bounds in page px, measured with everything else. */
    let bounds = {};
    /** Place-bound messages already said, so each is said once a visit. */
    const said = new Set();

    const nextSpec = fits => {
      for (let tries = 0; tries < 64; tries++) {
        ix++;
        if (ix >= list.length) {
          const walked = walkedBefore + (colony ? colony.ants.reduce((a, x) => a + x.worker.walked, 0) : 0);
          list = messageList(aboutTheVisitor(), performance.now() - loadedAt, walked);
          ix = 0;
        }
        if (fits(list[ix])) return list[ix];
      }
      return list[ix];
    };

    /** Measure the page, mark off the reading, tile it, let the ants out. */
    const build = () => {
      if (colony) walkedBefore += colony.ants.reduce((a, x) => a + x.worker.walked, 0);
      deployed = 0;
      if (reduced) ix = -1;
      layer.replaceChildren();
      sprites = [];

      const phone = window.innerWidth < 700;
      const cellCss = phone ? 4 : cell;
      const dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
      const px = Math.max(2, Math.round(cellCss * dpr));
      const pageW = root.clientWidth;
      const pageH = root.scrollHeight;
      const cols = Math.floor(pageW / cellCss);
      const rows = Math.floor(pageH / cellCss);
      if (cols < 20 || rows < 20) { colony = null; return; }

      // The reading, in cells, with a margin of two.
      const blocked = new Uint8Array(cols * rows);
      const rootRect = root.getBoundingClientRect();

      // Where each section sits on the page, for the place-bound
      // messages above. Re-measured whenever the ground is.
      bounds = {};
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        bounds[id] = {
          top: r.top - rootRect.top + root.scrollTop,
          bottom: r.bottom - rootRect.top + root.scrollTop
        };
      }
      const blockRect = (l, t, r, b, m = 2) => {
        const x0 = Math.max(0, Math.floor(l / cellCss) - m), x1 = Math.min(cols - 1, Math.ceil(r / cellCss) + m);
        const y0 = Math.max(0, Math.floor(t / cellCss) - m), y1 = Math.min(rows - 1, Math.ceil(b / cellCss) + m);
        for (let y = y0; y <= y1; y++) blocked.fill(1, y * cols + x0, y * cols + x1 + 1);
      };
      const blockClient = r => {
        if (!r.width || !r.height) return;
        blockRect(r.left - rootRect.left + root.scrollLeft, r.top - rootRect.top + root.scrollTop,
          r.right - rootRect.left + root.scrollLeft, r.bottom - rootRect.top + root.scrollTop);
      };
      const range = document.createRange();
      for (const el of document.querySelectorAll(TEXT)) {
        range.selectNodeContents(el);
        for (const r of range.getClientRects()) blockClient(r);
      }
      for (const el of document.querySelectorAll(BOXES)) blockClient(el.getBoundingClientRect());
      // The fixed spine on the left, the scrollbar on the right, a hair at the top.
      if (window.innerWidth > 900) blockRect(0, 0, 78 + 12, pageH, 0);
      blockRect(pageW - 14, 0, pageW, pageH, 0);
      blockRect(0, 0, pageW, 8, 0);

      // Ink goes into tiles, made only where something is drawn. A tile
      // is TILE_CELLS cells square: its canvas is exactly that many device
      // pixels per cell, so every cell lands on whole pixels whatever the
      // device ratio, and the canvas is scaled to its css size.
      const tiles = new Map();
      const tileCss = TILE_CELLS * cellCss;
      const tileFor = (tx, ty) => {
        const key = tx + ',' + ty;
        let t = tiles.get(key);
        if (t) return t;
        const c = document.createElement('canvas');
        c.className = 'tracer-tile';
        c.width = TILE_CELLS * px;
        c.height = TILE_CELLS * px;
        c.style.left = `${tx * tileCss}px`;
        c.style.top = `${ty * tileCss}px`;
        c.style.width = c.style.height = `${tileCss}px`;
        layer.insertBefore(c, layer.firstChild); // under the ants
        t = { ctx: c.getContext('2d', { alpha: true }), tx, ty };
        tiles.set(key, t);
        return t;
      };
      const onCell = (i, inked) => {
        const cx = i % cols, cy = (i / cols) | 0;
        const tx = Math.floor(cx / TILE_CELLS), ty = Math.floor(cy / TILE_CELLS);
        const { ctx } = tileFor(tx, ty);
        const lx = (cx - tx * TILE_CELLS) * px, ly = (cy - ty * TILE_CELLS) * px;
        ctx.clearRect(lx, ly, px, px);
        if (inked) { ctx.fillStyle = FILL_MARK; ctx.fillRect(lx, ly, px, px); }
      };

      const board = createBoard({ cols, rows, blocked, onCell });

      // Truth is the engine's record of what is inked. Every few seconds
      // each tile is repainted from it, so nothing the engine doesn't own
      // can stay on the page — whatever put it there.
      reconcile = () => {
        for (const { ctx, tx, ty } of tiles.values()) {
          ctx.clearRect(0, 0, TILE_CELLS * px, TILE_CELLS * px);
          ctx.fillStyle = FILL_MARK;
          const x0 = tx * TILE_CELLS, y0 = ty * TILE_CELLS;
          const x1 = Math.min(cols, x0 + TILE_CELLS), y1 = Math.min(rows, y0 + TILE_CELLS);
          for (let cy = y0; cy < y1; cy++) {
            const row = cy * cols;
            for (let cx = x0; cx < x1; cx++) {
              if (board.done[row + cx]) ctx.fillRect((cx - x0) * px, (cy - y0) * px, px, px);
            }
          }
        }
      };

      if (reduced) {
        // One message, complete, near the top-right of the hero; no ants.
        colony = null;
        const spec = nextSpec(() => true);
        for (const scale of [2, 1]) {
          const spot = findSpot(board, [], board.measure(spec, scale), { x: Math.floor(cols * 0.8), y: Math.floor((window.innerHeight * 0.12) / cellCss) });
          if (spot) {
            const lay = board.layoutAt(spec, spot.x0, spot.y0, scale);
            for (const i of lay.cells) { board.done[i] = 1; onCell(i, true); }
            break;
          }
        }
        return;
      }

      colony = createColony({
        board, cellPx: cellCss, ants, rates, nextSpec,
        viewport: () => ({ top: root.scrollTop, bottom: root.scrollTop + root.clientHeight })
      });
      for (let i = 0; i < colony.ants.length; i++) {
        const s = document.createElement('div');
        s.className = 'tracer-ant';
        s.style.width = s.style.height = `${cellCss}px`;
        s.style.background = hotHex;
        layer.appendChild(s);
        sprites.push(s);
      }
      placeSprites(cellCss);
    };

    /**
     * If the reader is in a section that has something to say, send an
     * ant to say it — once a visit, and only when it actually lands,
     * so a failed attempt is retried rather than lost. Driven from the
     * frame loop rather than the scroll handler so it also fires for
     * someone who arrives on a deep link and never scrolls.
     */
    const announceForSection = () => {
      if (!colony || reduced) return;
      const view = { top: root.scrollTop, bottom: root.scrollTop + root.clientHeight };
      for (const m of CONTEXTUAL) {
        if (said.has(m.word)) continue;
        const b = bounds[m.where];
        if (!b) continue;
        // Most of the section has to be what the reader is looking at,
        // so it is a remark about this section and not the one above.
        const overlap = Math.min(b.bottom, view.bottom) - Math.max(b.top, view.top);
        if (overlap < Math.min(b.bottom - b.top, view.bottom - view.top) * 0.4) continue;
        // Aim at the middle of the part the reader can actually see.
        const seenTop = Math.max(b.top, view.top);
        const seenBottom = Math.min(b.bottom, view.bottom);
        const at = {
          x: root.clientWidth * (window.innerWidth < 700 ? 0.5 : 0.62),
          y: (seenTop + seenBottom) / 2
        };
        // Confined to the section, so the remark is about what the
        // reader is looking at and not about its neighbour.
        if (colony.announce(m, at, b)) said.add(m.word);
      }
    };

    const placeSprites = cellCss => {
      const half = cellCss / 2;
      colony.ants.forEach((ant, i) => {
        const p = ant.worker.board ? { x: (ant.worker.x + 0.5) * cellCss, y: (ant.worker.y + 0.5) * cellCss } : ant;
        sprites[i].style.transform = `translate(${(p.x - half).toFixed(1)}px, ${(p.y - half).toFixed(1)}px)`;
      });
    };

    // Type measurements move once the display faces land, so the first
    // build waits for them; a resize rebuilds — the ground has moved.
    let ready = false;
    let raf = 0, last = 0, lastAnnounce = 0;
    const frame = now => {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!colony) return;
      colony.advance(dt);
      placeSprites(window.innerWidth < 700 ? 4 : cell);
      if (reconcile && now - lastReconcile > RECONCILE_MS) {
        lastReconcile = now;
        reconcile();
      }
      if (now - lastAnnounce > ANNOUNCE_MS) {
        lastAnnounce = now;
        announceForSection();
      }
    };
    const start = () => {
      if (ready || disposed) return;
      ready = true;
      build();
      if (!reduced && colony) raf = requestAnimationFrame(frame);
    };
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(start);
    const fallback = setTimeout(start, 1500);

    let resizeRaf = 0;
    const onResize = () => {
      if (!ready || disposed) return;
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        build();
        if (!reduced && colony && !raf) raf = requestAnimationFrame(frame);
      });
    };
    window.addEventListener('resize', onResize);

    // Reinforcements: one more ant for every viewport of depth the
    // visitor explores, each arriving where they are looking. And a
    // summons when they've jumped somewhere with no ant in sight.
    let deepest = 0;
    let lastSummon = -Infinity;
    const onScroll = () => {
      if (!colony || reduced) return;
      const phone = window.innerWidth < 700;
      const view = { top: root.scrollTop, bottom: root.scrollTop + root.clientHeight };
      const midX = root.clientWidth * (phone ? 0.5 : 0.7), midY = (view.top + view.bottom) / 2;
      deepest = Math.max(deepest, view.top);
      const earned = Math.floor(deepest / Math.max(1, root.clientHeight));
      const limit = phone ? Math.min(maxAnts, 3) : maxAnts;
      while (deployed < earned && colony.ants.length < limit) {
        colony.deploy(midX, midY);
        const s = document.createElement('div');
        s.className = 'tracer-ant';
        s.style.width = s.style.height = `${phone ? 4 : cell}px`;
        s.style.background = hotHex;
        layer.appendChild(s);
        sprites.push(s);
        deployed++;
      }
      const now = performance.now();
      const inSight = colony.ants.some(a => a.y >= view.top - 40 && a.y <= view.bottom + 40);
      if (!inSight && now - lastSummon > 6000) {
        colony.summon(midX, midY);
        lastSummon = now;
      }
    };
    root.addEventListener('scroll', onScroll, { passive: true });

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && ready && !reduced && colony) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(fallback);
      window.removeEventListener('resize', onResize);
      root.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      layer.replaceChildren();
    };
  }, [ink, hot, cell, mark, rates, ants, maxAnts]);

  return <div className="tracer-layer" ref={layerRef} aria-hidden="true" />;
}
