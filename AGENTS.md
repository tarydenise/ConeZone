
# AGENTS.md

Project: ConeZone, a job board for a traffic control company (Bakeoff 2: Astro static prototype).

## Stack

- Astro with **static output only**. Do not use server output, adapters, API routes, Astro Actions, or `@supabase/ssr`.
- Interactive parts are **Svelte 5 islands** (through Astro's Svelte integration). Use runes (`$state`, `$derived`, `$props`). Never use `export let`.
- JavaScript, not TypeScript.
- Supabase (`@supabase/supabase-js`) runs in the browser for login and data.
- Plain CSS. No UI libraries.

## Rules

- Security lives in the database: every table has Row Level Security. Role checks in page code only hide or redirect.
- Only the public Supabase URL and public key go in the browser. Never use or commit the service role key.
- Job pages use a query string (for example `/jobs/view?id=5`), since static pages cannot be made for every id.
- Follow `docs/BAKEOFF_2_PLAN.md` and the feature plans in `docs/plans/`. Implement only what is asked.
- Do not add dependencies without asking.
- Keep changes small.
- Never commit `.env`.
- F6 (jobs) is a learning feature: explain and give small examples instead of writing the whole feature.

## Shared values

- Roles: `admin`, `dispatcher`, `supervisor`, `field_worker`.
- Job statuses: `open`, `staffed`, `in_progress`, `completed`, `cancelled`.
