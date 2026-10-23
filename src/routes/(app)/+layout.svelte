<script>
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { navFor, homeFor, ROLE_LABELS } from '#lib/nav.js';

  let { data, children } = $props();
  let menuOpen = $state(false);

  const items = $derived(navFor(data.user.role));
  const home = $derived(homeFor(data.user.role));
  const isWorker = $derived(data.user.role === 'field_worker' || data.user.role === 'supervisor');

  function isCurrent(href) {
    const path = page.url.pathname;
    return path === href || path.startsWith(href + '/');
  }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') menuOpen = false; }} />

<div class="shell" class:has-tabs={isWorker}>
  <a class="skip" href="#main">Skip to content</a>

  <header>
    <a class="brand" href={resolve(home)}>ConeZone</a>

    <nav class="topnav" aria-label="Main">
      {#each items as item (item.href)}
        <a href={resolve(item.href)} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
      {/each}
    </nav>

    <div class="spacer"></div>
    <div class="who">{data.user.name}<small>{ROLE_LABELS[data.user.role]}</small></div>

    {#if !isWorker}
      <button class="menu-btn" aria-expanded={menuOpen} aria-controls="drawer"
        onclick={() => (menuOpen = !menuOpen)}>Menu</button>
    {/if}

    <form method="POST" action="/logout"><button>Log out</button></form>
  </header>

  {#if menuOpen && !isWorker}
    <nav id="drawer" class="drawer" aria-label="Menu">
      {#each items as item (item.href)}
        <a href={resolve(item.href)} aria-current={isCurrent(item.href) ? 'page' : undefined}
          onclick={() => (menuOpen = false)}>{item.label}</a>
      {/each}
    </nav>
  {/if}

  <main id="main">{@render children()}</main>

  {#if isWorker}
    <nav class="tabbar" aria-label="Main tabs">
      {#each items as item (item.href)}
        <a href={resolve(item.href)} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .shell { min-height: 100vh; display: flex; flex-direction: column; }
  .skip { position: absolute; left: -9999px; top: 8px; z-index: 50; background: #fff; padding: 12px 16px; border: 2px solid var(--ink); }
  .skip:focus { left: 8px; }

  header { display: flex; align-items: center; gap: 12px; padding: 0 12px; min-height: 56px; background: var(--ink); color: #fff; }
  header form { margin: 0; }
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

  main { flex: 1; width: 100%; max-width: 1100px; margin: 0 auto; padding: 16px; box-sizing: border-box; }
  .has-tabs main { padding-bottom: 88px; }

  .tabbar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; background: #fff; border-top: 1.5px solid var(--line); }
  .tabbar a { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 56px; color: var(--ink); text-decoration: none; font-size: 13px; }
  .tabbar a[aria-current='page'] { font-weight: 800; border-top: 3px solid var(--ink); }

  @media (min-width: 768px) {
    .topnav { display: flex; }
    .menu-btn, .drawer, .tabbar { display: none; }
    .has-tabs main { padding-bottom: 16px; }
    .who { font-size: 14px; }
  }
</style>