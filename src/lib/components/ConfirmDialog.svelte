<script>
  import { enhance } from '$app/forms';

  let { id, title, message, confirmLabel = 'Confirm', action, name, value } = $props();
  let dialog = $state();

  export function show() {
    dialog.showModal();
  }
</script>

<dialog bind:this={dialog} aria-labelledby="{id}-title">
  <h2 id="{id}-title">{title}</h2>
  <p>{message}</p>
  <form
    method="POST"
    {action}
    use:enhance={() => {
      return async ({ update }) => {
        await update();
        dialog.close();
      };
    }}
  >
    {#if name}<input type="hidden" {name} {value} />{/if}
    <div class="actions">
      <button class="btn danger">{confirmLabel}</button>
      <button class="btn secondary" type="button" onclick={() => dialog.close()}>Keep it</button>
    </div>
  </form>
</dialog>

<style>
  dialog { max-width: 420px; width: calc(100% - 32px); padding: 20px; border: 1.5px solid var(--ink); border-radius: 8px; }
  dialog::backdrop { background: rgba(0, 0, 0, 0.45); }
  h2 { margin: 0 0 8px; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
</style>