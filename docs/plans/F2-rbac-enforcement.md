# F2 — Role-Based Access Control (RBAC) Enforcement

> Implementation plan. Source: ConeZone Project Specification §3.6 (Role-Based Access Control permissions table) and §7 (Roles columns).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F2 |
| **Section** | Users and Authentication (infrastructure) |
| **Severity** | BLOCKER |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F1 |
| **Unblocks** | F3, F4, F5, F6, F7, F8, F9, F10, F11 |

---

## 1. Problem Statement

Users have roles, but nothing yet decides what each role may do. If every feature writes its own role checks, the rules drift apart and a missed check lets a Field Worker edit jobs or read other crews' messages. This feature builds one shared set of permission rules and checks, on the server and in the UI, that every later feature uses.

## 2. Goals

- One permissions definition that matches the spec's permissions table.
- Every protected API route checks the user's role (and job membership where needed) on the server.
- Consistent responses: 401 when not logged in, 403 when the role is not allowed, 404 when a job-scoped item is not theirs.
- The UI hides or blocks pages and buttons the user's role cannot use, without being the only protection.
- A role-by-route test matrix that catches routes with no rule.

## 3. Non-Goals

- Custom roles, per-user permission overrides, or users with more than one role.
- A screen for editing permissions.
- Changing a user's role (F3).
- An audit log screen or admin report of denied requests.
- Row-level rules beyond job membership.

## 4. Personas & User Stories

- **As a Field Worker**, I want to see only my own jobs so that I am not shown other crews' information.
- **As a Dispatcher**, I want to create and edit any job so that I can run the schedule.
- **As an Admin**, I want a role change to take effect right away so that someone who is promoted or demoted is not stuck with old permissions.
- **As a developer on the team**, I want one place to look up who can do what so that I do not guess when I build a route.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST support exactly four roles stored on the user: `admin`, `dispatcher`, `supervisor`, `field_worker`.
- **FR-2.** The system MUST keep a single permissions definition (role to allowed actions) matching the specification's permissions table, and every route check MUST read from it rather than hard-coding role names inline.
- **FR-3.** The system MUST provide a reusable "allowed roles" check for routes. A request with no valid session gets 401. A logged-in user whose role is not allowed gets 403.
- **FR-4.** The system MUST provide a reusable "job member" check. A user is a member of a job if they have an assignment on it. Dispatchers and Admins count as members of every job. Until F7 exists, only Dispatchers and Admins are members.
- **FR-5.** The system MUST return 404 (not 403) when a non-member asks for a specific job, crew list, or thread, so job ids cannot be probed. Role-restricted actions (for example, creating a job) return 403.
- **FR-6.** The system MUST read the user's role from stored data on every request and MUST ignore any role sent by the browser. A role change therefore applies on the user's next request.
- **FR-7.** The system MUST treat a deactivated user as logged out on every request, even if they hold a session.
- **FR-8.** The UI MUST send users to an "access denied" screen when they open a page their role cannot use. This is a convenience, not security.
- **FR-9.** The UI MUST hide buttons and menu items for actions the role cannot perform.
- **FR-10.** The system SHOULD log each denied request with user id, role, route, and time.
- **FR-11.** The system SHOULD include an automated test that lists every route and fails if a route has no declared rule.

## 6. Non-Functional Requirements

- **Performance** — The checks add under 10 ms per request on a local setup.
- **Security** — Checks run on the server for every route. A missing rule defaults to deny. Responses to denied requests contain no data about the protected item.
- **Privacy & Compliance** — Denial messages do not reveal whether a job exists.
- **Accessibility** — The access denied screen has a clear heading, plain-language message, and a link back to the user's home page.
- **Scalability** — N/A.
- **Reliability** — If the permission lookup fails, the request is denied, not allowed.
- **Observability** — Denials are logged as described in FR-10.
- **Maintainability** — Adding a route means adding one line to the permissions definition. The definition is the document reviewers check.
- **Internationalization** — N/A.
- **Backward compatibility** — N/A. Applies to every route written after F1.

## 7. Acceptance Criteria

- **AC-1.** *Given* a Field Worker, *when* they call the create-job route directly, *then* the response is 403 and no job is created.
- **AC-2.** *Given* no session, *when* any protected route is called, *then* the response is 401.
- **AC-3.** *Given* a Dispatcher, *when* they request any job, *then* the request is allowed.
- **AC-4.** *Given* a Field Worker assigned to Job A only, *when* they request Job B, *then* the response is 404 and contains no data about Job B.
- **AC-5.** *Given* a Supervisor, *when* an Admin changes their role to Field Worker, *then* the next request from that user is checked as a Field Worker.
- **AC-6.** *Given* a deactivated user with an existing session, *when* they call any protected route, *then* the response is 401.
- **AC-7.** *Given* a request that includes `role: "admin"` in its body or headers, *when* it is processed, *then* the sent role is ignored and the stored role is used.
- **AC-8.** *Given* a Field Worker, *when* they open the Users page address directly, *then* they see the access denied screen.
- **AC-9.** *Given* a Field Worker on any page, *when* the page renders, *then* no create-job, assign, or announcement-post controls are visible.
- **AC-10.** *Given* a route added without a permission rule, *when* the route matrix test runs, *then* the test fails and names the route.

## 8. Data Model

