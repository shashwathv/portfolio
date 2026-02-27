export default function Hero() {
  const scrollToWork = (e) => {
    e.preventDefault();
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="container">
        <h1 className="serif text-strong">Shashwath V</h1>
        <p className="subtitle text-muted">Computer Science Undergraduate</p>
        <p className="intro">
          Building backend systems and learning how scalable, reliable software is designed.
          Interested in AI-driven systems, clean architecture, and thoughtful engineering.
        </p>

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
    </section>
  );
}