# F9 — Job Message Threads

> Implementation plan. Source: ConeZone Project Specification §3.4 (Messaging), §6 (Message data model), §7 (Messages routes), wireframes 5.3 and 5.5.

## Metadata

| Field | Value |
|---|---|
| **Feature ID** | F9 |
| **Section** | Messaging |
| **Severity** | MAJOR |
| **Markets** | N/A. One company, English only. |
| **Status (today)** | MISSING |
| **Estimated effort** | S (1w) |
| **Owner (proposed)** | TBD once teams are formed |
| **Depends on** | F2, F6, F7 |
| **Unblocks** | F11 (announcements reuse the message table); real-time updates (additional feature) |

---

## 1. Problem Statement

Crew communication happens in group texts that mix jobs together, so people scroll to find a gate code or an address change. Each job needs its own conversation that only the people on that job and the office can see. This feature adds a message thread to every job.

## 2. Goals

- Each job has one thread visible only to its crew, Dispatchers, and Admins.
- Members can read, post, edit, and delete their own messages.
- Admins can remove any message.
- Messages are displayed safely, and removed crew lose access.

## 3. Non-Goals

- Live updates without refreshing (additional feature).
- Photos, files, reactions, replies, or @mentions.
- Unread counts, read receipts, or notifications.
- Private one-to-one messages.
- Searching messages.
- Company-wide announcements (F11).

## 4. Personas & User Stories

- **As a Field Worker**, I want to message my crew about a job so that everyone sees the same updates.
- **As a Supervisor**, I want to post the gate code once so that I do not text each person.
- **As a Dispatcher**, I want to read and post in any job thread so that I can answer questions from the office.
- **As a message author**, I want to fix a typo by editing or delete a message sent by mistake.
- **As an Admin**, I want to remove an inappropriate message.
- Parent and self-learner personas: N/A.

## 5. Functional Requirements

- **FR-1.** The system MUST show a job's thread oldest message first, with each message's author name, time, text, and an "(edited)" marker if it was edited.
- **FR-2.** The system MUST let a member post a message of 1 to 2000 characters after trimming spaces, and MUST reject empty messages.
- **FR-3.** The system MUST let Supervisors and Field Workers read and post only in threads of jobs they are assigned to, and Dispatchers and Admins in any job's thread (F2 membership check). Other requests return 404.
- **FR-4.** The system MUST allow posting in a thread regardless of job status, including Cancelled and Completed jobs.
- **FR-5.** The system MUST let an author edit their own message text, and MUST record the edit time. Nobody can edit another person's message.
- **FR-6.** The system MUST let an author delete their own message and let an Admin delete any message. Dispatchers cannot delete other people's messages.
- **FR-7.** The system MUST remove a deleted message completely.
- **FR-8.** The system MUST show a person's own new message in the thread right after sending, without a full page reload.
- **FR-9.** The system MUST display message text safely, so text that looks like code or markup shows as plain text.
- **FR-10.** The system MUST show "(inactive)" beside the name of a deactivated author.
- **FR-11.** The system MUST stop showing a thread to a user who is removed from the job, while their past messages stay for the others.
- **FR-12.** The system SHOULD load the latest 50 messages and offer "Load earlier messages" for older ones.
- **FR-13.** The system MAY show the date as a divider between days.

## 6. Non-Functional Requirements

- **Performance** — Loading the latest 50 messages takes under 500 ms (p95).
- **Security** — Membership and author checks run on the server. Message text is shown as plain text. The route for editing and deleting does not accept announcements (F11).
- **Privacy & Compliance** — Threads are visible only to members and the office roles. Messages are company records and are not private.
- **Accessibility** — WCAG 2.1 AA. The message box has a visible label, new messages are announced politely, and send works with the keyboard.
- **Scalability** — N/A.
- **Reliability** — A failed send keeps the typed text so it is not lost.
- **Observability** — Log message deletes by Admins (actor, message id).
- **Maintainability** — Messages and announcements share one table (see Data Model), so changes here must keep F11 working.
- **Internationalization** — N/A. Messages are stored and shown as typed.
- **Backward compatibility** — N/A (new feature).

## 7. Acceptance Criteria

