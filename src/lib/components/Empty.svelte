<script>
  let { message, children } = $props();
</script>

<div class="state">
  <p>{message}</p>
  {@render children?.()}
</div>

<style>
  .state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 16px; color: #555; text-align: center; }
  p { margin: 0; }
</style>