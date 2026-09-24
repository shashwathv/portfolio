/**
 * The ants' brains, with no DOM in them: the font, the message pool,
 * the board (the whole page as one grid, with the reading marked off),
 * a worker (one ant's position and task queue) and the colony that
 * lets several of them roam, write, cross paths and take each other's
 * work down. Pure, so all of it runs in Node — and it does, in the
 * repo's checks. Tracer.jsx owns the page and the pixels; this owns
 * the decisions.
 */

// Direction vectors, clockwise from up.
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

/* A 5×7 font. Seven rows per glyph, each a 5-bit number, MSB left. */
export const FONT = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14], D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],      J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],   T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],     Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14],
  2: [14, 17, 1, 2, 4, 8, 31],     3: [31, 2, 4, 2, 1, 17, 14],
  4: [2, 6, 10, 18, 31, 2, 2],     5: [31, 16, 30, 1, 1, 17, 14],
  6: [6, 8, 16, 30, 17, 17, 14],   7: [31, 1, 2, 4, 8, 8, 8],
  8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  ' ': [0, 0, 0, 0, 0, 0, 0],      ':': [0, 4, 4, 0, 4, 4, 0],
  '-': [0, 0, 0, 31, 0, 0, 0],     '.': [0, 0, 0, 0, 0, 12, 12],
  '?': [14, 17, 1, 2, 4, 0, 4],    '!': [4, 4, 4, 4, 4, 0, 4]
};

/** Cells per second, by job. */
export const RATES = { mark: 120, walk: 170, clear: 240 };

/**
 * Messages, as { cap, word }: the visitor first, then everything else
 * shuffled. `visitor` is whatever the page could read locally — see
 * aboutTheVisitor in Tracer.jsx — and may have gaps.
 */
export function messageList(visitor, sinceLoadMs = 0, cellsWalked = 0) {
  const v = visitor || {};
  const personal = [
    v.os && { cap: 'YOU ARE ON', word: v.os },
    v.browser && { cap: 'YOU ARE USING', word: v.browser }
  ].filter(Boolean);
  const mins = Math.floor(sinceLoadMs / 60000);
  const rest = [
    v.screenSize && { cap: 'YOUR SCREEN IS', word: v.screenSize },
    v.time && { cap: 'THE TIME IS', word: v.time },
    v.day && { cap: 'TODAY IS', word: v.day },
    mins >= 1 && { cap: 'YOU HAVE BEEN HERE', word: `${mins} MIN` },
    cellsWalked >= 1000 && { cap: 'THE ANTS HAVE WALKED', word: `${cellsWalked} CELLS` },
    { cap: 'THIS SITE RUNS ON', word: 'ARCH LINUX' },
    { cap: 'DEPLOYED WITH', word: 'COOLIFY' },
    { cap: 'SERVED BY', word: 'NGINX' },
    { cap: 'TUNNELLED THROUGH', word: 'CLOUDFLARE' },
    { cap: 'LIVES IN A', word: 'HOMELAB' },
    { cap: 'ENTIRELY', word: 'SELF HOSTED' },
    { cap: 'STILL HERE?', word: 'GOOD.' }
  ].filter(Boolean);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  if (personal.length) {
    const lead = personal.splice((Math.random() * personal.length) | 0, 1)[0];
    return [lead, ...rest, ...personal];
  }
  return rest;
}

/**
 * Messages tied to a place on the page. One of these is offered ahead
 * of the shuffled pool when an ant is standing in that section and the
 * reader is looking at it — and only once a visit, so it reads as a
 * remark rather than a nag. The work one points at the rows: each
 * opens onto a write-up, which a plain index doesn't say by itself.
 */
export const CONTEXTUAL = [
  { where: 'work', cap: 'EACH ONE', word: 'OPENS UP' }
];

const textWidth = (str, scale) => (str.length * 6 - 1) * scale;
const rand = (a, b) => a + Math.random() * (b - a);

/**
 * The board: the whole page as one grid of cells. `blocked` marks the
 * reading — anywhere the ants must not write. `onCell(i, inked)` is
 * the only way pixels happen.
 */
