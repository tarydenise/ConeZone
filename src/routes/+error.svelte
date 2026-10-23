<script>
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
</script>

<main class="auth-card">
  {#if page.status === 403}
    <h1>Access denied</h1>
    <p>Your role does not have access to this page.</p>
  {:else if page.status === 404}
    <h1>Not found</h1>
    <p>We could not find what you were looking for.</p>
  {:else if page.status === 409}
    <h1>Not allowed</h1>
    <p>{page.error?.message}</p>
  {:else}
    <h1>Something went wrong</h1>
    <p>{page.error?.message}</p>
  {/if}
  <a href={resolve("/")}>Go back home</a>
</main>
