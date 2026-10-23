import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { job } from './db/schema.js';

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