<script>
  import { resolve } from '$app/paths';
  import { enhance } from '$app/forms';
  import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
  import AssignDialog from '#lib/components/AssignDialog.svelte';
  import { STATUS_LABELS } from '#lib/jobStatus.js';
  import { ROLE_LABELS } from '#lib/nav.js';
  import { formatDate, formatTime, isOvernight } from '#lib/time.js';

  let { data, form } = $props();
  const job = $derived(data.job);

  let cancelDialog = $state();
  let deleteDialog = $state();
  let assignDialog = $state();

  const STATUS_BUTTONS = {
    in_progress: 'Start job (In Progress)',
    completed: 'Mark Completed'
  };
</script>

<p><a href={resolve(data.backHref)}>&larr; {data.backLabel}</a></p>

<div class="top">
  <h1>{job.title}</h1>
  <span class="badge {job.status}">{STATUS_LABELS[job.status]}</span>
</div>

{#if data.isFinal}
  <p class="note">This job is {STATUS_LABELS[job.status].toLowerCase()} and can no longer be edited.</p>
{/if}

<section class="card">
  <dl>
    {#if job.clientName}
      <dt>Client</dt><dd>{job.clientName}</dd>
    {/if}
    <dt>Address</dt><dd>{job.address}</dd>
    <dt>Date</dt><dd>{formatDate(job.date)}</dd>
    <dt>Time</dt>
    <dd>
      {formatTime(job.startTime)} to {formatTime(job.endTime)}
      {#if isOvernight(job.startTime, job.endTime)}(Overnight, ends the next day){/if}
    </dd>
    <dt>Workers needed</dt><dd>{job.workersNeeded}</dd>
    {#if job.notes}
      <dt>Notes</dt><dd class="notes">{job.notes}</dd>
    {/if}
  </dl>

  <div class="actions">
    {#if data.canEdit}
      <a class="btn" href={resolve('/jobs/[id]/edit', { id: String(job.id) })}>Edit</a>
    {/if}

    {#each data.statusOptions.filter((s) => s !== 'cancelled') as option (option)}
      <form method="POST" action="?/status" use:enhance>
        <input type="hidden" name="status" value={option} />
        <button class="btn">{STATUS_BUTTONS[option]}</button>
      </form>
    {/each}

    {#if data.statusOptions.includes('cancelled')}
      <button class="btn secondary" type="button" onclick={() => cancelDialog.show()}>Cancel job</button>
    {/if}

    {#if data.canDelete}
      <button class="btn danger" type="button" onclick={() => deleteDialog.show()}>Delete</button>
    {/if}
  </div>
</section>

<section class="card crew">
  <div class="crew-head">
    <h2>Crew ({data.crew.length} of {job.workersNeeded})</h2>
    {#if data.canManageCrew && !data.isFinal}
      <button class="btn" type="button" onclick={() => assignDialog.show()}>+ Assign</button>
    {/if}
  </div>

  {#if form?.crewError}<p class="error" role="alert">{form.crewError}</p>{/if}

  {#if data.crew.length === 0}
    <p class="empty">No one assigned yet</p>
  {:else}
    <ul>
      {#each data.crew as member (member.id)}
        <li>
          <span>
            {member.name}{#if !member.isActive} (inactive){/if}
            <small>{ROLE_LABELS[member.role]}</small>
          </span>
          {#if data.canManageCrew && !data.isFinal}
            <form method="POST" action="?/remove" use:enhance>
              <input type="hidden" name="assignmentId" value={member.id} />
              <button class="btn secondary" aria-label="Remove {member.name}">Remove</button>
            </form>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<ConfirmDialog
  bind:this={cancelDialog}
  id="cancel"
  title="Cancel this job?"
  message="The job stays on record marked Cancelled, but it can't be reopened."
  confirmLabel="Cancel job"
  action="?/status"
  name="status"
  value="cancelled"
/>

<ConfirmDialog
  bind:this={deleteDialog}
  id="delete"
  title="Delete this job?"
  message="This permanently removes the job and anything attached to it. This cannot be undone."
  confirmLabel="Delete job"
  action="?/delete"
/>

<AssignDialog bind:this={assignDialog} eligible={data.eligible} error={form?.assignError} />

<style>
  .top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  h1 { margin: 8px 0; }
  .card { max-width: 640px; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; padding: 20px; margin-bottom: 16px; }
  dl { margin: 0; display: grid; grid-template-columns: 1fr; gap: 4px 16px; }
  dt { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin-top: 12px; }
  dd { margin: 0; }
  .notes { white-space: pre-wrap; }
  .note { padding: 10px 12px; background: #fff1c2; border: 1.5px solid var(--ink); border-radius: 6px; max-width: 640px; }
  .actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
  .actions form { margin: 0; }

  .crew-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .crew h2 { margin: 0; font-size: 18px; }
  .crew ul { list-style: none; margin: 12px 0 0; padding: 0; }
  .crew li { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; border-top: 1px solid #e3e3e0; }
  .crew li form { margin: 0; }
  .crew small { display: block; color: #666; }
  .empty { color: #666; }

  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1.5px solid var(--ink); }
  .badge.open { background: #fff; }
  .badge.staffed { background: #dff3e3; }
  .badge.in_progress { background: #fff1c2; }
  .badge.completed { background: #e3e3e0; }
  .badge.cancelled { background: #fadada; }
  @media (min-width: 600px) {
    dl { grid-template-columns: 160px 1fr; }
    dt { margin-top: 0; }
  }
</style>