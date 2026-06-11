import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view, for nav highlighting.
 * Observes against #root since that's the scroll container.
 */
export default function useScrollSpy(sectionIds) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const root = document.getElementById('root');
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        // Pick the most visible intersecting section
        const inView = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (inView.length) setActive(inView[0].target.id);
      },
      { root, rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}
