# Portfolio — Shashwath V

Personal portfolio, live at [portfolio.nw-right.dev](https://portfolio.nw-right.dev/). A riso-print zine — warm newsprint on a warm charcoal board, two ink drums (Copper and Sea Foam) — built with React 19 + Vite (rolldown), with a tracer behind it spelling out, cell by cell, what it knows about you.

## Stack

- **React 19** + **Vite** (`rolldown-vite`)
- Plain CSS, no framework — all styling and design tokens in `src/styles.css`
- Canvas 2D, no library — a few ants have the whole page as their ground. They roam it, write captioned words in a 5×7 pixel font wherever there's room, leave them, and take down each other's once the author has walked away: first your OS or browser, then a shuffled pool of your screen, the time, the day, and the stack (`src/components/background/`). The reading — every heading, paragraph, button, figure, form — is measured and marked off first; nothing is ever written over it. Three ants to start; one more is deployed, where you're looking, for each screen of depth you scroll, up to six. Ink sits in tiles set into the document, so it scrolls with the copy. Everything the ants use is read locally and never sent anywhere.
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
    ├── ProjectPrintout.jsx   # a project's sample run, on tractor-feed paper
    ├── Skills.jsx
    ├── Contact.jsx
    ├── Footer.jsx
    └── background/
        ├── Background.jsx    # the fixed board, and the Tracer
        ├── Background.css
        ├── Tracer.jsx        # measures the reading, tiles the page, moves the ants
        └── tracing.js        # font, message pool, the board, a worker and the colony (no DOM; runs in Node)
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
- Animations respect `prefers-reduced-motion`; the first message is drawn complete on the hero as a static print, with no ants.
- The two ink drums each carry one value per substrate — a spot colour on the dark board and the same colour on newsprint are not the same colour to read against. The table in `src/styles.css` says which to reach for.
- The email address is never a single string in the source, the bundle, or the DOM until someone asks for it (`Contact.jsx`).
- Deployment is configured in Coolify, not in this repo — there is no CI config here.
