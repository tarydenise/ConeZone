import { fail, redirect } from '@sveltejs/kit';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job } from '#lib/server/db/schema.js';
import { readJobForm, validateJob } from '#lib/jobForm.js';

export function load(event) {
  requireAction(event, 'job.create');
  // Default the date to today (YYYY-MM-DD)
  return { today: new Date().toLocaleDateString('en-CA') };
}

export const actions = {
  default: async (event) => {
    const user = requireAction(event, 'job.create');
    const values = readJobForm(await event.request.formData());
    const errors = validateJob(values);
    if (Object.keys(errors).length) return fail(400, { errors, values });

    const [created] = await db
      .insert(job)
      .values({
        title: values.title,
        clientName: values.clientName || null,
        address: values.address,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        workersNeeded: Number(values.workersNeeded),
        notes: values.notes || null,
        createdBy: user.id
      })
      .returning({ id: job.id });

    console.log(`JOB created id=${created.id} by=${user.id}`);
    redirect(303, `/jobs/${created.id}`);
  }
};