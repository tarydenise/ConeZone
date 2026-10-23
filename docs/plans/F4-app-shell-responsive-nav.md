# F4 — App Shell, Navigation, and Responsive Layout

> Implementation plan. Source: ConeZone Project Specification §3.7 (Responsive Design) and §5 (Wireframes).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F4 |
| **Section** | Responsive Design (infrastructure) |
| **Severity** | MAJOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F1, F2 |
| **Unblocks** | F5, F6, F7, F8, F9, F10, F11 (every page uses the shell and shared states) |

---

## 1. Problem Statement

Without a shared layout, every page would build its own header, navigation, and loading and error messages, and none would behave the same on a phone. Field workers use the app mostly on phones in the field, while dispatchers use desktop screens. This feature builds the shared frame and the reusable states that every later page uses.

## 2. Goals

- One layout (header, navigation, content area) for all logged-in pages.
- Navigation that shows the right items for each role and fits phone, tablet, and desktop.
- Reusable loading, empty, and error displays so later pages stay consistent.
- Access denied and page-not-found screens.
- Pages work without horizontal scrolling at 375 px width.

## 3. Non-Goals

- A logo, brand design, or dark mode.
- Notification bell or unread badges (additional features).
- Offline support and installable app behavior.
- Translations.
- Page content itself (jobs, messages, and so on belong to later features).

## 4. Personas & User Stories

- **As a Field Worker**, I want large, easy-to-tap navigation on my phone so that I can use the app with gloves or in sunlight.
- **As a Dispatcher**, I want a desktop navigation bar so that I can jump between the job board and announcements quickly.
- **As an Admin**, I want a Users link that other roles do not see so that the menu is not cluttered.
- **As any user**, I want the same loading and error messages everywhere so that I know what is happening.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST show a shared layout on every logged-in page with the app name, the user's name and role, and a Log out button.
- **FR-2.** The system MUST show navigation items based on role: Field Worker and Supervisor see My Jobs, Announcements, and Profile; Dispatcher sees Jobs, Announcements, and Profile; Admin sees Jobs, Announcements, Users, and Profile.
- **FR-3.** The system MUST send a user to their home page after login: My Jobs for Field Worker and Supervisor, Jobs for Dispatcher and Admin.
- **FR-4.** The system MUST show a top navigation bar at widths of 1024 px and above.
- **FR-5.** The system MUST show a bottom tab bar for Field Worker and Supervisor below 768 px, and a menu button that opens the navigation for Dispatcher and Admin below 768 px.
- **FR-6.** The system MUST NOT cause horizontal page scrolling at 375 px width. Wide tables MUST scroll inside their own box or become cards.
- **FR-7.** The system MUST make every button and navigation item at least 44 by 44 px.
- **FR-8.** The system MUST provide reusable loading, empty, and error displays that take a message and (for errors) a Retry action.
- **FR-9.** The system MUST provide an access denied screen (used by F2) and a page-not-found screen, each with a link to the user's home page.
- **FR-10.** The system MUST mark the current page in navigation (visually and for screen readers).
- **FR-11.** The system SHOULD provide a "skip to content" link and visible keyboard focus outlines.
- **FR-12.** The system MAY remember whether the phone menu was open. It is not required.

## 6. Non-Functional Requirements

- **Performance** — The shell adds no visible delay. Navigation between pages does not reload the header.
- **Security** — The shell hides navigation by role as a convenience only. Real protection is F2.
- **Privacy & Compliance** — The header shows only the user's name and role.
- **Accessibility** — WCAG 2.1 AA: contrast of at least 4.5:1 for text, visible focus, landmarks for header, navigation, and main content, and navigation reachable by keyboard.
- **Scalability** — N/A.
- **Reliability** — If the current-user call fails, the shell shows the error display, not a blank page.
- **Observability** — N/A.
- **Maintainability** — Colors, spacing, and breakpoints live in one shared place so the team does not repeat values.
- **Internationalization** — N/A for MVP. Keep navigation labels in one place.
- **Backward compatibility** — N/A.

## 7. Acceptance Criteria

- **AC-1.** *Given* a Field Worker who logs in on a 375 px phone, *when* the page loads, *then* they land on My Jobs and see a bottom tab bar with Jobs, Announcements, and Profile.
- **AC-2.** *Given* a Dispatcher on a 1280 px desktop, *when* they log in, *then* they land on the Job Board and see a top bar with Jobs and Announcements, and no Users link.
- **AC-3.** *Given* an Admin, *when* they view navigation, *then* a Users link appears; *given* any other role, *then* it does not.
- **AC-4.** *Given* a Dispatcher on a 375 px phone, *when* they select the menu button, *then* a menu opens with their navigation items and closes with a second tap or Escape.
- **AC-5.** *Given* any page at 375 px width, *when* it renders, *then* the page itself does not scroll horizontally.
- **AC-6.** *Given* any button or navigation item, *when* its size is measured, *then* it is at least 44 by 44 px.
- **AC-7.** *Given* a page waiting for data, *when* the response is slow, *then* the loading display appears; *given* the request fails, *then* the error display shows a Retry button that retries the request.
- **AC-8.** *Given* a signed-in user opening an address that does not exist, *when* the page loads, *then* the not-found screen shows with a link home.
- **AC-9.** *Given* a user on any page, *when* they press Tab from the top, *then* a "Skip to content" link appears first and focus outlines are visible on every item.
- **AC-10.** *Given* the current page is Announcements, *when* navigation renders, *then* Announcements is marked as current for sighted users and screen readers.

