import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth.js';
import { normalizeEmail, safeRedirectPath } from '#lib/validation.js';

export function load({ locals }) {
  if (locals.user) redirect(303, '/');
}


export const actions = {
  default: async ({ request, url }) => {
    const data = await request.formData();
    const email = normalizeEmail(data.get('email'));
    const password = String(data.get('password') ?? '');

    let result;
    try {
      result = await auth.api.signInEmail({ body: { email, password } });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { error: 'Email or password is incorrect.', values: { email } });
      }
      throw error;
    }

    if (result.user?.isActive === false) {
      return fail(403, { error: 'This account is inactive. Contact an administrator.', values: { email } });
    }

    redirect(303, safeRedirectPath(url.searchParams.get('redirectTo')));
  }
};