export const ROLE_LABELS = {
  admin: 'Admin',
  dispatcher: 'Dispatcher',
  supervisor: 'Supervisor',
  field_worker: 'Field Worker'
};

const ALL = ['admin', 'dispatcher', 'supervisor', 'field_worker'];

export const NAV_ITEMS = [
  { label: 'My Jobs', href: '/my-jobs', roles: ['field_worker', 'supervisor'] },
  { label: 'Jobs', href: '/jobs', roles: ['dispatcher', 'admin'] },
  { label: 'Announcements', href: '/announcements', roles: ALL },
  { label: 'Users', href: '/users', roles: ['admin'] },
  { label: 'Profile', href: '/profile', roles: ALL }
];

export function navFor(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function homeFor(role) {
  return role === 'field_worker' || role === 'supervisor' ? '/my-jobs' : '/jobs';
}