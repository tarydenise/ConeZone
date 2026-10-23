# F11 — Company Announcements

> Implementation plan. Source: ConeZone Project Specification §3.4 (Announcements), §6 (Message data model), §7 (Announcements routes), wireframe 5.6.

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F11 |
| **Section** | Messaging |
| **Severity** | MINOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F2, F4, F9 |
| **Unblocks** | Notifications for announcements (additional feature) |

---

## 1. Problem Statement

Company-wide notices such as safety meetings and new equipment go out in group texts that many people miss. Dispatchers and Admins need one place to post a notice that every employee can find later. This feature adds a company announcements list.

## 2. Goals

- Dispatchers and Admins can post and remove announcements.
- Every logged-in user can read all announcements, newest first.
- Announcements stay separate from job threads.

## 3. Non-Goals

- Targeting a role or a crew.
- Editing a posted announcement (delete and repost instead).
- Replies, reactions, comments, or acknowledgements.
- Scheduling, pinning, or expiry dates.
- Push notifications, email, or text alerts.
- Titles, formatting, files, or images.

## 4. Personas & User Stories

- **As a Dispatcher**, I want to post "Safety meeting Friday 6:30 AM" so that everyone sees it.
- **As an Admin**, I want to delete an outdated announcement so that the list stays accurate.
- **As a Field Worker**, I want to read recent announcements so that I do not miss company news.
- **As a Supervisor**, I want to see who posted an announcement and when.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST show all announcements, newest first, with author name, date and time, and text, to every logged-in user.
- **FR-2.** The system MUST let a Dispatcher or Admin post an announcement of 1 to 2000 characters after trimming spaces, and MUST reject empty ones.
- **FR-3.** The system MUST let a Dispatcher or Admin delete any announcement after confirmation, and MUST NOT let Supervisors or Field Workers post or delete.
- **FR-4.** The system MUST hide the post box and delete buttons from roles that cannot use them, and MUST also refuse their requests with 403.
- **FR-5.** The system MUST keep announcements out of every job thread, and job thread routes MUST NOT return announcements.
- **FR-6.** The system MUST reject edit or delete of an announcement through the job message routes (F9) with 404.
- **FR-7.** The system MUST display announcement text safely as plain text.
- **FR-8.** The system MUST show "No announcements." when none exist.
- **FR-9.** The system SHOULD show the latest 50 announcements with a "Load more" button for older ones.
- **FR-10.** The system MAY show a relative time such as "2 days ago" beside the exact date.

## 6. Non-Functional Requirements

- **Performance** — The list loads in under 500 ms (p95).
- **Security** — Post and delete roles checked on the server (F2). Text displayed as plain text.
- **Privacy & Compliance** — Announcements are visible to all logged-in users, including future hires. Do not post private information.
- **Accessibility** — WCAG 2.1 AA. The post box is labeled, and the delete confirmation traps focus.
- **Scalability** — N/A.
- **Reliability** — A failed post keeps the typed text.
- **Observability** — Log announcement posts and deletes with actor id.
- **Maintainability** — Uses the shared Message table from F9. The rules in Data Model keep job messages and announcements apart.
- **Internationalization** — N/A.
- **Backward compatibility** — Requires F9's message edit and delete routes to ignore announcements (FR-6).

## 7. Acceptance Criteria

- **AC-1.** *Given* 3 announcements, *when* any logged-in user opens Announcements, *then* all 3 show newest first with author, time, and text.
- **AC-2.** *Given* a Dispatcher, *when* they post "Safety meeting Friday", *then* it appears at the top of the list for every user.
- **AC-3.** *Given* an empty or spaces-only text, *when* a Dispatcher posts, *then* it is rejected and nothing is added.
- **AC-4.** *Given* text over 2000 characters, *when* posted, *then* it is rejected with a length message.
- **AC-5.** *Given* a Field Worker or Supervisor, *when* they open Announcements, *then* no post box or delete buttons appear.
- **AC-6.** *Given* a Field Worker or Supervisor, *when* they call the post or delete route directly, *then* the response is 403.
- **AC-7.** *Given* an announcement, *when* a Dispatcher or Admin deletes it and confirms, *then* it disappears for everyone; *given* they cancel the confirmation, *then* it stays.
- **AC-8.** *Given* an announcement and a job thread, *when* the thread is read, *then* the announcement is not in it.
- **AC-9.** *Given* an announcement id, *when* it is sent to the job message edit or delete route, *then* the response is 404 and the announcement is unchanged.
- **AC-10.** *Given* text containing `<script>`, *when* displayed, *then* it shows literally and does not run.
- **AC-11.** *Given* no announcements, *when* the page opens, *then* "No announcements." shows.
- **AC-12.** *Given* 60 announcements, *when* the page loads, *then* 50 show with a Load more button that shows the other 10.

## 8. Data Model

**Message (shared with F9; no new table)**

