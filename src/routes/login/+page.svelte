<script>
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  let { form } = $props();
  let submitting = $state(false);
</script>

<main class="auth-card">
  <h1>ConeZone</h1>
  <p>Log in to see your jobs</p>
  <form method="POST" class="auth-card" style="margin:0;padding:0;border:0;max-width:none"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { await update(); submitting = false; };
    }}>
    {#if form?.error}<p class="error" role="alert">{form.error}</p>{/if}
    <label>Email
      <input name="email" type="email" value={form?.values?.email ?? ''} />
    </label>
    <label>Password
      <input name="password" type="password" />
    </label>
    <button disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
  </form>
  <p>No account? <a href={resolve('/signup')}>Sign up</a></p>
</main>