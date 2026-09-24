import { useEffect, useRef, useState } from 'react';
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
      { name: 'Gin', primary: true },
      { name: 'FastAPI', primary: true },
      { name: 'Flask' }
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
      { name: 'Distributed systems' }
    ]
  }
];

/* The case, laid out flat: every sort in reading order, each knowing
   which drawer it came from. Twenty-five of them — five by five. */
const sorts = drawers.flatMap(d => d.items.map(i => ({ ...i, drawer: d.name })));

export default function Skills() {
  const trayRef = useRef(null);
  // How many columns the tray is actually in — read from the grid
  // rather than assumed, because the count comes from media queries.
  const [cols, setCols] = useState(5);

  useEffect(() => {
    const tray = trayRef.current;
    if (!tray) return undefined;
    const measure = () => {
      const n = getComputedStyle(tray)
        .gridTemplateColumns.split(' ')
        .filter(Boolean).length;
      // Only ever set a different value, so re-rendering the furniture
      // below can't feed back into the observer.
      setCols(current => (n > 0 && n !== current ? n : current));
    };
    // The observer's first callback does the initial measure, so nothing
    // sets state synchronously while the effect is running.
    const ro = new ResizeObserver(measure);
    ro.observe(tray);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /**
   * The last row is justified, the way a line of type is: whatever is
   * left over widens to fill the measure exactly, so the tray never
   * ends in a blank. Five columns across three sorts is 2 + 2 + 1;
   * three across two is 2 + 1. Every edge still lands on the grid
   * above it, because a sort only ever widens by whole columns.
   */
  const onLastRow = sorts.length % cols;
  const firstOfLastRow = sorts.length - onLastRow;
  const spanOf = index => {
    if (!onLastRow || index < firstOfLastRow) return 1;
    const place = index - firstOfLastRow;
    return Math.floor(cols / onLastRow) + (place < cols % onLastRow ? 1 : 0);
  };

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
          <ul className="case" ref={trayRef}>
            {sorts.map((sort, i) => (
              <li
                key={`${sort.drawer}/${sort.name}`}
                className={`case-sort${sort.primary ? ' is-primary' : ''}`}
                style={spanOf(i) > 1 ? { gridColumn: `span ${spanOf(i)}` } : undefined}
              >
                <span className="case-name" data-long={sort.name.length > 12 || undefined}>
                  {sort.name}
                </span>
                <span className="case-drawer">{sort.drawer}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={140}>
          <p className="type-note">
            Set in <b>the hot ink</b>: what I'd reach for first on a new project.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
