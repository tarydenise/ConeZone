<script>
  import { resolve } from '$app/paths';
  import { STATUS_LABELS } from '#lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight } from '#lib/time.js';

  let { data } = $props();
  const job = $derived(data.job);
</script>

<p><a href={resolve('/jobs')}>&larr; All jobs</a></p>

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

  {#if data.canEdit}
    <div class="actions">
      <a class="btn" href={resolve('/jobs/[id]/edit', { id: String(job.id) })}>Edit</a>
    </div>
  {/if}
</section>

<style>
  .top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  h1 { margin: 8px 0; }
  .card { max-width: 640px; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; padding: 20px; }
  dl { margin: 0; display: grid; grid-template-columns: 1fr; gap: 4px 16px; }
  dt { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin-top: 12px; }
  dd { margin: 0; }
  .notes { white-space: pre-wrap; }
  .note { padding: 10px 12px; background: #fff1c2; border: 1.5px solid var(--ink); border-radius: 6px; max-width: 640px; }
  .actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
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