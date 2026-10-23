import { eq, sql } from 'drizzle-orm';
import { job, assignment } from './db/schema.js';
import { statusAfterStaffing } from '../staffing.js';

/** Recount the crew and switch Open/Staffed if needed. Call inside a transaction. */
export async function syncJobStatus(tx, jobId) {
  const [j] = await tx.select().from(job).where(eq(job.id, jobId));
  const [{ n }] = await tx
    .select({ n: sql`count(*)`.mapWith(Number) })
    .from(assignment)
    .where(eq(assignment.jobId, jobId));

  const next = statusAfterStaffing(j.status, n, j.workersNeeded);
  if (next !== j.status) {
    await tx.update(job).set({ status: next, updatedAt: new Date() }).where(eq(job.id, jobId));
  }
  return { assigned: n, status: next };
}