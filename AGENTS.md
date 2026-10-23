
# ConeZone: Instructions for AI Tools

ConeZone is a job board and crew communication app for a traffic control company. This is a PROTOTYPE built for a two-week bakeoff. Keep things simple.

## Stack

SvelteKit (Svelte 5), JavaScript, PostgreSQL with Drizzle ORM, Better Auth, plain CSS. Do not add other dependencies without asking.

## Rules

- Use Svelte 5 runes syntax ($state, $derived, $props). Never use `export let` or the old `$:` syntax.
- Use scoped CSS inside Svelte components. No Tailwind or UI libraries.
- Use SvelteKit form actions for forms and `hooks.server.js` for the session.
- Check roles on the server for every protected page and action. UI hiding is not security.
- Follow the plan in docs/plans for the feature being built. Do not add features that are not in the plan.
- Keep changes small. Change only the files needed for the task.
- Never commit secrets. Use `.env`.

## Roles

admin, dispatcher, supervisor, field_worker

## Job statuses

open, staffed, in_progress, completed, cancelled
