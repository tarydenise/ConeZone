<script>
  // onconfirm runs the action and returns an error message, or nothing if it worked.
  let { title, message, confirmLabel = 'Confirm', onconfirm } = $props();

  const uid = $props.id(); // a unique id, so several dialogs can share a page
  let dialog = $state();
  let saving = $state(false);
  let error = $state('');

  export function show() {
    error = '';
    dialog.showModal();
  }

  async function confirm() {
    saving = true;
    error = '';
    try {
      const problem = await onconfirm();
      if (problem) error = problem; // keep it open so they can read the error
      else dialog.close();
    } finally {
      saving = false;
    }
  }
</script>

<dialog bind:this={dialog} aria-labelledby="{uid}-title">
  <h2 id="{uid}-title">{title}</h2>
  <p>{message}</p>
  {#if error}<p class="error" role="alert">{error}</p>{/if}
  <div class="actions">
    <button class="btn danger" onclick={confirm} disabled={saving}>{saving ? 'Working...' : confirmLabel}</button>
    <button class="btn secondary" onclick={() => dialog.close()} disabled={saving}>Keep it</button>
  </div>
</dialog>

<style>
  dialog { max-width: 420px; width: calc(100% - 32px); padding: 20px; border: 1.5px solid var(--ink); border-radius: 8px; }
  dialog::backdrop { background: rgba(0, 0, 0, 0.45); }
  h2 { margin: 0 0 8px; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
</style>