import { error, redirect } from '@sveltejs/kit';
import { can } from './permissions.js';

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
export function requireJobMember(event, jobId) {
  const user = requireUser(event);
  if (can(user.role, 'job.view_any')) return user;
  // F7 will check the Assignment table here. Until then, everyone else is not a member.
  error(404, 'Not found');
}