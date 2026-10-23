import { asc } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { job } from '#lib/server/db/schema.js';

export async function load(event) {
  requireAction(event, 'job.view_any');
  const jobs = await db.select().from(job).orderBy(asc(job.date), asc(job.startTime));
  return { jobs };
}