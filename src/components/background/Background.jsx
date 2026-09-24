import { lazy, Suspense } from 'react';
import './Background.css';

// Canvas 2D, no library — but still lazy so it never blocks first paint.
const Tracer = lazy(() => import('./Tracer'));

/** `silent`: the ants still walk the page, but write nothing on it. */
export default function Background({ silent = false }) {
  return (
    <>
      {/* The board: fixed, with the left gutter kept a shade darker
          behind the copy. */}
      <div className="background-layer" aria-hidden="true">
        <div className="background-scrim" />
      </div>
      {/* The ants are not on the board — they are on the page, and what
          they write scrolls with it. */}
      <Suspense fallback={null}>
        <Tracer silent={silent} />
      </Suspense>
    </>
  );
}
