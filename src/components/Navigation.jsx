import { useState, useEffect, useMemo } from 'react';
import useScrollSpy from '../hooks/useScrollSpy';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => ['about', 'work', 'skills', 'contact'], []);
  const active = useScrollSpy(navItems);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { root.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = e => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const goTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* The spine — a bound-volume edge running the full height of the
          page, with the nameplate set to read up it. */}
      <header className="spine">
        <span className="crop crop-tl" aria-hidden="true" />
        <span className="crop crop-bl" aria-hidden="true" />

        <a
          href="#home"
          className="spine-plate"
          onClick={e => { e.preventDefault(); goTo('home'); }}
        >
          <span className="spine-name">Shashwath&nbsp;V</span>
        </a>

        <nav className="spine-nav">
          <ul>
            {navItems.map((id, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={active === id ? 'is-active' : ''}
                  onClick={e => { e.preventDefault(); goTo(id); }}
                >
                  <span className="spine-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="spine-label">{id}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Balances the nameplate at the head of the spine, and unlike
            the "Est." folio it replaced, it goes somewhere. */}
        <a
          href="https://github.com/shashwathv"
          className="spine-handle"
          target="_blank"
          rel="noopener noreferrer"
        >
          @shashwathv
        </a>
      </header>

      {/* Mobile: the spine folds into a top bar with a menu sheet. */}
      <div className="topbar">
        <a
          href="#home"
          className="topbar-name"
          onClick={e => { e.preventDefault(); goTo('home'); }}
        >
          Shashwath V
        </a>
        <button
          className={`topbar-toggle ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`mobile-sheet ${mobileOpen ? 'is-open' : ''}`}>
        {navItems.map(id => (
          <a
            key={id}
            href={`#${id}`}
            onClick={e => { e.preventDefault(); goTo(id); }}
          >
            {id}
          </a>
        ))}
      </div>
    </>
  );
}
