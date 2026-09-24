import { useEffect } from 'react';
import Reveal from './Reveal';
import ProjectPrintout from './ProjectPrintout';
import HomelabMap from './HomelabMap';
import projects from '../data/projects';
import { Link } from '../router';

const pad = n => String(n).padStart(2, '0');

const SITE_TITLE = document.title;

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/**
 * One part of the write-up: a section mark, its name, and a line in
 * the typewriter face naming the form it takes on the sheet — all in
 * the margin, with the copy on the measure.
 */
function Part({ no, label, note, children, className = '' }) {
  return (
    <Reveal as="section" className={`pp-part ${className}`.trim()} aria-label={label}>
      <h2 className="pp-label">
        <span className="pp-mark" aria-hidden="true">§{pad(no)}</span>
        {label}
        {note && <span className="pp-note">{note}</span>}
      </h2>
      <div className="pp-body">{children}</div>
    </Reveal>
  );
}

/** A flow of stations, left to right, with the feed between them. */
function PressLine({ steps }) {
  return (
    <ol className="press-line">
      {steps.map((step, i) => (
        <li className="station" key={step.label}>
          <span className="station-no" aria-hidden="true">
            {i === 0 ? 'In' : i === steps.length - 1 ? 'Out' : `St. ${pad(i)}`}
          </span>
          <span className="station-box">
            <span className="station-label">{step.label}</span>
            {step.note && <span className="station-note">{step.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The machine's rating plate: the particulars stamped on a plate and
 * riveted to the case, where a shipped project has its sample run.
 */
function RatingPlate({ rows }) {
  return (
    <figure className="rating">
      <span className="rating-rivet" aria-hidden="true" />
      <span className="rating-rivet" aria-hidden="true" />
      <span className="rating-rivet" aria-hidden="true" />
      <span className="rating-rivet" aria-hidden="true" />
      <figcaption className="rating-head">Rating plate · in service</figcaption>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/** A ticket off the tear-off strip at the foot: the sheet either side. */
function Ticket({ to, dir, kicker, title }) {
  return (
    <Link to={to} className={`ticket ticket-${dir}`}>
      <span className="ticket-kicker">{kicker}</span>
      <span className="ticket-title">{title}</span>
    </Link>
  );
}

/**
 * The template every /work/<slug> page shares, set as one sheet of the
 * run: a job ticket clipped to the head, the sample run pasted beside
 * it, and the write-up in print-shop forms below — a brief, clippings,
 * a press line, proof marks, stamps, and a strip to tear off for the
 * next sheet. Everything on it comes from src/data/projects.js.
 */
export default function ProjectPage({ slug }) {
  const index = projects.findIndex(p => p.slug === slug);
  const project = projects[index];

  useEffect(() => {
    document.title = project
      ? `${project.title} — Shashwath V`
      : `Not found — Shashwath V`;
    return () => { document.title = SITE_TITLE; };
  }, [project]);

  if (!project) {
    return (
      <section className="pp pp-missing">
        <div className="sheet">
          <p className="section-kicker">Not in the run</p>
          <h1 className="section-title">
            No such <em>sheet</em>
          </h1>
          <p className="pp-missing-text">
            Nothing was printed at <code>/work/{slug}</code>.
          </p>
          <Link to="/#work" className="btn btn-primary">← All work</Link>
        </div>
      </section>
    );
  }

  const prev = projects[index - 1];
  const next = projects[index + 1];
  const { links } = project;
  const infra = project.kind === 'infra';

  return (
    <article className="pp">
      <div className="sheet">
        <nav className="pp-topline" aria-label="Project">
          <Link to="/#work" className="pp-back">
            <span aria-hidden="true">←</span> All work
          </Link>
          <span className="pp-count">
            Sheet <b>{pad(index + 1)}</b> of {pad(projects.length)}
          </span>
        </nav>

        <header className={`pp-head${infra ? ' pp-head-infra' : ''}`}>
          <div className="pp-head-text">
            {/* The meta line, as the job ticket clipped to the sheet. */}
            <dl className="job-ticket">
              <div>
                <dt>Year</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>Filed under</dt>
                <dd>{project.category}</dd>
              </div>
              <div>
                <dt>Main tech</dt>
                <dd>{project.tech[0]}</dd>
              </div>
            </dl>

            <h1 className="pp-title">{project.title}</h1>

            <div className="pp-inks">
              <span className="pp-inks-label">Set with</span>
              <ul aria-label="Tech">
                {project.tech.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>

            {(links.github || links.demo || links.paper) && (
              <div className="pp-actions">
                {links.github && (
                  <a href={links.github} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                    GitHub <span aria-hidden="true">↗</span>
                  </a>
                )}
                {links.demo && (
                  <a href={links.demo} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                    Demo <span aria-hidden="true">↗</span>
                  </a>
                )}
                {links.paper && (
                  <a href={links.paper} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                    Paper <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {project.rating && <RatingPlate rows={project.rating} />}

          {project.printout && (
            <figure className="pp-figure">
              <ProjectPrintout {...project.printout} />
              {project.flag && <span className="pp-flag">{project.flag}</span>}
            </figure>
          )}
        </header>

        {infra && (
          <Reveal as="figure" className="map-plate">
            <div className="map-scroll" tabIndex={0} aria-label="Homelab diagram — scrolls sideways on small screens">
              <HomelabMap />
            </div>
            <figcaption className="map-legend">
              <span><i className="lg-public" /> Public</span>
              <span><i className="lg-protected" /> Behind Zero Trust</span>
              <span><i className="lg-tunnel" /> Tunnel · Wi-Fi · fallback</span>
              <span><i className="lg-ink" /> Inside the box</span>
              <span><b className="lg-lan">LAN</b> also on *.lan</span>
              <span className="map-hint" aria-hidden="true">Drag sideways →</span>
            </figcaption>
          </Reveal>
        )}

        <Part no={1} label="Why it exists" note="the brief">
          <blockquote className="brief">
            <p>{project.problem}</p>
          </blockquote>
        </Part>

        {infra ? (
          <>
            <Part no={2} label={`${WORDS[project.doors.length] ?? project.doors.length} ways in`} note="and what each one opens">
              <ul className="keytags">
                {project.doors.map(door => (
                  <li className={`keytag keytag-${door.tone}`} key={door.name}>
                    <span className="keytag-hole" aria-hidden="true" />
                    <h3>{door.name}</h3>
                    <p className="keytag-path">{door.path}</p>
                    <ul>
                      {door.behind.map(b => <li key={b}>{b}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
            </Part>

            <Part no={3} label="Who keeps it" note="Yuna, the agent on the box">
              <p className="agent-intro">{project.agent.intro}</p>
              <PressLine steps={project.agent.flow} />
              <table className="ledger">
                <caption>The modules — everything Yuna can actually do</caption>
                <thead>
                  <tr><th scope="col">Module</th><th scope="col">Does</th><th scope="col">Touches</th></tr>
                </thead>
                <tbody>
                  {project.agent.modules.map(m => (
                    <tr key={m.name}>
                      <th scope="row">{m.name}</th>
                      <td>{m.does}</td>
                      <td>{m.touches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Part>
          </>
        ) : (
          <>
        <Part no={2} label="What you get" note="clipped from the build">
          <ul className="clippings" data-count={project.features.length}>
            {project.features.map((f, i) => (
              <li className="clipping" key={f.title}>
                <span className="clipping-no" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </Part>

        <Part no={3} label="How it runs" note="down the press line">
          <PressLine steps={project.architecture} />
        </Part>
          </>
        )}

        <Part no={4} label="Calls I made" note="marked on the proof">
          <ol className="proofs">
            {project.decisions.map((d, i) => (
              <li key={i}>
                <span className="proof-ring" aria-hidden="true">{i + 1}</span>
                <p className="proof-call">{d.decision}</p>
                <p className="proof-why"><em>because</em> {d.why}</p>
              </li>
            ))}
          </ol>
        </Part>

        <Part no={5} label="Where it landed" note="stamped and filed">
          <ul className="stamps">
            {project.outcome.map((o, i) => (
              <li key={i} style={{ '--i': i }}><span>{o}</span></li>
            ))}
          </ul>
        </Part>

        <nav className="tearoff" aria-label="More work">
          <p className="tearoff-cut" aria-hidden="true">
            <span>✂</span> Tear here for the next sheet
          </p>
          <div className="tearoff-row">
            {prev ? (
              <Ticket to={`/work/${prev.slug}`} dir="prev" kicker={`← Sheet ${pad(index)}`} title={prev.title} />
            ) : (
              <Ticket to="/#work" dir="prev" kicker="← Contents" title="All work" />
            )}
            {next ? (
              <Ticket to={`/work/${next.slug}`} dir="next" kicker={`Sheet ${pad(index + 2)} →`} title={next.title} />
            ) : (
              <Ticket to="/#work" dir="next" kicker="End of run →" title="All work" />
            )}
          </div>
        </nav>
      </div>
    </article>
  );
}
