import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view, for nav highlighting.
 * Measures against #root, since that's the scroll container.
 *
 * Deliberately not an IntersectionObserver. Two things went wrong with
 * one here:
 *
 *   - An observer callback only carries the entries that *changed*, so
 *     a batch containing nothing intersecting left the previous section
 *     highlighted rather than updating.
 *   - The sections are all taller than any sensible detection band, so
 *     the last one never won: at the bottom of the scroll the colophon
 *     occupies the band and CONTACT sits entirely above it.
 *
 * Measuring every section against a fixed line is simpler and has no
 * such corners. Reads are batched into a frame, and nothing is written
 * to layout, so it stays cheap.
 */
export default function useScrollSpy(sectionIds) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    let frame = null;

    const measure = () => {
      frame = null;

      // Once the page bottoms out, no further scrolling can bring the
      // last section down to the line — hand it the highlight directly.
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 2) {
        setActive(sections[sections.length - 1].id);
        return;
      }

      const line = root.clientHeight * 0.38;
      let current = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      // Above the first section (the hero) nothing is active, which is
      // right: "home" isn't one of the numbered items.
      setActive(current);
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();
    root.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      root.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sectionIds]);

  return active;
}
