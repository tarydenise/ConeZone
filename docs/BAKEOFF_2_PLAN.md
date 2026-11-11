# ConeZone Bakeoff 2 Plan: Astro (Static) Prototype

**Branch:** `bakeoff-2`
**Source documents:** [Project specification](SPEC.md), [feature plans](plans/README.md), [feature inventory](feature-inventory.md)

## 1. Goal

We are building a **working prototype** that shows that ConeZone's core idea works: a dispatcher can post a job, assign workers to it, and each worker can log in on a phone and see only their own jobs.

This bakeoff uses a **static rendering architecture**. Pages are built once, ahead of time, as plain HTML. The interactive parts are small **islands** that run in the browser and talk to the database directly. There is no app server of our own.

There are two goals, in this order:

1. **Primary:** a working prototype of the core features.
2. **Secondary:** learn Astro well enough to judge it fairly against SvelteKit (Bakeoff 1). At least one feature is built by hand with AI in the backseat (Section 5).

**Prototype means:** it works for the main path, it handles obvious errors, and it looks decent on a phone and a desktop. It does not mean polished, fully tested, or ready for real customers. When something is hard, we choose the simplest version that still demonstrates the feature.

## 2. Technology Stack

| Piece          | Choice                                                                | Notes                                                     |
| -------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| Framework      | **Astro**, static output                                        | Pages are built to HTML at build time                     |
| Islands        | **Svelte 5** components through Astro's Svelte integration      | Only the interactive parts load JavaScript                |
| Language       | JavaScript                                                            |                                                           |
| Authentication | **Supabase Auth** (email and password)                          | Runs in the browser with the Supabase JavaScript library  |
| Database       | **Supabase** (PostgreSQL)                                       | Tables written in SQL and saved in the repo               |
| Access control | Supabase **Row Level Security** policies and database functions | The database enforces roles, since there is no app server |
| Styling        | Plain CSS                                                             | Mobile first. No UI library.                              |
| Testing        | Vitest for logic                                                      | Prototype level only                                      |
| Hosting        | A static host (for example Netlify)                                   | Gives the live demo URL                                   |

**Rule:** do not add other dependencies without writing down why in this file.

## 3. How Static Rendering Changes the Design

- **Pages do not know who is logged in.** They are built before anyone visits. Each page's island checks the login session in the browser and then loads that user's data.
- **Security lives in the database.** Anyone can read or change code that runs in the browser, so role checks in page code are only for convenience (hiding buttons, redirecting). The real rules are Row Level Security policies and database functions in Supabase. The public Supabase key is safe in the browser only because those policies are in place.
- **Job pages use a query string.** A static build cannot make a page for every job id ahead of time, so the job detail page is one page that reads the id from the address, for example `/jobs/view?id=5`.
- **Multi-step changes run in the database.** Assigning a worker and updating the job's Open/Staffed status must happen together, so that logic is a database function instead of server code.

## 4. Scope

Same core features as Bakeoff 1, so the two stacks can be compared fairly.

| Feature                            | Plan                                      | Prototype version                                                                 | Built by                      |
| ---------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| F1 Auth basics                     | [F1](plans/F1-auth-basics.md)              | Sign up, log in, log out, current user, protected pages                           | AI-assisted                   |
| F2 Role enforcement                | [F2](plans/F2-rbac-enforcement.md)         | Role on each user's profile, Row Level Security per role, access denied view      | AI-assisted                   |
| F4 App shell and responsive layout | [F4](plans/F4-app-shell-responsive-nav.md) | Shared layout, role-based navigation, loading, empty, and error displays          | AI-assisted                   |
| F6 Job CRUD and status             | [F6](plans/F6-job-crud.md)                 | Create, list, view, edit, status changes, and delete; validation; overnight times | **By hand** (Section 5) |
| F7 Assignments and My Jobs         | [F7](plans/F7-job-assignments-staffing.md) | Assign and remove workers, staffed count, automatic Open/Staffed status, My Jobs  | AI-assisted                   |

### Simplified for the prototype

- **F3 Admin user management:** no screen. One user per role is created in the Supabase dashboard, and their roles are set with SQL.
- **F6:** only Dispatchers and Admins change a job's status. Without the job supervisor flag, the Supervisor status rules in F6 (FR-7, AC-7) are not included.
- **F7:** the job supervisor flag is not included.

### Out of scope

Profile (F5), search and filters (F8), messaging (F9), check-in (F10), announcements (F11), real-time updates, notifications, and offline support.

### Assignment minimum requirements

