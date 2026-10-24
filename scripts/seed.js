import pg from 'pg';

const BASE = 'http://localhost:5173';
const PASSWORD = 'Password123!'; // development only
const users = [
  { name: 'Alex Kim', email: 'admin@conezone.test', role: 'admin' },
  { name: 'Dana Cole', email: 'dispatcher@conezone.test', role: 'dispatcher' },
  { name: 'Sam Ruiz', email: 'supervisor@conezone.test', role: 'supervisor' },
  { name: 'Jo Tran', email: 'worker@conezone.test', role: 'field_worker' },
  { name: 'Pat Lee', email: 'worker2@conezone.test', role: 'field_worker' },
  { name: 'Riley Chen', email: 'worker3@conezone.test', role: 'field_worker' },
  { name: 'Morgan Diaz', email: 'supervisor2@conezone.test', role: 'supervisor' }
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

// Sample jobs (only if the job table is empty)
const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS n FROM job');
if (countRows[0].n === 0) {
  const { rows: dispatchers } = await pool.query(`SELECT id FROM "user" WHERE email = 'dispatcher@conezone.test'`);
  const dispatcherId = dispatchers[0].id;

  // title, client, address, days from today, start, end, workers needed, status
  const samples = [
    ['Main St lane closure', 'City of Springfield', '123 Main St', 1, '07:00', '15:00', 2, 'open'],
    ['Highway 20 night paving', 'State DOT', 'Hwy 20, mile marker 41', 2, '21:00', '05:00', 4, 'open'],
    ['School zone flagging', 'Lincoln Elementary', '500 School Rd', 3, '06:30', '09:00', 2, 'staffed'],
    ['Utility trench on Oak Ave', 'Valley Power', '88 Oak Ave', 0, '08:00', '16:00', 3, 'in_progress'],
    ['Parade route closure', 'Downtown Association', 'Center St', -3, '10:00', '14:00', 6, 'completed'],
    ['Bridge inspection detour', 'County Roads', 'River Bridge', 5, '09:00', '17:00', 2, 'cancelled']
  ];

  for (const [title, client, address, offset, start, end, needed, status] of samples) {
    await pool.query(
      `INSERT INTO job (title, client_name, address, date, start_time, end_time, workers_needed, status, created_by)
        VALUES ($1, $2, $3, CURRENT_DATE + $4::int, $5, $6, $7, $8, $9)`,
      [title, client, address, offset, start, end, needed, status, dispatcherId]
    );
  }
  console.log('Sample jobs created');
}

// Sample crew assignments (only if there are none yet)
const { rows: assignCount } = await pool.query('SELECT COUNT(*)::int AS n FROM assignment');
if (assignCount[0].n === 0) {
  const crew = [
    ['School zone flagging', 'worker@conezone.test'],
    ['School zone flagging', 'worker2@conezone.test'],
    ['Utility trench on Oak Ave', 'worker@conezone.test'],
    ['Utility trench on Oak Ave', 'supervisor@conezone.test'],
    ['Main St lane closure', 'worker3@conezone.test']
  ];
  for (const [title, email] of crew) {
    await pool.query(
      `INSERT INTO assignment (job_id, user_id)
       SELECT j.id, u.id FROM job j, "user" u WHERE j.title = $1 AND u.email = $2`,
      [title, email]
    );
  }
  console.log('Sample crew assigned');
}

await pool.end();