export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function validateSignup({ name, email, password }) {
  const errors = {};
  if (!name || name.length > 100) errors.name = 'Enter your name (up to 100 characters).';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  return errors;
}

export function safeRedirectPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}