- **New tables or columns:** none. Uses `User.role` and `User.is_active` (F1) and the Assignment table (F7) for membership.
- **Indexes and constraints:** none new. Membership lookups use the index on Assignment (job, user) created in F7.
- **Permissions definition:** a single table in code or configuration (not a database table) listing each action and the roles allowed. Actions: `job.view_any`, `job.view_own`, `job.create`, `job.edit`, `job.delete`, `job.set_status_own`, `assignment.manage`, `message.post_own_job`, `message.post_any_job`, `announcement.post`, `checkin.self`, `checkin.view_log_own_jobs`, `checkin.view_log_all`, `user.manage`, `user.list`.
- **Migration:** none. **Backfill:** none.

## 9. API Surface

- **New routes:** none. This feature provides checks that every route uses.
- **Changed routes:** `GET /api/users/me` (F1) includes `role` so the UI can adapt.
- **Response shapes for denials:**

```
401  { message: "Please log in" }
403  { message: "You do not have access to this action" }
404  { message: "Not found" }
```

- **Rate limits:** N/A. **Real-time:** N/A. **Documentation:** the README includes the permissions table and the 401/403/404 rule.

## 10. UI / UX

**Pages and components:** an access denied page; a route guard that wraps restricted pages; a small helper the UI calls to decide whether to show a control (for example, "can this user create jobs").

**Key flows**

1. A restricted page is opened by the wrong role, and the access denied screen appears with a link home.
2. A page loads and only shows the controls allowed for the user's role.
3. An Admin changes a role, and on the affected user's next page load the menu and buttons match the new role.

**States**

- **Empty:** N/A.
- **Loading:** the guard waits for the current-user response before deciding, to avoid flashing restricted content.
- **Error:** if the current-user call fails with 401, send the user to Login.
- **Offline:** N/A.

**Responsive:** the access denied screen works at 375 px. **Accessibility:** page heading, focus moves to the heading on load. **Copy keys:** `access.denied.title`, `access.denied.body`, `access.denied.home`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** session and current-user (F1); every route and page in F3 to F11 uses these checks; job membership depends on the Assignment table from F7.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F1.
- Must ship before: F3, F4, F5, F6, F7, F8, F9, F10, F11.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A route ships with no rule, leaving it open | H | H | Default deny; FR-11 route matrix test (AC-10) |
| Rules exist only in the UI | M | H | AC-1 calls routes directly; server checks required by FR-3 |
| Role names typed inline in many places and drift apart | M | M | Single permissions definition (FR-2) |
| Job membership check is slow or forgotten | L | H | One shared membership check (FR-4); AC-4 |
| Stale permissions after a role change | M | M | Read role from stored data each request (FR-6, AC-5) |

## 15. Rollout Plan

- **Feature flag:** none (core MVP feature).
- **Sequencing:** permissions definition, then server checks, then UI guard and helper, then the route matrix test.
- **Dogfood:** log in as each seeded role and try the pages and routes that should be blocked.
- **GA criteria:** AC-1 through AC-10 pass.
- **Rollback:** revert the pull request. Later features depend on this, so fix forward where possible.

## 16. Test Plan

- **Unit** — the permissions definition returns the right answer for each role and action; the membership check for each role.
- **Integration** — a role-by-route matrix calling each route as each role plus no session; role change then next request.
- **End-to-end** — Field Worker typing restricted page addresses; Admin changing a role and the user seeing new menus.
- **Security** — client-sent role ignored; deactivated user rejected; non-member gets 404 with no data.
- **Accessibility** — automated checker on the access denied screen.
- **Performance / load** — N/A.
- **Manual exploratory** — expired session mid-use; two browsers, one changing the other's role.

| AC | Test case | Level |
|---|---|---|
| AC-1 | As Field Worker call create-job route; expect 403 and no new job | Integration |
| AC-2 | Call each protected route with no session; expect 401 | Integration |
| AC-3 | As Dispatcher request an unassigned job; expect success | Integration |
| AC-4 | As Field Worker request an unassigned job; expect 404 and empty body of job data | Integration |
| AC-5 | Change role then call a Supervisor-only action as that user; expect 403 | Integration |
| AC-6 | Deactivate user with live session then call any route; expect 401 | Integration |
| AC-7 | Send a request with `role: "admin"`; expect it ignored | Security |
| AC-8 | As Field Worker open the Users page address; expect access denied screen | E2E |
| AC-9 | As Field Worker load each page; expect no restricted controls in the page | E2E |
| AC-10 | Register a route without a rule; expect the matrix test to fail naming it | Integration |

## 17. Documentation & Training

- **End-user docs:** N/A.
- **Admin and instructor docs:** a short note on what each role can do (the permissions table).
- **API reference:** document 401, 403, and 404 meanings once in the README.
- **Internal runbook:** how to add a new route and its permission rule.

## 18. Open Questions

1. Should job-scoped denials be 404 for everyone (this plan) or 403 so errors are more descriptive?
2. Should Dispatchers be able to read messages in every job even when not assigned (this plan says yes)?
3. Is a log of denied requests useful enough to keep in the MVP (FR-10)?

## 19. References

- ConeZone Project Specification: §3.6 permissions table; §7 Roles columns.
- Related plans: F1 (sessions), F3 (role changes), F7 (job membership), F9 and F10 (membership use).
- Existing code paths: N/A until the stack is chosen.
