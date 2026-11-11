<script>
  import { onMount } from 'svelte';
  import { requireUser, logOut } from '../lib/auth.js';
  import { navFor, homeFor, ROLE_LABELS } from '../lib/nav.js';

  let profile = $state(null);
  let menuOpen = $state(false);

  const items = $derived(profile ? navFor(profile.role) : []);
  const home = $derived(profile ? homeFor(profile.role) : '/');
  const isWorker = $derived(profile?.role === 'field_worker' || profile?.role === 'supervisor');

  onMount(async () => {
    const result = await requireUser(); // sends logged-out visitors to Login
    if (result) profile = result.profile;
  });

  function isCurrent(href) {
    const path = location.pathname.replace(/\/$/, '') || '/';
    return path === href || path.startsWith(href + '/');
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') menuOpen = false; }} />

<header>
  <a class="brand" href={home}>ConeZone</a>

  {#if profile}
    <nav class="topnav" aria-label="Main">
      {#each items as item (item.href)}
        <a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
      {/each}
    </nav>

    <div class="spacer"></div>
    <div class="who">{profile.name}<small>{ROLE_LABELS[profile.role]}</small></div>

    {#if !isWorker}
      <button class="menu-btn" aria-expanded={menuOpen} aria-controls="drawer"
        onclick={() => (menuOpen = !menuOpen)}>Menu</button>
    {/if}

    <button onclick={logOut}>Log out</button>
  {/if}
</header>

{#if profile && menuOpen && !isWorker}
  <nav id="drawer" class="drawer" aria-label="Menu">
    {#each items as item (item.href)}
      <a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}
        onclick={() => (menuOpen = false)}>{item.label}</a>
    {/each}
  </nav>
{/if}

{#if profile && isWorker}
  <nav class="tabbar" aria-label="Main tabs">
    {#each items as item (item.href)}
      <a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
    {/each}
  </nav>
{/if}

<style>
  header { display: flex; align-items: center; gap: 12px; padding: 0 12px; min-height: 56px; background: var(--ink); color: #fff; }
  header button { min-height: 44px; min-width: 44px; padding: 0 12px; border: 1.5px solid #fff; border-radius: 6px; background: transparent; color: #fff; font: inherit; cursor: pointer; }
  .brand { display: inline-flex; align-items: center; min-height: 44px; color: #fff; font-weight: 800; text-decoration: none; }
  .spacer { flex: 1; }
  .who { font-size: 13px; line-height: 1.2; text-align: right; }
  .who small { display: block; opacity: 0.8; }

  .topnav { display: none; gap: 4px; }
  .topnav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; color: #fff; text-decoration: none; border-radius: 6px; }
  .topnav a[aria-current='page'] { background: #fff; color: var(--ink); font-weight: 700; }

  .drawer { display: flex; flex-direction: column; background: #fff; border-bottom: 1.5px solid var(--line); }
  .drawer a { display: flex; align-items: center; min-height: 48px; padding: 0 16px; color: var(--ink); text-decoration: none; border-top: 1px solid #e3e3e0; }
  .drawer a[aria-current='page'] { font-weight: 800; }

  .tabbar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; background: #fff; border-top: 1.5px solid var(--line); z-index: 10; }
  .tabbar a { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 56px; color: var(--ink); text-decoration: none; font-size: 13px; }
  .tabbar a[aria-current='page'] { font-weight: 800; border-top: 3px solid var(--ink); }

  @media (min-width: 768px) {
    .topnav { display: flex; }
    .menu-btn, .drawer, .tabbar { display: none; }
    .who { font-size: 14px; }
  }
</style>