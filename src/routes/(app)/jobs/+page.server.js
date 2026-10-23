import { asc, sql } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job, assignment } from '#lib/server/db/schema.js';

export async function load(event) {
  requireAction(event, 'job.view_any');
  const jobs = await db.select().from(job).orderBy(asc(job.date), asc(job.startTime));

  const rows = await db
    .select({ jobId: assignment.jobId, n: sql`count(*)`.mapWith(Number) })
    .from(assignment)
    .groupBy(assignment.jobId);
  const counts = new Map(rows.map((r) => [r.jobId, r.n]));

  return { jobs: jobs.map((j) => ({ ...j, staffed: counts.get(j.id) ?? 0 })) };
}