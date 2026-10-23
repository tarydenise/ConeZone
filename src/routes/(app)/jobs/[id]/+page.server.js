import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireAction, requireJobMember } from '#lib/server/guards.js';
import { can } from '#lib/server/permissions.js';
import { db } from '#lib/server/db/index.js';
import { job } from '#lib/server/db/schema.js';
import { getJob, parseJobId } from '#lib/server/jobs.js';
import { isFinal, checkStatusChange } from '#lib/jobStatus.js';

// Until F7 adds the "job supervisor" flag, no supervisor counts as the job's supervisor.
function isJobSupervisor(user, found) {
  return false;
}

export async function load(event) {
  const id = parseJobId(event.params.id);
  const user = requireJobMember(event, id); // non-members get Not found
  const found = await getJob(id);

  // Only offer the status buttons this person is allowed to use
  const statusOptions = ['in_progress', 'completed', 'cancelled'].filter(
    (to) =>
      checkStatusChange({
        role: user.role,
        isJobSupervisor: isJobSupervisor(user, found),
        from: found.status,
        to
      }) === 'ok'
  );

  return {
    job: found,
    canEdit: can(user.role, 'job.edit') && !isFinal(found.status),
    canDelete: can(user.role, 'job.delete'),
    isFinal: isFinal(found.status),
    statusOptions
  };
}

export const actions = {
  status: async (event) => {
    const user = requireAction(event, 'job.set_status_own');
    const id = parseJobId(event.params.id);
    requireJobMember(event, id);
    const found = await getJob(id);

    const data = await event.request.formData();
    const to = String(data.get('status') ?? '');

    const result = checkStatusChange({
      role: user.role,
      isJobSupervisor: isJobSupervisor(user, found),
      from: found.status,
      to
    });
    if (result === 'forbidden') error(403, 'You do not have access to this action');
    if (result === 'invalid') error(409, 'That status change is not allowed');

    await db.update(job).set({ status: to, updatedAt: new Date() }).where(eq(job.id, id));
    console.log(`JOB status id=${id} ${found.status}->${to} by=${user.id}`);
    return { statusChanged: true };
  },

  delete: async (event) => {
    const user = requireAction(event, 'job.delete');
    const id = parseJobId(event.params.id);
    await getJob(id); // Not found if it does not exist

    await db.delete(job).where(eq(job.id, id));
    console.log(`JOB deleted id=${id} by=${user.id}`);
    redirect(303, '/jobs');
  }
};