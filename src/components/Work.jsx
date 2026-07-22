import { useRef } from 'react';
import Reveal from './Reveal';
import RevealHeading from './RevealHeading';
import ProjectVisual from './ProjectVisual';

/**
 * Drop a screenshot into `public/work/` and set `image` to its path
 * (e.g. '/work/kenxsearch.png') — the generative `visual` is only the
 * fallback for projects that don't have one yet.
 */
const projects = [
  {
    title: 'KenXSearch',
    category: 'Linux Tooling',
    year: '2025',
    description:
      'Circle to Search for Linux. Draw a freehand circle around anything on screen to search it instantly — text, visual, or translate. Multi-strategy OCR behind a capture pipeline that survives KDE, GNOME, Wayland and X11.',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract', 'Playwright'],
    image: null,
    visual: 'scan',
    deprecated: true,
    deprecatedNote:
      'Partial support on GNOME 49+ Wayland — background capture restricted by compositor',
    links: {
      github: 'https://github.com/shashwathv/KenXSearch',
      demo: 'https://kenxsearch.nw-right.dev/'
    }
  },
  {
    title: 'ShadowBrowse',
    category: 'Backend Infrastructure',
    year: '2025',
    description:
      'Web scraping and browser automation in Go. Headless browsing, proxy support and intelligent rate limiting, built for enterprise-scale data extraction.',
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
    category: 'ML / Security',
    year: '2025',
    description:
      'Behavioural biometrics for mobile banking. Five signals with per-user EWMA baselines and an Isolation Forest distilled to a 3KB TFLite artifact for on-device anomaly detection.',
    tech: ['Python', 'FastAPI', 'TensorFlow Lite', 'scikit-learn', 'Cloudflare'],
    image: null,
    visual: 'wave',
    links: {
      github: 'https://github.com/shashwathv/Behaviour-Vault',
      demo: null
    }
  },
  {
    title: 'KanGen',
    category: 'AI / Computer Vision',
    year: '2025',
    description:
      'Photos of physical Japanese study material in, high-quality Anki decks out. A Gemini 2.5 Flash vision-first pipeline with a Redis job store, S3 upload and offline fallbacks.',
    tech: ['Python', 'Gemini 2.5 Flash', 'Redis', 'AWS S3', 'SudachiPy'],
    image: null,
    visual: 'glyph',
    links: {
      github: 'https://github.com/shashwathv/KanGen',
      demo: null
    }
  }
];

function WorkCard({ project, index }) {
  const mediaRef = useRef(null);

  // Cursor parallax on the cover art. Written straight to CSS custom
  // properties so the transform stays on the compositor and the card
  // never re-renders on mousemove.
  const handleMove = e => {
    const el = mediaRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.setProperty('--px', `${x * 16}px`);
    el.style.setProperty('--py', `${y * 16}px`);
  };

  const handleLeave = () => {
    const el = mediaRef.current;
    if (!el) return;
    el.style.setProperty('--px', '0px');
    el.style.setProperty('--py', '0px');
  };

  const primaryLink = project.links.demo || project.links.github;

  return (
    <Reveal delay={index * 80} className="work-card">
      {/* Decorative duplicate of the links below — hidden from AT and
          the tab order so the card isn't announced twice. */}
      <a
        ref={mediaRef}
        className="work-card-media"
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="work-card-media-inner">
          {project.image ? (
            <img src={project.image} alt="" loading="lazy" decoding="async" />
          ) : (
            <ProjectVisual variant={project.visual} />
          )}
        </div>

        <span className="work-card-index mono">
          {String(index + 1).padStart(2, '0')}
        </span>

        {project.deprecated && (
          <span
            className="project-badge badge-deprecated mono"
            title={project.deprecatedNote}
          >
            Partial Support
          </span>
        )}
      </a>

      <div className="work-card-body">
        <div className="work-card-meta mono">
          <span>{project.category}</span>
          <span className="work-card-dot" aria-hidden="true">·</span>
          <span>{project.year}</span>
        </div>

        <h3 className="work-card-title serif">{project.title}</h3>

        <p className="work-card-description">{project.description}</p>

        <ul className="work-card-tech mono">
          {project.tech.map(tech => (
            <li key={tech} className="tech-item">
              {tech}
            </li>
          ))}
        </ul>

        <div className="work-card-links">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="work-link"
            >
              GitHub
              <span className="link-arrow" aria-hidden="true">→</span>
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="work-link"
            >
              Live Demo
              <span className="link-arrow" aria-hidden="true">→</span>
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
      <div className="container">
        <div style={{ width: '100%' }}>
          <Reveal>
            <p className="section-label mono">Selected Work</p>
          </Reveal>
          <RevealHeading className="serif">Things I've built</RevealHeading>

          <div className="work-grid">
            {projects.map((project, index) => (
              <WorkCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
