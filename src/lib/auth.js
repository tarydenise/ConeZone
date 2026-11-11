import { supabase } from './supabase.js';

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