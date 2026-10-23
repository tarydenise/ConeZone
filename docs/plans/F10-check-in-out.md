# F10 — Check-In and Check-Out

> Implementation plan. Source: ConeZone Project Specification §3.5 (Check-In / Check-Out), §3.6 (Check-in permissions), §7 (Check-in routes), §9 (Check-in rules).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F10 |
| **Section** | Check-In |
| **Severity** | MAJOR |
| **Markets** | N/A. One company, one time zone, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F2, F6, F7 |
| **Unblocks** | CSV export of check-in log (additional feature) |

---

## 1. Problem Statement

Supervisors and Dispatchers find out who showed up by calling or texting each worker. This costs time at the start of every shift and leaves no record. This feature lets crew members check in and out from their phones and lets supervisors and the office see who is on site and when they arrived.

## 2. Goals

- Assigned workers check in and out with one tap.
- Supervisors (on their own jobs), Dispatchers, and Admins see check-in status and times for each crew member.
- Times are recorded by the server so they cannot be edited from a phone.
- Check-in is limited to real working windows and valid job states.

## 3. Non-Goals

- Location (GPS) checks or photo proof.
- Editing or correcting check-in times.
- Timesheets, pay calculations, or CSV export (additional feature).
- Reminders or alerts for people who have not checked in.
- Breaks or multiple check-ins per job.
- Automatically starting a job when the first person checks in (a person changes the status in F6).

## 4. Personas & User Stories

- **As a Field Worker**, I want to tap Check in when I arrive so that my supervisor knows I am on site.
- **As a Field Worker**, I want to tap Check out at the end of my shift so that my time is recorded.
- **As a Supervisor**, I want to see who has checked in on my job so that I know who is still missing.
- **As a Dispatcher**, I want to see check-in status for any job so that I can call people who have not arrived.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST let a Field Worker or Supervisor who is assigned to a job check in, and MUST record the server's current time as the check-in time. Dispatchers and Admins do not check in.
- **FR-2.** The system MUST allow check-in only if the job status is Open, Staffed, or In Progress, and only from 60 minutes before the job's start until the job's end, using the job's start and end times (including overnight jobs, via the shared time helper from F6).
- **FR-3.** The system MUST reject a second check-in for the same job, leave the first time unchanged, and say "You are already checked in".
- **FR-4.** The system MUST allow check-out only after check-in, only once, and MUST record the server's current time. Check-out is allowed in any job status.
- **FR-5.** The system MUST ignore any time sent by the browser.
- **FR-6.** The system MUST show a Check in or Check out button on the worker's job card and job page, with the state "Checked in at 6:58 AM" or "Checked out at 3:35 PM" after tapping.
- **FR-7.** The system MUST show each crew member's status ("In 6:52 AM", "Out 3:35 PM", or "Not yet") on the job's crew list to the job's Supervisor, Dispatchers, and Admins.
- **FR-8.** The system MUST NOT show other crew members' check-in times to Field Workers. A Field Worker sees only their own status.
- **FR-9.** The system MUST show times in the company's time zone.
- **FR-10.** The system MUST ask "Check out now?" before recording a check-out.
- **FR-11.** The system MUST delete a person's check-in record when they are removed from the job (it is stored on the assignment, F7).
- **FR-12.** The system MAY show a count such as "3 of 4 checked in" on the job page.

## 6. Non-Functional Requirements

- **Performance** — Check-in and check-out respond in under 500 ms (p95).
- **Security** — Role, assignment, and time-window checks run on the server (F2, F7). Times come from the server only.
- **Privacy & Compliance** — Check-in times are visible only to the job's Supervisor and the office roles. No location is collected.
- **Accessibility** — WCAG 2.1 AA. The button is large (at least 52 px tall on phones), labeled, and the result is announced to screen readers.
- **Scalability** — N/A.
- **Reliability** — Two quick taps record one check-in only. A failed request shows an error and does not record a time.
- **Observability** — Log each check-in and check-out with user id, job id, and time.
- **Maintainability** — The window rule uses the shared time helper from F6 rather than its own date math.
- **Internationalization** — N/A. Times are shown in one company time zone.
- **Backward compatibility** — Changes `GET /api/jobs/:id/assignments` (F7) to include check-in times for permitted roles only.

