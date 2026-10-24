# ConeZone

A job board and crew communication web app for a traffic control company. Dispatchers post and staff jobs, supervisors run the site, and field workers see their jobs, check in, and message about them.

Live Demo: [conezone.onrender.com/login](https://conezone.onrender.com/login)

## Team Members

| Name                 | Role / Focus | GitHub      |
| -------------------- | ------------ | ----------- |
| Tary-Denise Tupouata | Lead         | @Tarydenise |

## Project Description

Traffic control crews coordinate through calls, group texts, and spreadsheets. ConeZone puts jobs, crew assignments, and job conversations in one place, with different access for Admins, Dispatchers, Supervisors, and Field Workers.

See the full specification in [docs/SPEC.md](docs/SPEC.md) (add a copy or link to the spec doc here).

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

### How permissions are enforced

All rules live in one file, `src/lib/server/permissions.js`. Pages and form actions check them with the helpers in `src/lib/server/guards.js`. The user's role is read from the database on every request, never from the browser, so a role change takes effect on the user's next request. Deactivated users are treated as logged out.

| Response                   | Meaning                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| 401 (or redirect to Login) | You are not logged in                                                 |
| 403 Access denied          | You are logged in, but your role cannot do this action                |
| 404 Not found              | The job is not one you are assigned to (so job ids cannot be guessed) |

To protect a new page or action, add one line to `permissions.js` and call `requireAction(event, 'action.name')` at the top of its `load` function or form action.

## Setup and Installation

**You need:** Node.js 20 or newer and a free PostgreSQL database (we used Neon).

1. Clone the repo and switch to the `bakeoff-1` branch.
2. Install packages:

   npm install
3. Copy `.env.example` to `.env` and fill in the values:

   DATABASE_URL=your Postgres connection string
   BETTER_AUTH_SECRET=a random string, 32+ characters
   BETTER_AUTH_URL=http://localhost:5173

   To make a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
4. Create the tables:

   npx drizzle-kit push
5. Start the app:

   npm run dev
6. In a second terminal, add test users and sample jobs:

   npm run seed
7. Open http://localhost:5173 and log in.

### Seed data

`npm run seed` creates one user per role (and a few extra workers) with the password `Password123!`. These are for development only.

| Role         | Email                                                              |
| ------------ | ------------------------------------------------------------------ |
| Admin        | admin@conezone.test                                                |
| Dispatcher   | dispatcher@conezone.test                                           |
| Supervisor   | supervisor@conezone.test, supervisor2@conezone.test                |
| Field Worker | worker@conezone.test, worker2@conezone.test, worker3@conezone.test |

### Tests

    npm test            # unit tests (Vitest)
    npm run test:e2e    # browser checks (Playwright), needs the seed data

## API Documentation

ConeZone is a SvelteKit app. Pages load data on the server, and changes are sent as form actions (a `POST` to the page, with the action name after `?/`). Login is handled by Better Auth at `/api/auth/*`.

**Response codes:** a logged-out visitor is redirected to Login (401). A role that is not allowed gets **403**. A job the user is not on gets **404** (so job ids cannot be guessed). Bad field values get **400** with a message per field. A change that is not allowed in the current state gets **409**.

### Pages

| Path                             | Shows                        | Allowed                                           |
| -------------------------------- | ---------------------------- | ------------------------------------------------- |
| `/login`, `/signup`          | Log in, create account       | Anyone                                            |
| `/`                            | Redirects to your home page  | Logged in                                         |
| `/jobs`                        | All jobs with staffed counts | Dispatcher, Admin                                 |
| `/jobs/new`                    | New job form                 | Dispatcher, Admin                                 |
| `/jobs/[id]`                   | Job detail and crew          | Dispatcher, Admin, or someone assigned to the job |
| `/jobs/[id]/edit`              | Edit job form                | Dispatcher, Admin                                 |
| `/my-jobs`                     | Your upcoming jobs           | Logged in                                         |
| `/users`                       | Users and role change        | Admin                                             |
| `/announcements`, `/profile` | Placeholders (later phase)   | Logged in                                         |

### Actions

| Action                             | Purpose                                           | Allowed                                                | Errors                                                                  |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `POST /signup`                   | Create a Field Worker account                     | Anyone                                                 | 400 field messages, duplicate email                                     |
| `POST /login`                    | Log in                                            | Anyone                                                 | 400 wrong email or password, 403 inactive account                       |
| `POST /logout`                   | Log out                                           | Logged in                                              | none                                                                    |
| `POST /jobs/new`                 | Create a job (status Open)                        | Dispatcher, Admin                                      | 400, 403                                                                |
| `POST /jobs/[id]/edit`           | Edit a job                                        | Dispatcher, Admin                                      | 400 (including "remove crew first"), 403, 409 if Completed or Cancelled |
| `POST /jobs/[id]?/status`        | Change status (In Progress, Completed, Cancelled) | Dispatcher, Admin, or the job's supervisor (no Cancel) | 403, 409 invalid change                                                 |
| `POST /jobs/[id]?/delete`        | Delete a job and its crew                         | Dispatcher, Admin                                      | 403, 404                                                                |
| `POST /jobs/[id]?/assign`        | Add workers to a job                              | Dispatcher, Admin                                      | 400, 403, 409 duplicate or fully staffed                                |
| `POST /jobs/[id]?/remove`        | Remove a worker from a job                        | Dispatcher, Admin                                      | 403, 404, 409                                                           |
| `POST /jobs/[id]?/setSupervisor` | Set or clear the job supervisor                   | Dispatcher, Admin                                      | 400 not a Supervisor, 403, 409                                          |
| `POST /users?/role`              | Change a user's role                              | Admin                                                  | 400, 403, 409 own role or last Admin                                    |

### Auth routes (Better Auth)

`POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email`, `POST /api/auth/sign-out`, `GET /api/auth/get-session`

## Known Issues and Future Improvements

- The phone menu for Dispatcher and Admin does not trap keyboard focus yet.
- Announcements and Profile are placeholders. Messaging, check-in, search and filters, and user deactivation screens are planned in the feature plans but not built in this prototype.
- Users can be deactivated only by editing the database (the app does honor `is_active`).
- Times use the server's time zone. A company time zone setting is needed for real use.
- The job list has no pagination, search, or filters.
- There is no password reset or email verification.
- The Playwright checks assume the seed data is loaded.
- The free hosting tier on Render sleeps when idle, so the first load can take about a minute.

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
