import { error, redirect } from '@sveltejs/kit';
import { can } from './permissions.js';
import { and, eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { assignment } from './db/schema.js';

/** Must be logged in. Returns the user. */
export function requireUser(event) {
  if (!event.locals.user) {
    redirect(303, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
  }
  return event.locals.user;
}

/** Must be logged in AND allowed to do this action. Used by every protected page and form action. */
export function requireAction(event, action) {
  const user = requireUser(event);
  if (!can(user.role, action)) {
    console.warn(`DENIED user=${user.id} role=${user.role} action=${action} path=${event.url.pathname}`);
    error(403, 'You do not have access to this action');
  }
  return user;
}

/** Must be a member of this job. Dispatchers and Admins are members of every job. */
export async function requireJobMember(event, jobId) {
  const user = requireUser(event);
  if (can(user.role, 'job.view_any')) return user;

  const [row] = await db
    .select({ id: assignment.id })
    .from(assignment)
    .where(and(eq(assignment.jobId, jobId), eq(assignment.userId, user.id)))
    .limit(1);

  if (!row) error(404, 'Not found'); // not on this job: pretend it does not exist
  return user;
}