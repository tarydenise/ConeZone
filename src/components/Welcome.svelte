<script>
  import { onMount } from 'svelte';
  import { requireUser, logOut } from '../lib/auth.js';

  let profile = $state(null);

  onMount(async () => {
    const result = await requireUser(); // sends logged-out visitors to Login
    if (result) profile = result.profile;
  });
</script>

<main class="auth-card">
  {#if profile}
    <h1>Welcome, {profile.name}</h1>
    <p>Your role: {profile.role}</p>
    <button class="btn" onclick={logOut}>Log out</button>
  {:else}
    <p>Loading...</p>
  {/if}
</main>