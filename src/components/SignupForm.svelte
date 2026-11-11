<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { normalizeEmail, validateSignup } from '../lib/validation.js';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let errors = $state({});
  let submitting = $state(false);

  // Already logged in? Go home.
  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) location.replace('/');
  });

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);

    errors = validateSignup({ name: cleanName, email: cleanEmail, password });
    if (Object.keys(errors).length) return;

    submitting = true;
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: cleanName } } // the database trigger copies this into profiles
    });
    submitting = false;

    if (error) {
      if (error.code === 'user_already_exists' || /already/i.test(error.message)) {
        errors = { form: 'An account with this email already exists.' };
      } else if (error.code === 'weak_password') {
        errors = { password: 'Password must be at least 8 characters.' };
      } else {
        errors = { form: 'Could not create your account. Try again.' };
      }
      return;
    }

    if (!data.session) {
      // Only happens if "Confirm email" is still on in Supabase
      errors = { form: 'Check your email to confirm your account, then log in.' };
      return;
    }

    location.href = '/';
  }
</script>

<main class="auth-card">
  <h1>Create your account</h1>

  <form onsubmit={handleSubmit} novalidate>
    {#if errors.form}<p class="error" role="alert">{errors.form}</p>{/if}

    <label>Name
      <input name="name" autocomplete="name" bind:value={name} aria-invalid={!!errors.name} />
      {#if errors.name}<span class="error">{errors.name}</span>{/if}
    </label>

    <label>Email
      <input name="email" type="email" autocomplete="email" bind:value={email} aria-invalid={!!errors.email} />
      {#if errors.email}<span class="error">{errors.email}</span>{/if}
    </label>

    <label>Password
      <input name="password" type="password" autocomplete="new-password" bind:value={password} aria-invalid={!!errors.password} />
      {#if errors.password}<span class="error">{errors.password}</span>{/if}
    </label>

    <button class="btn" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
  </form>

  <p>Already have an account? <a href="/login">Log in</a></p>
</main>

<style>
  form { display: flex; flex-direction: column; gap: 16px; }
</style>