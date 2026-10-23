import pg from 'pg';

const BASE = 'http://localhost:5173';
const PASSWORD = 'Password123!'; // development only
const users = [
  { name: 'Alex Kim', email: 'admin@conezone.test', role: 'admin' },
  { name: 'Dana Cole', email: 'dispatcher@conezone.test', role: 'dispatcher' },
  { name: 'Sam Ruiz', email: 'supervisor@conezone.test', role: 'supervisor' },
  { name: 'Jo Tran', email: 'worker@conezone.test', role: 'field_worker' }
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

for (const u of users) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ name: u.name, email: u.email, password: PASSWORD })
  });
  console.log(u.email, res.ok ? 'created' : `skipped (${res.status})`);
  await pool.query('UPDATE "user" SET role = $1 WHERE email = $2', [u.role, u.email]);
}

await pool.end();