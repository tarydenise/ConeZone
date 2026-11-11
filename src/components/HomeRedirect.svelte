<script>
  import { onMount } from 'svelte';
  import { requireUser } from '../lib/auth.js';
  import { homeFor } from '../lib/nav.js';
  import Loading from './Loading.svelte';

  onMount(async () => {
    const result = await requireUser();
    if (result) location.replace(homeFor(result.profile.role));
  });
</script>

<Loading />