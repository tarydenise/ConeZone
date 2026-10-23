import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job } from '#lib/server/db/schema.js';
import { getJob, parseJobId } from '#lib/server/jobs.js';
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
    const found = await getJob(id);
    if (isFinal(found.status)) error(409, FINAL_MESSAGE);

    const values = readJobForm(await event.request.formData());
    const errors = validateJob(values);
    if (Object.keys(errors).length) return fail(400, { errors, values });

    await db
      .update(job)
      .set({
        title: values.title,
        clientName: values.clientName || null,
        address: values.address,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        workersNeeded: Number(values.workersNeeded),
        notes: values.notes || null,
        updatedAt: new Date()
      })
      .where(eq(job.id, id));

    console.log(`JOB edited id=${id} by=${user.id}`);
    redirect(303, `/jobs/${id}`);
  }
};