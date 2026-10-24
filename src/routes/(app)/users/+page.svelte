<script>
  import { enhance } from '$app/forms';
  import { ROLE_LABELS } from '#lib/nav.js';

  let { data, form } = $props();
</script>

<h1>Users</h1>
<p class="intro">Change a person's role. It takes effect on their next page load.</p>

<div class="scroll">
  <table>
    <thead>
      <tr><th>Name</th><th>Email</th><th>Status</th><th>Role</th></tr>
    </thead>
    <tbody>
      {#each data.users as person (person.id)}
        <tr>
          <td>{person.name}{#if person.id === data.meId} (you){/if}</td>
          <td>{person.email}</td>
          <td>{person.isActive ? 'Active' : 'Inactive'}</td>
          <td>
            <form method="POST" action="?/role" use:enhance>
              <input type="hidden" name="userId" value={person.id} />
              <select name="role" aria-label="Role for {person.name}" disabled={person.id === data.meId}>
                {#each Object.entries(ROLE_LABELS) as [value, label] (value)}
                  <option {value} selected={person.role === value}>{label}</option>
                {/each}
              </select>
              <button class="btn secondary" disabled={person.id === data.meId}>Save</button>
            </form>
            {#if form?.userId === person.id && form?.error}
              <p class="error" role="alert">{form.error}</p>
            {/if}
            {#if form?.saved === person.id}
              <p class="ok" role="status">Saved</p>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  h1 { margin: 8px 0; }
  .intro { color: #555; margin-top: 0; }
  .scroll { overflow-x: auto; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e3e3e0; vertical-align: top; }
  th { background: #f7f7f5; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  form { display: flex; gap: 8px; margin: 0; }
  select { min-height: 44px; padding: 0 8px; border: 1.5px solid var(--line); border-radius: 6px; font: inherit; background: #fff; }
  .ok { margin: 6px 0 0; color: #1a6b2f; font-size: 13px; }
</style>