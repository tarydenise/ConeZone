import { requireJobMember } from '#lib/server/guards.js';
import { can } from '#lib/server/permissions.js';
import { getJob, parseJobId } from '#lib/server/jobs.js';
import { isFinal } from '#lib/jobStatus.js';

export async function load(event) {
  const id = parseJobId(event.params.id);
  const user = requireJobMember(event, id); // non-members get Not found
  const found = await getJob(id);

  return {
    job: found,
    canEdit: can(user.role, 'job.edit') && !isFinal(found.status),
    isFinal: isFinal(found.status)
  };
}