import { useRef } from 'react';
import Reveal from './Reveal';
import ProjectVisual from './ProjectVisual';

/**
 * Drop a screenshot into `public/work/` and set `image` to its path
 * (e.g. '/work/kenxsearch.png') — the generative `visual` is only the
 * fallback for projects that don't have one yet.
 */
const projects = [
  {
    title: 'KenXSearch',
    tag: 'Linux tooling',
    year: '2025',
    description:
      'Circle to Search, for Linux. Draw a ring around anything on screen and it searches it — text, image, or translation. The hard part was capture: it survives KDE, GNOME, Wayland and X11.',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract', 'Playwright'],
    image: null,
    visual: 'scan',
    flag: 'Partial on GNOME 49+',
    links: {
      github: 'https://github.com/shashwathv/KenXSearch',
      demo: 'https://kenxsearch.nw-right.dev/'
    }
  },
  {
    title: 'ShadowBrowse',
    tag: 'Backend infrastructure',
    year: '2025',
    description:
      'A scraping and browser-automation framework in Go. Headless sessions, proxy rotation and rate limiting that holds up at enterprise volume.',
    tech: ['Golang', 'Chromedp', 'Redis', 'Docker'],
    image: null,
    visual: 'graph',
    links: {
      github: 'https://github.com/VincentSamuelPaul/ShadowBrowse',
      demo: 'https://drive.google.com/file/d/1Pr8xoM5vnvuXAdkyqVTOKZajyLsv-RvP/view?usp=drive_link'
    }
  },
  {
    title: 'BehaviorVault 2.0',
    tag: 'ML / security',
    year: '2025',
    description:
      'Behavioural biometrics for mobile banking. Five signals, per-user EWMA baselines, and an Isolation Forest squeezed into a 3KB TFLite model so detection runs on the handset.',
    tech: ['Python', 'FastAPI', 'TensorFlow Lite', 'scikit-learn'],
    image: null,
    visual: 'wave',
    links: {
      github: 'https://github.com/shashwathv/Behaviour-Vault',
      demo: null
    }
  },
  {
    title: 'KanGen',
    tag: 'AI / computer vision',
    year: '2025',
    description:
      'Photograph a page of Japanese study material, get back a properly built Anki deck. Gemini 2.5 Flash does the reading; Redis and S3 do the queueing, with offline fallbacks when the API is down.',
    tech: ['Python', 'Gemini 2.5 Flash', 'Redis', 'AWS S3', 'SudachiPy'],
    image: null,
    visual: 'glyph',
    links: {
      github: 'https://github.com/shashwathv/KanGen',
      demo: null
    }
  }
];

export default function Work() {
  const reelRef = useRef(null);

  // Drag-to-scroll the reel. Distinguishes a drag from a click so the
  // project links still work: only past a small threshold do we treat
  // the gesture as a scroll and swallow the click.
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });

  const onPointerDown = e => {
    // Mouse only. Touch and pen get the browser's native horizontal
    // scroll — smoother, with momentum and snap — and driving scrollLeft
    // from JS as well would fight it.
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const reel = reelRef.current;
    drag.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startLeft: reel.scrollLeft
    };
  };

  const onPointerMove = e => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    reelRef.current.scrollLeft = d.startLeft - dx;
  };

  const endDrag = e => {
    const d = drag.current;
    if (d.down && d.moved) {
      // Cancel the click that would otherwise fire after a drag.
      const swallow = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        window.removeEventListener('click', swallow, true);
      };
      window.addEventListener('click', swallow, true);
      setTimeout(() => window.removeEventListener('click', swallow, true), 0);
      if (e?.currentTarget?.releasePointerCapture && e.pointerId != null) {
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      }
    }
    drag.current.down = false;
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {projects.map((project, i) => (
          <article className="plate" key={project.title}>
            <div className="plate-head">
              <span className="plate-no">Nº {String(i + 1).padStart(2, '0')}</span>
              <span className="plate-tag">
                {project.tag} <span aria-hidden="true">·</span> {project.year}
              </span>
            </div>

            <div className="plate-figure">
              {project.image ? (
                <img
                  src={project.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              ) : (
                <ProjectVisual variant={project.visual} />
              )}
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
