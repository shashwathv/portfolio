/**
 * guts, wired: the whole homelab on one sheet, redrawn from
 * homelab.d2. Every relation in the source is here — some folded
 * together so the sheet stays readable:
 *
 *   - Nginx's eleven routes become two: one to the public services,
 *     one to the ones behind Zero Trust, each listed in its frame.
 *   - What Coolify deploys, and the four admin UIs nginx-proxy-manager
 *     also serves on *.lan, are tags on those rows.
 *   - Each app's own internals (KanZen's front → back → redis, Immich's
 *     four containers, Coolify's database and workers) are its caption.
 *   - Yuna's insides are summarised here and drawn out in full further
 *     down the page.
 *
 * Laid out by hand on a 1200 × 900 grid, in four bands: outside, the
 * gates, the machine, and what the agent calls out to.
 */

const W = 1200;
const H = 900;

function Box({ x, y, w = 150, h = 44, label, sub, tone = '' }) {
  const cy = y + h / 2;
  return (
    <g className={`hm-box ${tone}`.trim()}>
      <rect x={x} y={y} width={w} height={h} />
      <text className="hm-label" x={x + 12} y={sub ? cy - 3 : cy + 5}>{label}</text>
      {sub && <text className="hm-sub" x={x + 12} y={cy + 12}>{sub}</text>}
    </g>
  );
}

function Frame({ x, y, w, h, label, tone = '' }) {
  return (
    <g className={`hm-frame ${tone}`.trim()}>
      <rect x={x} y={y} width={w} height={h} />
      {label && <text className="hm-frame-label" x={x + 12} y={y + 18}>{label}</text>}
    </g>
  );
}

/** One service in a frame's list: name, caption, where it comes from. */
function Row({ x, y, name, sub, tag, lan }) {
  return (
    <g className="hm-row">
      <rect className="hm-bullet" x={x + 12} y={y - 8} width="7" height="7" />
      <text className="hm-row-name" x={x + 26} y={y}>{name}</text>
      {sub && <text className="hm-sub" x={x + 118} y={y}>{sub}</text>}
      {lan && (
        <g className="hm-lan">
          <rect x={x + 214} y={y - 10} width="30" height="13" />
          <text x={x + 229} y={y - 0.5}>LAN</text>
        </g>
      )}
      <text className="hm-tag" x={x + 318} y={y}>{tag}</text>
    </g>
  );
}

/** A connection. `d` is the path; `tone` sets ink and arrowhead. */
function Edge({ d, tone = 'ink', dashed, both, label, lx, ly, anchor = 'start', rotate }) {
  return (
    <g className={`hm-edge hm-${tone}`}>
      <path
        d={d}
        className={dashed ? 'is-dashed' : ''}
        markerEnd={`url(#hm-head-${tone})`}
        markerStart={both ? `url(#hm-tail-${tone})` : undefined}
      />
      {label && (
        <text
          className="hm-edge-label"
          x={lx}
          y={ly}
          textAnchor={anchor}
          transform={rotate ? `rotate(${rotate} ${lx} ${ly})` : undefined}
        >
          {label}
        </text>
      )}
    </g>
  );
}

const TONES = ['ink', 'public', 'protected'];

