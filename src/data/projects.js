/**
 * Every project on the site, in running order. The homepage index and
 * each /work/<slug> page are both built from this list — adding a
 * project is adding an entry here, nothing else.
 *
 * Anything in [square brackets] is placeholder copy, still to be
 * written.
 *
 *   slug          the URL: /work/<slug>
 *   year          shown in the index row and the page's meta line
 *   category      the meta line's middle item
 *   tech          first entry is the "main tech" in the meta line
 *   summary       one line, for the index row
 *   flag          optional caveat, stuck on the corner of the figure
 *   links         github / demo / paper — leave one out and its
 *                 button goes
 *   problem       one short paragraph            → "Why it exists"
 *   features      3–4 of { title, body }         → "What you get"
 *   architecture  the flow, left to right: { label, note? }
 *                                                → "How it runs"
 *   decisions     2–3 of { decision, why }       → "Calls I made"
 *   outcome       awards, publications, results — one line each
 *                                                → "Where it landed"
 *   printout      the sample run on the page's figure; see
 *                 ProjectPrintout for how much fits on the paper
 *
 * kind: 'infra' marks something that runs rather than something that
 * shipped, and gets its own page: a rating plate instead of the
 * printout, the wiring drawing (see HomelabMap), and its own parts —
 *
 *   rating        [label, value] pairs for the plate
 *   doors         the ways in: { name, path, behind[], tone }
 *   agent         { intro, flow[] (as architecture), modules[] of
 *                 { name, does, touches } }
 */