| Requirement                                    | Covered by                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| User authentication (sign up, log in, log out) | F1                                                                           |
| A main feature that is the core of the project | F6 and F7 (jobs and crew assignment)                                         |
| Responsive interface for desktop and mobile    | F4                                                                           |
| Basic error handling and validation            | F6 form validation, database constraints, and the shared error displays (F4) |

## 5. Hand-Built Feature (AI in the Backseat)

**Feature:** F6 Job CRUD and status.

- I write the code for F6 myself.
- I use **GitHub Copilot in VS Code** with the custom **Framework Student** agent (`.github/agents/FrameworkStudent.agent.md`, from the assignment instructions), in Ask mode. AI explains concepts, answers questions, and reviews my code. It does not write the feature for me.
- I log the questions I ask and what I learned (Section 9).

## 6. How We Will Use AI

- **Planning:** AI helped generate this plan from my specification and feature plans, with the stack and the prototype goal stated up front. I reviewed and adjusted it.
- **Code generation (F1, F2, F4, F7):** AI generates code to save time, since the primary goal is a working prototype in two weeks.
- **Learning (F6):** AI is in the backseat. I use Copilot in Ask mode with the Framework Student agent (Section 5).

## 7. Folder Structure

```
src/
  pages/           index, login, signup, jobs/ (index, new, view, edit), my-jobs, 404
  layouts/         the shared app layout (header and navigation)
  components/      Svelte islands (forms, job list, crew panel) and shared states
  lib/             Supabase client, time helper, form validation
supabase/
  schema.sql       tables, constraints, policies, and database functions
docs/              spec, plans, this file
.github/agents/    FrameworkStudent.agent.md
```

## 8. Task List (Two Weeks)

### Day 0: Setup

- [X] Create the Astro project in the repo, add the Svelte integration, and run it locally
- [X] Create the Supabase project; add its URL and public key to `.env`; update `.env.example`
- [X] Update `AGENTS.md` for Astro and Supabase
- [X] Set up GitHub Copilot in VS Code and add `.github/agents/FrameworkStudent.agent.md`
- [X] Add setup steps to the README
- [X] Commit and push

### Week 1: Foundations

**Days 1 to 2: F1 Auth**

- [X] Create the profiles table (name, role, active) with new users defaulting to Field Worker
- [X] Add the Supabase client
- [X] Build Sign Up and Log In islands with validation errors
- [X] Add log out
- [X] Send logged-out visitors to Login
- [X] Create one user per role (Admin, Dispatcher, Supervisor, Field Worker)
- [X] Check F1 acceptance criteria by hand; write Vitest tests for the password and email rules

**Day 3: F2 Role enforcement**

- [X] Turn on Row Level Security for every table, with policies per role (profiles done; jobs and assignments add theirs in F6 and F7)
- [X] Add a permissions file for the interface (which controls each role sees)
- [X] Build the access denied view
- [X] Check F2 acceptance criteria, including a Field Worker trying to create a job by calling Supabase directly

**Days 4 to 5: F4 App shell**

- [X] Build the shared layout: header with name, role, and Log out
- [X] Role-based navigation (top bar on desktop, bottom tabs for workers on phones, menu button for Dispatcher and Admin on phones)
- [X] Build shared Loading, Empty, and Error displays, and the not-found page
- [X] Check layouts at 375 px and 1280 px
- [X] **Week 1 checkpoint:** log in as each role and see the correct navigation. Commit and push.

### Week 2: Core Features

**Days 6 to 8: F6 Jobs (built by hand)**

- [X] Create the jobs table with constraints and policies
- [X] Write the shared time helper (overnight jobs end the next day) with Vitest tests
- [X] Job list page (Dispatcher and Admin)
- [X] New job and Edit job forms with validation (New is done; Edit is still to come)
- [X] Job detail page
- [X] Status changes with the transition rules (Cancel, In Progress, Completed)
- [X] Delete with a confirmation
- [X] Log my Copilot questions and what I learned
- [X] Check F6 acceptance criteria - AC-7 not in scope (no job supervisor flag); AC-10 crew removal checked in F7

**Days 9 to 10: F7 Assignments and My Jobs**

- [X] Create the assignments table and policies
- [X] Database functions to assign and remove workers and update Open/Staffed in one step
- [X] Crew list and Assign dialog on the job detail page
- [X] My Jobs page for Field Worker and Supervisor (only their jobs)
- [X] Show not found for jobs a worker is not assigned to
- [X] Check the main F7 acceptance criteria - AC-6, AC-7, and AC-16 (job supervisor flag) not in scope; AC-15 covered by unit tests.

**Days 11 to 14: Finish**

