import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';
import ProjectPrintout from './ProjectPrintout';

/**
 * Each project carries a `printout`: a sample run — the command and what
 * came back — which is what a reader actually wants to see of a tool
 * that has no screen. See ProjectPrintout for the copy limits: the paper
 * is a fixed size, so the lines have to fit it. The runs are illustrative
 * and say so on the plate.
 */
const projects = [
  {
    title: 'KenXSearch',
    tag: 'Linux tooling',
    description:
      'Circle to Search, for Linux. Draw a ring around anything on screen and it searches it — text, image, or translation. The hard part was capture: it survives KDE, GNOME, Wayland and X11.',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract', 'Playwright'],
    flag: 'Partial on GNOME 49+',
    printout: {
      figure: '01',
      caption: 'ring to result',
      stamp: 'circle → answer',
      mark: 'ring',
      lines: [
        { kind: 'cmd', text: 'kenx --ring' },
        { kind: 'dim', label: 'session', text: 'wayland · kde plasma' },
        { kind: 'out', label: 'capture', text: 'ring 412 × 288 px  ✓' },
        { kind: 'out', label: 'ocr', text: 'tesseract  "circle to search"' },
        { kind: 'out', label: 'search', text: 'text · 3 results' },
        { kind: 'hot', label: '→', text: 'opened in browser' }
      ]
    },
    links: {
      github: 'https://github.com/shashwathv/KenXSearch',
      demo: 'https://kenxsearch.nw-right.dev/'
    }
  },
  {
    title: 'ShadowBrowse',
    tag: 'Backend infrastructure',
    description:
      'A scraping and browser-automation framework in Go. Headless sessions, proxy rotation and rate limiting that holds up at enterprise volume.',
    tech: ['Golang', 'Chromedp', 'Redis', 'Docker'],
    printout: {
      figure: '02',
      caption: 'one job through the pool',
      stamp: 'holds at volume',
      mark: 'fan',
      lines: [
        { kind: 'cmd', text: 'shadowbrowse run jobs.yaml' },
        { kind: 'dim', label: 'pool', text: '24 headless sessions · 60 proxies' },
        { kind: 'out', label: 'job 0412', text: 'fetch  200  1.2s' },
        { kind: 'dim', label: 'job 0413', text: 'fetch  429  → backoff 8s' },
        { kind: 'out', label: 'job 0413', text: 'fetch  200  0.9s' },
        { kind: 'hot', label: '→', text: 'structured payload out' }
      ]
    },
    links: {
      github: 'https://github.com/VincentSamuelPaul/ShadowBrowse',
      demo: 'https://drive.google.com/file/d/1Pr8xoM5vnvuXAdkyqVTOKZajyLsv-RvP/view?usp=drive_link'
    }
  },
  {
    title: 'BehaviorVault 2.0',
    tag: 'ML / security',
    description:
      'Behavioural biometrics for mobile banking. Five signals, per-user EWMA baselines, and an Isolation Forest squeezed into a 3KB TFLite model so detection runs on the handset.',
    tech: ['Python', 'FastAPI', 'TensorFlow Lite', 'scikit-learn'],
    printout: {
      figure: '03',
      caption: 'a session, scored',
      stamp: '3 kb, on device',
      mark: 'trace',
      lines: [
        { kind: 'cmd', text: 'bvault score session.jsonl' },
        { kind: 'dim', label: 'signals', text: 'touch · swipe · hold · tilt · dwell' },
        { kind: 'out', label: 'baseline', text: 'per-user ewma  Δ 0.011' },
        { kind: 'out', label: 'model', text: 'isolation forest · 3 kb tflite' },
        { kind: 'out', label: 'score', text: '0.03  (threshold 0.42)' },
        { kind: 'hot', label: '→', text: 'verdict: same user' }
      ]
    },
    links: {
      github: 'https://github.com/shashwathv/Behaviour-Vault',
      demo: 'https://drive.google.com/file/d/10zEj51U0DaI2REGVXIlrllYOLCUvMClq/view?usp=drive_link'
    }
  },
  {
    title: 'KanZen',
    tag: 'AI / computer vision',
    description:
      'Photograph a page of Japanese study material, get back a properly built Anki deck. Gemini 2.5 Flash does the reading; Redis and S3 handle queueing and storage, with offline fallbacks for when Gemini is unreachable.',
    tech: ['Python', 'Gemini 2.5 Flash', 'Redis', 'AWS S3', 'SudachiPy'],
    printout: {
      figure: '04',
      caption: 'page in, deck out',
      stamp: 'photo → deck',
      mark: 'cards',
      lines: [
        { kind: 'cmd', text: 'kanzen photo.jpg' },
        { kind: 'out', label: 'read', text: '1 page · gemini 2.5 flash' },
        { kind: 'out', label: 'split', text: 'sudachipy · 38 tokens' },
        { kind: 'dim', label: 'cards', text: '24 kept · 6 duplicates dropped' },
        { kind: 'out', label: 'deck', text: 'anki .apkg → redis + s3' },
        { kind: 'hot', label: '→', text: 'deck.apkg · 24 cards' }
      ]
    },
    links: {
      github: 'https://github.com/shashwathv/KanGen',
      demo: 'https://kanzen.nw-right.dev/'
    }
  }
];