export default function HomelabMap() {
  return (
    <svg
      className="hm"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-labelledby="hm-title hm-desc"
    >
      <title id="hm-title">The homelab, wired</title>
      <desc id="hm-desc">
        Public users reach Cloudflare DNS; public hostnames go straight to the
        tunnel edge, protected ones through Zero Trust Access first. The edge
        reaches the laptop through an outbound cloudflared tunnel into host
        Nginx, which serves KanZen, KenXSearch, the portfolio and ntfy
        (password-protected) publicly, and Coolify, nginx-proxy-manager, Portainer, Uptime Kuma,
        Immich, Pi-hole and Cockpit behind Zero Trust. My devices come in over
        Tailscale; home clients use Pi-hole for DNS, nginx-proxy-manager for
        *.lan names, and the laptop's 5 GHz hotspot. Coolify builds and
        deploys the apps onto the Docker engine, which Portainer manages and
        the Yuna agent reaches only through a filtered socket proxy. Yuna
        takes commands over ntfy, a local web UI and a CLI, parses them with
        a local llama.cpp model (Gemini as fallback), sets up proxy hosts in
        nginx-proxy-manager and DNS records through the Cloudflare API, and
        switches the GNOME session for headless mode.
      </desc>

      <defs>
        {TONES.map(t => (
          <g key={t}>
            <marker id={`hm-head-${t}`} className={`hm-${t}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" />
            </marker>
            <marker id={`hm-tail-${t}`} className={`hm-${t}`} viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M8,0 L0,4 L8,8 z" />
            </marker>
          </g>
        ))}
      </defs>

      {/* ---- bands ---- */}
      <text className="hm-zone" x="20" y="26">Outside</text>
      <text className="hm-zone" x="215" y="26">The gates</text>

      {/* ---- outside ---- */}
      <Box x={20} y={60} w={160} label="Public users" sub="anyone" />
      <Box x={20} y={150} w={160} label="Phone" sub="ntfy, logged in · Tasker" />
      <Box x={20} y={380} w={160} label="My devices" sub="remote" />
      <Box x={20} y={560} w={160} label="Home clients" sub="LAN · hotspot" />
      <Box x={20} y={758} w={160} label="Me, at the laptop" sub="local only" />

      {/* ---- the gates ---- */}
      <Frame x={215} y={40} w={210} h={254} label="Cloudflare" />
      <Box x={235} y={70} w={170} label="DNS" sub="*.nw-right.dev" />
      <Box x={285} y={150} w={120} h={40} label="Zero Trust" sub="login first" tone="protected" />
      <Box x={235} y={230} w={170} label="Tunnel edge" />
      <Box x={235} y={380} w={170} label="Tailscale" sub="tailnet" />
      <Frame x={215} y={668} w={210} h={72} label="Home LAN" />
      <Box x={235} y={692} w={170} h={40} label="ISP router" />

      {/* ---- the machine ---- */}
      <g className="hm-host">
        <rect x="455" y="40" width="725" height="780" />
        <text className="hm-host-name" x="475" y="72">guts</text>
        <text className="hm-host-spec" x="530" y="72">one laptop · Arch Linux</text>
      </g>

      {/* the doors on the host */}
      <Box x={475} y={230} label="cloudflared" sub="outbound tunnel" />
      <Box x={475} y={380} label="tailscaled" />
      <Box x={475} y={500} label="Pi-hole" sub="DNS for the LAN" />
      <Box x={475} y={560} label="NPM" sub="*.lan proxy" />
      <Box x={475} y={620} label="Hotspot" sub="5 GHz" />

      {/* the engine room */}
      <Box x={650} y={200} h={104} label="Nginx" sub="public reverse proxy" tone="key" />
      <Box x={650} y={476} label="Docker engine" tone="key" />
      <Box x={650} y={546} label="Socket proxy" sub="Yuna’s way to Docker" />
      <Box x={650} y={616} label="llama.cpp" sub="qwen3:4b · for Yuna" />
      <Box x={650} y={686} label="GNOME / GDM" sub="Yuna: headless · apps" />

      {/* what's served */}
      <Frame x={830} y={96} w={330} h={130} label="Open to anyone" tone="public" />
      <Row x={830} y={138} name="KanZen" sub="front → back → redis" tag="coolify" />
      <Row x={830} y={162} name="KenXSearch" tag="coolify" />
      <Row x={830} y={186} name="Portfolio" sub="this site" tag="coolify" />
      <Row x={830} y={210} name="ntfy" sub="push · login" tag="compose" />

      <Frame x={830} y={246} w={330} h={200} label="Behind Zero Trust" tone="protected" />
      <Row x={830} y={288} name="Coolify" sub="deploys" tag="platform" lan />
      <Row x={830} y={312} name="NPM" sub="its admin" tag="docker" />
      <Row x={830} y={336} name="Portainer" sub="manages" tag="compose" lan />
      <Row x={830} y={360} name="Uptime Kuma" sub="monitors" tag="compose" lan />
      <Row x={830} y={384} name="Immich" sub="server · ML · pg · redis" tag="coolify" />
      <Row x={830} y={408} name="Pi-hole" sub="admin UI" tag="compose" lan />
      <Row x={830} y={432} name="Cockpit" sub="host admin" tag="host" />

      <Frame x={830} y={476} w={330} h={74} label="Coolify platform" />
      <text className="hm-sub" x="842" y="516">coolify · realtime · sentinel (metrics)</text>
      <text className="hm-sub" x="842" y="536">postgres 15 · redis</text>

      <Frame x={830} y={580} w={330} h={216} label="Yuna · the agent" tone="agent" />
      <text className="hm-sub" x="842" y="624">in    web UI · ntfy chat · CLI</text>
      <text className="hm-sub" x="842" y="646">→     agent.py · action registry</text>
      <text className="hm-sub" x="842" y="668">→     llm.py · picks the model</text>
      <text className="hm-sub" x="842" y="690">→     safety.py · policy, dry run, approval</text>
      <text className="hm-sub" x="842" y="712">→     audit log · hash-chained, append-only</text>
      <text className="hm-sub" x="842" y="734">out   deploy · containers · power · apps</text>
      <text className="hm-sub" x="842" y="756">      hardening · metrics · browser</text>

      {/* ---- called out to ---- */}
      <text className="hm-zone" x="470" y="872">Called out to</text>
      <Box x={860} y={846} w={140} label="Cloudflare API" />
      <Box x={1020} y={846} w={140} label="Gemini" sub="cloud fallback" />

      {/* ---- title block ---- */}
      <g className="hm-titleblock">
        <rect x="20" y="846" width="405" height="44" />
        <line x1="150" y1="846" x2="150" y2="890" />
        <text className="hm-tb-big" x="32" y="874">Fig. 01</text>
        <text className="hm-sub" x="162" y="864">guts, wired — from homelab.d2</text>
        <text className="hm-sub" x="162" y="880">simplified; no relation dropped</text>
      </g>

      {/* ================= connections ================= */}

      {/* in from outside */}
      <Edge d="M180,82 L235,82" tone="public" label="HTTPS" lx={186} ly={76} />
      <Edge d="M180,172 L235,106" tone="public" both label="ntfy" lx={214} ly={150} />
      <Edge d="M255,114 L255,230" tone="public" label="public" lx={250} ly={200} rotate={-90} />
      <Edge d="M345,114 L345,150" tone="protected" />
      <Edge d="M345,190 L345,230" tone="protected" label="after login" lx={352} ly={214} />
      <Edge d="M405,252 L475,252" dashed label="outbound" lx={414} ly={244} />
      <Edge d="M625,252 L650,252" />

      <Edge d="M180,402 L235,402" />
      <Edge d="M405,402 L475,402" dashed label="WireGuard" lx={412} ly={394} />

      <Edge d="M180,576 L475,522" label="DNS" lx={420} ly={524} />
      <Edge d="M180,582 L475,582" label="http://*.lan" lx={330} ly={576} />
      <Edge d="M180,590 L475,642" dashed label="Wi-Fi" lx={420} ly={645} />
      <Edge d="M455,712 L405,712" label="uplink" lx={412} ly={706} />

      <Edge d="M180,780 L830,780" label="browser · terminal" lx={200} ly={774} />

      {/* Nginx out: two audiences */}
      <Edge d="M800,226 L830,168" tone="public" />
      <Edge d="M800,284 L830,300" tone="protected" />

      {/* NPM serves four admin UIs on *.lan */}
      <Edge d="M625,574 L634,574 L634,430 L830,430" label="*.lan" lx={642} ly={424} />

      {/* Docker: who drives it */}
      <Edge d="M1000,476 L1000,446" label="builds & deploys" lx={1008} ly={466} />
      <Edge d="M830,500 L800,498" />
      <Edge d="M830,340 L725,340 L725,476" label="manages" lx={732} ly={354} />
      <Edge d="M725,546 L725,520" label="allowlisted API" lx={732} ly={538} />

      {/* Yuna's reach */}
      <Edge d="M830,568 L800,568" />
      <Edge d="M830,638 L800,638" />
      <Edge d="M830,708 L800,708" />
      <Edge d="M830,760 L640,760 L640,596 L625,596" label="proxy host + SSL" lx={648} ly={754} />
      <Edge d="M1160,206 L1172,206 L1172,626 L1160,626" both label="commands · presence · alerts" lx={1186} ly={416} anchor="middle" rotate={90} />
      <Edge d="M930,796 L930,846" label="DNS records" lx={938} ly={828} />
      <Edge d="M1090,796 L1090,846" dashed label="fallback" lx={1098} ly={828} />
    </svg>
  );
}
