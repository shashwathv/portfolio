import Reveal from './Reveal';

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <Reveal>
            <p className="about-label mono">About</p>
          </Reveal>

          <div className="about-content">
            <Reveal>
              <p className="text-strong about-lede serif">
                I'm a computer science undergraduate interested in backend systems and
                developer tooling.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                Mostly Golang and Python, currently focused on distributed systems and
                API design. I run a self-hosted homelab where most of my projects —
                including this site — live in production.
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="info-item">
                <h3>Education</h3>
                <p>Bachelor of Engineering in Computer Science</p>
                <p className="text-muted">Dayananda Sagar Academy of Technology and Management, Bengaluru</p>
                <p>Expected Graduation: 2027</p>
              </div>

              <div className="info-item">
                <h3>Recognition</h3>
                <p>2nd Place — Techfusion Hackathon</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
