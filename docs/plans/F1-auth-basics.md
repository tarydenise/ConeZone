# F1 — Auth Basics (Sign Up, Log In, Log Out)

> Implementation plan. Source: ConeZone Project Specification §3.1 (Authentication and Profiles) and §7 (Auth endpoints).

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F1 |
| **Section** | Users and Authentication |
| **Severity** | BLOCKER |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | None |
| **Unblocks** | F2, F3, F4, F5, F6, F7, F8, F9, F10, F11 (everything that needs to know who the user is) |

---

## 1. Problem Statement

The app has no accounts, so it cannot tell who is using it or what they are allowed to see. Every other feature (jobs, crews, messages, check-in) depends on knowing the current user. This feature gives each person an account and a way to log in and out securely.

## 2. Goals

- A new person can create an account and be logged in right away.
- A returning user can log in, stay logged in across page refreshes, and log out.
- Pages and API routes that need a user reject visitors who are not logged in.
- Passwords are never stored or returned in readable form.
- The current user can be fetched so the UI knows their name and role.

## 3. Non-Goals

- Password reset by email, "forgot password" flows.
- Email verification, social login, two-factor authentication.
- Editing a profile or changing a password (F5).
- Role changes or deactivating users (F3).
- Enforcing what each role may do (F2). This feature only proves who the user is.
- Creating the first Admin through the UI. The team creates it with a seed step.

## 4. Personas & User Stories

- **As a new Field Worker**, I want to sign up with my email and a password so that I can see my jobs.
- **As any returning user**, I want to log in and stay logged in on my phone so that I do not retype my password every time I open the app.
- **As any user on a shared device**, I want to log out so that nobody else can use my account.
- **As an Admin**, I want deactivated users to be unable to log in so that former employees lose access.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST let a visitor create an account with name, email, and password. The new account has the role `field_worker` and is active.
- **FR-2.** The system MUST require name (1 to 100 characters), a valid email format, and a password of at least 8 characters, and MUST reject sign up that breaks any rule with a message naming the field.
- **FR-3.** The system MUST treat email as unique ignoring capitalization, and MUST reject sign up with an email already in use.
- **FR-4.** The system MUST store only a secure hash of the password and MUST NOT include the password or hash in any response.
- **FR-5.** The system MUST let a user log in with email and password and start an authenticated session on success.
- **FR-6.** The system MUST show the same message ("Email or password is incorrect") for an unknown email and for a wrong password.
- **FR-7.** The system MUST refuse login for a deactivated user who enters the correct password, with the message "This account is inactive. Contact an administrator."
- **FR-8.** The system MUST keep a user logged in across page refreshes for up to 7 days or until they log out.
- **FR-9.** The system MUST let a logged-in user log out, which ends the session immediately.
- **FR-10.** The system MUST return 401 for any protected API route called without a valid session.
- **FR-11.** The system MUST redirect a logged-out visitor who opens a protected page to the login page, and send them back to that page after they log in.
- **FR-12.** The system MUST provide the current user's id, name, email, and role to the UI.
- **FR-13.** The system SHOULD trim spaces and lowercase the email before saving or comparing it.
- **FR-14.** The system MAY slow down or block login after 5 failed attempts for one email within 10 minutes.

## 6. Non-Functional Requirements

- **Performance** — Login and sign up respond in under 1 second (p95) on a local or hosted test setup.
- **Security** — Passwords hashed with a slow, salted algorithm. Session identifiers cannot be read by page scripts. Login errors do not reveal whether an email exists. Credentials only travel over a secure connection when deployed.
- **Privacy & Compliance** — Store only the data in the spec (name, email, phone, certifications). No legal compliance regime applies to the class project.
- **Accessibility** — WCAG 2.1 AA. Every field has a visible label, errors are announced next to the field, and the forms work with keyboard only.
- **Scalability** — N/A (prototype for one company).
- **Reliability** — A failed sign up leaves no partial account behind.
- **Observability** — Log sign ups, successful logins, and failed logins (email and time, never the password).
- **Maintainability** — Authentication code lives in one module that other features import. No feature reads credentials directly.
- **Internationalization** — N/A for MVP. Keep message text in one place.
- **Backward compatibility** — N/A (new feature).

