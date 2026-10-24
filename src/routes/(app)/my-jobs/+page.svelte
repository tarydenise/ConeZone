<script>
  import { resolve } from '$app/paths';
  import Empty from '#lib/components/Empty.svelte';
  import { STATUS_LABELS } from '#lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight } from '#lib/time.js';

  let { data } = $props();
</script>

{#snippet card(job)}
  <li>
    <a class="job" href={resolve('/jobs/[id]', { id: String(job.id) })}>
      <span class="when">
        {formatDate(job.date)}, {formatTime(job.startTime)} to {formatTime(job.endTime)}
        {#if isOvernight(job.startTime, job.endTime)}(Overnight){/if}
      </span>
      <strong>{job.title}</strong>
      <span>{job.address}</span>
      <span class="badge {job.status}">{STATUS_LABELS[job.status]}</span>
    </a>
  </li>
{/snippet}

<h1>My Jobs</h1>

{#if data.today.length === 0 && data.upcoming.length === 0}
  <Empty message="You have no upcoming jobs. Check back after dispatch assigns you." />
{:else}
  {#if data.today.length > 0}
    <h2>Today</h2>
    <ul>{#each data.today as job (job.id)}{@render card(job)}{/each}</ul>
  {/if}

  {#if data.upcoming.length > 0}
    <h2>Upcoming</h2>
    <ul>{#each data.upcoming as job (job.id)}{@render card(job)}{/each}</ul>
  {/if}
{/if}

<style>
  h1 { margin: 8px 0; }
  h2 { font-size: 16px; margin: 20px 0 8px; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .job { display: flex; flex-direction: column; gap: 4px; min-height: 44px; padding: 14px 16px; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; color: var(--ink); text-decoration: none; }
  .when { font-size: 13px; color: #555; }
  .badge { align-self: flex-start; margin-top: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1.5px solid var(--ink); }
  .badge.open { background: #fff; }
  .badge.staffed { background: #dff3e3; }
  .badge.in_progress { background: #fff1c2; }
  .badge.completed { background: #e3e3e0; }
  .badge.cancelled { background: #fadada; }
</style>