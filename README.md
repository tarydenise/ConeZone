# ConeZone

A job board and crew communication web app for a traffic control company. Dispatchers post and staff jobs, supervisors run the site, and field workers see their jobs, check in, and message about them.

## Team Members

| Name                 | Role / Focus | GitHub      |
| -------------------- | ------------ | ----------- |
| Tary-Denise Tupouata | Lead         | @Tarydenise |

## Project Description

ConeZone is a job board and crew app for a traffic control company. Dispatchers post jobs, assign field workers and supervisors, and track each job's status. Workers log in on their phones and see only the jobs they're assigned to.

This branch (`bakeoff-2`) is a prototype built with a **static rendering architecture**. Astro builds every page to plain HTML ahead of time, small Svelte 5 islands handle the interactive parts in the browser, and Supabase provides login and a PostgreSQL database. There is no app server: Row Level Security policies and database functions decide who can see and change what.

See the full specification in [docs/SPEC.md](docs/SPEC.md) (add a copy or link to the spec doc here).

**Live demo:** [https://conezone-bakeoff2.netlify.app](https://conezone-bakeoff2.netlify.app)

## User Roles and Permissions

Permissions are enforced in the interface and on the server.

| Action                      | Field Worker | Supervisor             | Dispatcher | Admin   |
| --------------------------- | ------------ | ---------------------- | ---------- | ------- |
| View own assigned jobs      | Yes          | Yes                    | Yes        | Yes     |
| View all jobs               | No           | No                     | Yes        | Yes     |
| Create / edit / delete jobs | No           | Status only (own jobs) | Yes        | Yes     |
| Assign workers to jobs      | No           | No                     | Yes        | Yes     |
| Post in a job thread        | Own jobs     | Own jobs               | Any job    | Any job |
| Post announcements          | No           | No                     | Yes        | Yes     |
| Check in / out              | Own jobs     | Own jobs               | No         | No      |
| View check-in log           | No           | Own jobs               | Yes        | Yes     |
| Manage users and roles      | No           | No                     | No         | Yes     |

**In this prototype:** only Dispatchers and Admins change a job's status (there is no job supervisor flag yet). Messaging, check-in, and announcements are not built.

**How permissions are enforced:** the database is the security boundary. Every table has Row Level Security, so each user can only read the rows their role allows, and jobs a worker isn't assigned to simply don't come back. Changing a job's status or crew is only possible through database functions that check the user's role first. The interface also hides buttons each role can't use, but that's only for convenience.

## Setup and Installation

**You need:** Node.js 22 or newer and a free Supabase project.

1. Clone the repo and switch to the `bakeoff-2` branch.
2. Install packages:

   npm install
3. Copy `.env.example` to `.env` and fill in your Supabase **Project URL** and **Publishable key** (Supabase: Project Settings, then API Keys).
4. Start the app:

   npm run dev
5. Open http://localhost:4321.

### Database setup (Supabase)

1. In Supabase, go to Authentication > Sign In / Providers > Email. Turn off **Confirm email** and set the minimum password length to 8.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. Create the test users in Authentication > Users > Add user (password `Password123!`, Auto Confirm on), then run `supabase/seed.sql`.

### Test users (development only)

| Role         | Email                    |
| ------------ | ------------------------ |
| Admin        | admin@conezone.test      |
| Dispatcher   | dispatcher@conezone.test |
| Supervisor   | supervisor@conezone.test |
| Field Worker | worker@conezone.test     |
| Field Worker | worker2@conezone.test    |
| Field Worker | worker3@conezone.test    |

### Tests

    npm test

## API Documentation

ConeZone has no server of its own. The browser talks to Supabase directly with `@supabase/supabase-js`, and the database enforces every rule. The full schema is in `supabase/schema.sql`.

### Pages

| Path                    | Shows                        | Who                                             |
| ----------------------- | ---------------------------- | ----------------------------------------------- |
| `/login`, `/signup` | Log in, create account       | Anyone                                          |
| `/`                   | Sends you to your home page  | Logged in                                       |
| `/jobs`               | All jobs with staffed counts | Dispatcher, Admin                               |
| `/jobs/new`           | New job form                 | Dispatcher, Admin                               |
| `/jobs/view?id=5`     | Job details and crew         | Dispatcher, Admin, or someone on the job's crew |
| `/jobs/edit?id=5`     | Edit job form                | Dispatcher, Admin                               |
| `/my-jobs`            | Your upcoming jobs           | Logged in                                       |

### Tables

| Table           | Read                                                                       | Write                                                                                          |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `profiles`    | Your own; Dispatchers and Admins see everyone; crew members see each other | Nobody from the app (roles are set in Supabase)                                                |
| `jobs`        | Dispatchers and Admins see all; crew members see their jobs                | Dispatchers and Admins create, edit details, and delete. `status` can't be written directly. |
| `assignments` | Dispatchers and Admins see all; crew members see their jobs' crews         | Only through the functions below                                                               |

### Database functions (`supabase.rpc`)

| Function                                 | Purpose                                                           | Who               | Errors                     |
| ---------------------------------------- | ----------------------------------------------------------------- | ----------------- | -------------------------- |
| `set_job_status(p_job_id, p_status)`   | Change status to `in_progress`, `completed`, or `cancelled` | Dispatcher, Admin | PT403, PT404, PT409        |
| `assign_workers(p_job_id, p_user_ids)` | Add workers to a job and update Open/Staffed                      | Dispatcher, Admin | PT400, PT403, PT404, PT409 |
| `remove_assignment(p_assignment_id)`   | Remove a worker and update Open/Staffed                           | Dispatcher, Admin | PT403, PT404, PT409        |

### Error codes

| Code      | Meaning                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| `PT400` | Bad input (for example, no one picked, or someone who can't be assigned)                                           |
| `PT403` | Your role can't do this                                                                                            |
| `PT404` | Not found                                                                                                          |
| `PT409` | Not allowed right now: final job, invalid status change, already on the job, fully staffed, or "remove crew first" |
| `42501` | Direct write blocked by the database's permissions                                                                 |
| `23514` | A field broke a database rule (length, range, or equal start and end times)                                        |

A job you aren't allowed to see returns no row, so it looks exactly like a job that doesn't exist.

## Known Issues and Future Improvements

- Every protected page shows "Loading..." briefly, because the login check runs in the browser after the static page loads.
- Times use the browser's time zone and assume everyone is in the company's time zone. Daylight saving changes are ignored.
- The job supervisor flag and Supervisor status changes are not built, so only Dispatchers and Admins change status.
- Roles and deactivation are managed in the Supabase dashboard. There is no admin screen.
- Announcements, Profile, messaging, check-in, and search and filters are planned in the feature plans but not built.
- There is no password reset, and email confirmation is turned off for the prototype.
- The job list loads every job at once (no pagination).
- The phone menu for Dispatchers and Admins does not trap keyboard focus.
- The edit time (`updated_at`) is set by the browser, not the database.

## Feature Plans

The full MVP list is in [docs/feature-inventory.md](docs/feature-inventory.md). Build order and dependencies are in [docs/plans/README.md](docs/plans/README.md).

| ID  | Feature                                                                            | Status  |
| --- | ---------------------------------------------------------------------------------- | ------- |
| F1  | [Auth basics](docs/plans/F1-auth-basics.md)                                         | Planned |
| F2  | [RBAC enforcement](docs/plans/F2-rbac-enforcement.md)                               | Planned |
| F3  | [Admin user management](docs/plans/F3-admin-user-management.md)                     | Planned |
| F4  | [App shell and responsive navigation](docs/plans/F4-app-shell-responsive-nav.md)    | Planned |
| F5  | [Profile management](docs/plans/F5-profile-management.md)                           | Planned |
| F6  | [Job CRUD and status](docs/plans/F6-job-crud.md)                                    | Planned |
| F7  | [Job assignments, staffing, and My Jobs](docs/plans/F7-job-assignments-staffing.md) | Planned |
| F8  | [Job board search and filters](docs/plans/F8-job-board-search-filters.md)           | Planned |
| F9  | [Job message threads](docs/plans/F9-job-message-threads.md)                         | Planned |
| F10 | [Check-in and check-out](docs/plans/F10-check-in-out.md)                            | Planned |
| F11 | [Announcements](docs/plans/F11-announcements.md)                                    | Planned |

Each feature has its own plan in [docs/plans](docs/plans).

| ID  | Feature                                                                          | Status  |
| --- | -------------------------------------------------------------------------------- | ------- |
| 3.3 | [Job Assignments and Staffing Status](docs/plans/3.3-job-assignments-staffing.md) | Planned |

## Team Workflow

- **Branches:** `main` is always working. Do work on a branch named `feature/<short-name>` and merge with a pull request.
- **Commits:** small and meaningful, with a message that says what changed.
- **Pull requests:** at least one teammate reviews before merging. Link the related issue or plan.
- **Project board:** track tasks in GitHub Projects (Backlog, This Sprint, In Progress, Review, Done).
- **Sprints:** one weekly goal. Planning and retro notes go in [docs/retros](docs/retros).