## 7. Acceptance Criteria

- **AC-1.** *Given* a visitor on Sign Up, *when* they submit a valid name, a new email, and an 8-character password, *then* an account with role Field Worker is created, they are logged in, and they land on their home page.
- **AC-2.** *Given* an account with `Jo@Example.com`, *when* someone signs up with `jo@example.com`, *then* sign up is rejected with "An account with this email already exists" and no second account exists.
- **AC-3.** *Given* a password of 7 characters, *when* the visitor submits Sign Up, *then* it is rejected with a message about the 8-character minimum.
- **AC-4.** *Given* a newly created account, *when* the stored record and every API response are inspected, *then* the password appears only as a hash in storage and never in a response.
- **AC-5.** *Given* valid credentials, *when* the user logs in, *then* they are authenticated and sent to their home page.
- **AC-6.** *Given* a wrong password for a real email and an unknown email, *when* each tries to log in, *then* both see the identical message "Email or password is incorrect".
- **AC-7.** *Given* a deactivated user, *when* they log in with the correct password, *then* login is refused with the inactive-account message.
- **AC-8.** *Given* a logged-in user, *when* they refresh the page, *then* they are still logged in.
- **AC-9.** *Given* a logged-in user, *when* they log out and then open a protected page, *then* they are sent to the login page.
- **AC-10.** *Given* no session, *when* the current-user route is called, *then* it returns 401; *given* a session, *then* it returns id, name, email, and role without any password data.
- **AC-11.** *Given* a logged-out visitor who opens a job page link, *when* they log in, *then* they land on that job page.

## 8. Data Model

**User (new)**

| Field | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| name | text | required, 1 to 100 characters |
| email | text | required, unique ignoring capitalization |
| password_hash | text | never returned by the API |
| phone | text | nullable (edited in F5) |
| certifications | text | nullable (edited in F5) |
| role | enum | `admin`, `dispatcher`, `supervisor`, `field_worker`; default `field_worker` |
| is_active | boolean | default true |
| created_at / updated_at | datetime | |

- **Constraints:** unique email (case-insensitive).
- **Migration:** one migration creating the User table. File naming follows the stack chosen after the Bakeoffs.
- **Backfill / seed:** a seed step creates one Admin account and a few test users (one per role) for development. The README documents how to run it.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| POST | `/api/auth/register` | Create account and log in | Public |
| POST | `/api/auth/login` | Log in | Public |
| POST | `/api/auth/logout` | Log out | Logged-in user |
| GET | `/api/users/me` | Current user | Logged-in user |

```
POST /api/auth/register  body: { name, email, password }
  201: { user: { id, name, email, role } }
  400: { errors: [{ field, message }] }      409: email already used

POST /api/auth/login     body: { email, password }
  200: { user: { id, name, email, role } }
  401: { message: "Email or password is incorrect" }
  403: { message: "This account is inactive. Contact an administrator." }

POST /api/auth/logout    200: {}
GET  /api/users/me       200: { id, name, email, phone, certifications, role }   401 if no session
```

**Rate limits:** optional, see FR-14. **Real-time:** N/A. **Documentation:** all four routes go in the README API section.

## 10. UI / UX

**Pages and components:** Login page, Sign Up page, a Log out button in the header (the full header comes from F4; until then, a simple button on a placeholder home page).

**Key flows**

1. Visitor opens the app and is sent to Login. They select "Sign up", fill the form, and land on their home page.
2. Returning user enters email and password and lands on their home page (or the page they first requested).
3. Logged-in user selects Log out and returns to Login.

**States**

