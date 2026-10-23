# ConeZone MVP Feature Inventory

This list covers MVP features only (Section 3 of the specification). Additional features (real-time updates, notifications, calendar, conflict warning, offline view, SMS alerts, CSV export, and so on) are not planned here.

Each feature is sized for about one week of student effort or less. **Type** is one of: independent (can start now), blocked (needs another feature first), or infrastructure/supporting (other features build on it).

| ID | Feature | Spec section | Type | Depends on | Plan |
|---|---|---|---|---|---|
| F1 | Auth basics: sign up, log in, log out, current user | 3.1 | Independent | None | [F1](plans/F1-auth-basics.md) |
| F2 | RBAC enforcement: permission rules, server checks, UI guards | 3.6 | Infrastructure | F1 | [F2](plans/F2-rbac-enforcement.md) |
| F3 | Admin user management: user list, role changes, deactivate | 3.1, 3.6 | Blocked | F1, F2, F4 | [F3](plans/F3-admin-user-management.md) |
| F4 | App shell, role-based navigation, responsive layout, shared states | 3.7 | Infrastructure | F1, F2 | [F4](plans/F4-app-shell-responsive-nav.md) |
| F5 | Profile management: edit profile, change password | 3.1 | Blocked | F1, F4 | [F5](plans/F5-profile-management.md) |
| F6 | Job CRUD and status changes | 3.2 | Blocked | F1, F2, F4 | [F6](plans/F6-job-crud.md) |
| F7 | Job assignments, staffing status, and My Jobs | 3.3 | Blocked | F2, F3, F4, F6 | [F7](plans/F7-job-assignments-staffing.md) |
| F8 | Job board search, filters, and role-based list | 3.2, 3.3 | Blocked | F6, F7 | [F8](plans/F8-job-board-search-filters.md) |
| F9 | Job message threads | 3.4 | Blocked | F2, F6, F7 | [F9](plans/F9-job-message-threads.md) |
| F10 | Check-in and check-out | 3.5 | Blocked | F2, F6, F7 | [F10](plans/F10-check-in-out.md) |
| F11 | Company announcements | 3.4 | Blocked | F2, F4, F9 | [F11](plans/F11-announcements.md) |

## How broad spec items were split

| Spec item | Split into | Why |
|---|---|---|
| 3.1 Authentication and Profiles | F1 (accounts and sessions), F5 (profile and password) | Login blocks everything; profile editing blocks nothing |
| 3.2 Job Board (CRUD) | F6 (create, read, update, delete, status), F8 (search, filters, role-based list) | Records first, then finding them |
| 3.4 Messaging | F9 (job threads), F11 (announcements) | Different audiences and permissions |
| 3.6 RBAC | F2 (rules and checks), F3 (managing roles) | Rules are infrastructure; the Admin screen is a feature |
| 3.7 Responsive Design | F4 (shell and navigation), plus responsive acceptance criteria in every UI plan | Cross-cutting, so it needs one owner and a shared frame |
| 3.3 Job Assignments | F7, which also includes the My Jobs view | My Jobs is the read side of assignments and sized to fit the same week |
