export const STATUS_LABELS = {
  open: 'Open',
  staffed: 'Staffed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export function isFinal(status) {
  return status === 'completed' || status === 'cancelled';
}

// Which statuses can be set by hand, from where, and by which roles.
// Open and Staffed are set automatically by F7, never by hand.
const RULES = {
  in_progress: { from: ['open', 'staffed'], supervisorMay: true },
  completed: { from: ['in_progress'], supervisorMay: true },
  cancelled: { from: ['open', 'staffed', 'in_progress'], supervisorMay: false }
};

/**
 * Can this person change the job from one status to another?
 * Returns 'ok', 'forbidden' (wrong role: 403), or 'invalid' (not a legal change: 409).
 */
export function checkStatusChange({ role, isJobSupervisor, from, to }) {
  const rule = RULES[to];
  if (!rule) return 'invalid'; // Open, Staffed, or anything unknown cannot be set by hand

  const office = role === 'dispatcher' || role === 'admin';
  const supervisorOk = role === 'supervisor' && isJobSupervisor && rule.supervisorMay;
  if (!office && !supervisorOk) return 'forbidden';

  if (!rule.from.includes(from)) return 'invalid';
  return 'ok';
}