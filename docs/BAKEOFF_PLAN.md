# ConeZone Bakeoff 1 Plan: SvelteKit Prototype

**Branch:** `bakeoff-1` (or the name you used)
**Source documents:** [Project specification](SPEC.md), [feature plans](plans/README.md), [feature inventory](feature-inventory.md)

## 1. Goal

We are building a **working prototype**, not a finished product. The prototype shows that ConeZone's core idea works: a dispatcher can post a job, assign workers to it, and each worker can log in on a phone and see only their own jobs.

There are two goals, in this order:

1. **Primary:** a working prototype of the core features, built quickly with help from AI code generation.
2. **Secondary:** learn SvelteKit well enough to judge it fairly against the other stacks we try later.

**Prototype means:** it works for the main path, it handles obvious errors, and it looks decent on a phone and a desktop. It does not mean polished, fully tested, or ready for real customers. When something is hard, we choose the simplest version that still demonstrates the feature.

## 2. Technology Stack

| Piece          | Choice                                                           | Notes                                                          |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Meta framework | **SvelteKit** (Svelte 5, runes syntax)                     | File-based routing, server-side rendering, form actions, hooks |
| Language       | JavaScript                                                       | TypeScript is optional later                                   |
| Database       | **PostgreSQL**, hosted on Neon or Supabase (database only) | One shared database for the team                               |
| Data access    | **Drizzle ORM**                                            | Schema written from the Data Model sections of the plans       |
| Authentication | **Better Auth** (email and password)                       | Roles stored on the user                                       |
| Styling        | Plain CSS in Svelte scoped styles                                | Mobile first. No UI library.                                   |
| Testing        | Vitest (logic), Playwright (a few end-to-end checks)             | Prototype level only                                           |
| Deployment     | Node adapter, hosted later on Render, Railway, or Fly.io         | Not required to start                                          |

**Rule:** do not add other dependencies without writing down why in this file. AI tools like to add libraries we do not need.

## 3. Scope

### In scope (core features, using the existing plans)

| Feature                            | Plan                                      | Prototype version                                                                            |
| ---------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| F1 Auth basics                     | [F1](plans/F1-auth-basics.md)              | Sign up, log in, log out, current user, protected pages                                      |
| F2 Role enforcement                | [F2](plans/F2-rbac-enforcement.md)         | One permissions file, a role check on every route, access denied page                        |
| F4 App shell and responsive layout | [F4](plans/F4-app-shell-responsive-nav.md) | Shared layout, role-based navigation, loading, empty, and error displays                     |
| F6 Job CRUD and status             | [F6](plans/F6-job-crud.md)                 | Create, list, view, edit, cancel, and delete jobs; status rules; overnight times             |
| F7 Assignments and My Jobs         | [F7](plans/F7-job-assignments-staffing.md) | Assign and remove workers, staffed count, automatic Open/Staffed status, My Jobs for workers |

### Simplified for the prototype

- **F3 Admin user management:** skipped as a screen. A **seed script** creates one user per role (Admin, Dispatcher, Supervisor, Field Worker). Role change through the UI is a stretch task.
- **F6 list:** a plain list sorted by date. Search and filters (F8) are not included.

### Out of scope for this bakeoff

Messaging (F9), check-in (F10), announcements (F11), profile editing (F5), search and filters (F8), real-time updates, notifications, offline support, and anything in the additional features list. The plans for these already exist and will be used in a later bakeoff or phase.

## 4. Learning Goals (SvelteKit)

By the end I should be able to explain, in my own words, how each of these works in the project:

- [ ] File-based routing and nested layouts (`+page.svelte`, `+layout.svelte`)
- [ ] Loading data on the server (`+page.server.js` load functions)
- [ ] Form actions and validation errors (`actions` and `use:enhance`)
- [ ] Hooks (`hooks.server.js`) for reading the session and attaching the user's role
- [ ] API-style endpoints (`+server.js`) if we need any
- [ ] Svelte 5 runes (`$state`, `$derived`, `$props`)
- [ ] How the framework renders pages on the server and then on the client

## 5. How We Will Use AI

- **Project instructions:** create an `AGENTS.md` at the repo root saying: use Svelte 5 runes syntax (never `export let`), use JavaScript, use plain CSS, do not add dependencies without asking, follow the folder structure, and keep changes small.
- **Spec first:** every prompt points to the matching feature plan (for example, "Implement F6 FR-1 to FR-4 only").
- **Slice by slice:** one small task per prompt (schema, then route, then page, then validation).
- **Show a pattern:** after the first page is built, paste a short example of it into later prompts so the code stays consistent.
- **Review every output:** read before running, check it against the plan's acceptance criteria, and ask AI to explain anything unfamiliar.
- **One chat per task:** start a new chat for each feature to keep context small.
- **Log it:** keep a short AI log (see Section 9) of what worked, what I had to fix, and how many tries it took. This feeds the stack report.

## 5a. Suggested Folder Structure

```
src/
  lib/
    server/        database connection, schema, auth setup, permissions, time helper
    components/    shared pieces (Loading, Empty, Error, JobCard, CrewList)
  routes/
    (auth)/        login, signup
    (app)/         everything behind login, with the shared layout
      jobs/        list, new, [id], [id]/edit
      my-jobs/
  hooks.server.js  reads the session, attaches the user and role
scripts/seed.js    creates sample users (one per role) and sample jobs
docs/              spec, plans, this file
```

## 6. Task List (Two Weeks)

### Day 0: Setup

