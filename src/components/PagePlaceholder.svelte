<script>
  import { onMount } from 'svelte';
  import { requireAction } from '../lib/auth.js';
  import AccessDenied from './AccessDenied.svelte';
  import Loading from './Loading.svelte';
  import Empty from './Empty.svelte';

  let { title, action, message } = $props();
  let state = $state('loading'); // 'loading' | 'allowed' | 'denied'

  onMount(async () => {
    const result = await requireAction(action);
    if (result) state = result.allowed ? 'allowed' : 'denied';
  });
</script>

{#if state === 'loading'}
  <Loading />
{:else if state === 'denied'}
  <AccessDenied />
{:else}
  <h1>{title}</h1>
  <Empty {message} />
{/if}