<script>
  import { onMount } from 'svelte';
  import { requireAction } from '../lib/auth.js';
  import AccessDenied from './AccessDenied.svelte';

  let state = $state('loading'); // 'loading' | 'allowed' | 'denied'

  onMount(async () => {
    const result = await requireAction('job.create');
    if (result) state = result.allowed ? 'allowed' : 'denied';
  });
</script>

{#if state === 'loading'}
  <main class="auth-card"><p>Loading...</p></main>
{:else if state === 'denied'}
  <AccessDenied />
{:else}
  <main class="auth-card">
    <h1>New job (placeholder)</h1>
    <p>F6 builds this page.</p>
  </main>
{/if}