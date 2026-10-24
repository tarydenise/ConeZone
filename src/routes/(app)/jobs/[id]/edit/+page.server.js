import { error, fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job, assignment } from '#lib/server/db/schema.js';
import { getJob, parseJobId } from '#lib/server/jobs.js';
import { syncJobStatus } from '#lib/server/staffing.js';
import { isFinal } from '#lib/jobStatus.js';
import { readJobForm, validateJob } from '#lib/jobForm.js';

const FINAL_MESSAGE = 'This job can no longer be edited';

export async function load(event) {
  requireAction(event, 'job.edit');
  const id = parseJobId(event.params.id);
  const found = await getJob(id);
  if (isFinal(found.status)) error(409, FINAL_MESSAGE);

  return {
    jobId: found.id,
    values: {
      title: found.title,
      clientName: found.clientName ?? '',
      address: found.address,
      date: found.date,
      startTime: found.startTime.slice(0, 5), // "07:00:00" -> "07:00"
      endTime: found.endTime.slice(0, 5),
      workersNeeded: String(found.workersNeeded),
      notes: found.notes ?? ''
    }
  };
}

export const actions = {
  default: async (event) => {
    const user = requireAction(event, 'job.edit');
    const id = parseJobId(event.params.id);

    const values = readJobForm(await event.request.formData());
    const errors = validateJob(values);
    if (Object.keys(errors).length) return fail(400, { errors, values });

    // One transaction: lock the job, check the crew size, save, then fix the status.
    const problem = await db.transaction(async (tx) => {
      const [j] = await tx.select().from(job).where(eq(job.id, id)).for('update');
      if (!j) return { status: 404 };
      if (isFinal(j.status)) return { status: 409 };

      const [{ n }] = await tx
        .select({ n: sql`count(*)`.mapWith(Number) })
        .from(assignment)
        .where(eq(assignment.jobId, id));

      const needed = Number(values.workersNeeded);
      if (needed < n) {
        return { status: 400, message: `Remove crew first: ${n} ${n === 1 ? 'person is' : 'people are'} assigned.` };
      }

      await tx
        .update(job)
        .set({
          title: values.title,
          clientName: values.clientName || null,
          address: values.address,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          workersNeeded: needed,
          notes: values.notes || null,
          updatedAt: new Date()
        })
        .where(eq(job.id, id));

      await syncJobStatus(tx, id); // Staffed <-> Open if the new number changes it
      return null;
    });

    if (problem?.status === 404) error(404, 'Not found');
    if (problem?.status === 409) error(409, FINAL_MESSAGE);
    if (problem) return fail(400, { errors: { workersNeeded: problem.message }, values });

    console.log(`JOB edited id=${id} by=${user.id}`);
    redirect(303, `/jobs/${id}`);
  }
};