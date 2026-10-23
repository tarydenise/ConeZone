import { requireUser } from '#lib/server/guards.js';

export function load(event) {
  const user = requireUser(event);
  return { user: { id: user.id, name: user.name, role: user.role } };
}