## 8. Data Model

N/A. This feature stores no data. It reads the current user (name and role) from F1.

## 9. API Surface

- **New routes:** none. The shell calls `GET /api/users/me` (F1) and uses `Log out` (F1).
- **Rate limits:** N/A. **Real-time:** N/A. **Documentation:** N/A beyond the README note listing screen breakpoints.

## 10. UI / UX

**Pages and components:** layout wrapper; top navigation (desktop); bottom tab bar (phone, workers); menu button and drawer (phone, Dispatcher and Admin); loading, empty, and error displays; access denied page; not-found page. Wireframes: ConeZone Wireframes, Job Board (desktop top bar) and My Jobs (bottom tab bar).

**Key flows**

1. User logs in and lands on their role's home page inside the shell.
2. User taps a navigation item and the content area changes while the header stays.
3. A page request fails, the error display appears, and the user taps Retry.

**Navigation by role**

| Role | Items | Home |
|---|---|---|
| Field Worker | My Jobs, Announcements, Profile | My Jobs |
| Supervisor | My Jobs, Announcements, Profile | My Jobs |
| Dispatcher | Jobs, Announcements, Profile | Jobs |
| Admin | Jobs, Announcements, Users, Profile | Jobs |

**Breakpoints:** phone below 768 px, tablet 768 to 1023 px (top bar with collapsible labels), desktop 1024 px and above.

**States**

- **Empty:** shared display takes a message such as "No jobs found" and an optional action button.
- **Loading:** simple placeholder or spinner with an accessible label "Loading".
- **Error:** message with Retry.
- **Offline:** N/A. Network errors use the error display.

**Accessibility:** header, navigation, and main landmarks; skip link; the phone menu traps focus and closes with Escape; current item uses `aria-current`. **Copy keys:** `nav.myjobs`, `nav.jobs`, `nav.announcements`, `nav.users`, `nav.profile`, `state.loading`, `state.error.retry`, `notfound.title`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none, apart from an optional web font.
- **Internal modules:** current user and log out (F1); access denied screen used by F2 route guards; every later page renders inside the shell.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F1, F2.
- Must ship before: F5 and every page-building feature (F6 to F11).
- Shared infrastructure needed: none.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Each page builds its own layout, so the app looks inconsistent | H | M | All pages use the shell; reviewers reject pages that bypass it |
| Desktop-first tables break on phones | H | M | FR-6, AC-5; tables scroll in a box or turn into cards |
| Touch targets too small for gloved use | M | M | FR-7, AC-6 |
| Shell takes more than a week and blocks others | M | H | Keep to the non-goals; build the shell with placeholder pages first |

## 15. Rollout Plan

- **Feature flag:** none (core MVP feature).
- **Sequencing:** layout and navigation first, then shared state displays, then error and not-found pages.
- **Dogfood:** the team opens placeholder pages at 375 px, 768 px, and 1280 px as each role.
- **GA criteria:** AC-1 through AC-10 pass.
- **Rollback:** revert the pull request; pages fall back to bare layouts.

## 16. Test Plan

- **Unit** — role to navigation items mapping; home page for each role.
- **Integration** — shell shows the error display when the current-user call fails.
- **End-to-end** — log in as each role at phone and desktop widths and check navigation; open an invalid address.
- **Security** — N/A beyond F2.
- **Accessibility** — automated checker on the shell; keyboard-only walkthrough including the phone menu and skip link.
- **Performance / load** — N/A.
- **Manual exploratory** — rotate a phone; browser zoom to 200%; very long names in the header.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Log in as Field Worker at 375 px; expect My Jobs and bottom tabs | E2E |
| AC-2 | Log in as Dispatcher at 1280 px; expect Jobs home and no Users link | E2E |
| AC-3 | Compare navigation for Admin and each other role; expect Users only for Admin | Unit |
| AC-4 | Open and close the phone menu for Dispatcher; expect items, toggle, and Escape close | E2E |
| AC-5 | Load each page at 375 px; expect no horizontal page scroll | E2E |
| AC-6 | Measure interactive elements; expect at least 44 by 44 px | E2E |
| AC-7 | Delay then fail a request; expect loading display, then error with working Retry | Integration |
| AC-8 | Open an unknown address; expect not-found screen with home link | E2E |
| AC-9 | Tab from page top; expect skip link first and visible focus | Accessibility |
| AC-10 | Inspect navigation on Announcements; expect current-page marking | Accessibility |

## 17. Documentation & Training

- **End-user docs:** a one-page "Getting around the app" note per role.
- **Admin and instructor docs:** N/A.
- **API reference:** N/A.
- **Internal runbook:** how to use the shell and shared states when building a new page.

## 18. Open Questions

1. The wireframe shows a "Msgs" tab for workers. This plan uses Announcements instead because job threads open from a job. Should there be a Messages tab listing all of a worker's threads?
2. Should Supervisors see the same navigation as Field Workers, or a "My Crew" item?
3. Should the Dispatcher's calendar view (additional feature) get a navigation slot now?

## 19. References

- ConeZone Project Specification: §3.7, §5 (Wireframes).
- ConeZone Wireframes: Job Board, My Jobs.
- Related plans: F1, F2; every page feature uses this one.
- External standards: WCAG 2.1 AA.
