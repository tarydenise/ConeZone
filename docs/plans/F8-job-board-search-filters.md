# F8 — Job Board: Search, Filters, and Staffing View

> Implementation plan. Source: ConeZone Project Specification §3.2 (filter and search), §3.3 (staffed visibility), §5 (Job Board wireframe), §7 (GET jobs).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F8 |
| **Section** | Jobs and Crew |
| **Severity** | MAJOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F6, F7 |
| **Unblocks** | None (the calendar view, an additional feature, would build on the same list route) |

---

## 1. Problem Statement

F6 lists every job in one plain table. As jobs pile up, Dispatchers cannot find the job they need or see which jobs are short of workers, and Supervisors and Field Workers should only see jobs they are on. This feature turns the list into a usable job board with search, filters, staffing information, and role-based visibility.

## 2. Goals

- Dispatchers find a job by text, date, or status in seconds.
- Understaffed jobs are obvious at a glance.
- Supervisors and Field Workers see only their own jobs through the same route.
- A filtered view survives a page refresh and can be shared as a link.

## 3. Non-Goals

- A calendar or week view (additional feature).
- Saved filters, sort options other than date and time, or CSV export.
- Searching message text or user names.
- Map view or distance sorting.
- Changing how jobs are created, edited, or assigned (F6, F7).

## 4. Personas & User Stories

- **As a Dispatcher**, I want to filter by date and status so that I can review tomorrow's Open jobs.
- **As a Dispatcher**, I want to search by address so that I can find a job when a client calls.
- **As a Dispatcher**, I want each row to show "3 / 4" and "Needs 1 more" so that I can see understaffing without opening the job.
- **As a Supervisor**, I want to list all jobs I am on, including past ones, so that I can look something up.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST support a `search` filter that matches job title, client name, or address, ignoring capitalization, with partial matches.
- **FR-2.** The system MUST support a `date` filter (one calendar day) and a `status` filter (one of the five statuses), and MUST combine all filters with AND.
- **FR-3.** The system MUST sort results by date and then start time, earliest first.
- **FR-4.** The system MUST return all jobs to Dispatchers and Admins, and only jobs they are assigned to (any date) to Supervisors and Field Workers.
- **FR-5.** The system MUST show for each job its title, date, time range, staffed count as "N / M", and a status label.
- **FR-6.** The system MUST show "Needs K more" (K = workers needed minus staffed) on jobs whose status is Open, in text and not only by color.
- **FR-7.** The system MUST show Cancelled jobs in the list with a Cancelled label.
- **FR-8.** The system MUST show "No jobs found" with a Clear filters button when filters match nothing, and "No jobs yet" when there are no jobs at all.
- **FR-9.** The system MUST keep the current search and filters in the page address so a refresh or shared link shows the same list.
- **FR-10.** The system SHOULD wait 300 ms after the user stops typing before running a search.
- **FR-11.** The system SHOULD show 25 jobs per page and offer next and previous page controls when there are more.
- **FR-12.** The system MAY highlight the row's date when it is today.

## 6. Non-Functional Requirements

- **Performance** — Target (a goal to check, not a hard limit): a filtered list with staffed counts loads in under 500 ms (p95) with 500 jobs.
- **Security** — Role filtering is done on the server. Supervisors and Field Workers cannot see other jobs by editing the address or filters.
- **Privacy & Compliance** — Search runs only over jobs the user is allowed to see.
- **Accessibility** — WCAG 2.1 AA. Search and filters have visible labels, results changes are announced, status not shown by color alone.
- **Scalability** — N/A (hundreds of jobs).
- **Reliability** — If staffed counts cannot be calculated, the list shows an error rather than wrong numbers.
- **Observability** — N/A.
- **Maintainability** — The staffed count comes from the same calculation as F7, not a second copy.
- **Internationalization** — N/A.
- **Backward compatibility** — Extends `GET /api/jobs` from F6 without changing the shape of existing fields.

## 7. Acceptance Criteria

- **AC-1.** *Given* jobs titled "Main St Utility Work" and "I-15 Night Paving", *when* the Dispatcher searches "main st", *then* only the first appears.
- **AC-2.** *Given* a job at "123 Main St", *when* the Dispatcher searches "123 main", *then* it appears (address match).
- **AC-3.** *Given* jobs on Oct 23 and Oct 24, *when* the Dispatcher filters date Oct 24 and status Open, *then* only Open jobs on Oct 24 appear.
- **AC-4.** *Given* any set of results, *when* the list renders, *then* jobs are in date then start time order.
- **AC-5.** *Given* a Field Worker assigned to one job, *when* they call the list route, *then* only that job is returned, including if it is in the past.
- **AC-6.** *Given* an Open job with 3 of 4 assigned, *when* the row renders, *then* it shows "3 / 4", the Open label, and "Needs 1 more".
- **AC-7.** *Given* a Cancelled job, *when* the list renders, *then* the job appears with a Cancelled label.
- **AC-8.** *Given* a search that matches nothing, *when* results return, *then* "No jobs found" and a working Clear filters button appear.
- **AC-9.** *Given* an applied search and status filter, *when* the page is refreshed, *then* the same filters and results show.
- **AC-10.** *Given* 40 jobs, *when* the board loads, *then* 25 appear with a working next page control that shows the rest.
- **AC-11.** *Given* a Supervisor who edits the address to add another job's id or filters, *when* the request is processed, *then* they still see only their own jobs.

