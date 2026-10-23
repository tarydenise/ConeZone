import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, desc, eq, inArray, notInArray } from 'drizzle-orm';
import { requireAction, requireJobMember } from '#lib/server/guards.js';
import { can } from '#lib/server/permissions.js';
import { db } from '#lib/server/db/index.js';
import { job, assignment, user as users } from '#lib/server/db/schema.js';
import { getJob, parseJobId } from '#lib/server/jobs.js';
import { syncJobStatus } from '#lib/server/staffing.js';
import { isFinal, checkStatusChange } from '#lib/jobStatus.js';
import { checkAssign } from '#lib/staffing.js';

// Until the job supervisor flag is built (stretch task), no supervisor counts as the job's supervisor.
function isJobSupervisor(user, found) {
  return false;
}

export async function load(event) {
  const id = parseJobId(event.params.id);
  const user = await requireJobMember(event, id); // non-members get Not found
  const found = await getJob(id);

  const crew = await db
    .select({
      id: assignment.id,
      isJobSupervisor: assignment.isJobSupervisor,
      userId: users.id,
      name: users.name,
      role: users.role,
      isActive: users.isActive
    })
    .from(assignment)
    .innerJoin(users, eq(assignment.userId, users.id))
    .where(eq(assignment.jobId, id))
    .orderBy(desc(assignment.isJobSupervisor), asc(users.name));

  const canManageCrew = can(user.role, 'assignment.manage');

  // People who could still be added (only office roles get this list)
  let eligible = [];
  if (canManageCrew && !isFinal(found.status)) {
    const onJob = crew.map((c) => c.userId);
    eligible = await db
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          inArray(users.role, ['field_worker', 'supervisor']),
          onJob.length ? notInArray(users.id, onJob) : undefined
        )
      )
      .orderBy(asc(users.name));
  }

  const statusOptions = ['in_progress', 'completed', 'cancelled'].filter(
    (to) =>
      checkStatusChange({
        role: user.role,
        isJobSupervisor: isJobSupervisor(user, found),
        from: found.status,
        to
      }) === 'ok'
  );

  const office = can(user.role, 'job.view_any');

  return {
    job: found,
    crew,
    eligible,
    canManageCrew,
    canEdit: can(user.role, 'job.edit') && !isFinal(found.status),
    canDelete: can(user.role, 'job.delete'),
    isFinal: isFinal(found.status),
    statusOptions,
    backHref: office ? '/jobs' : '/my-jobs',
    backLabel: office ? 'All jobs' : 'My jobs'
  };
}

export const actions = {
  status: async (event) => {
    const user = requireAction(event, 'job.set_status_own');
    const id = parseJobId(event.params.id);
    await requireJobMember(event, id);
    const found = await getJob(id);

    const data = await event.request.formData();
    const to = String(data.get('status') ?? '');

    const result = checkStatusChange({
      role: user.role,
      isJobSupervisor: isJobSupervisor(user, found),
      from: found.status,
      to
    });
    if (result === 'forbidden') error(403, 'You do not have access to this action');
    if (result === 'invalid') error(409, 'That status change is not allowed');

    await db.update(job).set({ status: to, updatedAt: new Date() }).where(eq(job.id, id));
    console.log(`JOB status id=${id} ${found.status}->${to} by=${user.id}`);
    return { statusChanged: true };
  },

  delete: async (event) => {
    const user = requireAction(event, 'job.delete');
    const id = parseJobId(event.params.id);
    await getJob(id);

    await db.delete(job).where(eq(job.id, id)); // the crew is removed automatically
    console.log(`JOB deleted id=${id} by=${user.id}`);
    redirect(303, '/jobs');
  },

  assign: async (event) => {
    const user = requireAction(event, 'assignment.manage');
    const id = parseJobId(event.params.id);

    const data = await event.request.formData();
    const userIds = [...new Set(data.getAll('userId').map(String))];
    if (userIds.length === 0) return fail(400, { assignError: 'Pick at least one person.' });

    // One transaction: lock the job, check the rules, add people, update the status.
    const problem = await db.transaction(async (tx) => {
      const [j] = await tx.select().from(job).where(eq(job.id, id)).for('update');
      if (!j) return { status: 404 };

      const existing = await tx
        .select({ userId: assignment.userId })
        .from(assignment)
        .where(eq(assignment.jobId, id));
      const onJob = new Set(existing.map((e) => e.userId));

      if (userIds.some((u) => onJob.has(u))) {
        return { status: 409, message: 'That person is already on this job.' };
      }

      const people = await tx.select().from(users).where(inArray(users.id, userIds));
      const bad =
        people.length !== userIds.length ||
        people.some((p) => !p.isActive || !['field_worker', 'supervisor'].includes(p.role));
      if (bad) return { status: 400, message: 'Only active Field Workers and Supervisors can be assigned.' };

      const message = checkAssign({
        status: j.status,
        assigned: onJob.size,
        needed: j.workersNeeded,
        adding: userIds.length
      });
      if (message) return { status: 409, message };

      await tx.insert(assignment).values(userIds.map((userId) => ({ jobId: id, userId })));
      await syncJobStatus(tx, id);
      return null;
    });

    if (problem?.status === 404) error(404, 'Not found');
    if (problem) return fail(problem.status, { assignError: problem.message });

    console.log(`ASSIGN job=${id} users=${userIds.join(',')} by=${user.id}`);
    return { assigned: true };
  },

  remove: async (event) => {
    const user = requireAction(event, 'assignment.manage');
    const id = parseJobId(event.params.id);

    const data = await event.request.formData();
    const assignmentId = Number(data.get('assignmentId'));
    if (!Number.isInteger(assignmentId)) return fail(400, { crewError: 'Choose someone to remove.' });

    const problem = await db.transaction(async (tx) => {
      const [j] = await tx.select().from(job).where(eq(job.id, id)).for('update');
      if (!j) return { status: 404 };
      if (isFinal(j.status)) return { status: 409, message: 'This job can no longer be changed.' };

      const removed = await tx
        .delete(assignment)
        .where(and(eq(assignment.id, assignmentId), eq(assignment.jobId, id)))
        .returning({ id: assignment.id });
      if (removed.length === 0) return { status: 404 };

      await syncJobStatus(tx, id);
      return null;
    });

    if (problem?.status === 404) error(404, 'Not found');
    if (problem) return fail(problem.status, { crewError: problem.message });

    console.log(`UNASSIGN job=${id} assignment=${assignmentId} by=${user.id}`);
    return { removed: true };
  }
};