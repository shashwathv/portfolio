/**
 * Generative cover art for a project card.
 *
 * These are placeholders with intent: each variant abstracts what the
 * project actually does, so a card reads as *something* before real
 * screenshots exist. Pure SVG/CSS — the GPU budget belongs to the hero
 * field, and four WebGL contexts in a grid is not a trade worth making.
 *
 * Drop a screenshot on the project and this is replaced entirely.
 */

const SEEDED = {
  // Freehand circle + OCR scan sweep — KenXSearch.
  scan: (
    <>
      <g className="pv-scan-text">
        {[
          [18, 30, 74], [18, 42, 96], [18, 54, 58],
          [18, 78, 110], [18, 90, 82], [18, 102, 124],
          [18, 126, 66], [18, 138, 104]
        ].map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height="5" rx="2.5" />
        ))}
      </g>

      <ellipse
        className="pv-circle"
        cx="128"
        cy="88"
        rx="62"
        ry="46"
        transform="rotate(-8 128 88)"
      />

      <rect className="pv-sweep" x="0" y="0" width="256" height="3" />
    </>
  ),

  // Crawl frontier fanning out from a root node — ShadowBrowse.
  graph: (
    <>
      <g className="pv-edges">
        {[
          [40, 88, 108, 44], [40, 88, 112, 88], [40, 88, 104, 134],
          [108, 44, 186, 26], [108, 44, 190, 66],
          [112, 88, 192, 100], [104, 134, 184, 128], [104, 134, 178, 160]
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ '--i': i }} />
        ))}
      </g>
      <g className="pv-nodes">
        {[
          [40, 88, 6], [108, 44, 4], [112, 88, 4], [104, 134, 4],
          [186, 26, 2.5], [190, 66, 2.5], [192, 100, 2.5],
          [184, 128, 2.5], [178, 160, 2.5]
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} style={{ '--i': i }} />
        ))}
      </g>
    </>
  ),

  // Behavioural signal traces against a baseline — BehaviorVault.
  wave: (
    <>
      <line className="pv-baseline" x1="0" y1="88" x2="256" y2="88" />
      <path
        className="pv-trace pv-trace-a"
        d="M0 88 Q 16 62, 32 88 T 64 88 Q 80 54, 96 88 T 128 88 Q 144 70, 160 88 T 192 88 Q 208 48, 224 88 T 256 88"
      />
      <path
        className="pv-trace pv-trace-b"
        d="M0 88 Q 20 108, 40 88 T 80 88 Q 100 122, 120 88 T 160 88 Q 180 104, 200 88 T 240 88 L 256 88"
      />
      {/* The anomaly the model is there to catch. */}
      <g className="pv-anomaly">
        <line x1="176" y1="30" x2="176" y2="146" />
        <circle cx="176" cy="52" r="4" />
      </g>
    </>
  ),

  // Glyph grid resolving into flashcards — KanGen.
  glyph: (
    <>
      <g className="pv-glyphs">
        {['学', '習', '漢', '字', '読', '書', '語', '文'].map((ch, i) => (
          <text
            key={ch}
            x={32 + (i % 4) * 64}
            y={i < 4 ? 68 : 132}
            style={{ '--i': i }}
          >
            {ch}
          </text>
        ))}
      </g>
      <rect className="pv-card" x="16" y="34" width="96" height="52" rx="3" />
      <rect className="pv-card pv-card-2" x="144" y="98" width="96" height="52" rx="3" />
    </>
  )
};

export default function ProjectVisual({ variant = 'scan' }) {
  return (
    <svg
      className={`project-visual pv-${variant}`}
      viewBox="0 0 256 176"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {SEEDED[variant] ?? SEEDED.scan}
    </svg>
  );
}
