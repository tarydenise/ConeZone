/** What status should the job have, given how many people are assigned? */
export function statusAfterStaffing(status, assigned, needed) {
  if (status === 'open' && assigned >= needed) return 'staffed';
  if (status === 'staffed' && assigned < needed) return 'open';
  return status; // In Progress, Completed, and Cancelled never change here
}

/** Can we add this many people? Returns an error message, or null if it is fine. */
export function checkAssign({ status, assigned, needed, adding }) {
  if (status === 'completed' || status === 'cancelled') return 'This job can no longer be changed.';
  const spots = needed - assigned;
  if (spots <= 0) return 'Job is fully staffed. Increase workers needed to add more.';
  if (adding > spots) {
    return `Only ${spots} spot${spots === 1 ? '' : 's'} left. Pick fewer people or increase workers needed.`;
  }
  return null;
}