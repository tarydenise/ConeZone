<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { requireUser } from '../lib/auth.js';
  import { can } from '../lib/permissions.js';
  import { STATUS_LABELS, isFinal } from '../lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight } from '../lib/time.js';
  import Loading from './Loading.svelte';
  import ErrorMessage from './ErrorMessage.svelte';

  let state = $state('loading'); // 'loading' | 'notfound' | 'error' | 'loaded'
  let job = $state(null);
  let role = $state('');

  // Hiding the button is only for convenience. RLS still protects edits.
  const canEdit = $derived(job !== null && can(role, 'job.edit') && !isFinal(job.status));
  const office = $derived(can(role, 'job.view_any'));
  const backHref = $derived(office ? '/jobs' : '/my-jobs');

  async function loadJob() {
    state = 'loading';

    const me = await requireUser();
    if (!me) return; // being sent to Login
    role = me.profile.role;

    // The id must be a whole number. Anything else is simply "not found".
    const id = new URLSearchParams(location.search).get('id');
    if (!id || !/^\d+$/.test(id)) {
      state = 'notfound';
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, client_name, address, date, start_time, end_time, workers_needed, notes, status')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      // Missing, or hidden by Row Level Security: both look the same
      if (!data) {
        state = 'notfound';
        return;
      }

      job = data;
      state = 'loaded';
    } catch (error) {
      console.error('Could not load job:', error);
      state = 'error';
    }
  }

  onMount(() => {
    loadJob();
  });
</script>

{#if state === 'loading'}
  <Loading />
{:else if state === 'notfound'}
  <div class="card narrow">
    <h1>Not found</h1>
    <p>We could not find that job.</p>
    <a href={backHref}>Back to jobs</a>
  </div>
{:else if state === 'error'}
  <ErrorMessage message="Could not load this job." onretry={loadJob} />
{:else}
  <p><a href={backHref}>&larr; {office ? 'All jobs' : 'My jobs'}</a></p>

  <div class="top">
    <h1>{job.title}</h1>
    <span class="badge {job.status}">{STATUS_LABELS[job.status]}</span>
  </div>

  {#if isFinal(job.status)}
    <p class="note">This job is {STATUS_LABELS[job.status].toLowerCase()} and can no longer be edited.</p>
  {/if}

  <section class="card">
    <dl>
      {#if job.client_name}
        <dt>Client</dt><dd>{job.client_name}</dd>
      {/if}
      <dt>Address</dt><dd>{job.address}</dd>
      <dt>Date</dt><dd>{formatDate(job.date)}</dd>
      <dt>Time</dt>
      <dd>
        {formatTime(job.start_time)} to {formatTime(job.end_time)}
        {#if isOvernight(job.start_time, job.end_time)}(Overnight, ends the next day){/if}
      </dd>
      <dt>Workers needed</dt><dd>{job.workers_needed}</dd>
      {#if job.notes}
        <dt>Notes</dt><dd class="notes">{job.notes}</dd>
      {/if}
    </dl>

    {#if canEdit}
      <div class="actions">
        <a class="btn" href={`/jobs/edit?id=${job.id}`}>Edit</a>
      </div>
    {/if}
  </section>
{/if}

<style>
  .top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  h1 { margin: 8px 0; }
  .card { max-width: 640px; margin-bottom: 16px; }
  .narrow { max-width: 480px; margin: 32px auto; }
  dl { margin: 0; display: grid; grid-template-columns: 1fr; gap: 4px 16px; }
  dt { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #666; margin-top: 12px; }
  dd { margin: 0; }
  .notes { white-space: pre-wrap; overflow-wrap: anywhere; }
  .note { padding: 10px 12px; background: #fff1c2; border: 1.5px solid var(--ink); border-radius: 6px; max-width: 640px; }
  .actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
  @media (min-width: 600px) {
    dl { grid-template-columns: 160px 1fr; }
    dt { margin-top: 0; }
  }
</style>