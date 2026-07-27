import Reveal from './Reveal';

const drawers = [
  {
    name: 'Languages',
    items: [
      { name: 'Golang', primary: true },
      { name: 'Python', primary: true },
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'C' }
    ]
  },
  {
    name: 'Backend & APIs',
    items: [
      { name: 'Gin' },
      { name: 'FastAPI', primary: true },
      { name: 'Flask' },
      { name: 'REST' }
    ]
  },
  {
    name: 'Data & storage',
    items: [
      { name: 'PostgreSQL', primary: true },
      { name: 'MySQL' },
      { name: 'MariaDB', primary: true },
      { name: 'SQLite' },
      { name: 'S3' },
      { name: 'Redis' }
    ]
  },
  {
    name: 'Infrastructure',
    items: [
      { name: 'Linux', primary: true },
      { name: 'Docker', primary: true },
      { name: 'AWS' },
      { name: 'Coolify', primary: true },
      { name: 'Nginx' },
      { name: 'Cloudflare Zero Trust / Tunnel', primary: true }
    ]
  },
  {
    name: 'Focus',
    items: [
      { name: 'API design', primary: true },
      { name: 'LLM pipelines', primary: true },
      { name: 'On-device inference' },
      { name: 'Distributed systems' }
    ]
  }
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="sheet">
        <Reveal>
          <p className="section-kicker">The type case</p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="section-title">
            Tools I reach for <em>without thinking</em>
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="type-case">
            {drawers.map(drawer => (
              <div className="type-drawer" key={drawer.name}>
                <h3>{drawer.name}</h3>
                <ul>
                  {drawer.items.map(item => (
                    <li
                      key={item.name}
                      className={item.primary ? 'is-primary' : ''}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p className="type-note">
            Set in <b>bold</b>: what I'd reach for first on a new project.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
