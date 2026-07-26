export default function Footer() {
  const backToTop = e => {
    e.preventDefault();
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <b>Courier Prime</b>, and printed by hand at a small homelab in
          Bengaluru — Arch Linux, Coolify and nginx, behind a Cloudflare
          tunnel.
        </p>

        <div className="colophon-grid">
          <dl>
            <dt>Two inks</dt>
            <dd className="colophon-inks">
              <span className="ink-line">
                <span className="ink-swatch swatch-red" aria-hidden="true" />
                RISO Red <span className="ink-hex">FF665E</span>
              </span>
              <span className="ink-line">
                <span className="ink-swatch swatch-blue" aria-hidden="true" />
                RISO Medium Blue <span className="ink-hex">3255A4</span>
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
            <dd>Vol. IV — the fourth setting, 2026</dd>
          </dl>
        </div>

        <p className="colophon-wordmark" aria-hidden="true">
          Shashwath V
        </p>
      </div>
    </footer>
  );
}
