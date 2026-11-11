-- Test users (development only). Create these four users first in
-- Supabase: Authentication > Users > Add user (password Password123!),
-- then run this to set their names and roles.
update public.profiles p
set name = v.name,
  role = v.role
from auth.users u,
  (
    values ('admin@conezone.test', 'Alex Kim', 'admin'),
      (
        'dispatcher@conezone.test',
        'Dana Cole',
        'dispatcher'
      ),
      (
        'supervisor@conezone.test',
        'Sam Ruiz',
        'supervisor'
      ),
      (
        'worker@conezone.test',
        'Jo Tran',
        'field_worker'
      ),
      (
        'worker2@conezone.test',
        'Pat Lee',
        'field_worker'
      ),
      (
        'worker3@conezone.test',
        'Riley Chen',
        'field_worker'
      )
  ) as v(email, name, role)
where u.id = p.id
  and u.email = v.email;