- **AC-1.** *Given* a job with 3 messages, *when* a crew member opens its thread, *then* all 3 show oldest first with author, time, and text.
- **AC-2.** *Given* a crew member, *when* they send "Running 10 minutes late", *then* it appears in the thread immediately and for other members on their next load.
- **AC-3.** *Given* an empty or spaces-only message, *when* the user sends, *then* it is rejected and nothing is added.
- **AC-4.** *Given* a message of 2001 characters, *when* the user sends, *then* it is rejected with a length message.
- **AC-5.** *Given* a Field Worker not assigned to Job B, *when* they read or post in Job B's thread, *then* the response is 404 and nothing is added.
- **AC-6.** *Given* a Dispatcher not assigned to a job, *when* they read and post in its thread, *then* both succeed.
- **AC-7.** *Given* an author, *when* they edit their message, *then* the new text shows with "(edited)"; *given* any other user tries to edit it, *then* the response is 403.
- **AC-8.** *Given* an author, *when* they delete their message, *then* it disappears for everyone.
- **AC-9.** *Given* a Dispatcher who is not the author, *when* they try to delete another user's message, *then* the response is 403; *given* an Admin, *then* it succeeds.
- **AC-10.** *Given* a message containing `<b>hi</b>`, *when* it is displayed, *then* the text shows literally and nothing is formatted or run.
- **AC-11.** *Given* a Cancelled job, *when* a crew member posts, *then* the message is added.
- **AC-12.** *Given* a worker removed from a job, *when* they request its thread, *then* the response is 404 and their earlier messages still show to other members.
- **AC-13.** *Given* a thread with no messages, *when* it opens, *then* "No messages yet. Start the conversation." shows.

## 8. Data Model

**Message (new, shared with F11)**

| Field | Type | Notes |
|---|---|---|
| id | identifier | primary key |
| job | reference to Job | required for job messages; empty only for announcements (F11) |
| author | reference to User | required |
| body | text | required, 1 to 2000 characters |
| is_announcement | boolean | default false |
| edited_at | datetime | nullable |
| created_at / updated_at | datetime | |

- **Constraints:** a message with `is_announcement = false` must have a job; a message with `is_announcement = true` must have no job. Deleting a job deletes its messages.
- **Indexes:** by job and created time.
- **Migration:** one migration creating the Message table.
- **Backfill / seed:** a few sample messages on the seeded jobs.

## 9. API Surface

Paths are illustrative and may change during implementation.

| Method | Path | Purpose | Allowed |
|---|---|---|---|
| GET | `/api/jobs/:id/messages` | Read a thread (latest 50; `?before=` for older) | Members, Dispatcher, Admin |
| POST | `/api/jobs/:id/messages` | Post to a thread | Members, Dispatcher, Admin |
| PUT | `/api/messages/:id` | Edit own message | Author |
| DELETE | `/api/messages/:id` | Delete a message | Author, Admin |

```
GET  /api/jobs/:id/messages  200: { items: [{ id, author: { id, name, is_active }, body, edited_at, created_at }], has_more }
POST /api/jobs/:id/messages  body: { body }   201: { message }   400 empty or too long   404 not a member
PUT  /api/messages/:id       body: { body }   200: { message }   403 not author   404 not found
DELETE /api/messages/:id     200: {}          403 not author or Admin   404 not found
```

**Rate limits:** N/A. **Real-time:** N/A in this plan (the event `message:new` is an additional feature). **Documentation:** add the four routes to the README API section.

## 10. UI / UX

**Pages and components:** a Thread panel on the Job Detail page (desktop) and a full-screen thread (phone) with a message list and a send box; edit and delete controls on a person's own messages (and on all messages for Admins). Wireframes: ConeZone Wireframes, Job Detail (Job messages panel) and Job Thread (mobile).

**Key flows**

1. Member opens a job and sees its thread, types a message, and sends.
2. Author selects Edit on their message, changes the text, and saves.
3. Author or Admin selects Delete and confirms; the message disappears.
4. Member selects "Load earlier messages" to see older messages.

**States**

- **Empty:** "No messages yet. Start the conversation."
- **Loading:** placeholder lines; the send button is disabled while sending.
- **Error:** "Message not sent. Try again." with the text kept in the box.
- **Offline:** N/A.