export function createBoard({ cols, rows, blocked, onCell }) {
  const B = { cols, rows, onCell, done: new Uint8Array(cols * rows) };

  // A summed-area table over the blocked mask, so "is this rectangle
  // clear of the reading?" is four lookups however big it is.
  const W = cols + 1;
  const sat = new Int32Array(W * (rows + 1));
  for (let y = 1; y <= rows; y++) {
    let run = 0;
    for (let x = 1; x <= cols; x++) {
      run += blocked ? blocked[(y - 1) * cols + (x - 1)] : 0;
      sat[y * W + x] = sat[(y - 1) * W + x] + run;
    }
  }
  B.blockedIn = (x0, y0, x1, y1) => {
    if (x0 < 0 || y0 < 0 || x1 >= cols || y1 >= rows || x1 < x0 || y1 < y0) return true;
    return sat[(y1 + 1) * W + x1 + 1] - sat[y0 * W + x1 + 1] - sat[(y1 + 1) * W + x0] + sat[y0 * W + x0] > 0;
  };
  B.isBlocked = (x, y) => x < 0 || y < 0 || x >= cols || y >= rows || (blocked ? blocked[y * cols + x] === 1 : false);

  const textCells = (str, scale, x0, y0) => {
    const out = [];
    [...str.toUpperCase()].forEach((ch, gi) => {
      const g = FONT[ch] || FONT[' '];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
        if (!(g[r] & (16 >> c))) continue;
        for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
          const cx = x0 + (gi * 6 + c) * scale + sx, cy = y0 + r * scale + sy;
          if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) out.push(cy * cols + cx);
        }
      }
    });
    return out;
  };
  const bubbleCells = (x0, y0, x1, y1) => {
    const out = [];
    const add = (cx, cy) => { if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) out.push(cy * cols + cx); };
    for (let cx = x0; cx <= x1; cx++) { add(cx, y0); add(cx, y1); }
    for (let cy = y0 + 1; cy < y1; cy++) { add(x0, cy); add(x1, cy); }
    add(x1 - 3, y1 + 1);
    add(x1 - 2, y1 + 2);
    return out;
  };
  const loopCells = (x0, y0, x1, y1) => {
    const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    x0 = cl(x0, 0, cols - 1); x1 = cl(x1, 0, cols - 1);
    y0 = cl(y0, 0, rows - 1); y1 = cl(y1, 0, rows - 1);
    const out = [];
    for (let cx = x0; cx < x1; cx++) out.push(cx, y0);
    for (let cy = y0; cy < y1; cy++) out.push(x1, cy);
    for (let cx = x1; cx > x0; cx--) out.push(cx, y1);
    for (let cy = y1; cy > y0; cy--) out.push(x0, cy);
    return out;
  };

  /** A trace task: visit every cell in `cells`, inking or clearing. */
  B.trace = (cells, mode) => {
    const mask = new Set(cells);
    return { kind: 'trace', mode, cells, mask, left: mask.size, board: B };
  };
  /** A walk task: follow a path of [x, y, x, y, …], pen up. */
  B.walk = path => ({ kind: 'walk', path, at: 0, board: B });

  /** How much room a message needs at a scale, in cells. */
  B.measure = ({ cap, word }, scale) => ({
    w: Math.max(textWidth(cap, 1) + 4, textWidth(word, scale)),
    h: (7 + 4) + 3 + 7 * scale
  });

  /**
   * Lay a message out with its box's top-left at (x0, y0): caption in
   * a bubble, tail down, word beneath, everything flush to the box's
   * right edge. Returns the tasks that write it, the cells it occupies,
   * its box and the loop an ant patrols around it.
   */
  B.layoutAt = ({ cap, word }, x0, y0, scale) => {
    const { w } = B.measure({ cap, word }, scale);
    const bubbleH = 7 + 4;
    const wordW = textWidth(word, scale);
    const wx = x0 + w - wordW;
    const wy = y0 + bubbleH + 3;
    const wordCells = textCells(word, scale, wx, wy);
    const capW = textWidth(cap, 1);
    const bx1 = x0 + w - 1;
    const bx0 = bx1 - (capW + 3);
    const by0 = y0;
    const by1 = y0 + bubbleH - 1;
    const capCells = textCells(cap, 1, bx0 + 2, by0 + 2);
    const bubble = bubbleCells(bx0, by0, bx1, by1);
    const box = { x0, y0, x1: x0 + w - 1, y1: wy + 7 * scale - 1 };
    return {
      markTasks: [B.trace(capCells, 'mark'), B.trace(bubble, 'mark'), B.trace(wordCells, 'mark')],
      cells: [...capCells, ...bubble, ...wordCells],
      loop: loopCells(box.x0 - 2, box.y0 - 2, box.x1 + 2, box.y1 + 2),
      box
    };
  };

  return B;
}

