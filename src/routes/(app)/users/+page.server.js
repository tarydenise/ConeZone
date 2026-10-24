import { error, fail } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { requireAction } from '#lib/server/guards.js';
import { db } from '#lib/server/db/index.js';
import { assignment, user as users } from '#lib/server/db/schema.js';
import { ROLE_LABELS } from '#lib/nav.js';

const ROLES = Object.keys(ROLE_LABELS);

export async function load(event) {
  const me = requireAction(event, 'user.manage');
  // Only what this screen needs. Never password data.
  const list = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive })
    .from(users)
    .orderBy(asc(users.name));
  return { users: list, meId: me.id };
}

export const actions = {
  role: async (event) => {
    const me = requireAction(event, 'user.manage');
    const data = await event.request.formData();
    const userId = String(data.get('userId') ?? '');
    const role = String(data.get('role') ?? '');

    if (!ROLES.includes(role)) return fail(400, { userId, error: 'Choose a valid role.' });
    if (userId === me.id) return fail(409, { userId, error: 'You cannot change your own role.' });

    const problem = await db.transaction(async (tx) => {
      const [target] = await tx.select().from(users).where(eq(users.id, userId)).for('update');
      if (!target) return { status: 404 };

      // Never leave the company without an active Admin
      if (target.role === 'admin' && role !== 'admin') {
        const admins = await tx
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.role, 'admin'), eq(users.isActive, true)));
        if (admins.filter((a) => a.id !== target.id).length === 0) {
          return { status: 409, message: 'At least one active Admin is required' };
        }
      }

      await tx.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

      // Leaving the Supervisor role clears their job supervisor flags. They stay on the crew.
      if (role !== 'supervisor') {
        await tx
          .update(assignment)
          .set({ isJobSupervisor: false, updatedAt: new Date() })
          .where(eq(assignment.userId, userId));
      }
      return null;
    });

    if (problem?.status === 404) error(404, 'Not found');
    if (problem) return fail(problem.status, { userId, error: problem.message });

    console.log(`ROLE changed target=${userId} to=${role} by=${me.id}`);
    return { saved: userId };
  }
};