import { lazy, Suspense } from 'react';
import './Background.css';

// Raw-WebGL, no library — but still lazy so it never blocks first paint.
const Halftone = lazy(() => import('./Halftone'));

export default function Background() {
  return (
    <div className="background-layer" aria-hidden="true">
      <Suspense fallback={null}>
        <Halftone />
      </Suspense>
      {/* Keeps the moiré off the left gutter where most text sits. */}
      <div className="background-scrim" />
    </div>
  );
}
