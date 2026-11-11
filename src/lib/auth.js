import { supabase } from './supabase.js';
import { can } from './permissions.js';

/** Send the visitor to Login, remembering where they were going. */
export function goToLogin() {
  const here = location.pathname + location.search;
  location.href = `/login?redirectTo=${encodeURIComponent(here)}`;
}

/**
 * For protected pages: returns { user, profile } for the logged-in user,
 * or sends them to Login. This is a convenience check in the browser.
 * The real protection is Row Level Security in the database.
 */
export async function requireUser() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) {
    goToLogin();
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, is_active')
    .eq('id', session.user.id)
    .single();

  // Deactivated (or missing) profile: treat as logged out
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    goToLogin();
    return null;
  }

  return { user: session.user, profile };
}

export async function logOut() {
  await supabase.auth.signOut();
  location.href = '/login';
}

/**
 * For pages limited to certain roles: returns { user, profile, allowed },
 * or sends logged-out visitors to Login.
 */
export async function requireAction(action) {
  const result = await requireUser();
  if (!result) return null;
  return { ...result, allowed: can(result.profile.role, action) };
}