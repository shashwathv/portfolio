import { useEffect, useRef } from 'react';

/**
 * 1px progress line along the top edge of the viewport frame,
 * filling left-to-right as the page scrolls.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const root = document.getElementById('root');
    const bar = barRef.current;
    if (!root || !bar) return;

    let ticking = false;
    const update = () => {
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? root.scrollTop / max : 0;
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />;
}
