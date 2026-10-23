# F6 — Job CRUD and Status

> Implementation plan. Source: ConeZone Project Specification §3.2 (Job Board CRUD), §6 (Job data model), §7 (Jobs routes), §9 (Overnight jobs, cancelled jobs).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F6 |
| **Section** | Jobs and Crew |
| **Severity** | BLOCKER |
| **Markets** | N/A. One company, one time zone, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F1, F2, F4 |
| **Unblocks** | F7, F8, F9, F10, F11 (everything attaches to a job except announcements) |

---

## 1. Problem Statement

The company has no single record of a job. Details live in texts and spreadsheets, so crews get the wrong address, time, or head count. This feature creates the job record and the basic screens to create, view, edit, change the status of, and remove jobs, so every later feature has a job to attach to.

## 2. Goals

- Dispatchers and Admins can create, view, edit, and delete jobs.
- Each job has a clear status, with only valid changes allowed.
- Overnight jobs are supported.
- Invalid input is rejected with clear field messages.
- Supervisors can move their own jobs through In Progress and Completed.

## 3. Non-Goals

- Assigning crew or the staffed count (F7).
- Searching, filtering, and the role-based job board (F8). This feature only lists all jobs for Dispatchers and Admins.
- Messaging and check-in.
- Recurring jobs, templates, or duplicate-job.
- File or plan uploads, maps, address lookup, or a separate client table.
- Reopening a Completed or Cancelled job.

## 4. Personas & User Stories

- **As a Dispatcher**, I want to create a job with address, date, times, and workers needed so that crews know where to be.
- **As a Dispatcher**, I want to edit a job when the client changes the time so that the record stays correct.
- **As a Dispatcher**, I want to cancel a job and keep it on record so that nobody shows up to a cancelled job.
- **As a Supervisor**, I want to mark my job In Progress and Completed so that the office sees where it stands.
- **As an Admin**, I want the same job powers as a Dispatcher so that I can cover for them.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST let a Dispatcher or Admin create a job with title (1 to 120 characters), address (1 to 200), date, start time, end time, and workers needed (whole number 1 to 50, default 1), plus optional client name (up to 120) and notes (up to 2000). A new job has status Open.
- **FR-2.** The system MUST treat an end time earlier than the start time as ending the next day (overnight job), and MUST reject an end time equal to the start time.
- **FR-3.** The system MUST allow any date, including past dates, when creating or editing a job.
- **FR-4.** The system MUST let a Dispatcher or Admin list all jobs sorted by date and then start time (earliest first) and open any job's detail page.
- **FR-5.** The system MUST let an assigned user (after F7 exists) open the detail page of their own job and MUST return 404 for jobs they are not on (F2).
- **FR-6.** The system MUST let a Dispatcher or Admin edit any field of a Open, Staffed, or In Progress job, and MUST NOT allow edits to the fields of a Completed or Cancelled job.
- **FR-7.** The system MUST allow these status changes only: In Progress by the job's supervisor, Dispatcher, or Admin from Open or Staffed; Completed by the job's supervisor, Dispatcher, or Admin from In Progress; Cancelled by Dispatcher or Admin from Open, Staffed, or In Progress. Open and Staffed are set automatically by F7 and MUST NOT be set by hand. Any other change returns 409.
- **FR-8.** The system MUST treat Completed and Cancelled as final in the MVP.
- **FR-9.** The system MUST let a Dispatcher or Admin delete a job after confirmation. Deleting a job also deletes data that belongs to it (assignments in F7, messages in F9).
- **FR-10.** The system MUST reject invalid input with a 400 response and a message for each bad field, and show those messages next to the fields.
- **FR-11.** The system MUST show a job's title, client, address, date and times, workers needed, notes, and status on its detail page.
- **FR-12.** The system SHOULD default the date field to today on the create form.
- **FR-13.** The system MAY show "Overnight" next to a job whose end time is the next day.

## 6. Non-Functional Requirements

- **Performance** — List and detail load in under 500 ms (p95) with 500 jobs.
- **Security** — Create, edit, status, and delete check roles on the server (F2). A Supervisor can change status only on jobs they supervise.
- **Privacy & Compliance** — Jobs contain client names and addresses of work sites, so only members and office roles can read a job.
- **Accessibility** — WCAG 2.1 AA. Form fields labeled, errors tied to fields, status shown as text as well as color.
- **Scalability** — N/A (hundreds of jobs).
- **Reliability** — Delete removes the job and its dependent data together or not at all.
- **Observability** — Log job create, edit, status change, and delete with actor id and job id.
- **Maintainability** — Time and overnight handling live in one shared helper that F7 and F10 also use.
- **Internationalization** — N/A. Dates and times show in the company's time zone.
- **Backward compatibility** — N/A (new feature).

