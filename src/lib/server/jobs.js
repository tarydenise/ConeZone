import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { job, assignment } from './db/schema.js';

/** Turn the id in the address into a number, or return Not found. */
export function parseJobId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) error(404, 'Not found');
  return id;
}

/** Load one job, or return Not found. */
export async function getJob(id) {
  const [found] = await db.select().from(job).where(eq(job.id, id));
  if (!found) error(404, 'Not found');
  return found;
}

/** Is this user flagged as the supervisor of this job? */
export async function isJobSupervisor(userId, jobId) {
  const [row] = await db
    .select({ id: assignment.id })
    .from(assignment)
    .where(
      and(eq(assignment.jobId, jobId), eq(assignment.userId, userId), eq(assignment.isJobSupervisor, true))
    )
    .limit(1);
  return Boolean(row);
}