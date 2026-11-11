<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { requireAction } from '../lib/auth.js';
  import { STATUS_LABELS } from '../lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight, hasJobEnded } from '../lib/time.js';
  import { todayLocal } from '../lib/jobValidation.js';
  import Loading from './Loading.svelte';
  import Empty from './Empty.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  import AccessDenied from './AccessDenied.svelte';

  let state = $state('loading'); // 'loading' | 'denied' | 'error' | 'loaded'
  let today = $state([]);
  let upcoming = $state([]);

  async function loadMyJobs() {
    state = 'loading';

    const access = await requireAction('job.view_own');
    if (!access) return; // being sent to Login
    if (!access.allowed) {
      state = 'denied';
      return;
    }

    try {
      // Start from this user's own assignments, so even office roles only see their own
      const { data, error } = await supabase
        .from('assignments')
        .select('jobs(id, title, address, date, start_time, end_time, status)')
        .eq('user_id', access.user.id);
      if (error) throw error;

      const now = new Date();
      const todayStr = todayLocal();

      const current = data
        .map((row) => row.jobs)
        .filter((job) => job && !hasJobEnded(job, now)) // hide jobs that are over
        .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));

      today = current.filter((job) => job.date <= todayStr); // includes overnight jobs still running
      upcoming = current.filter((job) => job.date > todayStr);
      state = 'loaded';
    } catch (error) {
      console.error('Could not load My Jobs:', error);
      state = 'error';
    }
  }

  onMount(() => {
    loadMyJobs();
  });
</script>

{#snippet card(job)}
  <li>
    <a class="job" href={`/jobs/view?id=${job.id}`}>
      <span class="when">
        {formatDate(job.date)}, {formatTime(job.start_time)} to {formatTime(job.end_time)}
        {#if isOvernight(job.start_time, job.end_time)}(Overnight){/if}
      </span>
      <strong>{job.title}</strong>
      <span>{job.address}</span>
      <span class="badge {job.status}">{STATUS_LABELS[job.status]}</span>
    </a>
  </li>
{/snippet}

{#if state === 'loading'}
  <Loading />
{:else if state === 'denied'}
  <AccessDenied />
{:else if state === 'error'}
  <ErrorMessage message="Could not load your jobs." onretry={loadMyJobs} />
{:else}
  <h1>My Jobs</h1>

  {#if today.length === 0 && upcoming.length === 0}
    <Empty message="You have no upcoming jobs. Check back after dispatch assigns you." />
  {:else}
    {#if today.length > 0}
      <h2>Today</h2>
      <ul>{#each today as job (job.id)}{@render card(job)}{/each}</ul>
    {/if}

    {#if upcoming.length > 0}
      <h2>Upcoming</h2>
      <ul>{#each upcoming as job (job.id)}{@render card(job)}{/each}</ul>
    {/if}
  {/if}
{/if}

<style>
  h1 { margin: 8px 0; }
  h2 { font-size: 16px; margin: 20px 0 8px; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .job { display: flex; flex-direction: column; gap: 4px; min-height: 44px; padding: 14px 16px; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; color: var(--ink); text-decoration: none; }
  .when { font-size: 13px; color: #555; }
  .badge { align-self: flex-start; margin-top: 4px; }
</style>