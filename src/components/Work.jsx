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

function Clipping({ project, index }) {
  const mediaRef = useRef(null);

  // Cursor parallax on the cover art, written straight to CSS custom
  // properties so the transform stays on the compositor and the card
  // never re-renders on mousemove.
  const handleMove = e => {
    const el = mediaRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    el.style.setProperty('--px', `${((e.clientX - left) / width - 0.5) * 14}px`);
    el.style.setProperty('--py', `${((e.clientY - top) / height - 0.5) * 14}px`);
  };

  const handleLeave = () => {
    const el = mediaRef.current;
    if (!el) return;
    el.style.setProperty('--px', '0px');
    el.style.setProperty('--py', '0px');
  };

  const primaryLink = project.links.demo || project.links.github;

  return (
    <Reveal delay={index * 90} className="clipping">
      {/* Decorative duplicate of the links below — kept out of the tab
          order and the a11y tree so the card isn't announced twice. */}
      <a
        ref={mediaRef}
        className="clipping-media"
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="clipping-media-inner">
          {project.image ? (
            <img src={project.image} alt="" loading="lazy" decoding="async" />
          ) : (
            <ProjectVisual variant={project.visual} />
          )}
        </div>

        <span className="clipping-index">
          {String(index + 1).padStart(2, '0')}
        </span>

        {project.flag && <span className="clipping-flag">{project.flag}</span>}
      </a>

      <div className="clipping-body">
        <p className="clipping-tag">{project.tag}</p>
        <h3 className="clipping-title">{project.title}</h3>
        <p className="clipping-desc">{project.description}</p>

        <ul className="clipping-tech">
          {project.tech.map(tech => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <div className="clipping-links">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="clipping-link"
            >
              Source <span aria-hidden="true">→</span>
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="clipping-link"
            >
              Live <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export default function Work() {
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

        <div className="clippings">
          {projects.map((project, index) => (
            <Clipping key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