- Announcements are Message rows with `is_announcement = true` and an empty `job`.
- **Constraints (defined in F9):** a message with `is_announcement = true` must have no job; job messages must have a job.
- **Indexes:** by `is_announcement` and created time.
- **Migration:** none if F9's table is already created with these columns. **Backfill:** none; seed two sample announcements.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/announcements` | List announcements (latest 50; `?before=` for older) | Any logged-in user |
| POST | `/api/announcements` | Post an announcement | Dispatcher, Admin |
| DELETE | `/api/announcements/:id` | Delete an announcement | Dispatcher, Admin |

```
GET  /api/announcements   200: { items: [{ id, author: { id, name }, body, created_at }], has_more }
POST /api/announcements   body: { body }   201: { announcement }   400 empty or too long   403 role
DELETE /api/announcements/:id   200: {}   403 role   404 not found
```

**Rate limits:** N/A. **Real-time:** N/A. **Documentation:** add the three routes to the README API section.

## 10. UI / UX

**Pages and components:** Announcements page with a list, a post box (Dispatcher and Admin only), and delete buttons (Dispatcher and Admin only). Wireframe: ConeZone Wireframes, Announcements (5.6 in the specification).

**Key flows**

1. Any user opens Announcements and reads the list.
2. Dispatcher types an announcement, selects Post, and sees it at the top.
3. Dispatcher or Admin selects Delete on an announcement, confirms, and it disappears.

**States**

- **Empty:** "No announcements."
- **Loading:** placeholder cards while the list loads.
- **Error:** "Could not load announcements" with Retry; "Not posted. Try again." with text kept.
- **Offline:** N/A.

**Responsive:** full-width cards on phones; the post box above the list. **Accessibility:** labeled post box; confirmation dialog; list is a real list for screen readers. **Copy keys:** `announce.title`, `announce.empty`, `announce.post`, `announce.delete.confirm`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** role checks (F2); shell and states (F4); the Message table and its rules (F9); F9's edit and delete routes must refuse announcements.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F2, F4, F9.
- Must ship before: nothing in the MVP depends on it.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Announcements leak into job threads or the reverse | M | M | FR-5, FR-6; AC-8 and AC-9 |
| Non-office roles post by calling the route | M | H | FR-4; AC-6 |
| Shared table makes F9 and F11 changes collide | M | M | Constraints written in F9; test both features together |
| Text run as code in the page | M | H | FR-7; AC-10 |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** routes, then page, then confirm F9's routes refuse announcements.
- **Dogfood:** the team posts and deletes announcements as Dispatcher and reads them as each role.
- **GA criteria:** AC-1 through AC-12 pass.
- **Rollback:** revert the pull request; announcement rows can stay unused in the Message table.

## 16. Test Plan

- **Unit** — body length and trim rules; role rules for post and delete.
- **Integration** — each route by each role; separation from job threads; F9 routes refusing announcement ids; pagination.
- **End-to-end** — post, read as another role, delete.
- **Security** — non-office post and delete calls; script text in the body.
- **Accessibility** — automated checker; keyboard-only post and delete.
- **Performance / load** — N/A.
- **Manual exploratory** — very long text; posting twice quickly; phone width.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Seed 3 announcements; open page as each role; expect newest first with details | E2E |
| AC-2 | As Dispatcher post; reload as Field Worker; expect it at top | E2E |
| AC-3 | Post empty and spaces-only; expect 400 | Integration |
| AC-4 | Post 2001 characters; expect 400 | Integration |
| AC-5 | Open page as Field Worker and Supervisor; expect no post box or delete buttons | E2E |
| AC-6 | As Field Worker and Supervisor call post and delete; expect 403 | Integration |
| AC-7 | Delete and confirm; delete and cancel; expect removed, then unchanged | E2E |
| AC-8 | Post announcement; read a job thread; expect it absent | Integration |
| AC-9 | Send an announcement id to F9 edit and delete routes; expect 404 and unchanged | Integration |
| AC-10 | Post `<script>`; expect literal text | Security |
| AC-11 | Open with none; expect empty message | E2E |
| AC-12 | Seed 60; expect 50 then Load more shows 10 | Integration |

## 17. Documentation & Training

- **End-user docs:** a note on where to find announcements and who can post them.
- **Admin and instructor docs:** a Dispatcher note on posting and deleting.
- **API reference:** add three routes to the README.
- **Internal runbook:** N/A.

## 18. Open Questions

1. Should Dispatchers be able to edit an announcement they posted, instead of deleting and reposting?
2. Should announcements show an unread marker on the navigation item? (Notifications are an additional feature.)
3. Should old announcements be hidden automatically after a number of days?
4. Should only Admins be able to delete announcements posted by someone else?

## 19. References

- ConeZone Project Specification: §3.4, §6 (Message), §7 (Announcements).
- ConeZone Wireframes: Announcements (5.6 in the specification).
- Related plans: F2 (roles), F4 (shell), F9 (shared Message table and routes).
- Existing code paths: N/A until the stack is chosen.
