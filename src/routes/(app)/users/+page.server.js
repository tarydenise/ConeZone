import { requireAction } from '#lib/server/guards.js';

export function load(event) {
  requireAction(event, 'user.manage');
  return {};
}