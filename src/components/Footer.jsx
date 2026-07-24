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
              <span className="ink-swatch swatch-red" aria-hidden="true" />
              Riso red
              <span className="ink-swatch swatch-blue" aria-hidden="true" />
              Riso blue
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
            <dt>Edition</dt>
            <dd>© 2026 — Vol. IV, No. 04</dd>
          </dl>
        </div>

        <p className="colophon-wordmark" aria-hidden="true">
          Shashwath V
        </p>
      </div>
    </footer>
  );
}
