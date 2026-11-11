export const ROLE_LABELS = {
  admin: 'Admin',
  dispatcher: 'Dispatcher',
  supervisor: 'Supervisor',
  field_worker: 'Field Worker'
};

// Navigation labels live here, in one place.
// Only pages built in this bakeoff are listed.
export const NAV_ITEMS = [
  { label: 'My Jobs', href: '/my-jobs', roles: ['field_worker', 'supervisor'] },
  { label: 'Jobs', href: '/jobs', roles: ['dispatcher', 'admin'] }
];

export function navFor(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function homeFor(role) {
  return role === 'field_worker' || role === 'supervisor' ? '/my-jobs' : '/jobs';
}