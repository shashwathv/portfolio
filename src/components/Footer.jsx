import projects from '../data/projects';

const pad = n => String(n).padStart(2, '0');

const backToTop = e => {
  e.preventDefault();
  // #root, not #home — a project page has no hero to scroll to.
  document.getElementById('root')?.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * The control strip a press prints in the trim of every sheet: each
 * drum at four coverages, the two overprinted, then stock and key.
 * Tints are let down toward the stock, as a tint on paper is. Real
 * values, so the strip is also the swatch card for the run.
 */
const PATCHES = [
  ...[100, 70, 40, 15].map(t => ({ ink: 'var(--swatch-1)', t })),
  { ink: 'color-mix(in srgb, var(--swatch-1) 55%, var(--swatch-2))', t: 100 },
  ...[100, 70, 40, 15].map(t => ({ ink: 'var(--swatch-2)', t })),
  { ink: 'var(--paper)', t: 100 },
  { ink: 'var(--ink)', t: 100 }
];

/**
 * A project page's foot: not the back cover — that closes the
 * homepage — but the slug line printed in the trim of a single sheet.
 * Registration marks, the control strip, and the job's particulars,
 * the way a sheet off the press says what it is and where it belongs.
 */
function Slug({ slug }) {
  const index = projects.findIndex(p => p.slug === slug);
  const project = projects[index];

  return (
    <footer className="slug">
      <span className="slug-crop slug-crop-tl" aria-hidden="true" />
      <span className="slug-crop slug-crop-tr" aria-hidden="true" />
      <span className="slug-crop slug-crop-bl" aria-hidden="true" />
      <span className="slug-crop slug-crop-br" aria-hidden="true" />

      <div className="sheet">
        <div className="slug-strip" aria-hidden="true">
          <span className="slug-reg" />
          <span className="slug-patches">
            {PATCHES.map((p, i) => (
              <i
                key={i}
                style={{ background: `color-mix(in srgb, ${p.ink} ${p.t}%, var(--paper))` }}
              />
            ))}
          </span>
          <span className="slug-reg" />
        </div>

        <p className="slug-imprint">
          {project
            ? <>End of sheet {pad(index + 1)}. </>
            : <>Nothing on this sheet. </>}
          Printed in two inks, on a homelab, by Shashwath V.
        </p>

        <div className="slug-foot">
          <dl className="slug-line">
          <div>
            <dt>Job</dt>
            <dd>{project ? project.title : '—'}</dd>
          </div>
          <div>
            <dt>Sheet</dt>
            <dd>{project ? `${pad(index + 1)} / ${pad(projects.length)}` : '—'}</dd>
          </div>
          <div>
            <dt>Inks</dt>
            <dd>Copper + Sea Foam</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <a href="https://github.com/shashwathv" target="_blank" rel="noopener noreferrer">
                github.com/shashwathv
              </a>
            </dd>
          </div>
        </dl>
        <a href="#top" className="slug-top" onClick={backToTop}>Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

export default function Footer({ sheet }) {
  if (sheet !== undefined) return <Slug slug={sheet} />;

  return (
    <footer className="colophon">
      <div className="sheet">
        <div className="colophon-top">
          <p className="colophon-mark">Colophon</p>
          <a href="#home" className="colophon-top-link" onClick={backToTop}>
            Back to top ↑
          </a>
        </div>

        {/* The imprint — how and where the thing was made. */}
        <p className="colophon-imprint">
          This site was set in <b>Anton</b>, <b>Archivo Black</b>,{' '}
          <b>Bebas Neue</b>, <b>Playfair Display</b> and{' '}
          <b>Courier Prime</b>, and crafted at a small homelab
          — Arch Linux, Coolify and nginx, behind a Cloudflare
          tunnel.
        </p>

        <div className="colophon-grid">
          <dl>
            <dt>Two inks</dt>
            <dd className="colophon-inks">
              <span className="ink-line">
                <span className="ink-swatch swatch-red" aria-hidden="true" />
                RISO Copper <span className="ink-hex">BD6439</span>
              </span>
              <span className="ink-line">
                <span className="ink-swatch swatch-blue" aria-hidden="true" />
                RISO Sea Foam <span className="ink-hex">62C2B1</span>
              </span>
            </dd>
          </dl>
          <dl>
            <dt>Source</dt>
            <dd>
              <a
                href="https://github.com/shashwathv"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/shashwathv
              </a>
            </dd>
          </dl>
          <dl>
            {/* Vol. IV is literal: this is the fourth time the site has
                been set from scratch — Feb, Jun and two in Jul 2026. */}
            <dt>Edition</dt>
            <dd>Vol. VIII — the eighth setting, 2026</dd>
          </dl>
        </div>

        <p className="colophon-wordmark" aria-hidden="true">
          Shashwath V
        </p>
      </div>
    </footer>
  );
}
