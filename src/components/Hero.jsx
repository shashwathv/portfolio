/**
 * The name is set as individual newsprint cut-outs — each letter a
 * different face on its own scrap of paper, pasted at an angle.
 *
 * The per-letter treatment is authored, not randomised: the mix of
 * faces, inks and angles is tuned so the whole still reads as a name
 * at a glance, and so it looks identical on every load.
 */
const CLIPPINGS = [
  { char: 'S', face: 'anton', ink: 'ink', tilt: -3.5, shift: 0 },
  { char: 'h', face: 'playfair', ink: 'invert', tilt: 2, shift: -6 },
  { char: 'a', face: 'bebas', ink: 'red', tilt: -1.5, shift: 4 },
  { char: 's', face: 'archivo', ink: 'shade', tilt: 3, shift: -3 },
  { char: 'h', face: 'courier', ink: 'blue', tilt: -2.5, shift: 5 },
  { char: 'w', face: 'anton', ink: 'ink', tilt: 1.5, shift: -5 },
  { char: 'a', face: 'playfair', ink: 'red-fill', tilt: -3, shift: 2 },
  { char: 't', face: 'bebas', ink: 'ink', tilt: 2.5, shift: -4 },
  { char: 'h', face: 'archivo', ink: 'invert', tilt: -2, shift: 3 },
  { char: 'V', face: 'anton', ink: 'blue-fill', tilt: 4, shift: -7, gap: true }
];

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
          Backend engineering, mostly at night
        </p>

        <h1 className="ransom" aria-label={NAME}>
          {CLIPPINGS.map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`clip clip-${c.face} ink-${c.ink}${c.gap ? ' has-gap' : ''}`}
              style={{
                '--tilt': `${c.tilt}deg`,
                '--shift': `${c.shift}px`,
                '--delay': `${i * 55}ms`
              }}
            >
              {c.char}
            </span>
          ))}
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
