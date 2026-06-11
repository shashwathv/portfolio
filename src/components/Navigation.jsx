import { useState, useEffect, useRef, useMemo } from 'react';
import useScrollSpy from '../hooks/useScrollSpy';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const navItems = useMemo(() => ['about', 'work', 'skills', 'contact'], []);
  const active = useScrollSpy(navItems);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = root.scrollTop;
          const diff = currentY - lastScrollY.current;
          if (Math.abs(diff) > 8) {
            setVisible(diff < 0 || currentY < 60);
            lastScrollY.current = currentY;
          }
          setScrolled(currentY > 24);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    return () => root.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when menu open
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { root.style.overflow = ''; };
  }, [mobileOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = e => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <nav className={`${visible ? 'nav-visible' : 'nav-hidden'} ${scrolled ? 'nav-scrolled' : ''}`}>
        {/* Desktop links */}
        <ul className="nav-desktop">
          {navItems.map(id => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={active === id ? 'nav-link-active' : ''}
                onClick={e => { e.preventDefault(); scrollToSection(id); }}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger — mobile only */}
        <button
          className="nav-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <span className={`hamburger-icon ${mobileOpen ? 'is-open' : ''}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>

      {/* Backdrop dimmer */}
      <div
        className={`mobile-menu-backdrop ${mobileOpen ? 'backdrop-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Frosted glass slide-in panel */}
      <div className={`mobile-menu-panel ${mobileOpen ? 'panel-open' : ''}`}>
        <ul>
          {navItems.map((id, i) => (
            <li
              key={id}
              className={mobileOpen ? 'item-visible' : ''}
              style={{ transitionDelay: mobileOpen ? `${80 + i * 55}ms` : '0ms' }}
            >
              <a
                href={`#${id}`}
                onClick={e => { e.preventDefault(); scrollToSection(id); }}
              >
                <span className="mobile-nav-number">0{i + 1}</span>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
