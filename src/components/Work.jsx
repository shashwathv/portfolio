export default function Work() {
  const projects = [
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
      title: 'KenXSearch',
      category: 'Linux Tooling',
      description:
        'Circle to Search for Linux. Draw a freehand circle around anything on screen to instantly search it — text, visual, translate, or shopping via Google Lens. Features a full-screen HUD overlay, smart multi-strategy OCR, persistent browser session, and a resilient screen capture pipeline that works across KDE, GNOME, Wayland, and X11.',
      tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract OCR', 'Playwright', 'Wayland & X11'],
      deprecated: true,
      deprecatedNote: 'Partial support on GNOME 49+ Wayland — background capture restricted by compositor',
      links: {
        github: 'https://github.com/shashwathv/KenXSearch',
        demo: 'https://kenxsearch.vercel.app'
      }
    },
    {
      title: 'KanGen',
      category: 'AI / Computer Vision',
      description:
        'An automated Kanji flashcard generation tool that converts images of physical study materials into high-quality Anki decks using computer vision, OCR, and AI-driven parsing with robust offline fallbacks.',
      tech: [
        'Python',
        'OpenCV',
        'EasyOCR',
        'Google Gemini',
        'SudachiPy',
        'Genanki',
        'Pandas',
        'NumPy'
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
          <h2 className="serif">Selected Work</h2>

          <div className="work-list">
            {projects.map((project, index) => (
              <div key={index} className="work-item">
                <div className="work-header">
                  <div className="work-title-row">
                    <h3 className="work-title">{project.title}</h3>
                    <div className="work-badges">
                      {project.deprecated && (
                        <span
                          className="project-badge badge-deprecated"
                          title={project.deprecatedNote}
                        >
                          GNOME 49+ Partial
                        </span>
                      )}
                      {project.comingSoon && (
                        <span className="project-badge badge-coming-soon">
                          Repo Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="work-category text-muted">
                    {project.category}
                  </span>
                </div>

                {project.deprecated && project.deprecatedNote && (
                  <p className="deprecated-note">{project.deprecatedNote}</p>
                )}

                <p className="work-description text-strong">
                  {project.description}
                </p>

                <div className="work-tech">
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
                      GitHub →
                    </a>
                  )}
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="work-link"
                    >
                      Live Demo →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}