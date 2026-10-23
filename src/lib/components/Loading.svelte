<script>
  let { message = 'Loading' } = $props();
</script>

<div class="state" role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  <p>{message}...</p>
</div>

<style>
  .state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 16px; color: #555; }
  .spinner { width: 28px; height: 28px; border: 3px solid #ddd; border-top-color: var(--ink); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  p { margin: 0; }
</style>