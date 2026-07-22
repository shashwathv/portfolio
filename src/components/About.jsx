import Reveal from './Reveal';

export default function About() {
  return (
    <section id="about">
      <div className="sheet">
        <Reveal>
          <p className="section-kicker">Who's setting this</p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="section-title">
            I like the parts <em>nobody demos</em>
          </h2>
        </Reveal>

        <div className="about-spread">
          <Reveal delay={100} className="about-body">
            <p>
              Computer science undergraduate, three years into writing Go and
              Python for things that have to keep running when nobody's watching.
            </p>
            <p>
              Most of what I build starts as a personal annoyance — a screenshot
              I couldn't search, a deck I didn't want to make by hand — and ends
              up as a daemon on a machine in my room. That homelab is where this
              site lives too, behind a tunnel I maintain myself.
            </p>
            <p>
              Right now I'm working through distributed systems and API design,
              and figuring out where machine learning genuinely earns its place
              in a stack instead of being bolted on.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <dl className="fact-stack">
              <div className="fact">
                <dt>Studying</dt>
                <dd>
                  BE Computer Science
                  <span>Dayananda Sagar Academy of Technology &amp; Management</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Graduating</dt>
                <dd>2027</dd>
              </div>
              <div className="fact">
                <dt>Based in</dt>
                <dd>Bengaluru, India</dd>
              </div>
              <div className="fact">
                <dt>Placed</dt>
                <dd>
                  2nd — Techfusion Hackathon
                  <span>Out of a field of student teams</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Runs on</dt>
                <dd>
                  A small homelab
                  <span>
                    Arch Linux, Coolify and nginx, behind a Cloudflare tunnel
                  </span>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
