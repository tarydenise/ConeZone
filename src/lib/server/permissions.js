export const PERMISSIONS = {
  'job.view_any': ['admin', 'dispatcher'],
  'job.view_own': ['admin', 'dispatcher', 'supervisor', 'field_worker'],
  'job.create': ['admin', 'dispatcher'],
  'job.edit': ['admin', 'dispatcher'],
  'job.delete': ['admin', 'dispatcher'],
  'job.set_status_own': ['admin', 'dispatcher', 'supervisor'],
  'assignment.manage': ['admin', 'dispatcher'],
  'message.post_own_job': ['admin', 'dispatcher', 'supervisor', 'field_worker'],
  'message.post_any_job': ['admin', 'dispatcher'],
  'announcement.post': ['admin', 'dispatcher'],
  'checkin.self': ['supervisor', 'field_worker'],
  'checkin.view_log_own_jobs': ['supervisor'],
  'checkin.view_log_all': ['admin', 'dispatcher'],
  'user.manage': ['admin'],
  'user.list': ['admin', 'dispatcher']
};

export function can(role, action) {
  return PERMISSIONS[action]?.includes(role) ?? false;
}