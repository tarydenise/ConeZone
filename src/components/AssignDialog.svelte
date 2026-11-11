<script>
  import { ROLE_LABELS } from '../lib/nav.js';

  // onassign runs the assignment and returns an error message, or nothing if it worked.
  let { eligible, onassign } = $props();

  let dialog = $state();
  let search = $state('');
  let selected = $state([]); // ids of the ticked people
  let saving = $state(false);
  let error = $state('');

  export function show() {
    search = '';
    selected = [];
    error = '';
    dialog.showModal();
  }

  function matches(person) {
    return person.name.toLowerCase().includes(search.trim().toLowerCase());
  }

  async function save(event) {
    event.preventDefault();
    if (selected.length === 0) {
      error = 'Pick at least one person.';
      return;
    }
    saving = true;
    error = '';
    try {
      const problem = await onassign([...selected]);
      if (problem) error = problem; // keep it open so they can read it
      else dialog.close();
    } finally {
      saving = false;
    }
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

  <form onsubmit={save}>
    <div class="list">
      {#each eligible as person (person.id)}
        <!-- Hidden instead of removed, so ticks survive while searching -->
        <label class="pick" hidden={!matches(person)}>
          <input type="checkbox" value={person.id} bind:group={selected} />
          <span>{person.name} <small>{ROLE_LABELS[person.role]}</small></span>
        </label>
      {/each}
    </div>
    <div class="actions">
      <button class="btn" disabled={saving || eligible.length === 0}>{saving ? 'Saving...' : 'Save'}</button>
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
  .list:empty { display: none; }
  .pick { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 0 12px; border-bottom: 1px solid #e3e3e0; }
  .pick[hidden] { display: none; }
  .pick input { width: 22px; height: 22px; }
  small { color: #666; margin-left: 4px; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
</style>