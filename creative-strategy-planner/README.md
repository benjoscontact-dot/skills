# Creative Strategy Planner

A single-page app for planning a month of Meta video ads across info products and
physical products. Drag concepts into a weekly grid by creator swimlane, auto-suggest
a starting plan, and validate the 50/30/20 iteration strategy in real time.

Built from the Lovable spec, but **static-first**: it runs entirely in the browser
with seed data and `localStorage` persistence — no backend to provision, so you can
host it in minutes. (Supabase auth + DB + edge functions can be layered in later;
see "Going to Supabase" below.)

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- @dnd-kit/core for drag & drop
- Zustand (persisted to `localStorage`)
- date-fns, Tabler Icons

## Run locally

```bash
cd creative-strategy-planner
npm install
npm run dev          # http://localhost:5173
```

Build a production bundle:

```bash
npm run build        # outputs to dist/
npm run preview      # preview the production build
```

## Deploy to Vercel (fastest path)

This is a static Vite app, so Vercel needs zero config. Two ways:

### A. From the dashboard (no CLI)
1. Push this repo to GitHub (already done if you're reading this on the branch).
2. Go to https://vercel.com/new and import the repository.
3. When Vercel asks, set **Root Directory** to `creative-strategy-planner`.
   It auto-detects Vite: Build = `npm run build`, Output = `dist`.
4. Click **Deploy**. You get a live URL in ~1 minute. Every push redeploys.

### B. From the CLI
```bash
npm i -g vercel
cd creative-strategy-planner
vercel            # follow prompts; accept the detected Vite settings
vercel --prod     # promote to production
```

Routing uses a hash router (`/#/plan/...`), so no rewrite config is needed on any
static host. `vercel.json` is included as a harmless belt-and-braces rewrite.

> Other hosts work identically: Netlify (build `npm run build`, publish `dist`),
> Cloudflare Pages, or GitHub Pages (set Vite `base` to the repo name first).

## How it works

- **Dashboard** (`/`) — past month plans, yearly stats, "Plan next month".
- **Planner** (`/plan/:month`) — the main screen:
  - **Setup zone**: events, per-creator weekly availability, product priorities.
  - **Generate plan** runs `generatePlan()` from `src/lib/autoSuggest.ts`.
  - **Grid**: creator swimlanes × weeks. Drag concepts from the library (press `L`)
    into cells; drag cells to move/reassign. Blocked drops (creator can't film that
    product, or capacity full) flash a message.
  - **Validator** (right) runs `validatePlan()` live: 50/30/20 ratios, hook diversity,
    product weighting, format variety.
  - **Backup row**: one no-film concept per week.
  - **Action bar**: share-for-review and push-to-Asana/Notion/Slack are stubs in v1.
- **Settings** (`/settings`) — edit products, creators, view hook types, reset to seed.

All state lives in `localStorage` under `csp-store-v1`. "Reset to seed data" in
Settings restores the original products/creators/concepts.

## Going to Supabase (Phase 2)

The original `schema.sql` and the Lovable prompt target Supabase. To migrate:
1. Create a Supabase project, run `schema.sql` in the SQL editor.
2. Swap the Zustand persistence in `src/lib/store.ts` for Supabase queries.
3. Add `@supabase/supabase-js`, wire email/password auth, and implement the three
   edge function stubs (`sync-asana`, `sync-notion`, `notify-slack`).

The domain logic (`autoSuggest.ts`) is backend-agnostic and works unchanged.
