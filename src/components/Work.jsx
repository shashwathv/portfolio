import Reveal from './Reveal';
import projects from '../data/projects';
import { Link } from '../router';

/** The title counts the run, so a new project doesn't leave it wrong. */
const COUNT = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

/**
 * The contents page. Each entry is set the way a printed contents page
 * sets one — number, title, a dot leader running out to the year — and
 * the whole entry is a link to its write-up on /work/<slug>. The
 * numbers print a touch out of register, and slip further when an
 * entry is picked up.
 */
export default function Work() {
  // Leaving from here, the way back should land on the contents rather
  // than the top of the homepage — so the entry we leave becomes /#work.
  const markReturn = () => window.history.replaceState(null, '', '/#work');

  return (
    <section id="work">
      <div className="sheet">
        <Reveal>
          <p className="section-kicker">Filed under: built it</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="section-title">
            {COUNT[projects.length] ?? projects.length} things that <em>actually ship</em>
          </h2>
        </Reveal>

        <Reveal delay={90} className="contents-head" aria-hidden="true">
          <span>Contents</span>
          <span>Year</span>
        </Reveal>

        <ol className="contents">
          {projects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={Math.min(i, 5) * 60}>
              <Link
                to={`/work/${project.slug}`}
                className="entry"
                onClick={markReturn}
              >
                <span className="entry-no" data-no={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="entry-line">
                  <span className="entry-name">{project.title}</span>
                  <span className="entry-leader" aria-hidden="true" />
                  <span className="entry-year">{project.year}</span>
                  <span className="entry-go" aria-hidden="true">↗</span>
                </span>
                <span className="entry-summary">{project.summary}</span>
                <span className="entry-stack">{project.tech.join(' / ')}</span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