## 7. Acceptance Criteria

- **AC-1.** *Given* an assigned Field Worker on an Open job whose start is in 30 minutes, *when* they tap Check in, *then* the server records the time and the button changes to "Checked in at" with that time.
- **AC-2.** *Given* a Field Worker who is not assigned to the job, *when* they call the check-in route, *then* the response is 404 and nothing is recorded.
- **AC-3.** *Given* a Dispatcher, *when* they call the check-in route, *then* the response is 403.
- **AC-4.** *Given* a job starting in 3 hours, *when* an assigned worker tries to check in, *then* it is rejected with "Check-in opens 1 hour before the start".
- **AC-5.** *Given* an overnight job (9:00 PM to 5:00 AM) at 1:00 AM, *when* an assigned worker checks in, *then* it succeeds.
- **AC-6.** *Given* a job that has ended, *when* an assigned worker who has not checked in tries, *then* it is rejected.
- **AC-7.** *Given* a Cancelled or Completed job, *when* an assigned worker tries to check in, *then* it is rejected.
- **AC-8.** *Given* a worker already checked in, *when* they check in again, *then* the response is 409, the first time is unchanged, and the page shows "You are already checked in".
- **AC-9.** *Given* a checked-in worker, *when* they select Check out and confirm, *then* the check-out time is recorded and shown; *given* they have not checked in, *then* check-out is rejected.
- **AC-10.** *Given* a request that sends a time value, *when* it is processed, *then* the recorded time is the server's time.
- **AC-11.** *Given* a job's Supervisor, Dispatcher, or Admin, *when* they open the crew list, *then* they see "In", "Out", or "Not yet" with times for each crew member.
- **AC-12.** *Given* a Field Worker, *when* they call the crew list route, *then* other crew members' check-in times are not in the response.
- **AC-13.** *Given* a checked-in worker, *when* a Dispatcher removes them from the job, *then* their check-in record is deleted with the assignment.

## 8. Data Model

- **New tables or columns:** none. Uses `Assignment.checked_in_at` and `Assignment.checked_out_at` (created in F7).
- **Constraints:** `checked_out_at` is empty unless `checked_in_at` is set; `checked_out_at` is later than `checked_in_at`.
- **Indexes:** none new.
- **Migration:** none. **Backfill:** none.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| POST | `/api/jobs/:id/check-in` | Check in the current user | Assigned Field Worker or Supervisor |
| POST | `/api/jobs/:id/check-out` | Check out the current user | Assigned Field Worker or Supervisor |
| GET | `/api/jobs/:id/assignments` | Crew list (changed from F7) | Members, Dispatcher, Admin |

```
POST /api/jobs/:id/check-in    (no body)
  200: { checked_in_at }
  403 not a worker or supervisor role   404 not assigned
  409 { message: "You are already checked in" }
  422 { message: "Check-in opens 1 hour before the start" }  (also: job ended, job Cancelled or Completed)

POST /api/jobs/:id/check-out   (no body)   200: { checked_out_at }   409 not checked in or already checked out

GET /api/jobs/:id/assignments
  For Supervisor (own job), Dispatcher, Admin: items include { checked_in_at, checked_out_at }
  For Field Worker: only their own entry includes those fields
```

**Rate limits:** N/A. **Real-time:** N/A in this plan (`checkin:updated` is an additional feature). **Documentation:** add the two routes and the changed response to the README.

## 10. UI / UX

**Pages and components:** a Check in / Check out button on the My Jobs card and the Job Detail page; a status column in the crew list; a confirmation dialog for check-out. Wireframes: ConeZone Wireframes, My Jobs (Check in button) and Job Detail (crew "IN" status).

**Key flows**

1. Worker opens My Jobs on the day, taps Check in, and sees "Checked in at 6:58 AM".
2. Supervisor opens the job and sees each crew member as In, Out, or Not yet.
3. Worker taps Check out, confirms, and sees "Checked out at 3:35 PM".

**States**

