import { useEffect, useRef } from 'react';
import Reveal from './Reveal';
import ProjectSchematic from './ProjectSchematic';

/**
 * Each project carries a `schematic`: the path one job takes through it,
 * which is what a reader actually wants to know and what a screenshot
 * can't tell them. See ProjectSchematic for the copy length limits — the
 * figure geometry is fixed, so the strings have to fit it.
 */
const projects = [
  {
    title: 'KenXSearch',
    tag: 'Linux tooling',
    description:
      'Circle to Search, for Linux. Draw a ring around anything on screen and it searches it — text, image, or translation. The hard part was capture: it survives KDE, GNOME, Wayland and X11.',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract', 'Playwright'],
    flag: 'Partial on GNOME 49+',
    schematic: {
      figure: '01',
      caption: 'ring to result',
      stamp: 'circle → answer',
      stages: [
        { label: 'Gesture', detail: 'freehand ring, any window' },
        {
          label: 'Capture',
          detail: 'wayland, x11, kde, gnome',
          gloss: 'the hard part'
        },
        { label: 'Read', detail: 'opencv crop → tesseract' },
        { label: 'Search', detail: 'text · image · translate' }
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
    schematic: {
      figure: '02',
      caption: 'one job through the pool',
      stamp: 'holds at volume',
      stages: [
        { label: 'Queue', detail: 'redis-backed job intake' },
        { label: 'Session', detail: 'headless chrome, chromedp' },
        {
          label: 'Egress',
          detail: 'proxy rotation, rate limits',
          gloss: 'never one ip'
        },
        { label: 'Payload', detail: 'structured scrape out' }
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
    schematic: {
      figure: '03',
      caption: 'a session, scored',
      stamp: '3 kb, on device',
      stages: [
        { label: 'Signals', detail: 'five behavioural streams' },
        { label: 'Baseline', detail: 'per-user ewma drift' },
        {
          label: 'Model',
          detail: 'isolation forest, tflite',
          gloss: 'on the handset'
        },
        { label: 'Verdict', detail: 'anomaly score, per session' }
      ]
    },
    links: {
      github: 'https://github.com/shashwathv/Behaviour-Vault',
      demo: 'https://drive.google.com/file/d/10zEj51U0DaI2REGVXIlrllYOLCUvMClq/view?usp=drive_link'
    }
  },
  {
    title: 'KanGen',
    tag: 'AI / computer vision',
    description:
      'Photograph a page of Japanese study material, get back a properly built Anki deck. Gemini 2.5 Flash does the reading; Redis and S3 handle queueing and storage, with offline fallbacks for when Gemini is unreachable.',
    tech: ['Python', 'Gemini 2.5 Flash', 'Redis', 'AWS S3', 'SudachiPy'],
    schematic: {
      figure: '04',
      caption: 'page in, deck out',
      stamp: 'photo → deck',
      stages: [
        { label: 'Photo', detail: 'a page of study material' },
        {
          label: 'Read',
          detail: 'gemini 2.5 flash',
          gloss: 'offline fallback'
        },
        { label: 'Split', detail: 'sudachipy tokenising' },
        { label: 'Deck', detail: 'anki .apkg · redis + s3' }
      ]
    },
    links: {
      github: 'https://github.com/shashwathv/KanGen',
      demo: null
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
function snapPoints(reel) {
  const pad = parseFloat(getComputedStyle(reel).paddingLeft) || 0;
  const origin = reel.getBoundingClientRect().left - reel.scrollLeft + pad;
  const max = Math.max(0, reel.scrollWidth - reel.clientWidth);

  return Array.from(reel.querySelectorAll('.plate')).map(plate =>
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
        <Reveal delay={90}>
          <p className="reel-hint">
            <span className="reel-hint-rule" aria-hidden="true" />
            Drag or swipe through the plates
            <span aria-hidden="true"> →</span>
          </p>
        </Reveal>
      </div>

      <div
        className="reel"
        ref={reelRef}
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
              <ProjectSchematic {...project.schematic} />
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
    </section>
  );
}
