import { useState, useEffect, useRef, useMemo } from 'react';
import useScrollSpy from '../hooks/useScrollSpy';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const navItems = useMemo(() => ['about', 'work', 'skills', 'contact'], []);
  const active = useScrollSpy(navItems);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const handleScroll = () => {
      if (ticking.current) return;
      window.requestAnimationFrame(() => {
        const y = root.scrollTop;
        const diff = y - lastScrollY.current;
        if (Math.abs(diff) > 8) {
          setHidden(diff > 0 && y > 80);
          lastScrollY.current = y;
        }
        ticking.current = false;
      });
      ticking.current = true;
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => root.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className={`masthead ${hidden && !mobileOpen ? 'is-hidden' : ''}`}>
        <a
          href="#home"
          className="masthead-title"
          onClick={e => { e.preventDefault(); goTo('home'); }}
        >
          Shashwath V<span className="dot">.</span>
        </a>

        <p className="masthead-meta">Backend &amp; infrastructure — Bengaluru</p>

        <nav>
          <ul className="masthead-nav">
            {navItems.map(id => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={active === id ? 'is-active' : ''}
                  onClick={e => { e.preventDefault(); goTo(id); }}
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className={`masthead-toggle ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </header>

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
