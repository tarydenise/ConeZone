import { requireAction } from '#lib/server/guards.js';

export function load(event) {
  requireAction(event, 'job.create');
  return {};
}

export const actions = {
  default: async (event) => {
    requireAction(event, 'job.create');
    return { ok: true };
  }
};