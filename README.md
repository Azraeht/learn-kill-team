# Kill Team Trainer

A gamified, offline-friendly quiz app for learning Warhammer 40,000 Kill Team
rules on your phone. Study cards with streaks and scoring, spaced repetition
so the rules you keep missing come back sooner, and per-category progress
tracking — all in a static site with no backend, installable as a PWA.

**⚠️ Content status:** the question bank currently ships with a small set of
placeholder questions, each clearly flagged `DRAFT — unverified` in the app.
They exist to exercise the UI, not to teach correct rules. See
[CONTENT.md](./CONTENT.md) for how to add real, verified questions.

## Stack

Vite + vanilla TypeScript + plain CSS, `vite-plugin-pwa` for the offline
service worker/manifest, `ajv` for validating the question bank, `vitest` for
unit tests. No UI framework, no backend — the whole app is static files.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL on your phone (same Wi-Fi) or in a browser at a
mobile viewport size to try the touch-friendly card UI.

Other scripts:

```bash
npm run validate-content   # schema-validate the question bank (also runs in CI)
npm test                   # run unit tests (SRS scheduler, session engine, validator)
npm run build               # type-check + production build to dist/
npm run preview             # serve the production build locally
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which validates the
question bank, runs tests, builds, and deploys `dist/` to GitHub Pages.

One-time setup in the repo on GitHub: **Settings → Pages → Source: GitHub
Actions**. After that, every push to `main` auto-deploys.

The site is built with `base: '/learn-kill-team/'` in `vite.config.ts` to
match this repo's GitHub Pages project-page URL
(`https://<your-username>.github.io/learn-kill-team/`). If you fork this
under a different repo name, update `base` (or set the `BASE_URL` env var)
to match.

## How it works

- **Categories**: Core Rules, Terrain & Missions, and the Angels of Death
  kill team (see `src/data/categories.ts`).
- **Spaced repetition**: each question tracks a Leitner "box" (0–5) and an
  ease factor; answering correctly pushes it further out, answering
  incorrectly drops it back so it resurfaces sooner. See `src/core/srs.ts`.
- **Gamification**: session score and streak are a lightweight motivational
  layer on top of the persistent SRS state — see `src/core/sessionEngine.ts`.
- **Progress**: stored in your browser's `localStorage` only — nothing is
  sent to a server. Clearing site data resets your progress.
- **Offline**: the app shell and question data are precached by the service
  worker, so it keeps working mid-game with no signal.

## Adding or fixing questions

See [CONTENT.md](./CONTENT.md).
