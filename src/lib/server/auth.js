import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'field_worker', input: false },
      isActive: { type: 'boolean', required: false, defaultValue: true, input: false }
    }
  },
  plugins: [sveltekitCookies(getRequestEvent)] // keep this last
});