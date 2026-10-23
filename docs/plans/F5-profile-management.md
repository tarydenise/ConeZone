# F5 — Profile Management

> Implementation plan. Source: ConeZone Project Specification §3.1 (Profile page) and §7 (Auth and Users routes), wireframe 5.6.

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F5 |
| **Section** | Users and Authentication |
| **Severity** | MINOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F1, F4 |
| **Unblocks** | None (this is a standalone CRUD flow; it is the first user-owned update flow for the team to test) |

---

## 1. Problem Statement

Accounts store a name, phone number, and certifications, but users cannot update them or change their password. Field workers need to correct their name and phone, and keep certification notes current. Without this, the only way to fix a typo or rotate a password is to edit the database.

## 2. Goals

- A user can view and edit their own name, phone, and certifications.
- A user can change their own password safely.
- Role and email are visible but cannot be edited here.
- A user can only ever change their own profile.

## 3. Non-Goals

- Changing email, role, or active status.
- Profile photos.
- Viewing or editing other users' profiles.
- Deleting an account.
- Tracking certification expiry dates or reminders.
- Password reset by email.

## 4. Personas & User Stories

- **As a Field Worker**, I want to add my phone number so that my supervisor can reach me.
- **As a Field Worker**, I want to list my certifications ("ATSSA Flagger, expires 03/2027") so that the company knows my qualifications.
- **As any user**, I want to change my password so that I can keep my account secure.
- **As any user**, I want to see my role so that I know what I can do in the app.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST show the logged-in user's name, email (read-only), phone, certifications, and role (read-only).
- **FR-2.** The system MUST let a user update name (required, 1 to 100 characters), phone (optional, up to 20 characters of digits, spaces, plus, dashes, and parentheses), and certifications (optional, up to 500 characters).
- **FR-3.** The system MUST reject any attempt to change email, role, or active status through the profile route, with a 400 response.
- **FR-4.** The system MUST let a user change their password by entering the current password, a new password of at least 8 characters, and a confirmation that matches.
- **FR-5.** The system MUST reject a password change if the current password is wrong or the new password equals the current one.
- **FR-6.** The system MUST keep the user logged in after a successful password change.
- **FR-7.** The system MUST validate input on the server as well as in the page.
- **FR-8.** The system MUST only act on the logged-in user's own record. The routes do not accept a user id.
- **FR-9.** The system MUST NOT return password data in any response.
- **FR-10.** The system SHOULD show a confirmation message after a successful save.
- **FR-11.** The system SHOULD warn before leaving the page with unsaved changes.
- **FR-12.** The system MAY show a counter for the certifications field.

## 6. Non-Functional Requirements

- **Performance** — Save and load respond in under 500 ms (p95).
- **Security** — Own-record only. Current password verified before a change. New password stored hashed (F1).
- **Privacy & Compliance** — Phone and certifications are visible to the user and to nobody else in the MVP (see Open Questions).
- **Accessibility** — WCAG 2.1 AA. Each field has a visible label, errors appear next to the field, and success is announced to screen readers.
- **Scalability** — N/A.
- **Reliability** — A failed save leaves the old values in place.
- **Observability** — Log password changes (user id and time, never the password).
- **Maintainability** — Password rules are shared with sign up (F1), not copied.
- **Internationalization** — N/A. Phone format is not enforced beyond allowed characters.
- **Backward compatibility** — N/A.

## 7. Acceptance Criteria

- **AC-1.** *Given* a logged-in user, *when* they open Profile, *then* they see their name, email, phone, certifications, and role, with email and role not editable.
- **AC-2.** *Given* the Profile form, *when* the user changes name, phone, and certifications and saves, *then* a confirmation appears and a reload shows the new values.
- **AC-3.** *Given* an empty name, *when* the user saves, *then* the save is rejected with a message on the name field and nothing changes.
- **AC-4.** *Given* a phone number with letters, *when* the user saves, *then* it is rejected with a message on the phone field.
- **AC-5.** *Given* a request that includes `role` or `email`, *when* it is sent to the profile route, *then* the response is 400 and the stored role and email are unchanged.
- **AC-6.** *Given* the correct current password and a valid new password, *when* the user changes it, *then* the change succeeds, the user stays logged in, and the new password works on the next login.
- **AC-7.** *Given* a wrong current password, *when* the user changes it, *then* it is rejected with "Current password is incorrect" and the password is unchanged.
- **AC-8.** *Given* a new password of 7 characters or one that matches the current password, *when* submitted, *then* it is rejected with a message explaining why.
- **AC-9.** *Given* a user logged out, *when* any profile route is called, *then* the response is 401.
- **AC-10.** *Given* two users, *when* the first saves a profile, *then* the second user's record is unchanged.

