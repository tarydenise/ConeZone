<script>
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<main class="auth-card">
  <h1>Jobs</h1>
  <form method="POST" use:enhance>
    <button>Test create</button>
  </form>
  {#if form?.ok}<p>Allowed.</p>{/if}
</main>