/** Past this many pixels a gesture is a scroll, not a click. */
const DRAG_SLOP = 6;

/** How far a flick's speed carries the reel past where it was let go. */
const FLICK_MS = 110;

/** Fallback for browsers without `scrollend`. */
const SETTLE_MS = 700;

/**
 * The scrollLeft values at which each plate sits flush against the
 * reel's left gutter — i.e. the snap points, computed rather than
 * assumed, since the plate width is a clamp() and the gutter changes
 * at the mobile breakpoint.
 */
function snapPoints(reel, selector = '.plate') {
  const pad = parseFloat(getComputedStyle(reel).paddingLeft) || 0;
  const origin = reel.getBoundingClientRect().left - reel.scrollLeft + pad;
  const max = Math.max(0, reel.scrollWidth - reel.clientWidth);

  return Array.from(reel.querySelectorAll(selector)).map(plate =>
    Math.min(max, Math.max(0, plate.getBoundingClientRect().left - origin))
  );
}

export default function Work() {
  const reelRef = useRef(null);

  // Drag-to-scroll the reel, mouse only: touch and pen keep the browser's
  // native horizontal scroll, which already has momentum and snapping, and
  // driving scrollLeft from JS as well would fight it.
  //
  // `moved` outlives the gesture by one event so the capture-phase click
  // swallow below can tell a drag from a click on a project link.
  const drag = useRef({
    down: false,
    moved: false,
    startX: 0,
    startLeft: 0,
    dx: 0,
    frame: 0,
    vx: 0,
    lastX: 0,
    lastT: 0
  });

  // The whole gesture lives in one effect so the handlers can close over
  // each other directly — `finish` has to be reachable from `onMove`, and
  // both have to be the same function objects at removeEventListener time.
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return undefined;

    const d = drag.current;
    let settleTimer = 0;

    function onMove(e) {
      if (!d.down) return;

      // A release that happened off-window never arrives as a pointerup.
      if (e.buttons === 0) {
        finish();
        return;
      }

      d.dx = e.clientX - d.startX;
      if (Math.abs(d.dx) > DRAG_SLOP) d.moved = true;

      // Trailing speed, smoothed so one stray sample can't throw the flick.
      const dt = e.timeStamp - d.lastT;
      if (dt > 0) {
        d.vx = d.vx * 0.7 + ((e.clientX - d.lastX) / dt) * 0.3;
        d.lastX = e.clientX;
        d.lastT = e.timeStamp;
      }

      // A mouse can report several moves per frame; one scrollLeft write
      // per frame is all the compositor can use.
      if (!d.frame) {
        d.frame = requestAnimationFrame(() => {
          d.frame = 0;
          reel.scrollLeft = d.startLeft - d.dx;
        });
      }
    }

    function finish() {
      if (!d.down) return;
      d.down = false;

      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);

      if (d.frame) {
        cancelAnimationFrame(d.frame);
        d.frame = 0;
      }
      reel.classList.remove('is-dragging');

      // A press that never moved is a click on a link. Leave the scroll be.
      if (!d.moved) return;

      reel.scrollLeft = d.startLeft - d.dx; // the frame just cancelled

      // Land on a plate rather than wherever the pointer stopped, carrying
      // some of the gesture's speed into which plate that is. Snapping has
      // to stay off until the glide ends — turning it back on first snaps
      // the reel instantly, and that jump is the jank it was meant to fix.
      const points = snapPoints(reel);
      if (!points.length) return;

      const projected = reel.scrollLeft - d.vx * FLICK_MS;
      const target = points.reduce((best, p) =>
        Math.abs(p - projected) < Math.abs(best - projected) ? p : best
      );

      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      reel.classList.add('is-settling');
      reel.scrollTo({ left: target, behavior: still ? 'auto' : 'smooth' });

      const settled = () => {
        reel.classList.remove('is-settling');
        reel.removeEventListener('scrollend', settled);
        clearTimeout(settleTimer);
      };
      reel.addEventListener('scrollend', settled);
      settleTimer = setTimeout(settled, still ? 0 : SETTLE_MS);
    }

    function onDown(e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;

      reel.classList.remove('is-settling');
      reel.classList.add('is-dragging');

      d.down = true;
      d.moved = false;
      d.startX = e.clientX;
      d.startLeft = reel.scrollLeft;
      d.dx = 0;
      d.vx = 0;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;

      // The rest of the gesture is tracked on the window, so a drag that
      // runs off the reel keeps scrolling instead of stopping dead.
      //
      // Deliberately not setPointerCapture, which would do the same job:
      // Chrome then derives the click from the capturing element, so every
      // "Source →" on the plates arrives at the reel instead of the link
      // and stops navigating.
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
    }

    reel.addEventListener('pointerdown', onDown);

    return () => {
      reel.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      if (d.frame) cancelAnimationFrame(d.frame);
      clearTimeout(settleTimer);
    };
  }, []);

  // Where the reel is: which plate is flush left, how far along the run
  // we are, and whether there is anything left to the right. Drives the
  // counter, the track, the arrows and the edge fade — the four things
  // that say "this scrolls" without anyone having to guess.
  const [pos, setPos] = useState({ index: 0, count: projects.length, progress: 0, thumb: 1, atEnd: false });

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = Math.max(0, reel.scrollWidth - reel.clientWidth);
      // Only the project plates count — the end-stop is not a stop.
      const points = snapPoints(reel, '.plate:not(.plate-end)');
      let index = 0;
      for (let i = 0; i < points.length; i++) if (points[i] <= reel.scrollLeft + 2) index = i;
      setPos({
        index: Math.min(index, projects.length - 1),
        count: projects.length,
        progress: max ? reel.scrollLeft / max : 0,
        thumb: reel.scrollWidth ? reel.clientWidth / reel.scrollWidth : 1,
        atEnd: reel.scrollLeft >= max - 2
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    reel.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      reel.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /** Glide to a scrollLeft with snapping held off until we land. */
  const glideTo = left => {
    const reel = reelRef.current;
    if (!reel) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reel.classList.add('is-settling');
    reel.scrollTo({ left, behavior: still ? 'auto' : 'smooth' });
    let timer = 0;
    const settled = () => {
      reel.classList.remove('is-settling');
      reel.removeEventListener('scrollend', settled);
      clearTimeout(timer);
    };
    reel.addEventListener('scrollend', settled);
    timer = setTimeout(settled, still ? 0 : SETTLE_MS);
  };

  /**
   * Step one plate left or right — to the nearest snap point actually on
   * that side of where we are. Near the end of the run several plates
   * share the maximum scroll position, so stepping by index could land
   * on the point we were already at and go nowhere.
   */
  const step = dir => {
    const reel = reelRef.current;
    if (!reel) return;
    const points = [...new Set(snapPoints(reel))].sort((a, b) => a - b);
    const here = reel.scrollLeft;
    const target = dir > 0
      ? points.find(p => p > here + 2)
      : [...points].reverse().find(p => p < here - 2);
    if (target !== undefined) glideTo(target);
  };

  const onKeyDown = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  // The first time the reel comes into view it leans right a little and
  // settles back — the plates visibly slide, which is the one thing a
  // static half-plate can't say. Once, never after the visitor has
  // touched it, and not at all under reduced motion.
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    let spent = false;
    const cancel = () => {
      spent = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; reel.classList.remove('is-settling'); }
    };
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || spent) return;
      io.disconnect();
      if (reel.scrollLeft > 0) return;
      spent = true;
      const start = performance.now();
      const duration = 1300, reach = 64;
      reel.classList.add('is-settling');
      const tick = now => {
        const t = Math.min(1, (now - start) / duration);
        // Out and back on one sine arc: slow to leave, slow to return.
        reel.scrollLeft = reach * Math.sin(Math.PI * t) ** 2;
        if (t < 1) raf = requestAnimationFrame(tick);
        else { raf = 0; reel.scrollLeft = 0; reel.classList.remove('is-settling'); }
      };
      raf = requestAnimationFrame(tick);
    }, { root: document.getElementById('root'), threshold: 0.45 });
    io.observe(reel);
    reel.addEventListener('pointerdown', cancel, { once: true });
    reel.addEventListener('wheel', cancel, { once: true, passive: true });
    reel.addEventListener('touchstart', cancel, { once: true, passive: true });
    return () => {
      io.disconnect();
      cancel();
    };
  }, []);

  // Swallow the click a drag would otherwise fire on whatever plate the
  // gesture happened to finish over.
  const onClickCapture = e => {
    if (!drag.current.moved) return;
    drag.current.moved = false;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section id="work">
      <div className="sheet reel-head">
        <Reveal>
          <p className="section-kicker">Filed under: built it</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="section-title">
            Four things that <em>actually ship</em>
          </h2>
        </Reveal>
        <Reveal delay={90} className="reel-bar">
          <p className="reel-hint">
            <span className="reel-hint-rule" aria-hidden="true" />
            Drag, swipe, or step through
          </p>
          <div className="reel-nav">
            <span className="reel-count" aria-live="polite">
              <b>{String(pos.index + 1).padStart(2, '0')}</b>
              <span aria-hidden="true"> / </span>
              <span className="visually-hidden">of </span>
              {String(pos.count).padStart(2, '0')}
            </span>
            <button
              type="button"
              className="reel-btn"
              onClick={() => step(-1)}
              disabled={pos.index === 0}
              aria-label="Previous project"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="reel-btn"
              onClick={() => step(1)}
              disabled={pos.atEnd}
              aria-label="Next project"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </Reveal>
      </div>

      <div className="reel-frame" data-at-end={pos.atEnd}>
      <div
        className="reel"
        ref={reelRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClickCapture={onClickCapture}
        // The plates hold links, and a link drags natively — which hijacks
        // the gesture halfway through and leaves a ghost image behind.
        onDragStart={e => e.preventDefault()}
      >
        {projects.map((project, i) => (
          <article className="plate" key={project.title}>
            <div className="plate-head">
              <span className="plate-no">Nº {String(i + 1).padStart(2, '0')}</span>
              <span className="plate-tag">
                 <span aria-hidden="true">·</span> {project.tag}
              </span>
            </div>

            <div className="plate-figure">
              <ProjectPrintout {...project.printout} />
              {project.flag && (
                <span className="plate-flag">{project.flag}</span>
              )}
            </div>

            <h3 className="plate-title">{project.title}</h3>
            <p className="plate-desc">{project.description}</p>

            <ul className="plate-tech">
              {project.tech.map(tech => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <div className="plate-links">
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source <span aria-hidden="true">→</span>
                </a>
              )}
              {project.links.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        ))}

        {/* Colophon end-stop for the reel. */}
        <div className="plate plate-end" aria-hidden="true">
          <span>End of<br />run</span>
          <span className="plate-end-mark">✦</span>
        </div>
      </div>

      {/* The run, as a length of rule: the block is the part of it you
          can see, and it slides as you go. */}
      <div className="reel-track" aria-hidden="true">
        <span
          className="reel-thumb"
          style={{ '--thumb': pos.thumb, '--progress': pos.progress }}
        />
      </div>
      </div>
    </section>
  );
}
