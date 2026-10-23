# ConeZone Feature Plans: Sequencing Note

One plan file per MVP feature, using the course template. The full list with types and spec sections is in [../feature-inventory.md](../feature-inventory.md).

## Recommended Implementation Order

| Order | Feature ID | Depends on | Why this order |
|---|---|---|---|
| 1 | [F1-auth-basics](F1-auth-basics.md) | None | Unlocks protected routes and every feature that needs to know the user |
| 2 | [F2-rbac-enforcement](F2-rbac-enforcement.md) | F1 | Every later route needs the shared role and membership checks, so build them before the routes |
| 3 | [F4-app-shell-responsive-nav](F4-app-shell-responsive-nav.md) | F1, F2 | Every page renders inside the shell, so build it before pages to avoid rework |
| 4 | [F3-admin-user-management](F3-admin-user-management.md) | F1, F2, F4 | Lets an Admin create Dispatchers and Supervisors, which later features need for real testing |
| 5 | [F6-job-crud](F6-job-crud.md) | F1, F2, F4 | The central record; first full CRUD flow with role rules |
| 6 | [F7-job-assignments-staffing](F7-job-assignments-staffing.md) | F2, F3, F4, F6 | Defines who belongs to a job; messaging and check-in read from it |
| 7 | [F9-job-message-threads](F9-job-message-threads.md) | F2, F6, F7 | The main communication goal of the app; creates the shared Message table |
| 8 | [F10-check-in-out](F10-check-in-out.md) | F2, F6, F7 | Field workers' core daily action; reuses assignments and the time helper |
| 9 | [F8-job-board-search-filters](F8-job-board-search-filters.md) | F6, F7 | Improves the board once there is staffing data to show; F6 already lists jobs |
| 10 | [F11-announcements](F11-announcements.md) | F2, F4, F9 | Small and reuses the Message table from F9 |
| 11 | [F5-profile-management](F5-profile-management.md) | F1, F4 | Not needed by other features, so it can be pulled forward by a free teammate any time after F4 |

## Dependency Map

```
F1 auth-basics
 +-- F2 rbac-enforcement
      +-- F4 app-shell-responsive-nav
           +-- F3 admin-user-management ----+
           +-- F6 job-crud -----------------+--> F7 job-assignments-staffing
           |                                         +-- F8 job-board-search-filters
           +-- F5 profile-management                 +-- F9 job-message-threads --> F11 announcements
                                                     +-- F10 check-in-out
```

F11 also needs F2 and F4. F8 also needs F6. F9 and F10 also need F2 and F6.

## First Feature to Implement

**F1 (auth basics).** It has no dependencies, every other plan needs a logged-in user, and it forces the team to set up the project, database, and seed data first. F2 follows right behind it so no route is ever written without a permission rule.

## Risks That Could Delay Multiple Features

| Risk | Features affected | Mitigation |
|---|---|---|
| Technology stack not chosen yet, so file paths, migration names, and setup steps are marked N/A | All | After the Bakeoffs, run one pass over every plan to fill in paths and conventions |
| A wrong or missing permission rule in F2 spreads to every route | F3, F6 to F11 | Default deny; route-by-role test matrix (F2 AC-10) |
| Overnight and time-window logic copied in several places | F6, F7, F10 | One shared time helper, built in F6 and reused |
| The shared Message table (F9, F11) and cascading deletes across jobs, assignments, and messages | F6, F7, F9, F11 | Table constraints defined once in F9; cross-feature delete test (F6 AC-10) |
| Shell and shared states (F4) slip, so each page builds its own | F3, F5 to F11 | Build F4 with placeholder pages early; reject pages that bypass it |
| No realistic test data for four roles and jobs in different states | F3, F6 to F11 | Seed script in F1 and F6 with one user per role and about 6 jobs |
| Real-time updates added later change how messages and check-in return data | F9, F10, F11 | Plans mark real-time as an additional feature; keep response shapes stable |

## Shared Conventions (apply to every plan)

- **Roles:** `admin`, `dispatcher`, `supervisor`, `field_worker`.
- **Job statuses:** `open`, `staffed`, `in_progress`, `completed`, `cancelled`.
- **Response codes:** 400 invalid input, 401 not logged in, 403 role not allowed, 404 not found or not a member of that job, 409 conflict with current state, 422 action not allowed right now (for example, check-in too early).
- **Endpoint paths** are illustrative and may change once the stack is chosen.
- **Time:** one company time zone; overnight jobs end the next day.
- **Seed data:** one user per role and about 6 jobs in different states for development.
- **AC to test mapping:** every plan has a table mapping each acceptance criterion to at least one test case.
