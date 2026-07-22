import { useState, useEffect, lazy, Suspense } from 'react';
import './Background.css';

// The WebGL scene is heavy — load it lazily so it never blocks first paint.
const HeroScene = lazy(() => import('./HeroScene'));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Background() {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(false);
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = e => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // The field only reads as background behind the hero — once it's scrolled
  // well past, stop rendering rather than burning GPU on a near-invisible
  // layer. Same when the tab is hidden.
  useEffect(() => {
    if (reducedMotion) return;
    const root = document.getElementById('root');
    if (!root) return;

    let ticking = false;
    const update = () => {
      const y = root.scrollTop;
      // Step the scene back once the hero is behind us, then stop
      // rendering it entirely a little further down.
      setDimmed(y > window.innerHeight * 0.6);
      setPaused(document.hidden || y > window.innerHeight * 1.5);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', update);
    update();

    return () => {
      root.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', update);
    };
  }, [reducedMotion]);

  return (
    <div className="background-layer">
      {!reducedMotion && (
        <div className={`field-wrap ${dimmed ? 'is-dimmed' : ''}`}>
          <Suspense fallback={null}>
            <HeroScene paused={paused} />
          </Suspense>
        </div>
      )}
      <div className="background-grain" aria-hidden="true" />
    </div>
  );
}
