import { redirect } from '@sveltejs/kit';
import { homeFor } from '#lib/nav.js';

export function load({ locals }) {
  redirect(303, locals.user ? homeFor(locals.user.role) : '/login');
}