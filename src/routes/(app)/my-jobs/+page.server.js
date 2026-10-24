import { asc, eq } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job, assignment } from '#lib/server/db/schema.js';
import { hasEnded } from '#lib/time.js';

export async function load(event) {
  const user = requireAction(event, 'job.view_own');

  // Only jobs this user is assigned to
  const rows = await db
    .select()
    .from(assignment)
    .innerJoin(job, eq(assignment.jobId, job.id))
    .where(eq(assignment.userId, user.id))
    .orderBy(asc(job.date), asc(job.startTime));

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

  // Hide jobs that are over. Cancelled jobs stay visible with a Cancelled label.
  const current = rows.map((r) => r.job).filter((j) => !hasEnded(j.date, j.startTime, j.endTime, now));

  return {
    today: current.filter((j) => j.date <= todayStr), // includes overnight jobs still running
    upcoming: current.filter((j) => j.date > todayStr)
  };
}