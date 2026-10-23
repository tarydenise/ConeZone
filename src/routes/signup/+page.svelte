<script>
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  let { form } = $props();
  let submitting = $state(false);
</script>

<main class="auth-card">
  <h1>Create your account</h1>
  <form method="POST" class="auth-card" style="margin:0;padding:0;border:0;max-width:none"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => { await update(); submitting = false; };
    }}>
    {#if form?.errors?.form}<p class="error" role="alert">{form.errors.form}</p>{/if}
    <label>Name
      <input name="name" value={form?.values?.name ?? ''} />
      {#if form?.errors?.name}<span class="error">{form.errors.name}</span>{/if}
    </label>
    <label>Email
      <input name="email" type="email" value={form?.values?.email ?? ''} />
      {#if form?.errors?.email}<span class="error">{form.errors.email}</span>{/if}
    </label>
    <label>Password
      <input name="password" type="password" />
      {#if form?.errors?.password}<span class="error">{form.errors.password}</span>{/if}
    </label>
    <button disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
  </form>
  <p>Already have an account? <a href={resolve('/login')}>Log in</a></p>
</main>