# ConeZone

A job board and crew communication web app for a traffic control company. Dispatchers post and staff jobs, supervisors run the site, and field workers see their jobs, check in, and message about them.

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

1. Install Node 20 or higher.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add your database connection string.
4. Run `npm run dev` and open http://localhost:5173.

### Seed data

With the server running ('npm run dev'), run this in a second terminal: `npm run seed`

This creates one test user per role. All use the password 'Password123!':

| Role         | Email                    |
| ------------ | ------------------------ |
| Admin        | admin@conezone.test      |
| Dispatcher   | dispatcher@conezone.test |
| Supervisor   | supervisor@conezone.test |
| Field Worker | worker@conezone.test     |

## API Documentation

_To be completed during development. Start from the endpoint list in the specification (Section 7)._

## Known Issues and Future Improvements

- _None yet._

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
