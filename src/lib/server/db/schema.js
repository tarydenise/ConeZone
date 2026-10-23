import { pgTable, text, timestamp, boolean, serial, integer, date, time, unique } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  role: text('role').notNull().default('field_worker'),
  isActive: boolean('is_active').notNull().default(true)
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const job = pgTable('job', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  clientName: text('client_name'),
  address: text('address').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  workersNeeded: integer('workers_needed').notNull().default(1),
  notes: text('notes'),
  status: text('status').notNull().default('open'),
  createdBy: text('created_by').notNull().references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const assignment = pgTable(
  'assignment',
  {
    id: serial('id').primaryKey(),
    jobId: integer('job_id').notNull().references(() => job.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id),
    isJobSupervisor: boolean('is_job_supervisor').notNull().default(false),
    checkedInAt: timestamp('checked_in_at'),
    checkedOutAt: timestamp('checked_out_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
  },
  (t) => [unique('assignment_job_user').on(t.jobId, t.userId)]
);