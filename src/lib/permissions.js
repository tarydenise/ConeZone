// Which roles may do each action. Used by the interface to hide controls
// and show Access denied. The database policies are the real protection.
export const PERMISSIONS = {
  'job.view_any': ['admin', 'dispatcher'],
  'job.view_own': ['admin', 'dispatcher', 'supervisor', 'field_worker'],
  'job.create': ['admin', 'dispatcher'],
  'job.edit': ['admin', 'dispatcher'],
  'job.delete': ['admin', 'dispatcher'],
  'job.set_status_own': ['admin', 'dispatcher', 'supervisor'],
  'assignment.manage': ['admin', 'dispatcher'],
  'user.manage': ['admin'],
  'user.list': ['admin', 'dispatcher']
};

/** Can this role do this action? Unknown actions are denied. */
export function can(role, action) {
  return PERMISSIONS[action]?.includes(role) ?? false;
}