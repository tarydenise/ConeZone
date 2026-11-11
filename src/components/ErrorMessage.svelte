<script>
  let { message = 'Something went wrong.', onretry } = $props();
</script>

<div class="state" role="alert">
  <p>{message}</p>
  {#if onretry}<button class="btn" onclick={onretry}>Retry</button>{/if}
</div>

<style>
  .state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 16px; text-align: center; }
  p { margin: 0; color: #a40000; }
</style>