const projects = [
  {
    slug: 'homelab',
    title: 'Homelab',
    kind: 'infra',
    year: '2026',
    category: 'Infrastructure',
    tech: ['Arch Linux', 'Docker', 'Cloudflare', 'Tailscale', 'Nginx', 'Coolify', 'llama.cpp'],
    summary: 'The laptop this all runs on — tunnelled out, locked behind Zero Trust, kept by its own agent.',
    links: {},
    rating: [
      ['Host', 'guts'],
      ['Machine', 'one laptop, at home'],
      ['OS', 'Arch Linux'],
      ['Containers', '20'],
      ['Inbound ports', '0'],
      ['Domain', '*.nw-right.dev'],
      ['Local model', 'qwen3:4b · llama.cpp']
    ],
    problem:
      'Everything on this site runs on it. I wanted that to be somewhere of my own — a laptop on a home connection, with no static IP, no port forwarding and no monthly cloud bill. The catch is doing it without opening the house: nothing listens on the internet, every way in is a door I chose, and anything with admin powers sits behind a login.',
    doors: [
      {
        name: 'Public',
        path: 'Cloudflare DNS → tunnel → Nginx',
        behind: ['KanZen', 'KenXSearch', 'this portfolio', 'ntfy — username and password to subscribe'],
        tone: 'public'
      },
      {
        name: 'Behind a login',
        path: 'Zero Trust Access → tunnel → Nginx',
        behind: ['7 admin UIs', 'deploys, containers and proxies', 'monitoring, DNS and the host', 'a photo library'],
        tone: 'protected'
      },
      {
        name: 'My devices, anywhere',
        path: 'Tailscale tailnet → WireGuard → tailscaled',
        behind: ['the machine itself, privately'],
        tone: 'private'
      },
      {
        name: 'At home',
        path: 'the LAN, or the laptop’s 5 GHz hotspot',
        behind: ['*.lan names through nginx-proxy-manager', 'Pi-hole as the network’s DNS'],
        tone: 'private'
      }
    ],
    agent: {
      intro:
        'Yuna keeps the box for me. It takes a plain-language command — from my phone over a password-protected ntfy topic, a local web UI, or the terminal — works out which action I mean, and runs it only if the policy allows. Nothing it does goes unrecorded.',
      flow: [
        { label: 'Ask', note: 'ntfy chat · web UI · CLI' },
        { label: 'Understand', note: 'llama.cpp first, Gemini fallback' },
        { label: 'Guard', note: 'policy tier · dry run · approval' },
        { label: 'Record', note: 'hash-chained, append-only log' },
        { label: 'Act', note: 'one of seven modules' }
      ],
      modules: [
        { name: 'deploy', does: 'Runs a container and gives it a subdomain.', touches: 'socket proxy · NPM · Cloudflare API' },
        { name: 'containers', does: 'Starts, stops and inspects containers.', touches: 'socket proxy' },
        { name: 'power', does: 'Switches between away, headless, home and perf.', touches: 'GDM · ntfy presence' },
        { name: 'apps', does: 'Opens desktop apps on the laptop.', touches: 'GNOME session' },
        { name: 'hardening', does: 'Audits the host on a timer.', touches: 'ntfy alerts + approve buttons' },
        { name: 'metrics', does: 'Samples the machine on a timer, kept 14 days.', touches: 'host' },
        { name: 'browser', does: 'Drives a headless Firefox.', touches: 'the web' }
      ]
    },
    decisions: [
      {
        decision: 'An outbound tunnel, not open ports.',
        why: 'cloudflared dials out to Cloudflare, so the router forwards nothing and there is no inbound port to find. DNS, TLS and the front door all live at the edge.'
      },
      {
        decision: 'Zero Trust in front of everything with admin powers.',
        why: 'Coolify, Portainer, Pi-hole, Cockpit and the rest share the same tunnel as the public sites, but Cloudflare Access wants a login before a request ever reaches the laptop.'
      },
      {
        decision: 'The agent never holds the Docker socket.',
        why: 'Yuna goes through a socket proxy that only allows filtered endpoints, every action passes a read-only policy first, and the audit log can only be appended to.'
      },
      {
        decision: 'A local model first.',
        why: 'Commands are parsed by qwen3:4b on llama.cpp on the laptop itself. Gemini is only the fallback, so the box doesn’t need the cloud to understand me.'
      }
    ],
    outcome: [
      '20 containers on one laptop',
      '0 inbound ports open',
      '4 public hostnames · 7 admin UIs behind Zero Trust',
      'Serves this site, KanZen and KenXSearch'
    ]
  },
  {
    slug: 'kenxsearch',
    title: 'KenXSearch',
    year: '2025',
    category: 'Linux tooling',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Tesseract', 'Playwright'],
    summary: 'Circle to Search, for Linux — ring anything on screen and search it.',
    flag: 'Partial on GNOME 49+',
    links: {
      github: 'https://github.com/shashwathv/KenXSearch',
      demo: 'https://kenxsearch.nw-right.dev/'
    },
    problem:
      'Android has Circle to Search; Linux has screenshot, crop, save, upload. I wanted the one gesture — draw around anything on screen and get an answer. The search was the easy part. The hard part was capturing the screen at all, because KDE, GNOME, Wayland and X11 each guard it differently.',
    features: [
      {
        title: 'Draw around it',
        body: 'Circle anything — or scribble any shape — on a full-screen overlay. The selection snaps to a bracketed box with a scanning line across it.'
      },
      {
        title: 'Four ways to search',
        body: 'Text, Visual, Translate and Shopping, all through Google Lens. A text search falls back to a visual one when there’s nothing to read.'
      },
      {
        title: 'OCR in ten languages',
        body: 'Tesseract with OpenCV preprocessing and more than one extraction strategy — English, Japanese, Korean, Chinese and six more.'
      },
      {
        title: 'One-line install',
        body: 'A curl-pipeable bootstrap installs the system packages, a virtualenv and Playwright’s Chromium on apt, dnf and pacman distros.'
      }
    ],
    architecture: [
      { label: 'Launcher', note: 'bash' },
      { label: 'Overlay', note: 'PyQt6' },
      { label: 'Capture', note: 'mss + fallbacks' },
      { label: 'OCR', note: 'Tesseract · OpenCV' },
      { label: 'Lens', note: 'Playwright' }
    ],
    decisions: [
      {
        decision: 'A chain of capture backends, not one.',
        why: 'mss first, then gnome-screenshot, grim and spectacle. Each desktop blocks a different one, and trying them in order is what makes the same tool work on KDE, GNOME, Wayland and X11.'
      },
      {
        decision: 'Keep one browser profile between runs.',
        why: 'Playwright reuses a persistent context, so Google’s login and cookies survive. A fresh browser every time would run straight into CAPTCHAs.'
      },
      {
        decision: 'Degrade on GNOME 49 instead of failing.',
        why: 'GNOME 49 blocks background capture on Wayland at the compositor. The overlay falls back to a plain background, and every search mode still works.'
      }
    ],
    outcome: [
      'Fully working on Kubuntu 25.10, Manjaro and Pop!_OS 24.04 — KDE Plasma and GNOME, on Wayland.',
      'Partial on Arch with GNOME 49.4: everything works except showing the desktop behind the overlay.',
      'One-command install on Debian/Ubuntu, Fedora and Arch. MIT-licensed.'
    ],
    printout: {
      figure: '02',
      caption: 'ring to result',
      stamp: 'circle → answer',
      mark: 'ring',
      lines: [
        { kind: 'cmd', text: 'KenXSearch' },
        { kind: 'dim', label: 'session', text: 'wayland · kde plasma' },
        { kind: 'out', label: 'capture', text: 'mss · ring 412 × 288 px  ✓' },
        { kind: 'out', label: 'ocr', text: 'tesseract  "circle to search"' },
        { kind: 'out', label: 'mode', text: 'search → google lens' },
        { kind: 'hot', label: '→', text: 'opened in browser' }
      ]
    }
  },
  {
    slug: 'shadowbrowse',
    title: 'ShadowBrowse',
    year: '2025',
    category: 'Security tooling',
    tech: ['Go', 'Gin', 'Docker', 'JavaScript', 'VirusTotal', 'SQLite'],
    summary: 'Open a suspicious link in a throwaway browser — scanned before it loads.',
    links: {
      github: 'https://github.com/VincentSamuelPaul/ShadowBrowse',
      demo: 'https://drive.google.com/file/d/1Pr8xoM5vnvuXAdkyqVTOKZajyLsv-RvP/view?usp=drive_link'
    },
    problem:
      'Clicking an unknown link is a bet — phishing, drive-by downloads, exploits that only need the page to load. ShadowBrowse takes the bet off your machine. The link is checked against VirusTotal first, and if you still want to see it, it opens in a disposable browser inside a Docker container rather than in yours.',
    features: [
      {
        title: 'Scanned before it opens',
        body: 'Every URL is checked against VirusTotal’s 70+ vendors and marked High, Medium or Low risk before you decide whether to go on.'
      },
      {
        title: 'A browser you throw away',
        body: 'The page runs in an ephemeral Firefox container, streamed to you over noVNC. Ending the session removes the container and its files.'
      },
      {
        title: 'Right where the link is',
        body: 'Right-click any link, or press Ctrl+Shift+S on the page you’re on. No copying URLs into a separate tool.'
      },
      {
        title: 'Your own threshold',
        body: 'Warn on any detection, over 5% of vendors, or over 10% — and wipe session data automatically when you’re done.'
      }
    ],
    architecture: [
      { label: 'Extension', note: 'Chrome · MV3' },
      { label: 'Risk check', note: 'VirusTotal' },
      { label: 'API', note: 'Go · Gin' },
      { label: 'Sandbox', note: 'Docker · Firefox' },
      { label: 'Session', note: 'noVNC' }
    ],
    decisions: [
      {
        decision: 'Isolate the page, don’t just filter it.',
        why: 'A blocklist only stops what’s already known. Running the page in a disposable container means even an unknown exploit has nothing of yours to reach.'
      },
      {
        decision: 'Scan before the container starts.',
        why: 'A VirusTotal lookup is cheap and a container isn’t. Scoring first puts the risk in front of you before anything is spun up.'
      },
      {
        decision: 'Ephemeral by default.',
        why: 'Every session gets a fresh container that’s destroyed when it ends, so nothing a page downloads or sets survives into the next one.'
      }
    ],
    outcome: [
      'A working extension, Go backend and container sandbox, shown end to end in a recorded demo.',
      'Runs locally: the backend, the containers and the browsing stay on your machine — only the URL goes to VirusTotal.',
      'Built with Vincent Samuel Paul; the repository lives on his GitHub.'
    ],
    printout: {
      figure: '03',
      caption: 'a link, opened safely',
      stamp: 'boxed, not clicked',
      mark: 'fan',
      lines: [
        { kind: 'cmd', text: 'POST /session  url=hxxp://inv0ice.co' },
        { kind: 'dim', label: 'scan', text: 'virustotal · 7 / 72 vendors' },
        { kind: 'out', label: 'risk', text: 'HIGH  (threshold 5%)' },
        { kind: 'dim', label: 'user', text: 'proceed anyway' },
        { kind: 'out', label: 'sandbox', text: 'firefox container · :5800' },
        { kind: 'hot', label: '→', text: 'ended · container removed' }
      ]
    }
  },
  {
    slug: 'behaviorvault',
    title: 'BehaviorVault 2.0',
    year: '2026',
    category: 'ML / security',
    tech: ['Python', 'scikit-learn', 'TensorFlow Lite', 'FastAPI', 'Docker', 'Cloudflare'],
    summary: 'A second, silent login — behavioural biometrics scored all session long.',
    links: {
      github: 'https://github.com/shashwathv/Behaviour-Vault',
      demo: 'https://drive.google.com/file/d/10zEj51U0DaI2REGVXIlrllYOLCUvMClq/view?usp=drive_link'
    },
    problem:
      'Mobile banking checks who you are at the login screen — password, OTP, 2FA — and once someone is past that, nothing is watching. BehaviorVault keeps authenticating for the whole session, from how the user types, presses, swipes, scrolls and holds the phone, without asking them for anything.',
    features: [
      {
        title: 'Five behavioural signals',
        body: 'Keystroke timing, touch pressure, swipe velocity, scroll rhythm and accelerometer variance, scored continuously in the background.'
      },
      {
        title: 'Three threats told apart',
        body: 'Someone else on the device, the real user under duress — shaky, hesitant input — and bots injecting input with inhumanly even timing.'
      },
      {
        title: 'A baseline for each user',
        body: 'After three sessions, a personal EWMA baseline outweighs the global model 70 to 30, so scoring follows the person rather than the average.'
      },
      {
        title: 'A 3KB model for the phone',
        body: 'The Isolation Forest is distilled into a 3KB TensorFlow Lite model, so scoring can run on the device without raw behaviour leaving it.'
      }
    ],
    architecture: [
      { label: 'App', note: 'React Native' },
      { label: 'Backend', note: 'Node.js · HMAC' },
      { label: 'Edge', note: 'Cloudflare Zero Trust' },
      { label: 'Inference', note: 'FastAPI' },
      { label: 'Score', note: 'global + EWMA' }
    ],
    decisions: [
      {
        decision: 'Isolation Forest, trained on normal sessions only.',
        why: 'A bank launching this has no labelled attack data. An unsupervised model learns what normal looks like and flags whatever is quick to isolate from it.'
      },
      {
        decision: 'Distil to TFLite rather than ship scikit-learn.',
        why: 'scikit-learn doesn’t run on a phone. Labelling 50,000 points with the forest and training a 16→8→1 network on them gave a 3KB model that agrees with it about 97% of the time.'
      },
      {
        decision: 'Freeze a baseline only on severe anomalies.',
        why: 'Freezing on every anomaly locked real users out after one odd session. Now only scores above 0.95 freeze it, so baselines keep adapting while attack-like sessions are still blocked.'
      }
    ],
    outcome: [
      'AUC-ROC 1.0 and 100% anomaly recall on the synthetic test set, at a 5% false-positive rate.',
      '3KB on-device model — about 10ms per inference, about 97% agreement with the full Isolation Forest.',
      'Self-hosted on a homelab behind Cloudflare Tunnel and Zero Trust, with an Android build and an admin dashboard.',
      'Built with Shashank G Yaplar, who made the app, backend and dashboard; I built the ML, the API and the infrastructure.'
    ],
    printout: {
      figure: '04',
      caption: 'a session, scored',
      stamp: '3 kb, on device',
      mark: 'trace',
      lines: [
        { kind: 'cmd', text: 'POST /predict  user=demo' },
        { kind: 'dim', label: 'signals', text: 'keys, press, swipe, scroll, tilt' },
        { kind: 'out', label: 'baseline', text: 'ewma α 0.15 · session 12' },
        { kind: 'out', label: 'scores', text: 'global 0.08 · personal 0.04' },
        { kind: 'out', label: 'combined', text: '0.05  → NORMAL' },
        { kind: 'hot', label: '→', text: 'verdict: same user' }
      ]
    }
  },
  {
    slug: 'kanzen',
    title: 'KanZen',
    year: '2024',
    category: 'AI / computer vision',
    tech: ['Python', 'Gemini 2.5 Flash', 'SudachiPy', 'FastAPI', 'AWS S3', 'genanki'],
    summary: 'Photograph a page of kanji study material, get back an Anki deck.',
    links: {
      github: 'https://github.com/shashwathv/KanZen',
      demo: 'https://kanzen.nw-right.dev/'
    },
    problem:
      'Kanji study sheets are already organised — the kanji, its readings, its meaning — but getting them into Anki means retyping every entry by hand. KanZen reads the page and hands back a deck. The trick is knowing what to leave out: stroke-order diagrams, practice boxes and margin notes aren’t cards.',
    features: [
      {
        title: 'Reads the page, not just the text',
        body: 'Gemini 2.5 Flash tells study content apart from stroke-order diagrams, practice boxes and decoration, and returns structured JSON instead of raw OCR.'
      },
      {
        title: 'Readings checked against a dictionary',
        body: 'Every extracted reading is validated with SudachiPy, so the model’s mistakes are caught before they turn into cards.'
      },
      {
        title: 'A deck, ready to import',
        body: 'genanki builds a standard .apkg — kanji, meaning, on-yomi, kun-yomi and an example sentence — for Anki, AnkiDroid and AnkiMobile.'
      },
      {
        title: 'CLI or API',
        body: 'Run one command locally, or post an image to the FastAPI service and collect the deck from a presigned S3 link.'
      }
    ],
    architecture: [
      { label: 'Photo', note: 'JPG · PNG · HEIC' },
      { label: 'Read', note: 'Gemini 2.5 Flash' },
      { label: 'Validate', note: 'SudachiPy' },
      { label: 'Build', note: 'genanki' },
      { label: 'Deck', note: '.apkg → S3' }
    ],
    decisions: [
      {
        decision: 'A vision model instead of OCR.',
        why: 'Plain OCR reads everything on the page, stroke-order numbers included. A multimodal model understands the layout and pulls out only what belongs on a card.'
      },
      {
        decision: 'Check the model against a dictionary.',
        why: 'Multimodal models still invent readings. Validating each one with SudachiPy turns a fluent guess into a card you can trust.'
      },
      {
        decision: 'Stateless, with work off the request.',
        why: 'Each request stands alone and runs in a worker thread, with backoff on 429s and 503s, and temporary files are deleted afterwards — so the API stays responsive and leaves nothing behind.'
      }
    ],
    outcome: [
      'One command turns a photographed study sheet into an importable deck.',
      'Decks open in Anki Desktop, AnkiDroid, AnkiMobile and AnkiWeb.',
      'Runs as a CLI or as a FastAPI service with S3 delivery.'
    ],
    printout: {
      figure: '05',
      caption: 'page in, deck out',
      stamp: 'photo → deck',
      mark: 'cards',
      lines: [
        { kind: 'cmd', text: 'kanzen sheet.jpg -o n4.apkg' },
        { kind: 'out', label: 'read', text: 'gemini 2.5 flash · 1 page' },
        { kind: 'dim', label: 'skipped', text: 'stroke order · practice boxes' },
        { kind: 'out', label: 'checked', text: 'sudachipy · 24 / 24 readings' },
        { kind: 'out', label: 'deck', text: 'genanki · 24 cards' },
        { kind: 'hot', label: '→', text: 'n4.apkg' }
      ]
    }
  },
  {
    slug: 'agribot',
    title: 'AgriBot',
    year: '2026',
    category: 'IoT · Research',
    tech: ['Python', 'IoT', 'MQTT', 'LLM API'],
    summary: 'LLM-guided soil monitoring. Published IEEE ICAECT 2026.',
    links: {
      paper: 'https://ieeexplore.ieee.org/document/11426073'
    },
    problem:
      'Smallholder farmers irrigate by intuition. Soil conditions shift faster than weekly checks catch — and most can’t afford a smartphone.',
    features: [
      {
        title: 'Soil Sensor Array',
        body: 'Monitors moisture, temperature, pH, and NPK levels at configurable intervals. Readings published over MQTT for low-power operation.'
      },
      {
        title: 'LLM Advice Engine',
        body: 'Python pipeline detects threshold crossings and sends readings to an LLM, which returns plain-language irrigation advice in the local language.'
      },
      {
        title: 'SMS Delivery',
        body: 'Advice delivered via basic SMS — no internet or smartphone required. Reaches every farmer regardless of device.'
      },
      {
        title: 'Published Research',
        body: 'The system design, field results, and architecture were peer-reviewed and published in IEEE ICAECT 2026.'
      }
    ],
    architecture: [
      { label: 'Sensors', note: 'soil · pH · NPK' },
      { label: 'MQTT', note: 'broker' },
      { label: 'Pipeline', note: 'Python · thresholds' },
      { label: 'LLM', note: 'interpret' },
      { label: 'SMS', note: 'delivery' }
    ],
    decisions: [
      {
        decision: 'LLM as interpretation only.',
        why: 'Thresholds are deterministic and auditable. The LLM translates them into plain-language advice for the specific crop and region — nothing more.'
      },
      {
        decision: 'SMS over app.',
        why: 'A basic phone reaching every farmer beats a smart app reaching some. The constraint made the system more useful.'
      }
    ],
    outcome: [
      'Published in IEEE ICAECT 2026 — “AgriBot: An LLM-Guided IoT System for Real-Time Soil Monitoring.”'
    ],
    printout: {
      figure: '06',
      caption: 'soil to sms',
      stamp: 'sms, not an app',
      mark: 'sprout',
      lines: [
        { kind: 'cmd', text: 'agribot watch field-07' },
        { kind: 'dim', label: 'mqtt', text: 'soil/field-07 · every 15 min' },
        { kind: 'out', label: 'moisture', text: '18%  (threshold 25%)' },
        { kind: 'out', label: 'crossed', text: 'moisture low → llm' },
        { kind: 'out', label: 'advice', text: 'plain language · local' },
        { kind: 'hot', label: '→', text: 'sms sent · basic phone' }
      ]
    }
  }
];

export default projects;
