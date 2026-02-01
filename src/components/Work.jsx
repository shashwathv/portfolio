export default function Work() {
  const projects = [
    {
      title: 'ShadowBrowse',
      category: 'Backend Infrastructure',
      description:
        'Web scraping and browser automation framework built with Golang. Features headless browsing, proxy support, and intelligent rate limiting for enterprise-scale data extraction.',
      tech: ['Golang', 'Chromedp', 'Redis', 'Docker'],
      links: {
        github: '#', // TODO: add GitHub repo
        demo: '#'    // TODO: add live demo (optional)
      }
    },
    {
      title: 'Lensix',
      category: 'Linux Tooling',
      description:
        'A Linux-native “Circle to Search” tool that lets users draw a region on screen to perform instant OCR or visual search. Built in Python with PyQt6, OpenCV, and Tesseract, Lensix supports both Wayland and X11 via a resilient multi-strategy screen capture pipeline and integrates Google Lens through browser automation.',
      tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract OCR', 'Playwright', 'Wayland & X11'],
      links: {
        github: '#', // TODO: add GitHub repo
        demo: null   // no demo yet
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
        github: '#', // TODO: add GitHub repo
        demo: '#'    // TODO: optional web UI / demo
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
                  <h3 className="work-title">{project.title}</h3>
                  <span className="work-category text-muted">
                    {project.category}
                  </span>
                </div>

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
