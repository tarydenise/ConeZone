import { redirect } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.js';

export async function handle({ event, resolve }) {
  const session = await auth.api.getSession({ headers: event.request.headers });

  // Treat deactivated users as logged out (F1 / F2 rule)
  if (session && session.user.isActive !== false) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  const path = event.url.pathname;
  const isPublic = path === '/login' || path === '/signup' || path.startsWith('/api/auth');

  if (!event.locals.user && !isPublic) {
    redirect(303, `/login?redirectTo=${encodeURIComponent(path + event.url.search)}`);
  }

  return svelteKitHandler({ event, resolve, auth, building });
}