**Responsive:** the message box stays at the bottom on phones with large tap targets. **Accessibility:** message box labeled; new messages announced politely; delete uses a confirmation dialog. **Copy keys:** `thread.empty`, `thread.send`, `thread.edited`, `thread.delete.confirm`, `thread.loadEarlier`.

## 11. AI / ML Considerations

N/A. No AI or machine learning in this feature.

## 12. Integration Points

- **External services:** none.
- **Internal modules:** membership check (F2, F7); Job Detail page (F6); shell and states (F4); the message table is reused by announcements (F11).
- **File paths:** N/A until the stack is chosen.
- **Webhooks and events:** none in this plan.

## 13. Dependencies & Sequencing

- Must ship after: F2, F6, F7.
- Must ship before: F11.
- Shared infrastructure needed: the database.

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| A non-member reads or posts in a thread | M | H | F2 membership check on every route; AC-5 and AC-12 |
| Message text run as code in the page | M | H | Show as plain text; AC-10 |
| Author and Admin rules wrong for edit and delete | M | M | FR-5, FR-6; AC-7 and AC-9 |
| Table design makes announcements awkward later | L | M | Shared table constraints defined now (Data Model) |
| Users expect live updates and report bugs | H | L | Non-goal stated in the UI help text; real-time is an additional feature |

## 15. Rollout Plan

- **Feature flag:** none.
- **Sequencing:** schema, then routes, then thread panel, then edit and delete.
- **Dogfood:** the team chats as a crew on a seeded job and checks access as an outsider.
- **GA criteria:** AC-1 through AC-13 pass.
- **Rollback:** revert the pull request; drop the Message table in development.

## 16. Test Plan

- **Unit** — body length and trim rules; edit and delete permission rules.
- **Integration** — each route by each role; member and non-member access; removed-from-job access; display of special characters.
- **End-to-end** — send, edit, delete; load earlier messages; phone-width thread.
- **Security** — non-member reads and posts; editing another user's message; markup in message text.
- **Accessibility** — automated checker on the thread; keyboard-only send.
- **Performance / load** — thread with 500 messages loads the latest 50 under 500 ms.
- **Manual exploratory** — double-tapping Send; very long unbroken words; two members sending at once.

| AC | Test case | Level |
|---|---|---|
| AC-1 | Seed 3 messages; open thread; expect oldest first with details | E2E |
| AC-2 | Send a message; expect it shown immediately and returned for another member | E2E |
| AC-3 | Send empty and spaces-only text; expect 400 and no message | Integration |
| AC-4 | Send 2001 characters; expect 400 with length message | Integration |
| AC-5 | As unassigned Field Worker read and post; expect 404 each | Integration |
| AC-6 | As unassigned Dispatcher read and post; expect success | Integration |
| AC-7 | Author edits; other user edits; expect "(edited)" then 403 | Integration |
| AC-8 | Author deletes; expect message gone for all | Integration |
| AC-9 | Dispatcher deletes another's message; Admin deletes it; expect 403 then success | Integration |
| AC-10 | Post `<b>hi</b>`; expect literal text on screen | Security |
| AC-11 | Post on a Cancelled job; expect success | Integration |
| AC-12 | Remove worker from job; request thread; expect 404 and messages still visible to others | Integration |
| AC-13 | Open a thread with no messages; expect empty message | E2E |

## 17. Documentation & Training

- **End-user docs:** a short note on using the job thread and what Dispatchers can see.
- **Admin and instructor docs:** a note on how Admins remove messages.
- **API reference:** add four routes to the README.
- **Internal runbook:** N/A.

## 18. Open Questions

1. Should Dispatchers be allowed to delete other people's messages (spec says Author and Admin only)?
2. Should a deleted message leave a "Message deleted" placeholder instead of vanishing?
3. How long should edit be allowed (this plan has no time limit)?
4. Should crew members who were removed from a job still be able to read old messages?

## 19. References

- ConeZone Project Specification: §3.4, §6 (Message), §7 (Messages), §9.
- ConeZone Wireframes: Job Detail, Job Thread.
- Related plans: F2 (membership), F6 (jobs), F7 (assignments), F11 (announcements).
- Existing code paths: N/A until the stack is chosen.