## 7. Acceptance Criteria

- **AC-1.** *Given* a Dispatcher on the New job form, *when* they submit all required fields, *then* the job is created with status Open and shows on its detail page.
- **AC-2.** *Given* a missing title, a workers needed of 0, or an end time equal to the start time, *when* the Dispatcher submits, *then* the save is rejected with a message on each bad field and no job is created.
- **AC-3.** *Given* start 9:00 PM and end 5:00 AM, *when* the job is saved, *then* it is accepted and treated as ending the next day.
- **AC-4.** *Given* a Dispatcher, *when* they open the job list, *then* all jobs appear sorted by date then start time.
- **AC-5.** *Given* an Open job, *when* the Dispatcher edits the address and saves, *then* the detail page shows the new address.
- **AC-6.** *Given* a Completed or Cancelled job, *when* a Dispatcher tries to edit its fields, *then* the request is rejected with 409 and the job is unchanged.
- **AC-7.** *Given* an In Progress job, *when* its Supervisor sets Completed, *then* the status changes; *given* the Supervisor tries to set Cancelled, *then* the response is 403.
- **AC-8.** *Given* an Open job, *when* anyone tries to set its status to Completed directly or to Staffed by hand, *then* the response is 409 and the status is unchanged.
- **AC-9.** *Given* a Field Worker, *when* they call create, edit, or delete job routes directly, *then* the response is 403.
- **AC-10.** *Given* a Dispatcher on a job, *when* they select Delete and confirm, *then* the job and its dependent data are removed and it no longer appears in the list.
- **AC-11.** *Given* a Dispatcher on a job, *when* they select Delete and cancel the confirmation, *then* nothing is removed.
- **AC-12.** *Given* a job list with no jobs, *when* a Dispatcher opens it, *then* they see "No jobs yet" with a New job button.

## 8. Data Model

**Job (new)**

| Field | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| title | text | required, 1 to 120 characters |
| client_name | text | optional, up to 120 |
| address | text | required, up to 200 |
| date | date | required; the day the job starts |
| start_time / end_time | time | required; end earlier than start means next day |
| workers_needed | integer | required, 1 to 50, default 1 |
| notes | text | optional, up to 2000 |
| status | enum | `open`, `staffed`, `in_progress`, `completed`, `cancelled`; default `open` |
| created_by | reference to User | the Dispatcher or Admin who created it |
| created_at / updated_at | datetime | |

- **Constraints:** end time not equal to start time; workers_needed between 1 and 50.
- **Indexes:** by date and by status.
- **Migration:** one migration creating the Job table. File naming follows the chosen stack.
- **Backfill / seed:** about 6 sample jobs in different states for development.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/jobs` | List all jobs (widened and filtered in F8) | Dispatcher, Admin |
| GET | `/api/jobs/:id` | Job detail | Members of the job, Dispatcher, Admin |
| POST | `/api/jobs` | Create a job | Dispatcher, Admin |
| PUT | `/api/jobs/:id` | Edit job fields | Dispatcher, Admin |
| PATCH | `/api/jobs/:id/status` | Change status (rules in FR-7) | Job supervisor, Dispatcher, Admin |
| DELETE | `/api/jobs/:id` | Delete a job | Dispatcher, Admin |

```
POST /api/jobs   body: { title, client_name?, address, date, start_time, end_time, workers_needed?, notes? }
  201: { job: Job }     400: { errors: [{ field, message }] }

PUT /api/jobs/:id   body: same fields   200: { job: Job }   409 if Completed or Cancelled
PATCH /api/jobs/:id/status   body: { status: "in_progress" | "completed" | "cancelled" }
  200: { job: Job }   403 not allowed for this role   409 invalid change
