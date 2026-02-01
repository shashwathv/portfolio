import { useState } from 'react';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav>
      <button
        className="nav-toggle"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? '×' : '≡'}
      </button>

      <ul className={mobileOpen ? 'open' : ''}>
        {['about', 'work', 'contact'].map(id => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={e => {
                e.preventDefault();
                scrollToSection(id);
              }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
