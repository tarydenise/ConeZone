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

// Status changes a person can make by hand (F6). Open and Staffed are set automatically in F7.
export const STATUS_CHANGES = {
  in_progress: ['open', 'staffed'],
  completed: ['in_progress'],
  cancelled: ['open', 'staffed', 'in_progress']
};

/** Which statuses a job can be changed to from its current status. */
export function allowedStatusChanges(status) {
  return Object.keys(STATUS_CHANGES).filter((to) => STATUS_CHANGES[to].includes(status));
}