- [X] Run the demo script (Section 10) and fix bugs
- [X] Complete the README (description, setup, known issues)
- [ ] Deploy to a static host and get the live demo URL
- [ ] Collect the evaluation form numbers (Section 9)
- [ ] Fill in the evaluation form and reflection
- [ ] Final commit, push, and submit

## 9. Evaluation Notes

**Time log** (fill in as I go; this is my velocity number):

| Date  | Task                                                           | Hours |
| ----- | -------------------------------------------------------------- | ----- |
| 11/10 | Update agents.md and set up github copilot                     | 3     |
| 11/10 | Create Astro and Supabase projects; Add setup steps to README. | 1     |
| 11/10 | Add profiles table and Supabase Client                         | 1     |
| 11/10 | Add sign up, log in, and log out                               | 1     |
| 11/10 | Add test users, validation tets, and finish F1                 | 1     |
| 11/10 | Add role helpers, permission, and access denied view           | 1     |
| 11/10 | Add app shell, navigation, and shared states                   | 1     |
| 11/11 | F6 By Hand                                                     | 4     |

**Numbers for the evaluation form:** Lighthouse performance metrics, total JavaScript, time to first byte, initial CSS, hot reload time, dev dependency count, and my 1 to 5 ratings.

**Reflection notes:**

- What was easy:
- What was confusing:
- How building F6 by hand with Copilot went:
- How well AI generated Astro and Supabase code (fixes needed):
- How this compared with SvelteKit in Bakeoff 1:

**AI log (add a line per task):** task, what I asked, what worked, what I fixed.

**F6 with Copilot (Framework Student agent):**

| Step           | What I asked                                                  | What I learned                                                                                                                                                                                                                                                                       | What I fixed                                                                            |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Jobs table     | What to think about before writing the table                  | Copilot asked about design decisions first (time zones, constraints, status, created_by, indexes). With a static site the database is the only real enforcement. `btrim` blocks titles of only spaces. A column default isn't a guard, so the insert policy must check created_by. |                                                                                         |
| Time helper    | How to handle overnight jobs and month rollover               | `new Date("YYYY-MM-DD")` is read as UTC and can show the wrong day. `setDate` handles month rollover. Passing `now` in makes the function testable.                                                                                                                            | Typos (`hours`/`hour`, `date`/`Date`) and an auto-added `astro:schema` import |
| Job list       | Where data loads in a static page; loading/error/empty states | The `.astro` frontmatter runs at build time, so data has to load in the island. One state variable can drive the whole page.                                                                                                                                                       | `state = error` (variable) vs `state = 'error'` (text)                              |
| New job form   | Reusable form, validation, saving                             | Functions can't be passed from an `.astro` file to an island, so a small wrapper island passes `onSave`. Keep validation in its own file so it's testable.                                                                                                                       |                                                                                         |
| Job detail     | Loading one job by id                                         | `.maybeSingle()` returns null for no row, so a missing job and a forbidden job both look like "Not found." Showing notes as text (not `@html`) keeps them safe.                                                                                                                  |                                                                                         |
| Edit job       | Reusing the form; protecting final jobs                       | Wait for the job to load before showing the form. A trigger fits data rules better than a policy.                                                                                                                                                                                    |                                                                                         |
| Status changes | Where transition rules belong                                 | Copilot spotted that my F6 plan allows Supervisors but my bakeoff scope doesn't. RLS controls rows, not columns, so column privileges block direct status edits. A `security definer` function with `PT403`/`PT409` codes.                                                     |                                                                                         |
| Delete         | Deleting safely                                               | A plain delete with RLS is enough. `on delete cascade` removes related rows together.                                                                                                                                                                                              | Copilot assumed uuid ids; mine are numbers (bigint)                                     |

## 10. Demo Script (Definition of Done)

The prototype is done when this works on a phone-size window and a desktop window:

1. Log in as the Dispatcher and create a job needing 2 workers. It shows as Open, "0 / 2."
2. Assign two workers. The job shows "2 / 2" and becomes Staffed.
3. Log out and log in as an assigned Field Worker on a phone-size window. My Jobs shows only that worker's job.
4. As that worker, try to open the New Job page. The access denied view appears.
5. As the Dispatcher, cancel the job. It stays in the list marked Cancelled.
6. Submit an invalid job (missing title). A clear error message appears.

## 11. Risks

| Risk                                        | Mitigation                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| A missing database policy exposes data      | Turn on Row Level Security for every table; test each role, including direct calls |
| No app server for multi-step rules          | Database functions for assigning and status updates                                |
| Learning curve slows the hand-built feature | Framework Student agent; small steps; review with AI                               |
| Overnight time bugs                         | One shared time helper with tests                                                  |
| AI writes server-mode Astro code by habit   | `AGENTS.md` says static output only; review every output                         |