/**
 * A worker: one ant on the board. Has a position, a heading, a pen-up
 * route and a queue of tasks. `work(n)` spends up to n cells on the
 * queue and returns what it didn't use.
 */
export function createWorker(id = 0) {
  const W = { id, board: null, x: 0, y: 0, dir: 3, queue: [], route: [], walked: 0 };

  W.attach = (board, x, y) => { W.board = board; W.x = x; W.y = y; W.route = []; };
  Object.defineProperty(W, 'job', { get: () => W.queue[0] ? (W.queue[0].kind === 'walk' ? 'walk' : W.queue[0].mode) : 'walk' });
  Object.defineProperty(W, 'idle', { get: () => W.queue.length === 0 });

  const routeTo = (tx, ty) => {
    const pts = [];
    let cx = W.x, cy = W.y;
    const dx = Math.abs(tx - cx), dy = -Math.abs(ty - cy);
    const sx = cx < tx ? 1 : -1, sy = cy < ty ? 1 : -1;
    let err = dx + dy;
    while (cx !== tx || cy !== ty) {
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; cx += sx; }
      if (e2 <= dx) { err += dx; cy += sy; }
      pts.push(cx, cy);
    }
    W.route = [];
    for (let k = pts.length - 2; k >= 0; k -= 2) W.route.push(pts[k], pts[k + 1]);
  };
  const moveTo = (nx, ny) => {
    W.dir = nx > W.x ? 1 : nx < W.x ? 3 : ny > W.y ? 2 : ny < W.y ? 0 : W.dir;
    W.x = nx; W.y = ny;
    W.walked++;
  };
  const visit = (t, i) => {
    t.mask.delete(i);
    t.left--;
    const inked = t.mode === 'mark';
    t.board.done[i] = inked ? 1 : 0;
    t.board.onCell(i, inked);
  };
  const nearest = t => {
    const { cols } = t.board;
    let best = -1, bestD = Infinity;
    for (const i of t.mask) {
      const d = Math.abs((i % cols) - W.x) + Math.abs(((i / cols) | 0) - W.y);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  /** One cell of work on the current task; false when the task is done. */
  W.step = () => {
    const t = W.queue[0];
    if (!t) return false;
    const { cols, rows } = t.board;
    if (t.kind === 'walk') {
      if (t.at >= t.path.length) return false;
      if (t.at === 0 && !W.route.length && (W.x !== t.path[0] || W.y !== t.path[1])) routeTo(t.path[0], t.path[1]);
      if (W.route.length) { const ny = W.route.pop(), nx = W.route.pop(); moveTo(nx, ny); return true; }
      moveTo(t.path[t.at], t.path[t.at + 1]);
      t.at += 2;
      return true;
    }
    if (t.left <= 0) return false;
    const here = W.y * cols + W.x;
    if (t.mask.has(here)) { visit(t, here); return true; }
    for (const turn of [0, 3, 1, 2]) {
      const d = (W.dir + turn) & 3;
      const nx = W.x + DX[d], ny = W.y + DY[d];
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const i = ny * cols + nx;
      if (t.mask.has(i)) { W.route = []; moveTo(nx, ny); visit(t, i); return true; }
    }
    if (!W.route.length) {
      const i = nearest(t);
      if (i < 0) return false;
      routeTo(i % cols, (i / cols) | 0);
    }
    const ny = W.route.pop(), nx = W.route.pop();
    moveTo(nx, ny);
    if (t.mask.has(ny * cols + nx)) visit(t, ny * cols + nx);
    return true;
  };

  /** Spend up to n cells; return the leftover once the queue is empty. */
  W.work = n => {
    while (n > 0 && W.queue.length) {
      if (W.step()) { n--; continue; }
      W.queue.shift();
      W.route = [];
    }
    return n;
  };

  return W;
}

/**
 * Find room for a message: a box of the given size whose surroundings
 * are clear of the reading and of every other message, as near as
 * possible to `near` (in cells), searching outward in rings. Returns
 * the box's top-left, or null.
 */
export function findSpot(board, messages, size, near, margin = 3) {
  const clearOfMessages = (x0, y0, x1, y1) =>
    !messages.some(m => !(x1 + margin < m.box.x0 || x0 - margin > m.box.x1 || y1 + margin < m.box.y0 || y0 - margin > m.box.y1));
  // The last radius used to be effectively infinite, which only ever
  // produced coordinates off the board; the board's own size is as far
  // as it is worth looking.
  const reach = Math.max(board.cols, board.rows);
  for (const r of [30, 60, 120, 240, 480, reach]) {
    for (let k = 0; k < 40; k++) {
      const x0 = Math.round(near.x + rand(-r, r) - size.w / 2);
      const y0 = Math.round(near.y + rand(-r, r) - size.h / 2);
      const x1 = x0 + size.w - 1, y1 = y0 + size.h - 1;
      if (board.blockedIn(x0 - margin, y0 - margin, x1 + margin, y1 + margin)) continue;
      if (!clearOfMessages(x0, y0, x1, y1)) continue;
      return { x0, y0 };
    }
  }
  return null;
}

/**
 * Find room deterministically, by scanning rather than by sampling.
 * findSpot throws darts, which suits an ant looking for somewhere to
 * put its next remark but loses a pocket of clear ground often enough
 * to matter when a particular message has to land in a particular
 * place. This walks the region and returns the fitting spot nearest
 * `near`, or null if there genuinely isn't one.
 */
export function scanForSpot(board, messages, size, near, region, margin = 3, step = 2) {
  const top = Math.max(0, Math.floor(region?.top ?? 0));
  const bottom = Math.min(board.rows - size.h, Math.ceil(region?.bottom ?? board.rows));
  const clearOfMessages = (x0, y0, x1, y1) =>
    !messages.some(m => !(x1 + margin < m.box.x0 || x0 - margin > m.box.x1 || y1 + margin < m.box.y0 || y0 - margin > m.box.y1));
  let best = null;
  for (let y0 = top; y0 <= bottom; y0 += step) {
    const y1 = y0 + size.h - 1;
    for (let x0 = 0; x0 + size.w - 1 < board.cols; x0 += step) {
      const x1 = x0 + size.w - 1;
      if (board.blockedIn(x0 - margin, y0 - margin, x1 + margin, y1 + margin)) continue;
      if (!clearOfMessages(x0, y0, x1, y1)) continue;
      const d = Math.hypot(x0 + size.w / 2 - near.x, y0 + size.h / 2 - near.y);
      if (!best || d < best.d) best = { x0, y0, d };
    }
  }
  return best ? { x0: best.x0, y0: best.y0 } : null;
}

/**
 * The colony. Several ants on one open board. The rules of the piece:
 *
 *   an ant roams — leg after leg, to wherever there is clear ground —
 *   and now and then finds room and writes a message there, and moves
 *   on, leaving it;
 *   a message may be erased only once it is finished *and its author
 *   has walked away from it*; any ant that comes across such a message
 *   takes it down, cell by cell, and roams on;
 *   there is never more than a handful of messages up at once, so once
 *   the page has its share an ant goes looking for one to take down
 *   before it writes again.
 *
 * Ants travel in straight lines between waypoints, in page px, so they
 * cross paths by chance and nothing is choreographed. `advance(dt)`
 * moves everything on by dt seconds; read positions from `ants[i].x /
 * .y` in the page's coordinates.
 */
export function createColony({
  board, cellPx = 5, ants: count = 3, rates = RATES, nextSpec,
  speed = 340,         // px/s, roaming
  minAge = 20,         // s a finished message must have been up before anyone may erase it
  leaveDistance = 60,  // px the author must be from a message before it counts as having left
  encounter = 240,     // px within which a roaming ant notices a message it may take down
  spacing = 10,        // cells of clear ground kept between messages
  maxMessages = null,  // default: ants + 1
  viewport = null      // () => { top, bottom } in page px, to bias roaming toward what's on screen
}) {
  const cap = () => maxMessages ?? C.ants.length + 1;
  const C = { board, ants: [], messages: [], time: 0, events: [] };
  const log = (kind, ant, m) => C.events.push({ t: C.time, kind, ant: ant.id, spec: m?.spec, box: m?.box });
  const cellOf = p => ({ x: Math.floor(p.x / cellPx), y: Math.floor(p.y / cellPx) });
  const pxOf = (cx, cy) => ({ x: (cx + 0.5) * cellPx, y: (cy + 0.5) * cellPx });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const distToBox = (p, box) => {
    const l = box.x0 * cellPx, t = box.y0 * cellPx, r = (box.x1 + 1) * cellPx, b = (box.y1 + 1) * cellPx;
    return Math.hypot(Math.max(l - p.x, 0, p.x - r), Math.max(t - p.y, 0, p.y - b));
  };

  const posOf = ant => (ant.worker.board ? pxOf(ant.worker.x, ant.worker.y) : { x: ant.x, y: ant.y });
  const authorLeft = m => {
    const a = C.ants[m.by];
    return !a || distToBox(posOf(a), m.box) > leaveDistance;
  };
  const erasable = (m, ant) => m.finishedAt !== null && !m.busy && C.time - m.finishedAt >= minAge && authorLeft(m)
    && (m.by !== ant.id || C.time - m.finishedAt >= 60);

  const detach = ant => {
    const p = posOf(ant);
    ant.x = p.x; ant.y = p.y;
    ant.worker.board = null;
  };
  const travel = (ant, to, then, payload = null) => {
    detach(ant);
    ant.to = to; ant.then = then; ant.payload = payload;
    ant.state = 'travel';
  };

  /** A random waypoint on clear ground: near the ant, or on screen. */
  const waypoint = ant => {
    const here = posOf(ant);
    for (let k = 0; k < 40; k++) {
      let x, y;
      const view = viewport && viewport();
      if (view && Math.random() < 0.45) {
        x = rand(0, board.cols * cellPx);
        y = rand(Math.max(0, view.top), Math.min(board.rows * cellPx, view.bottom));
      } else {
        const a = rand(0, Math.PI * 2), d = rand(300, 900);
        x = here.x + Math.cos(a) * d;
        y = here.y + Math.sin(a) * d;
      }
      const c = cellOf({ x, y });
      if (!board.isBlocked(c.x, c.y)) return pxOf(c.x, c.y);
    }
    return here;
  };

  const startWrite = (ant, spot) => {
    const { spec, x0, y0, scale } = spot;
    const lay = board.layoutAt(spec, x0, y0, scale);
    const m = { spec, by: ant.id, cells: lay.cells, loop: lay.loop, box: lay.box, finishedAt: null, busy: ant, reserved: false };
    const i = C.messages.indexOf(spot.reservation);
    if (i >= 0) C.messages[i] = m; else C.messages.push(m);
    ant.worker.attach(board, lay.box.x1, lay.box.y0);
    ant.worker.queue = lay.markTasks;
    ant.state = 'write';
    log('write', ant, m);
  };
  const startErase = (ant, m) => {
    m.busy = ant;
    ant.worker.attach(board, m.box.x1, m.box.y0);
    ant.worker.queue = [board.trace(m.cells, 'clear')];
    ant.state = 'erase';
    log('erase', ant, m);
  };

  /** Where to next. Called whenever an ant runs out of things to do. */
  const decide = ant => {
    const here = posOf(ant);
    // Something to take down within reach?
    const near = C.messages.filter(m => !m.reserved && erasable(m, ant) && distToBox(here, m.box) <= encounter)
      .sort((a, b) => distToBox(here, a.box) - distToBox(here, b.box));
    if (near.length) { near[0].busy = ant; travel(ant, pxOf(near[0].box.x1, near[0].box.y0), 'erase', near[0]); return; }

    const live = C.messages.filter(m => !m.reserved).length + C.messages.filter(m => m.reserved).length;
    if (ant.legs >= ant.legsPlanned) {
      if (live < cap()) {
        // Room for one more: find ground near here and go write. Never
        // a word that is already up somewhere on the page.
        const up = new Set(C.messages.map(m => m.spec && m.spec.word));
        // `here` goes with it: a message bound to a place can only be
        // chosen by an ant that is standing there.
        const spec = nextSpec(s => !up.has(s.word), here);
        for (const scale of [2, 1]) {
          const spot = findSpot(board, C.messages, board.measure(spec, scale), cellOf(here), spacing);
          if (spot) {
            const size = board.measure(spec, scale);
            const reservation = { reserved: true, spec, box: { x0: spot.x0, y0: spot.y0, x1: spot.x0 + size.w - 1, y1: spot.y0 + size.h - 1 }, by: ant.id, finishedAt: null, busy: ant };
            C.messages.push(reservation);
            ant.legs = 0; ant.legsPlanned = Math.round(rand(2, 4));
            travel(ant, pxOf(reservation.box.x1, reservation.box.y0), 'write', { spec, x0: spot.x0, y0: spot.y0, scale, reservation });
            return;
          }
        }
      } else {
        // The page has its share: go and take one down, wherever it is.
        const any = C.messages.filter(m => !m.reserved && erasable(m, ant))
          .sort((a, b) => distToBox(here, a.box) - distToBox(here, b.box));
        if (any.length) { any[0].busy = ant; travel(ant, pxOf(any[0].box.x1, any[0].box.y0), 'erase', any[0]); return; }
      }
    }
    // Otherwise: another leg.
    ant.legs++;
    travel(ant, waypoint(ant), 'roam');
  };

  /**
   * Put a new ant down at a page position (px) and set it to work. Used
   * for the opening cast, and for reinforcements deployed later wherever
   * the visitor happens to be reading — they arrive with no legs to
   * walk first, so the first thing they do is look for room to write.
   */
  C.deploy = (x, y, legsPlanned = 0) => {
    const c = cellOf({ x, y });
    // Land on clear ground near the asked-for spot.
    let spot = null;
    for (let r = 0; r < 60 && !spot; r += 6) for (let k = 0; k < 12; k++) {
      const cx = Math.round(c.x + rand(-r, r)), cy = Math.round(c.y + rand(-r, r));
      if (!board.isBlocked(cx, cy)) { spot = { x: cx, y: cy }; break; }
    }
    const p = pxOf((spot || c).x, (spot || c).y);
    const ant = { id: C.ants.length, worker: createWorker(C.ants.length), state: 'idle', x: p.x, y: p.y, carry: 0, legs: 0, legsPlanned, to: null, then: null, payload: null };
    C.ants.push(ant);
    log('deploy', ant, null);
    decide(ant);
    return ant;
  };

  /**
   * Send the nearest roaming ant toward a place on the page (px) — for
   * when the visitor has scrolled somewhere and no ant is in sight. An
   * ant mid-write or mid-erase finishes first; roaming ones re-route.
   */
  C.summon = (x, y) => {
    const idle = C.ants.filter(a => a.state === 'travel' && a.then === 'roam');
    if (!idle.length) return null;
    idle.sort((a, b) => dist(a, { x, y }) - dist(b, { x, y }));
    const ant = idle[0];
    const c = cellOf({ x, y });
    let to = null;
    for (let r = 0; r < 60 && !to; r += 6) for (let k = 0; k < 12; k++) {
      const cx = Math.round(c.x + rand(-r, r)), cy = Math.round(c.y + rand(-r, r));
      if (!board.isBlocked(cx, cy)) { to = pxOf(cx, cy); break; }
    }
    if (!to) return null;
    ant.to = to;
    ant.legs = Math.max(ant.legs, ant.legsPlanned); // and, on arrival, look for room to write
    log('summon', ant, null);
    return ant;
  };

  // The opening cast, on the hero's clear ground.
  for (let i = 0; i < count; i++) {
    C.deploy(board.cols * cellPx * rand(0.55, 0.9), board.rows * cellPx * rand(0.02, 0.12), i === 0 ? 0 : Math.round(rand(1, 3)));
  }

  /**
   * Send an ant to write a particular message at a particular place.
   * Used for the place-bound messages: waiting for an ant to wander
   * into the right section while the reader happens to be looking at
   * it is a coincidence that may never occur on a tall page with three
   * ants. Returns false if nobody is free or there is no room, so the
   * caller can keep the message pending and try again.
   */
  C.announce = (spec, at, region = null, margin = 4) => {
    if (C.messages.some(m => m.spec && m.spec.word === spec.word)) return false;
    const free = C.ants.filter(a => a.state === 'travel' && a.then === 'roam');
    if (!free.length) return false;
    const near = cellOf(at);
    const inCells = region && { top: region.top / cellPx, bottom: region.bottom / cellPx };
    for (const scale of [2, 1]) {
      const size = board.measure(spec, scale);
      const spot = scanForSpot(board, C.messages, size, near, inCells, margin);
      if (!spot) continue;
      const box = { x0: spot.x0, y0: spot.y0, x1: spot.x0 + size.w - 1, y1: spot.y0 + size.h - 1 };
      free.sort((a, b) => distToBox(a, box) - distToBox(b, box));
      const ant = free[0];
      const reservation = { reserved: true, spec, box, by: ant.id, finishedAt: null, busy: ant };
      C.messages.push(reservation);
      ant.legs = 0;
      ant.legsPlanned = Math.round(rand(2, 4));
      travel(ant, pxOf(box.x1, box.y0), 'write', { spec, x0: spot.x0, y0: spot.y0, scale, reservation });
      log('announce', ant, reservation);
      return true;
    }
    return false;
  };

  C.advance = dt => {
    C.time += dt;
    for (const ant of C.ants) {
      if (ant.state === 'travel') {
        const d = dist(ant, ant.to);
        const stepPx = speed * dt;
        if (d > stepPx) {
          ant.x += ((ant.to.x - ant.x) / d) * stepPx;
          ant.y += ((ant.to.y - ant.y) / d) * stepPx;
          continue;
        }
        ant.x = ant.to.x; ant.y = ant.to.y;
        if (ant.then === 'write') startWrite(ant, ant.payload);
        else if (ant.then === 'erase') startErase(ant, ant.payload);
        else decide(ant);
        continue;
      }
      ant.carry += dt * rates[ant.worker.job];
      let n = ant.carry | 0;
      if (n <= 0) continue;
      ant.carry -= n;
      ant.worker.work(n);
      if (ant.worker.idle) {
        if (ant.state === 'write') {
          const m = C.messages.find(x => x.busy === ant && !x.reserved);
          if (m) { m.finishedAt = C.time; m.busy = null; log('done', ant, m); }
        } else if (ant.state === 'erase') {
          const m = C.messages.find(x => x.busy === ant);
          if (m) { C.messages.splice(C.messages.indexOf(m), 1); log('cleared', ant, m); }
        }
        ant.legs = 0;
        ant.legsPlanned = Math.round(rand(1, 3));
        decide(ant);
      }
    }
  };

  return C;
}
