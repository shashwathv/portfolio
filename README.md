# Portfolio — Shashwath V

Personal portfolio, live at [portfolio.nw-right.dev](https://portfolio.nw-right.dev/). A riso-print zine — newsprint stock, deep press-blue board, two ink drums — built with React 19 + Vite (rolldown), over a halftone background drawn in raw WebGL.

## Stack

- **React 19** + **Vite** (`rolldown-vite`)
- Plain CSS, no framework — all styling and design tokens in `src/styles.css`
- Raw WebGL, no 3D library — the background is one fragment shader (`src/components/background/Halftone.jsx`)
- **Formspree** — contact form backend
- Self-hosted via Coolify behind Cloudflare Tunnel

## Structure

```
src/
├── App.jsx
├── main.jsx
├── styles.css              # all styling + design tokens
├── hooks/
│   ├── useReveal.js        # IntersectionObserver scroll reveals
│   └── useScrollSpy.js     # active nav section tracking
└── components/
    ├── Reveal.jsx          # reveal-on-scroll wrapper
    ├── Navigation.jsx      # left spine; folds to a top bar + sheet on mobile
    ├── ScrollProgress.jsx
    ├── Hero.jsx
    ├── About.jsx
    ├── Work.jsx
    ├── ProjectSchematic.jsx  # the path one job takes through a project
    ├── Skills.jsx
    ├── Contact.jsx
    ├── Footer.jsx
    └── background/
        ├── Background.jsx    # lazy-loads Halftone, plus the left-gutter scrim
        ├── Background.css
        └── Halftone.jsx      # WebGL halftone board
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run lint
```

Requires Node ≥ 22.12 (pinned in `.node-version`).

## Notes

- The page scrolls inside `#root` (a 1px-inset frame), so any scroll observers must use it as their root — see the hooks.
- `useScrollSpy` deliberately measures against a fixed line rather than using an IntersectionObserver; the hook's comment records both ways the observer version failed.
- Animations respect `prefers-reduced-motion`; the WebGL background is skipped entirely when it's set, and the CSS board shows through.
- The two ink drums each carry one value per substrate — a spot colour on the dark board and the same colour on newsprint are not the same colour to read against. The table in `src/styles.css` says which to reach for.
- The email address is never a single string in the source, the bundle, or the DOM until someone asks for it (`Contact.jsx`).
- Deployment is configured in Coolify, not in this repo — there is no CI config here.