## 8. Data Model

- **New tables or columns:** none. Reads Job (F6) and Assignment (F7).
- **Indexes and constraints:** indexes on date and status (created in F6) support the filters. Search on text columns is acceptable as a simple partial match at this size.
- **Migration:** none. **Backfill:** none.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/jobs` | Filtered job list (changed from F6) | Any logged-in user, filtered by role (FR-4) |

```
GET /api/jobs?search=main&date=2026-10-24&status=open&page=1
  200: { items: [{ id, title, date, start_time, end_time, workers_needed,
                   staffed_count, status }], total, page, page_size: 25 }
  400: invalid date or status value
```

**Rate limits:** N/A. **Real-time:** N/A (live updates are an additional feature). **Documentation:** document the query parameters in the README API section.

## 10. UI / UX

**Pages and components:** Job Board page (replaces the plain list from F6) with a search box, date field, status dropdown, results table, and pagination; mobile card layout for the same list. Wireframe: ConeZone Wireframes, Job Board (Dispatcher, desktop).

**Key flows**

1. Dispatcher opens the Job Board and sees all jobs, earliest first.
2. Dispatcher types in the search box and picks a status; results update and the address changes.
3. Dispatcher selects a row to open its detail page.
4. Supervisor opens their jobs list and sees only their jobs.

**States**

- **Empty:** "No jobs found" with Clear filters; or "No jobs yet" with + New job for Dispatchers and Admins.
- **Loading:** placeholder rows while results load.
- **Error:** "Could not load jobs" with Retry (F4 display).
- **Offline:** N/A.

**Responsive:** table on desktop; cards at phone width showing title, date and time, "N / M", and status. **Accessibility:** results count announced after each change; labels on every control. **Copy keys:** `board.search.placeholder`, `board.empty.filtered`, `board.empty.none`, `board.needsMore`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** job records (F6); staffed count and membership (F7, F2); shell and states (F4).
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F6, F7.
- Must ship before: nothing in the MVP depends on it.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Role filtering done in the page instead of the server | M | H | FR-4; AC-5 and AC-11 call the route directly |
| Staffed count calculated two different ways | M | M | Reuse the F7 calculation; AC-6 |
| Slow list from counting assignments per row | M | M | Count in one query; check the 500 ms target |
| Filters that do not survive refresh frustrate Dispatchers | L | L | FR-9; AC-9 |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** route filters and role filtering, then page controls, then pagination.
- **Dogfood:** the team searches and filters sample jobs as Dispatcher and Supervisor.
- **GA criteria:** AC-1 through AC-11 pass.
- **Rollback:** revert the pull request; the plain list from F6 remains.

## 16. Test Plan

- **Unit** — search matching rules; filter combination; "Needs K more" calculation.
- **Integration** — the list route with each filter and combinations; role filtering for each role; pagination.
- **End-to-end** — search and filter then refresh; clear filters; open a row.
- **Security** — tampering with query parameters as a Field Worker and Supervisor.
- **Accessibility** — automated checker on the board; keyboard-only filtering.
- **Performance / load** — 500 jobs with staffed counts meets the 500 ms target.
- **Manual exploratory** — special characters in search; two filters leaving no results; phone width.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Seed two jobs; search "main st"; expect one result | Integration |
| AC-2 | Search "123 main"; expect the address match | Integration |
| AC-3 | Filter date and status together; expect only the intersection | Integration |
| AC-4 | Create jobs out of order; expect date then start time order | Integration |
| AC-5 | As assigned Field Worker call list; expect only own job including past | Integration |
| AC-6 | Render an Open job with 3 of 4 assigned; expect "3 / 4" and "Needs 1 more" | E2E |
| AC-7 | Cancel a job; expect it listed with Cancelled label | E2E |
| AC-8 | Search for nonsense; expect empty state and working Clear filters | E2E |
| AC-9 | Apply filters then reload; expect same filters and results | E2E |
| AC-10 | Seed 40 jobs; expect 25 then next page shows 15 | Integration |
| AC-11 | As Supervisor send extra filters or job ids; expect only own jobs | Security |

## 17. Documentation & Training

- **End-user docs:** a Dispatcher note on searching, filtering, and reading "Needs K more".
- **Admin and instructor docs:** N/A.
- **API reference:** document the query parameters and the response shape.
- **Internal runbook:** N/A.

## 18. Open Questions

1. Should the board hide Completed and Cancelled jobs by default (this plan shows everything)?
2. Should "Needs K more" appear only for jobs within the next 2 days to reduce noise?
3. Should Supervisors and Field Workers use this route or only My Jobs (F7)? This plan lets both work.
4. Is pagination necessary at about 500 jobs, or is scrolling enough?

## 19. References

- ConeZone Project Specification: §3.2, §3.3, §5 (Job Board), §7 (Jobs).
- ConeZone Wireframes: Job Board.
- Related plans: F6 (jobs), F7 (staffed count), F4 (states).
- Existing code paths: N/A until the stack is chosen.
