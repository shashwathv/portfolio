import Reveal from './Reveal';
import RevealHeading from './RevealHeading';

export default function Work() {
  const projects = [
    {
      title: 'KenXSearch',
      category: 'Linux Tooling',
      description:
        'Circle to Search for Linux. Draw a freehand circle around anything on screen to instantly search it — text, visual, translate, or shopping via Google Lens. Features a full-screen HUD overlay, smart multi-strategy OCR, persistent browser session, and a resilient screen capture pipeline that works across KDE, GNOME, Wayland, and X11.',
      tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract OCR', 'Playwright', 'Wayland & X11'],
      deprecated: true,
      deprecatedNote: 'Partial support on GNOME 49+ Wayland — background capture restricted by compositor',
      links: {
        github: 'https://github.com/shashwathv/KenXSearch',
        demo: 'https://kenxsearch.nw-right.dev/'
      }
    },
    {
      title: 'ShadowBrowse',
      category: 'Backend Infrastructure',
      description:
        'Web scraping and browser automation framework built with Golang. Features headless browsing, proxy support, and intelligent rate limiting for enterprise-scale data extraction.',
      tech: ['Golang', 'Chromedp', 'Redis', 'Docker'],
      links: {
        github: 'https://github.com/VincentSamuelPaul/ShadowBrowse',
        demo: 'https://drive.google.com/file/d/1Pr8xoM5vnvuXAdkyqVTOKZajyLsv-RvP/view?usp=drive_link'
      }
    },
    {
      title: 'BehaviorVault 2.0',
      category: 'ML / Security',
      description:
        'Behavioral biometric security layer for mobile banking. Uses five behavioral signals with per-user EWMA baselines and an Isolation Forest model distilled to a 3KB TFLite artifact for on-device anomaly detection, backed by a FastAPI inference service and Cloudflare Zero Trust gating.',
      tech: [
        'Python',
        'FastAPI',
        'TensorFlow Lite',
        'scikit-learn',
        'Cloudflare Zero Trust'
      ],
      links: {
        github: 'https://github.com/shashwathv/Behaviour-Vault',
        demo: null
      }
    },
    {
      title: 'KanGen',
      category: 'AI / Computer Vision',
      description:
        'An automated Japanese flashcard generation tool that converts photos of physical study materials into high-quality Anki decks. Built on a Gemini 2.5 Flash vision-first pipeline with a Redis job store and S3 upload, plus robust offline fallbacks.',
      tech: [
        'Python',
        'Google Gemini 2.5 Flash',
        'Redis',
        'AWS S3',
        'SudachiPy',
        'Genanki',
        'Pandas'
      ],
      links: {
        github: 'https://github.com/shashwathv/KanGen',
        demo: null
      }
    }
  ];

  return (
    <section id="work">
      <div className="container">
        <div style={{ width: '100%' }}>
          <Reveal>
            <p className="section-label mono">Selected Work</p>
          </Reveal>
          <RevealHeading className="serif">Things I've built</RevealHeading>

          <div className="work-list">
            {projects.map((project, index) => (
              <Reveal key={index} delay={index * 60} className="work-item">
                <span className="work-index mono" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="work-body">
                  <div className="work-header">
                    <div className="work-title-row">
                      <h3 className="work-title serif">{project.title}</h3>
                      <div className="work-badges">
                        {project.deprecated && (
                          <span
                            className="project-badge badge-deprecated mono"
                            title={project.deprecatedNote}
                          >
                            GNOME 49+ Partial
                          </span>
                        )}
                        {project.comingSoon && (
                          <span className="project-badge badge-coming-soon mono">
                            Repo Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="work-category mono">
                      {project.category}
                    </span>
                  </div>

                  {project.deprecated && project.deprecatedNote && (
                    <p className="deprecated-note">{project.deprecatedNote}</p>
                  )}

                  <p className="work-description text-strong">
                    {project.description}
                  </p>

                  <div className="work-tech mono">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="tech-item">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="work-links">
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="work-link"
                      >
                        GitHub <span className="link-arrow" aria-hidden="true">→</span>
                      </a>
                    )}
                    {project.links.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="work-link"
                      >
                        Live Demo <span className="link-arrow" aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
