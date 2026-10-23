# F3 — Admin User Management

> Implementation plan. Source: ConeZone Project Specification §3.1 (role changes), §3.6 (Manage users and roles), §7 (Auth and Users routes), wireframe 5.7.

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F3 |
| **Section** | Users and Authentication |
| **Severity** | MAJOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F1, F2, F4 |
| **Unblocks** | F7 (the Assign dialog needs a user list and users with different roles) |

---

## 1. Problem Statement

Every new account starts as a Field Worker, so nobody can become a Dispatcher or Supervisor, and there is no way to lock out someone who has left. Admins need a screen to find users, set roles, and deactivate accounts. Dispatchers also need a read-only user list so they can pick people to assign to jobs.

## 2. Goals

- An Admin can find a user and change their role in a few clicks.
- An Admin can deactivate and reactivate users instead of deleting them.
- Dispatchers can look up workers by name and role.
- The company cannot end up with no active Admin.
- Role changes take effect right away.

## 3. Non-Goals

- Admins creating accounts for others, invitations, or bulk import.
- Deleting users permanently.
- Admins editing another user's name, email, phone, or password.
- Resetting passwords.
- Viewing activity history for a user.

## 4. Personas & User Stories

- **As an Admin**, I want to change Lee's role from Field Worker to Supervisor so that Lee can run a crew.
- **As an Admin**, I want to deactivate someone who left so that they can no longer log in.
- **As a Dispatcher**, I want to search users by name and role so that I can find the right person to assign.
- **As an Admin**, I want the app to stop me from removing the last Admin so that I cannot lock everyone out.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST let Dispatchers and Admins list users, showing name, email, role, and active status, and MUST NOT show password data, phone numbers, or certifications in this list.
- **FR-2.** The system MUST support filtering the list by role and searching by name or email (case-insensitive, partial match).
- **FR-3.** The system MUST let an Admin change another user's role to any of the four roles.
- **FR-4.** The system MUST NOT let an Admin change their own role or deactivate their own account.
- **FR-5.** The system MUST NOT let the last active Admin be demoted or deactivated.
- **FR-6.** The system MUST let an Admin deactivate or reactivate another user. Deactivated users cannot log in and their existing sessions stop working (F1, F2). Their past messages and assignments stay.
- **FR-7.** The system MUST clear the job supervisor flag on a user's assignments when their role changes away from Supervisor. The user stays on the crew. (Applies once F7 exists.)
- **FR-8.** The system MUST limit the Users page to Admins; other roles who open it see the access denied screen (F2).
- **FR-9.** The system MUST ask for confirmation before deactivating a user.
- **FR-10.** The system SHOULD update the changed row in place and show a success message without reloading the page.
- **FR-11.** The system MAY show 25 users per page when the list is longer.

## 6. Non-Functional Requirements

- **Performance** — The list loads in under 500 ms (p95) with 200 users.
- **Security** — Role and status changes check the Admin role on the server (F2). The list route never returns password data.
- **Privacy & Compliance** — The list exposes only name, email, role, and status. Phone and certifications are not shown to Dispatchers.
- **Accessibility** — WCAG 2.1 AA. Role dropdowns and toggles have labels naming the user ("Role for Jo Tran"). Status is shown as text.
- **Scalability** — N/A (about 100 users maximum).
- **Reliability** — A role change and its supervisor-flag cleanup happen together or not at all.
- **Observability** — Log each role and status change with actor id, target id, old value, and new value.
- **Maintainability** — The supervisor cleanup (FR-7) calls the shared assignment rule from F7 rather than copying it.
- **Internationalization** — N/A.
- **Backward compatibility** — N/A (new feature).

## 7. Acceptance Criteria

- **AC-1.** *Given* an Admin on the Users page, *when* they change Lee's role from Field Worker to Supervisor, *then* the row shows Supervisor and Lee's next request is checked as a Supervisor.
- **AC-2.** *Given* an Admin on their own row, *when* they try to change their own role or deactivate themselves, *then* the controls are disabled and a direct request is rejected.
- **AC-3.** *Given* only one active Admin, *when* any request tries to demote or deactivate that Admin, *then* it is rejected with "At least one active Admin is required".
- **AC-4.** *Given* an Admin deactivating Jo, *when* they confirm, *then* Jo shows as Inactive, Jo's login is refused, and Jo's existing session returns 401.
- **AC-5.** *Given* a deactivated user, *when* an Admin reactivates them, *then* they can log in again.
- **AC-6.** *Given* a Dispatcher, *when* they open the user list route, *then* they see users with name, email, role, and status only.
- **AC-7.** *Given* a Dispatcher or Field Worker, *when* they call the role-change or active-status route, *then* the response is 403.
- **AC-8.** *Given* a list of users, *when* the Admin searches "lee" and filters role Supervisor, *then* only supervisors whose name or email contains "lee" appear.
- **AC-9.** *Given* a job whose supervisor is Sam, *when* an Admin changes Sam's role to Field Worker, *then* Sam stays on the crew and the job has no supervisor.
- **AC-10.** *Given* a search that matches nobody, *when* the list loads, *then* it shows "No users match your search".

## 8. Data Model

