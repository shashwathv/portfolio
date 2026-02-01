export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <p className="about-label text-muted">About</p>
          </div>

          <div className="about-content">
  <p className="text-strong">
    I'm a computer science undergraduate interested in backend systems and
    developer tooling.
  </p>
  <p>
    I enjoy building projects with Golang and Python while learning about
    system design, performance, and clean architecture through hands-on work.
  </p>

            <div className="info-item">
              <h3>Education</h3>
              <p>Bachelor of Engineering in Computer Science</p>
              <p>Expected Graduation: 2027</p>
            </div>

            <div className="info-item">
              <h3>Recognition</h3>
              <p>2nd Place — Techfusion Hackathon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