## 8. Data Model

- **New tables or columns:** none. Uses `User.name`, `phone`, `certifications` (F1).
- **Indexes and constraints:** length limits from FR-2 enforced on save.
- **Migration:** none. **Backfill:** none (phone and certifications are already nullable).

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/users/me` | Read own profile (from F1) | Logged-in user |
| PUT | `/api/users/me` | Update name, phone, certifications | Logged-in user |
| PUT | `/api/users/me/password` | Change password | Logged-in user |

```
PUT /api/users/me
  body: { name, phone?, certifications? }
  200: { user: { id, name, email, phone, certifications, role } }
  400: { errors: [{ field, message }] }   (also for role, email, or is_active sent)

PUT /api/users/me/password
  body: { current_password, new_password }
  200: {}
  400: { errors: [{ field, message }] }
  403: { message: "Current password is incorrect" }
```

**Rate limits:** N/A. **Real-time:** N/A. **Documentation:** add routes to the README API section.

## 10. UI / UX

**Pages and components:** Profile page with an edit form and a separate Change password section. Wireframe: ConeZone Wireframes, Profile (5.6 in the specification).

**Key flows**

1. User opens Profile, edits phone and certifications, and selects Save. A confirmation appears.
2. User opens Change password, fills three fields, and selects Update password. A confirmation appears.

**States**

- **Empty:** phone and certifications show placeholders ("Add a phone number").
- **Loading:** form fields disabled with a "Loading" label until data arrives.
- **Error:** field-level messages for validation; a message above the form if the save fails.
- **Offline:** N/A. A network failure shows "Could not reach the server. Try again."

**Responsive:** single column at 375 px with large inputs. **Accessibility:** labels tied to inputs; success message in a live region; show/hide button for password fields. **Copy keys:** `profile.title`, `profile.saved`, `profile.password.wrong`, `profile.password.same`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** session and current user (F1); the shell and shared states (F4); password rules from F1.
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none.

## 13. Dependencies & Sequencing

- Must ship after: F1, F4.
- Must ship before: nothing depends on it.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A user changes their own role by adding it to the request | M | H | FR-3 rejects extra protected fields; AC-5 |
| Password change skips the current-password check | L | H | FR-4, FR-5; AC-7 |
| Password rules differ from sign up | M | L | Shared rule (Maintainability); AC-8 |
| Unsaved edits lost on navigation | M | L | FR-11 warning |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** routes, then page, then password section.
- **Dogfood:** the team edits their own profiles and changes passwords, then logs in again.
- **GA criteria:** AC-1 through AC-10 pass.
- **Rollback:** revert the pull request; no schema change.

## 16. Test Plan

- **Unit** — field length and phone character rules; password rules.
- **Integration** — each route with valid, invalid, and protected-field inputs; wrong current password; logged-out calls.
- **End-to-end** — edit and save profile; change password and log in again.
- **Security** — attempts to change role, email, or another user's record; response contains no password data.
- **Accessibility** — automated checker on Profile; keyboard-only completion of both forms.
- **Performance / load** — N/A.
- **Manual exploratory** — very long certifications text; pasting formatted phone numbers; double-clicking Save.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Open Profile; expect the five values and read-only email and role | E2E |
| AC-2 | Edit and save; reload; expect new values and confirmation | E2E |
| AC-3 | Save with empty name; expect field error and no change | Integration |
| AC-4 | Save phone "abc"; expect field error | Integration |
| AC-5 | Send `role` and `email` to the profile route; expect 400 and unchanged values | Security |
| AC-6 | Change password correctly; expect success, still logged in, new password works | E2E |
| AC-7 | Change password with wrong current password; expect 403 and no change | Integration |
| AC-8 | Submit a 7-character and a repeated password; expect 400 for each | Integration |
| AC-9 | Call profile routes with no session; expect 401 | Integration |
| AC-10 | Save as user A; read user B; expect B unchanged | Integration |

## 17. Documentation & Training

- **End-user docs:** a short note on updating phone, certifications, and password.
- **Admin and instructor docs:** N/A.
- **API reference:** add two routes (and the existing current-user route) to the README.
- **Internal runbook:** N/A.

## 18. Open Questions

1. Should Supervisors and Dispatchers be able to see a crew member's phone number (this plan says no for MVP)?
2. Should certifications be structured (name and expiry date) later, or stay free text?
3. Should changing a password sign the user out of other devices?

## 19. References

- ConeZone Project Specification: §3.1, §7 (Auth and Users).
- ConeZone Wireframes: Profile.
- Related plans: F1 (accounts, password rules), F4 (shell).
- Existing code paths: N/A until the stack is chosen.
