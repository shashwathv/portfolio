import { useState, useEffect, lazy, Suspense } from 'react';
import './Beams.css';

// The WebGL scene is heavy — load it lazily so it never blocks first paint.
const Beams = lazy(() => import('./Beams'));

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Background() {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = e => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="background-layer">
      {!reducedMotion && (
        <div className="beams-tilt">
          <Suspense fallback={null}>
            <Beams
              beamNumber={12}
              beamWidth={2}
              beamHeight={15}
              speed={0.60}
              noiseIntensity={1.9}
              scale={0.2}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
