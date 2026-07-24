import Reveal from './Reveal';
import ProjectVisual from './ProjectVisual';

/**
 * Drop a screenshot into `public/work/` and set `image` to its path
 * (e.g. '/work/kenxsearch.png') — the generative `visual` is only the
 * fallback for projects that don't have one yet. The first project runs
 * as the lead story; the rest set below it in columns.
 */
const projects = [
  {
    title: 'KenXSearch',
    tag: 'Linux tooling',
    year: '2025',
    standfirst: 'Circle to Search, for Linux.',
    description:
      'Draw a ring around anything on screen and it searches it — text, image, or translation. The hard part was capture: it survives KDE, GNOME, Wayland and X11, four environments that agree on almost nothing.',
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

function Cover({ project }) {
  return project.image ? (
    <img src={project.image} alt="" loading="lazy" decoding="async" />
  ) : (
    <ProjectVisual variant={project.visual} />
  );
}

function StoryLinks({ links }) {
  return (
    <div className="story-links">
      {links.github && (
        <a href={links.github} target="_blank" rel="noopener noreferrer">
          Source <span aria-hidden="true">→</span>
        </a>
      )}
      {links.demo && (
        <a href={links.demo} target="_blank" rel="noopener noreferrer">
          Live <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

export default function Work() {
  const [lead, ...rest] = projects;

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

        {/* Folio line — sets the section up as a front page. */}
        <Reveal delay={90}>
          <div className="broadsheet-folio">
            <span>The Work — Selected Projects</span>
            <span>Vol. IV · Bengaluru · No. 04</span>
          </div>
        </Reveal>

        <div className="broadsheet">
          {/* Lead story */}
          <Reveal delay={110} className="lead-story">
            <article>
              <figure className="lead-figure">
                <div className="lead-figure-frame">
                  <Cover project={lead} />
                </div>
                <figcaption>
                  Fig. 1 — {lead.title}
                  {lead.flag && <em className="story-flag"> {lead.flag}</em>}
                </figcaption>
              </figure>

              <div className="lead-text">
                <p className="story-tag">
                  {lead.tag} <span aria-hidden="true">·</span> {lead.year}
                </p>
                <h3 className="lead-head">{lead.title}</h3>
                {lead.standfirst && (
                  <p className="lead-standfirst">{lead.standfirst}</p>
                )}
                <p className="lead-body">{lead.description}</p>
                <p className="story-byline">
                  Built with {lead.tech.join(' · ')}
                </p>
                <StoryLinks links={lead.links} />
              </div>
            </article>
          </Reveal>

          {/* Column stories */}
          <div className="broadsheet-columns">
            {rest.map((project, i) => (
              <Reveal
                key={project.title}
                delay={160 + i * 70}
                className="column-story"
              >
                <article>
                  <p className="story-tag">
                    {project.tag} <span aria-hidden="true">·</span>{' '}
                    {project.year}
                  </p>
                  <h3 className="column-head">{project.title}</h3>
                  <p className="column-body">{project.description}</p>
                  <p className="story-byline">{project.tech.join(' · ')}</p>
                  <StoryLinks links={project.links} />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
