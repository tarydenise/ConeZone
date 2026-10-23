<script>
  import { enhance } from '$app/forms';
  import { ROLE_LABELS } from '#lib/nav.js';

  let { eligible, error = '' } = $props();
  let dialog = $state();
  let search = $state('');

  export function show() {
    search = '';
    dialog.showModal();
  }

  function matches(person) {
    return person.name.toLowerCase().includes(search.trim().toLowerCase());
  }
</script>

<dialog bind:this={dialog} aria-labelledby="assign-title">
  <h2 id="assign-title">Assign workers</h2>
  {#if error}<p class="error" role="alert">{error}</p>{/if}

  {#if eligible.length === 0}
    <p>No one is available to assign.</p>
  {:else}
    <label class="search">Search by name
      <input type="search" bind:value={search} />
    </label>
  {/if}

  <form
    method="POST"
    action="?/assign"
    use:enhance={() => {
      return async ({ result, update }) => {
        await update();
        if (result.type === 'success') dialog.close();
      };
    }}
  >
    <div class="list">
      {#each eligible as person (person.id)}
        <label class="pick" hidden={!matches(person)}>
          <input type="checkbox" name="userId" value={person.id} />
          <span>{person.name} <small>{ROLE_LABELS[person.role]}</small></span>
        </label>
      {/each}
    </div>
    <div class="actions">
      <button class="btn" disabled={eligible.length === 0}>Save</button>
      <button class="btn secondary" type="button" onclick={() => dialog.close()}>Cancel</button>
    </div>
  </form>
</dialog>

<style>
  dialog { width: calc(100% - 32px); max-width: 460px; padding: 20px; border: 1.5px solid var(--ink); border-radius: 8px; }
  dialog::backdrop { background: rgba(0, 0, 0, 0.45); }
  h2 { margin: 0 0 8px; }
  .search { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
  .search input { min-height: 44px; padding: 0 12px; border: 1.5px solid var(--line); border-radius: 6px; font: inherit; font-weight: 400; }
  .list { max-height: 280px; overflow-y: auto; border: 1.5px solid var(--line); border-radius: 6px; }
  .pick { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 0 12px; border-bottom: 1px solid #e3e3e0; }
  .pick[hidden] { display: none; }
  .pick input { width: 22px; height: 22px; }
  small { color: #666; margin-left: 4px; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
</style>