- **Loading:** the submit button is disabled and shows "Logging in..." or "Creating account..." until the response arrives.
- **Error:** field-level messages for validation, one message above the form for login failures and inactive accounts.
- **Empty:** N/A.
- **Offline:** N/A. A network failure shows "Could not reach the server. Try again."

**Responsive:** forms are centered, single column, and usable at 375 px width. Wireframe: ConeZone Wireframes, Login.

**Accessibility:** labels tied to inputs, error text linked to its field, password field supports show/hide with a labeled button.

**Copy keys:** `auth.login.title`, `auth.login.error`, `auth.inactive`, `auth.signup.title`, `auth.email.exists`, `auth.password.min`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none (no email service in MVP).
- **Internal modules:** every protected route in later features calls the session check from this feature. F2 builds role checks on top of it.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: nothing. This is the first feature.
- Must ship before: all other features.
- Shared infrastructure needed: the database and a place to hold session state.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Passwords stored or logged in plain text | L | H | Hash on save; AC-4; never log request bodies on auth routes |
| Session handling mistakes leave logged-out users with access | M | H | AC-9 and AC-10; test after logout and with a missing session |
| Login errors reveal which emails exist | M | M | One shared message; AC-6 |
| Team picks a stack where auth is slow to set up | M | M | Keep scope to the non-goals list; no reset or verification |

## 15. Rollout Plan

- **Feature flag:** none (core MVP feature).
- **Sequencing:** schema, then routes, then pages, then seed script.
- **Dogfood:** the team signs up and logs in with the seeded test users on phone and desktop.
- **GA criteria:** AC-1 through AC-11 pass.
- **Rollback:** revert the pull request; in development, drop and recreate the User table.

## 16. Test Plan

- **Unit** — email normalization, password length rule, the shared login error message.
- **Integration** — each route with valid, invalid, duplicate, and inactive-user inputs; protected route with and without a session.
- **End-to-end** — sign up to home page; log in, refresh, log out; deep link then login.
- **Security** — password never in responses; same message for unknown email and wrong password; session ends on logout.
- **Accessibility** — automated checker on Login and Sign Up; keyboard-only completion of both forms.
- **Performance / load** — N/A beyond the 1 second check on a local setup.
- **Manual exploratory** — capitalization in emails, very long names, pasting spaces around an email, back button after logout.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Submit valid sign up; expect new Field Worker, session started, redirect to home | E2E |
| AC-2 | Sign up with `jo@example.com` when `Jo@Example.com` exists; expect 409 and one account | Integration |
| AC-3 | Submit 7-character password; expect 400 naming the password field | Integration |
| AC-4 | Read stored record and all responses after sign up; expect hash only in storage | Integration |
| AC-5 | Log in with valid credentials; expect 200 and redirect | E2E |
| AC-6 | Compare messages for wrong password and unknown email; expect identical text | Integration |
| AC-7 | Deactivate user then log in with correct password; expect 403 and inactive message | Integration |
| AC-8 | Log in, reload page; expect still logged in | E2E |
| AC-9 | Log out then request a protected page and route; expect login redirect and 401 | E2E |
| AC-10 | Call current-user route without and with a session; expect 401, then user without password data | Integration |
| AC-11 | Open a job link while logged out, log in; expect that job page | E2E |

## 17. Documentation & Training

- **End-user docs:** a short "Create your account" note for field workers.
- **Admin and instructor docs:** how to run the seed step to create the first Admin.
- **API reference:** add the four routes to the README API section.
- **Internal runbook:** how to reset the development database and re-seed.

## 18. Open Questions

1. How long should a session last (this plan says 7 days)?
2. Should sign up be open to anyone, or limited to people with a company email or invite code?
3. Should Admins be warned when a new account signs up so they can set its role?
4. Is login throttling (FR-14) worth including in the MVP?

## 19. References

- ConeZone Project Specification: §3.1, §7 (Auth and Users).
- ConeZone Wireframes: Login.
- Related plans: F2 (role enforcement), F5 (profile and password change).
- Existing code paths: N/A until the stack is chosen.
