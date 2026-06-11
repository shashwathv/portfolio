# Portfolio — Shashwath V

Personal portfolio, live at [portfolio.nw-right.dev](https://portfolio.nw-right.dev/). Dark, editorial, minimal — built with React 19 + Vite (rolldown), with a WebGL beams background rendered via React Three Fiber.

## Stack

- **React 19** + **Vite** (`rolldown-vite`)
- **Three.js / @react-three/fiber** — animated shader background (`src/components/background/`)
- Plain CSS, no framework — design tokens in `src/styles.css`
- **Formspree** — contact form backend
- Self-hosted via Coolify behind Cloudflare Tunnel

## Structure

```
src/
├── App.jsx
├── main.jsx
├── styles.css            # all styling + design tokens
├── hooks/
│   ├── useReveal.js      # IntersectionObserver scroll reveals
│   ├── useScrollSpy.js   # active nav section tracking
│   └── useLocalTime.js   # live IST clock
└── components/
    ├── Reveal.jsx        # reveal-on-scroll wrapper
    ├── Navigation.jsx
    ├── Hero.jsx
    ├── About.jsx
    ├── Work.jsx
    ├── Skills.jsx
    ├── Contact.jsx
    ├── Footer.jsx
    └── background/
        ├── Background.jsx  # lazy-loads Beams, reduced-motion fallback
        ├── Beams.jsx       # WebGL shader scene
        └── Beams.css
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run lint
```

Requires Node ≥ 22.12.

## Notes

- The page scrolls inside `#root` (a 1px-inset frame), so any scroll observers must use it as their root — see the hooks.
- Animations respect `prefers-reduced-motion`; the WebGL background is skipped entirely when it's set.
