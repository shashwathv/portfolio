/**
 * The plate figure for a project.
 *
 * Not a screenshot, and not decoration standing in for one. A screenshot
 * shows one frame of a UI; half of these projects don't really *have* a
 * UI, and none of them are one frame. So each project gets a figure the
 * way a printed manual would give it one: the path a single job takes
 * through the thing, four stages on a spine, with the one detail that
 * mattered glossed in red in the margin.
 *
 * Every figure is built from the same parts, so the four read as a plate
 * series rather than four unrelated illustrations. Pure SVG — the GPU
 * budget belongs to the hero field.
 *
 * Copy rules that keep the geometry honest (nothing here clips or wraps,
 * so the data has to behave):
 *   label   ≤ 12 chars   ·  detail ≤ 30 chars
 *   gloss   ≤ 16 chars   ·  stamp  ≤ 18 chars
 *   exactly 4 stages
 */

const VIEW_W = 320;
const VIEW_H = 220;

const SPINE_X = 30;
const ROW_Y = [48, 82, 116, 150]; // stage centres
const HEAD_RULE_Y = 24;

export default function ProjectSchematic({ figure, caption, stages, stamp }) {
  const first = ROW_Y[0];
  const last = ROW_Y[ROW_Y.length - 1];

  return (
    <svg
      className="schematic"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* Plate header, ruled off like a figure in a manual. */}
      <text className="sc-head" x="12" y="15">
        Fig. {figure} · {caption}
      </text>
      <line className="sc-rule" x1="0" y1={HEAD_RULE_Y} x2={VIEW_W} y2={HEAD_RULE_Y} />

      {/* The spine the job travels down. */}
      <line className="sc-spine" x1={SPINE_X} y1={first} x2={SPINE_X} y2={last} />

      {/* Flow chevrons in the gaps between stages. */}
      <g className="sc-flow">
        {ROW_Y.slice(0, -1).map((y, i) => {
          const mid = (y + ROW_Y[i + 1]) / 2;
          return (
            <path
              key={i}
              d={`M${SPINE_X - 4} ${mid - 3} L${SPINE_X} ${mid + 2} L${SPINE_X + 4} ${mid - 3}`}
            />
          );
        })}
      </g>

      {/* A signal running the length of the spine while the plate is hovered. */}
      <circle className="sc-pulse" cx={SPINE_X} cy={first} r="4.5" />

      {stages.map((stage, i) => {
        const y = ROW_Y[i];
        const terminal = i === stages.length - 1;
        return (
          <g key={stage.label}>
            <text className="sc-no" x="8" y={y + 3}>
              {String(i + 1).padStart(2, '0')}
            </text>
            <circle
              className={`sc-node${terminal ? ' sc-node-out' : ''}`}
              cx={SPINE_X}
              cy={y}
              r={terminal ? 5 : 3.5}
            />
            <text className="sc-label" x="48" y={y - 1}>
              {stage.label}
            </text>
            <text className="sc-detail" x="48" y={y + 12}>
              {stage.detail}
            </text>
            {stage.gloss && (
              <text className="sc-gloss" x={VIEW_W - 12} y={y + 2}>
                ← {stage.gloss}
              </text>
            )}
          </g>
        );
      })}

      {/* Rubber stamp: the whole project in three words, pasted on crooked. */}
      <g className="sc-stamp" transform="rotate(-4 238 188)">
        <rect x="168" y="174" width="140" height="28" />
        <rect className="sc-stamp-inner" x="172" y="178" width="132" height="20" />
        <text x="238" y="192">{stamp}</text>
      </g>
    </svg>
  );
}