- **New tables or columns:** none. Uses `User.role` and `User.is_active` (F1).
- **Indexes and constraints:** an index on role and one on lowercased name/email to keep search fast is optional at this size.
- **Rule enforced in code:** at least one active user with role `admin` must remain.
- **Migration:** none. **Backfill:** none. The seed step (F1) already creates one Admin.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/users` | List users; supports `?role=` and `?search=` | Dispatcher, Admin |
| PUT | `/api/users/:id/role` | Change a user's role | Admin |
| PUT | `/api/users/:id/active` | Activate or deactivate a user | Admin |

```
GET /api/users?role=supervisor&search=lee
  200: [{ id, name, email, role, is_active }]

PUT /api/users/:id/role     body: { role: "admin" | "dispatcher" | "supervisor" | "field_worker" }
  200: { user: { id, name, email, role, is_active } }
  400 invalid role   403 not Admin   404 no such user
  409 { message: "At least one active Admin is required" } or own account

PUT /api/users/:id/active   body: { is_active: boolean }
  200: { user: {...} }   same errors as above
```

**Rate limits:** N/A. **Real-time:** N/A. **Documentation:** add the three routes to the README API section.

## 10. UI / UX

**Pages and components:** Users page (Admin), a role dropdown per row, an Active toggle per row, search box, role filter. Wireframe: ConeZone Wireframes, Admin Users (desktop). A read-only user picker is used later in the Assign dialog (F7) and calls the same list route.

**Key flows**

1. Admin opens Users, searches for a person, picks a new role in the row, and sees the change confirmed.
2. Admin turns off Active for a person, confirms, and the row shows Inactive.
3. Dispatcher opens the Assign dialog (F7) and the user picker loads from the same list route.

**States**

- **Empty:** "No users match your search" with a Clear filters button.
- **Loading:** a placeholder row set while the list loads.
- **Error:** an inline message and Retry if the list fails; a message beside the row if a change is rejected (for example, "At least one active Admin is required").
- **Offline:** N/A.

**Responsive:** a desktop-first table; on a phone the rows become cards with the same controls. **Accessibility:** controls labeled with the user's name; confirmation dialog traps focus and closes with Escape. **Copy keys:** `users.title`, `users.empty`, `users.deactivate.confirm`, `users.lastAdmin`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** session and role checks (F1, F2); the supervisor cleanup rule from F7; the Assign dialog in F7 reads the list route.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F1, F2, F4.
- Must ship before: F7 (needs a user list and users in more than one role).
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Company locked out by demoting the last Admin | L | H | FR-4, FR-5, AC-2, AC-3 |
| Stale permissions after a role change | M | M | F2 reads role on every request; AC-1 |
| Supervisor flag left on a user who is no longer a Supervisor | M | M | FR-7, AC-9; coordinate with F7 |
| Dispatcher sees private contact data in the list | L | M | FR-1 limits fields; AC-6 |

## 15. Rollout Plan

- **Feature flag:** none (core MVP feature).
- **Sequencing:** routes, then page, then wire the supervisor cleanup when F7 lands.
- **Dogfood:** the team changes roles and deactivates test users, then logs in as them.
- **GA criteria:** AC-1 through AC-10 pass (AC-9 once F7 exists).
- **Rollback:** revert the pull request; no schema change to undo.

## 16. Test Plan

- **Unit** — last-Admin rule; self-change rule; role validation.
- **Integration** — each route by each role; list filters and search; deactivate then login; role change then next request.
- **End-to-end** — Admin promotes a user; promoted user sees new menu items; Admin deactivates and reactivates.
- **Security** — non-Admin calls to role and status routes; list response has no password data or phone numbers.
- **Accessibility** — automated checker on Users page; keyboard-only role change and confirmation dialog.
- **Performance / load** — list with 200 users meets the 500 ms target.
- **Manual exploratory** — two Admins changing each other at the same time; long names; phone width.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Change role through the page; reload; call a role-gated route as that user | E2E |
| AC-2 | As Admin try to change own role and status via UI and direct call; expect disabled controls and 409 | Integration |
| AC-3 | With one active Admin, call demote and deactivate; expect 409 each | Integration |
| AC-4 | Deactivate user; try login; call a route with the old session; expect refusal and 401 | Integration |
| AC-5 | Reactivate then log in; expect success | Integration |
| AC-6 | Call list route as Dispatcher; expect only name, email, role, status | Integration |
| AC-7 | Call role and status routes as Dispatcher and Field Worker; expect 403 | Integration |
| AC-8 | Search "lee" with role filter; expect only matching supervisors | Integration |
| AC-9 | Change a job supervisor's role; expect crew unchanged and supervisor flag cleared | Integration |
| AC-10 | Search for a string with no matches; expect the empty message | E2E |

## 17. Documentation & Training

- **End-user docs:** N/A.
- **Admin and instructor docs:** a short "Managing users" guide covering roles, deactivation, and the last-Admin rule.
- **API reference:** add three routes to the README API section.
- **Internal runbook:** how to promote the first Dispatcher in a fresh database using the seed Admin.

## 18. Open Questions

1. Should the Dispatcher's user list include phone numbers so they can call workers (this plan says no)?
2. Should Admins be able to edit another user's name or email to fix typos?
3. Should deactivated users stay visible by default, or be hidden behind a filter?
4. Should a role change notify the user? (Notifications are an additional feature.)

## 19. References

- ConeZone Project Specification: §3.1, §3.6, §7 (Auth and Users).
- ConeZone Wireframes: Admin Users.
- Related plans: F1 (accounts), F2 (role checks), F4 (shell), F7 (supervisor flag and Assign dialog).
- Existing code paths: N/A until the stack is chosen.