DELETE /api/jobs/:id   200: {}   404 not found
Job = { id, title, client_name, address, date, start_time, end_time, workers_needed, notes, status, created_by }
```

**Rate limits:** N/A. **Real-time:** N/A. **Documentation:** all routes go in the README API section.

## 10. UI / UX

**Pages and components:** Job list (basic table for Dispatcher and Admin), New job and Edit job form, Job Detail page with Edit, Cancel job, and Delete actions and a status control. Wireframe: ConeZone Wireframes, Job Detail (the crew and messages panels belong to F7 and F9).

**Key flows**

1. Dispatcher selects + New job, fills the form, saves, and lands on the new job's detail page.
2. Dispatcher opens a job, selects Edit, changes details, and saves.
3. Dispatcher selects Cancel job; the status becomes Cancelled and the job stays in the list.
4. Supervisor opens their job and changes the status to In Progress, then Completed.

**States**

- **Empty:** "No jobs yet" with a New job button.
- **Loading:** placeholder rows or fields while data loads.
- **Error:** field messages on the form; "Could not save. Try again." above the form on failure; "This job can no longer be edited" for 409.
- **Offline:** N/A.

**Responsive:** the form is single column at 375 px; the detail page stacks sections on phones. **Accessibility:** delete and cancel use a confirmation dialog with focus trapped; status uses text labels. **Copy keys:** `job.new`, `job.edit`, `job.cancel`, `job.delete.confirm`, `job.list.empty`, `job.final`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none (address is free text; no map service in MVP).
- **Internal modules:** session and role checks (F1, F2); shared layout and states (F4); the shared time helper is reused by F7 and F10; delete cascades into F7 (assignments) and F9 (messages).
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F1, F2, F4.
- Must ship before: F7, F8, F9, F10.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Overnight jobs break date logic in several features | H | H | One shared time helper; AC-3; reused by F7 and F10 |
| Invalid status changes corrupt the staffing logic | M | H | FR-7 transition rules; AC-7 and AC-8 |
| Delete leaves orphan assignments or messages | M | M | FR-9; AC-10 checks dependent data |
| Scope grows to search, maps, or templates | H | M | Non-goals list; F8 owns search and filters |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** schema, then routes with rules, then pages, then seed data.
- **Dogfood:** the team creates, edits, cancels, and deletes jobs as Dispatcher and moves one through Supervisor statuses.
- **GA criteria:** AC-1 through AC-12 pass.
- **Rollback:** revert the pull request; drop the Job table in development.

## 16. Test Plan

- **Unit** — field validation; overnight rule; status transition table (every allowed and disallowed pair).
- **Integration** — each route by each role; edit blocked on final statuses; delete with dependent data.
- **End-to-end** — create, edit, cancel, delete flows; Supervisor status flow.
- **Security** — Field Worker calls to create, edit, and delete; Supervisor changing status on a job they do not supervise.
- **Accessibility** — automated checker on the form and detail page; keyboard-only form completion and dialog use.
- **Performance / load** — list with 500 jobs meets the 500 ms target.
- **Manual exploratory** — jobs at midnight; very long titles; editing the same job in two tabs.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Submit valid form as Dispatcher; expect 201, status Open, detail page | E2E |
| AC-2 | Submit missing title, 0 workers, equal times; expect three field errors and no record | Integration |
| AC-3 | Save 9:00 PM to 5:00 AM job; expect accepted and flagged as overnight | Unit |
| AC-4 | Create three jobs out of order; list; expect date then start time order | Integration |
| AC-5 | Edit address on an Open job; reload; expect new address | E2E |
| AC-6 | Edit a Completed and a Cancelled job; expect 409 and no change | Integration |
| AC-7 | As Supervisor set Completed on In Progress job, then try Cancelled; expect success then 403 | Integration |
| AC-8 | Try Open to Completed and manual Staffed; expect 409 each | Unit |
| AC-9 | As Field Worker call create, edit, delete; expect 403 each | Integration |
| AC-10 | Delete a job with dependent data; expect job and data gone | Integration |
| AC-11 | Cancel the delete confirmation; expect job still listed | E2E |
| AC-12 | Open list with no jobs; expect empty state with New job button | E2E |

## 17. Documentation & Training

- **End-user docs:** a Dispatcher guide on creating jobs and the meaning of each status.
- **Admin and instructor docs:** N/A.
- **API reference:** add six routes to the README.
- **Internal runbook:** how to load the sample jobs.

## 18. Open Questions

1. Should a Dispatcher be able to reopen a Cancelled or Completed job (this plan says no)?
2. Should past dates be blocked or warned about when creating a job?
3. Should Supervisors be able to edit job notes on their own job (spec says status only)?
4. Should the job time zone be stored per job, or stay one company-wide time zone?

## 19. References

- ConeZone Project Specification: §3.2, §6 (Job), §7 (Jobs), §9.
- ConeZone Wireframes: Job Detail.
- Related plans: F2 (role checks), F4 (shell), F7 (crew), F8 (board filters), F9 (thread), F10 (check-in).
- Existing code paths: N/A until the stack is chosen.