- **Empty:** a crew list with nobody assigned shows "No one assigned yet" (F7).
- **Loading:** the button shows "Checking in..." and is disabled until the response arrives.
- **Error:** a message below the button (for example, "Check-in opens 1 hour before the start") and "Could not reach the server. Try again." on network failure.
- **Offline:** N/A for MVP (offline support is a stretch feature).

**Responsive:** the button is full width on phones. **Accessibility:** button label changes with state; result announced in a live region; confirmation dialog traps focus. **Copy keys:** `checkin.button`, `checkin.already`, `checkin.tooEarly`, `checkout.confirm`, `checkin.notYet`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none (no location or time service).
- **Internal modules:** assignments (F7); shared time helper (F6); role and membership checks (F2); My Jobs and Job Detail pages (F7, F6); shell (F4).
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none in this plan.

## 13. Dependencies & Sequencing

- Must ship after: F2, F6, F7.
- Must ship before: nothing in the MVP depends on it.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Overnight and time-window logic wrong | H | H | Shared time helper; AC-4 to AC-6 with fixed test times |
| Workers see each other's check-in times | M | M | FR-8; AC-12 |
| Double taps record two times | M | L | FR-3; AC-8 |
| Phone clock manipulated | L | M | Server time only (FR-5); AC-10 |
| Time zone shown wrongly | M | M | One company time zone (FR-9); manual check at different device settings |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** routes and rules, then buttons, then crew list status.
- **Dogfood:** the team uses fixed-time test jobs (starting soon, overnight, ended) and checks in as each role.
- **GA criteria:** AC-1 through AC-13 pass.
- **Rollback:** revert the pull request; the Assignment columns remain unused.

## 16. Test Plan

- **Unit** — time window rule across normal, overnight, early, and ended jobs; allowed statuses.
- **Integration** — each route by each role; double check-in; check-out before check-in; response fields by role.
- **End-to-end** — check in and out from a phone-size screen; Supervisor view of the crew list.
- **Security** — unassigned user; Dispatcher call; time value in the request body; Field Worker reading other people's times.
- **Accessibility** — automated checker; keyboard-only check-in and check-out dialog.
- **Performance / load** — N/A.
- **Manual exploratory** — phone clock set wrong; double-tap; checking in at exactly 60 minutes before start.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Fix clock 30 minutes before start; check in; expect time recorded and button state | E2E |
| AC-2 | As unassigned Field Worker call check-in; expect 404 and no record | Integration |
| AC-3 | As Dispatcher call check-in; expect 403 | Integration |
| AC-4 | Fix clock 3 hours before start; check in; expect 422 with message | Unit |
| AC-5 | Fix clock 1:00 AM on overnight job; check in; expect success | Unit |
| AC-6 | Fix clock after end; check in; expect 422 | Unit |
| AC-7 | Check in on Cancelled and Completed jobs; expect 422 each | Integration |
| AC-8 | Check in twice; expect 409 and unchanged first time | Integration |
| AC-9 | Check out after check-in; check out without check-in; expect success then 409 | Integration |
| AC-10 | Send a time in the body; expect server time recorded | Security |
| AC-11 | As Supervisor, Dispatcher, Admin load crew list; expect status and times | Integration |
| AC-12 | As Field Worker load crew list; expect no other times in response | Security |
| AC-13 | Remove checked-in worker; expect record deleted | Integration |

## 17. Documentation & Training

- **End-user docs:** a field worker note on when and how to check in and out.
- **Admin and instructor docs:** N/A.
- **API reference:** add the routes and changed response.
- **Internal runbook:** how to set a fixed test time for check-in tests.

## 18. Open Questions

1. Should check-in open 60 minutes before the start (this plan) or at another time?
2. How should a worker who forgot to check out be handled? A Dispatcher correction is a non-goal in this plan.
3. Should a late check-in (after the start time) be flagged for supervisors?
4. Should the first check-in automatically set the job to In Progress?

## 19. References

- ConeZone Project Specification: §3.5, §3.6, §6 (Assignment), §7 (Check-in), §9.
- ConeZone Wireframes: My Jobs, Job Detail.
- Related plans: F2 (checks), F6 (time helper), F7 (assignments and crew list).
- Existing code paths: N/A until the stack is chosen.
