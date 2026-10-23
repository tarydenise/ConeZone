<script>
  import { resolve } from '$app/paths';
  import Empty from '#lib/components/Empty.svelte';
  import { STATUS_LABELS } from '#lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight } from '#lib/time.js';

  let { data } = $props();
</script>

<div class="top">
  <h1>Jobs</h1>
  <a class="btn" href={resolve('/jobs/new')}>+ New job</a>
</div>

{#if data.jobs.length === 0}
  <Empty message="No jobs yet">
    <a class="btn" href={resolve('/jobs/new')}>New job</a>
  </Empty>
{:else}
  <div class="scroll">
    <table>
      <thead>
        <tr><th>Date</th><th>Time</th><th>Job</th><th>Address</th><th>Staffed</th><th>Status</th></tr>
      </thead>
      <tbody>
        {#each data.jobs as job (job.id)}
          <tr>
            <td>{formatDate(job.date)}</td>
            <td>
              {formatTime(job.startTime)} to {formatTime(job.endTime)}
              {#if isOvernight(job.startTime, job.endTime)}<small>Overnight</small>{/if}
            </td>
            <td>
              <a href={resolve('/jobs/[id]', { id: String(job.id) })}>{job.title}</a>
              {#if job.clientName}<small>{job.clientName}</small>{/if}
            </td>
            <td>{job.address}</td>
            <td>{job.staffed} / {job.workersNeeded}</td>
            <td><span class="badge {job.status}">{STATUS_LABELS[job.status]}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  h1 { margin: 8px 0; }
  .scroll { overflow-x: auto; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e3e3e0; vertical-align: top; }
  th { background: #f7f7f5; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  small { display: block; color: #666; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1.5px solid var(--ink); white-space: nowrap; }
  .badge.open { background: #fff; }
  .badge.staffed { background: #dff3e3; }
  .badge.in_progress { background: #fff1c2; }
  .badge.completed { background: #e3e3e0; }
  .badge.cancelled { background: #fadada; text-decoration: line-through; }
</style>