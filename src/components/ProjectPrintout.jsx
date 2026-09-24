import { useEffect, useRef, useState } from 'react';



const TYPE_MS = 34;         // per character, on a command line
const LINE_MS = [140, 320]; // pause before an output line, min..max

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ProjectPrintout({ figure, caption, lines, stamp, mark }) {
  const rootRef = useRef(null);
  // How far the run has printed: which line, and how many characters of
  // it. `done` also raises the stamp.
  const [pos, setPos] = useState({ line: 0, chars: 0, done: false });
  const [armed, setArmed] = useState(false);
  // Counts runs. A replay bumps it, which is what re-runs the print head
  // — flipping `armed` off and on again could be coalesced into no
  // change at all, and then the head never restarted.
  const [run, setRun] = useState(0);
  const timer = useRef(0);

  const still = prefersReducedMotion();

  // Start when the plate is in view; the page scrolls inside #root.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || still) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setArmed(true); io.disconnect(); }
    }, { root: document.getElementById('root'), threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  // The print head.
  useEffect(() => {
    if (!armed || still) return undefined;
    let cancelled = false;
    const step = (line, chars) => {
      if (cancelled) return;
      if (line >= lines.length) { setPos({ line, chars: 0, done: true }); return; }
      const cur = lines[line];
      if (cur.kind === 'cmd' && chars < cur.text.length) {
        setPos({ line, chars: chars + 1, done: false });
        timer.current = setTimeout(() => step(line, chars + 1), TYPE_MS);
        return;
      }
      // Line complete: a beat, then the next one starts.
      const wait = cur.kind === 'cmd' ? 260 : LINE_MS[0] + Math.random() * (LINE_MS[1] - LINE_MS[0]);
      timer.current = setTimeout(() => {
        setPos({ line: line + 1, chars: 0, done: false });
        step(line + 1, 0);
      }, wait);
    };
    // The first step is scheduled, not taken here: an effect that sets
    // state synchronously re-renders in a cascade, and the head has a
    // beat before it starts anyway.
    timer.current = setTimeout(() => step(0, 0), 180);
    return () => { cancelled = true; clearTimeout(timer.current); };
  }, [armed, run, lines, still]);

  // Hover replays a finished run: back to the top of the paper, next run.
  const replay = () => {
    if (still || !pos.done) return;
    setPos({ line: 0, chars: 0, done: false });
    setRun(r => r + 1);
  };

  const visibleCount = still ? lines.length : pos.line;
  const done = still || pos.done;

  return (
    <div className={`printout${done ? ' is-done' : ''}`} ref={rootRef} onMouseEnter={replay} aria-hidden="true">
      {mark && <div className={`printout-mark printout-mark-${mark}`} />}

      <div className="printout-head">
        Fig. {figure} · {caption}
        <span className="printout-sample"> · sample run</span>
      </div>

      <ol className="printout-lines">
        {lines.map((l, i) => {
          if (i > visibleCount) return null;
          const typing = !still && i === pos.line && l.kind === 'cmd' && !pos.done;
          const text = typing ? l.text.slice(0, pos.chars) : l.text;
          if (i === visibleCount && !typing && !still) return null;
          return (
            <li key={i} className={`printout-line printout-${l.kind}`}>
              {l.kind === 'cmd' && <span className="printout-prompt">$ </span>}
              {l.label && <span className="printout-label">{l.label}</span>}
              <span>{text}</span>
              {typing && <span className="printout-cursor" />}
            </li>
          );
        })}
        {done && (
          <li className="printout-line printout-cmd">
            <span className="printout-prompt">$ </span>
            <span className="printout-cursor printout-cursor-rest" />
          </li>
        )}
      </ol>

      {/* Rubber stamp, pressed on once the run is through. */}
      <div className="printout-stamp"><span>{stamp}</span></div>
    </div>
  );
}
