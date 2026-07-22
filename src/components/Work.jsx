import { useRef, useState, useEffect } from 'react';
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
      'Circle to Search, for Linux. Draw a ring around anything on screen and it searches it — text, image, or translation. The hard part was capture: it works across KDE, GNOME, Wayland and X11.',
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
  const [active, setActive] = useState(null);
  const stackRef = useRef(null);

  // The preview follows the pointer. Position is written straight to CSS
  // custom properties inside a rAF, so moving the mouse never re-renders
  // the list — only the compositor sees the change.
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      stack.style.setProperty('--x', `${x}px`);
      stack.style.setProperty('--y', `${y}px`);
      frame = 0;
    };

    const onMove = e => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="work">
      <div className="sheet">
        <Reveal>
          <p className="section-kicker">Filed under: built it</p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="section-title">
            Four things that <em>actually ship</em>
          </h2>
        </Reveal>

        <ol className="index" onMouseLeave={() => setActive(null)}>
          {projects.map((project, i) => {
            const primaryLink = project.links.demo || project.links.github;
            return (
              <Reveal
                key={project.title}
                delay={i * 70}
                className={`index-row ${active === i ? 'is-lit' : ''}`}
              >
                <li>
                  <a
                    className="index-link"
                    href={primaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  >
                    <span className="index-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="index-name">{project.title}</span>
                    <span className="index-tag">{project.tag}</span>
                    <span className="index-year">{project.year}</span>
                    <span className="index-go" aria-hidden="true">→</span>
                  </a>

                  <div className="index-detail">
                    {/* Single wrapper: the 0fr/1fr collapse only sizes the
                        first grid row, so both blocks have to share one. */}
                    <div className="index-detail-inner">
                    <p className="index-desc">
                      {project.description}
                      {project.flag && (
                        <em className="index-flag"> {project.flag}</em>
                      )}
                    </p>

                    <div className="index-foot">
                      <ul className="index-tech">
                        {project.tech.map(tech => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>

                      <div className="index-links">
                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Source
                          </a>
                        )}
                        {project.links.demo && (
                          <a
                            href={project.links.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live
                          </a>
                        )}
                      </div>
                    </div>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>

      {/* Pinned to the cursor. Decorative — every project is already
          reachable through the list above. */}
      <div className="preview-stack" ref={stackRef} aria-hidden="true">
        {projects.map((project, i) => (
          <figure
            key={project.title}
            className={`preview ${active === i ? 'is-active' : ''}`}
          >
            {project.image ? (
              <img src={project.image} alt="" loading="lazy" decoding="async" />
            ) : (
              <ProjectVisual variant={project.visual} />
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