- [X] Create the `bakeoff-1` branch from `main` and confirm the spec is in `docs/`
- [X] Create the SvelteKit project in the repo (or a subfolder) and run it locally
- [X] Create the Neon or Supabase database and add the connection string to a local `.env` (never commit it)
- [X] Add `.env` to `.gitignore` and add a `.env.example` with placeholder names
- [X] Write `AGENTS.md` (Section 5)
- [X] Add setup steps to the README (install, environment variables, run, seed)
- [X] Commit and push

### Week 1: Foundations

**Days 1 to 2: F1 Auth**

- [X] Add Drizzle and write the User table (fields from F1 Data Model)
- [X] Add Better Auth with email and password; store the role on the user (default Field Worker)
- [ ] Build Sign Up and Log In pages with validation errors (form actions)
- [ ] Add log out
- [X] Read the session in `hooks.server.js` and redirect logged-out visitors to Login
- [ ] Write `scripts/seed.js` to create one user per role
- [ ] Check F1 acceptance criteria AC-1 to AC-11 by hand; write Vitest tests for the password and email rules

**Day 3: F2 Role enforcement**

- [ ] Create the permissions file (role to allowed actions)
- [ ] Create `requireRole` and `requireJobMember` helpers used by every protected page and form action
- [ ] Attach the stored role to every request in the hook
- [ ] Build the access denied page
- [ ] Check F2 acceptance criteria (a Field Worker cannot reach the New Job page or its action)

**Days 4 to 5: F4 App shell**

- [ ] Build the shared layout: header with name, role, and Log out
- [ ] Role-based navigation (top bar on desktop, bottom tabs for workers on phones, menu button for Dispatcher and Admin on phones)
- [ ] Build shared Loading, Empty, and Error components
- [ ] Add the not-found page
- [ ] Check layouts at 375 px and 1280 px
- [ ] **Week 1 checkpoint:** log in as each seeded role and see the correct navigation. Commit and push.

### Week 2: Core Features

**Days 6 to 8: F6 Jobs**

- [ ] Write the Job table (fields from F6 Data Model) and add sample jobs to the seed script
- [ ] Write the shared time helper (overnight jobs end the next day) with Vitest tests
- [ ] Job list page (all jobs for Dispatcher and Admin, sorted by date and start time)
- [ ] New job and Edit job forms with server-side validation
- [ ] Job detail page
- [ ] Status changes with the transition rules (Cancel, In Progress, Completed)
- [ ] Delete with a confirmation
- [ ] Check F6 acceptance criteria AC-1 to AC-12

**Days 9 to 10: F7 Assignments and My Jobs**

- [ ] Write the Assignment table (fields from F7 Data Model)
- [ ] Assign dialog: pick users, enforce open spots and no duplicates
- [ ] Crew list on the job detail page with remove
- [ ] Staffed count and automatic Open/Staffed status
- [ ] My Jobs page for Field Worker and Supervisor (only their jobs)
- [ ] Return not-found for jobs a worker is not assigned to
- [ ] Check the main F7 acceptance criteria (AC-1 to AC-9, AC-14)

**Days 11 to 12: Stretch and cleanup (only if on schedule)**

- [ ] Role change screen for Admin (small slice of F3)
- [ ] Mark Supervisor as the job supervisor
- [ ] Better error messages and empty states

**Days 13 to 14: Finish**

- [ ] Fix bugs found while running the demo script (Section 8)
- [ ] Add a few Playwright checks for login and job creation
- [ ] Complete the README (description, team, setup, API documentation, known issues)
- [ ] Deploy if time allows (the course may only need the branch link)
- [ ] Fill in the stack report notes (Section 9)
- [ ] Final commit, push, and submit

## 7. Cut List

If we fall behind, drop things in this order:

1. Stretch tasks (days 11 to 12)
2. Playwright tests (keep Vitest)
3. Supervisor flag and My Jobs polish
4. Deployment (submit the branch link only)

**Never cut:** login, role checks, job create and view, responsive layout.

## 8. Demo Script (Definition of Done)

The prototype is done when this works on a phone-size window and a desktop window:

1. Log in as the seeded Dispatcher and create a job needing 2 workers. It shows as Open, "0 / 2."
2. Assign two workers. The job shows "2 / 2" and becomes Staffed.
3. Log out and log in as an assigned Field Worker on a phone-size window. My Jobs shows only that worker's job.
4. As that worker, try to open the New Job page. The access denied screen appears.
5. As the Dispatcher, cancel the job. It stays in the list marked Cancelled.
6. Submit an invalid job (missing title). A clear error message appears.

## 9. Stack Report Notes (for "Evaluate New Stack")

Fill this in as we go so the report is easy to write at the end.

| Measure                                             | Notes |
| --------------------------------------------------- | ----- |
| Time to a working login                             |       |
| Time to job create, edit, and list                  |       |
| Number of dependencies installed                    |       |
| Lines of code (rough)                               |       |
| Dev server start time                               |       |
| Learning curve: what was easy                       |       |
| Learning curve: what was confusing                  |       |
| How well AI generated SvelteKit code (fixes needed) |       |
| Would I use this stack again for ConeZone? Why?     |       |

**AI log (add a line per task):** task, what I asked, what worked, what I fixed.

## 10. Risks

| Risk                                                | Mitigation                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| AI writes old Svelte syntax or adds extra libraries | `AGENTS.md` rules; review every diff                                           |
| Auth setup takes longer than expected               | Follow Better Auth's SvelteKit guide exactly; do not customize until login works |
| Database setup problems block the team              | Shared hosted database; `.env.example`; seed script                            |
| Too much scope                                      | Core features only; cut list in Section 7                                        |
| Overnight and time logic bugs                       | One shared time helper with tests                                                |
