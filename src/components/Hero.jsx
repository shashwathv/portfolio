const NAME = 'Shashwath V';

export default function Hero() {
  const scrollToWork = (e) => {
    e.preventDefault();
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-mask" style={{ '--d': '0ms' }}>
          <p className="subtitle text-muted">Computer Science Undergraduate</p>
        </div>

        <h1 className="serif text-strong hero-name" aria-label={NAME}>
          {NAME.split('').map((char, i) => (
            <span className="h1-mask" key={i} aria-hidden="true">
              <span
                className="h1-char"
                style={{ animationDelay: `${120 + i * 35}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </h1>

        <div className="hero-mask" style={{ '--d': '420ms' }}>
          <p className="intro">
            Building backend systems, developer tooling, and self-hosted
            infrastructure.
          </p>
        </div>

        <div className="hero-fade" style={{ '--d': '720ms' }}>
          <div className="hero-actions">
            <a href="#work" className="hero-cta" onClick={scrollToWork}>
              View My Work
            </a>
            <div className="hero-socials">
              <a href="https://github.com/shashwathv" target="_blank" rel="noopener noreferrer" className="hero-social-link">GitHub</a>
              <a href="https://linkedin.com/in/shashwathv4405" target="_blank" rel="noopener noreferrer" className="hero-social-link">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator mono" aria-hidden="true">
        scroll
        <span className="scroll-indicator-line" />
      </div>
    </section>
  );
}
