import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth.js';
import { normalizeEmail, validateSignup } from '#lib/validation.js';


export function load({ locals }) {
  if (locals.user) redirect(303, '/');
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    const email = normalizeEmail(data.get('email'));
    const password = String(data.get('password') ?? '');
    const values = { name, email };

    /** @type {{ name?: string, email?: string, password?: string, form?: string }} */
    const errors = validateSignup({ name, email, password });
    if (Object.keys(errors).length) return fail(400, { errors, values });

    try {
      await auth.api.signUpEmail({ body: { name, email, password } });
    } catch (error) {
      if (error instanceof APIError) {
        const exists = String(error.message).toLowerCase().includes('exist');
        errors.form = exists
          ? 'An account with this email already exists.'
          : 'Could not create your account. Try again.';
        return fail(400, { errors, values });
      }
      throw error;
    }
    redirect(303, '/');
  }
};