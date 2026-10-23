export const STATUS_LABELS = {
  open: 'Open',
  staffed: 'Staffed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

/** Completed and cancelled jobs are final: no edits, no status changes. */
export function isFinal(status) {
  return status === 'completed' || status === 'cancelled';
}