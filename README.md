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

## Setup and Installation

_To be completed once the technology stack is chosen after the Bakeoffs._

## API Documentation

_To be completed during development. Start from the endpoint list in the specification (Section 7)._

## Known Issues and Future Improvements

- _None yet._

## Feature Plans

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
