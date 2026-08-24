/**
 * The name is set in one display face so it reads as a name first.
 * Only the leading S keeps the cut-out treatment — a single scrap of
 * paper pasted at an angle — which is the same drop-cap logic the
 * about copy already uses. The collage is still there; it just stops
 * competing with the rest of the page for attention.
 */
const NAME = 'Shashwath V';

export default function Hero() {
  const scrollToWork = e => {
    e.preventDefault();
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="sheet">
        <p className="hero-kicker">
          <span className="kicker-rule" aria-hidden="true" />
          Backend engineering · Self-hosted
        </p>

        <h1 className="signature" aria-label={NAME}>
          <span className="sig-word" aria-hidden="true">
            <span className="sig-cut">s</span>hashwath
          </span>
          <span className="sig-word" aria-hidden="true">V</span>
        </h1>

        <div className="hero-lower">
          <p className="hero-lede">
            I build the unglamorous parts — scrapers, daemons, inference
            services — and run them on hardware I can reach out and touch.
          </p>

          <div className="hero-actions">
            <a href="#work" className="btn btn-primary" onClick={scrollToWork}>
              See the work
            </a>
            <a
              href="https://github.com/shashwathv"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
