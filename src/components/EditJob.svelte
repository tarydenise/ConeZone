<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { requireAction } from '../lib/auth.js';
  import { isFinal, STATUS_LABELS } from '../lib/jobStatus.js';
  import { toFormValues, toJobRow, friendlyJobError } from '../lib/jobValidation.js';
  import JobForm from './JobForm.svelte';
  import Loading from './Loading.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  import AccessDenied from './AccessDenied.svelte';

  let state = $state('loading'); // 'loading' | 'denied' | 'notfound' | 'final' | 'error' | 'loaded'
  let job = $state(null);

  async function loadJob() {
    state = 'loading';

    const access = await requireAction('job.edit');
    if (!access) return; // being sent to Login
    if (!access.allowed) {
      state = 'denied';
      return;
    }

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
      if (!data) {
        state = 'notfound';
        return;
      }

      job = data;
      // The database also refuses these edits. This just explains it up front.
      state = isFinal(data.status) ? 'final' : 'loaded';
    } catch (error) {
      console.error('Could not load job:', error);
      state = 'error';
    }
  }

  async function saveJob(values) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...toJobRow(values), updated_at: new Date().toISOString() })
      .eq('id', job.id)
      .select('id')
      .maybeSingle();

    if (error) return { error: friendlyJobError(error) };
    if (!data) return { error: 'This job could not be saved. It may have been deleted.' };
    location.href = `/jobs/view?id=${job.id}`;
  }

  onMount(() => {
    loadJob();
  });
</script>

{#if state === 'loading'}
  <Loading />
{:else if state === 'denied'}
  <AccessDenied />
{:else if state === 'notfound'}
  <div class="card narrow">
    <h1>Not found</h1>
    <p>We could not find that job.</p>
    <a href="/jobs">Back to jobs</a>
  </div>
{:else if state === 'final'}
  <div class="card narrow">
    <h1>Can't edit this job</h1>
    <p>This job is {STATUS_LABELS[job.status].toLowerCase()} and can no longer be edited.</p>
    <a href={`/jobs/view?id=${job.id}`}>Back to the job</a>
  </div>
{:else if state === 'error'}
  <ErrorMessage message="Could not load this job." onretry={loadJob} />
{:else}
  <h1>Edit job</h1>
  <JobForm
    initial={toFormValues(job)}
    onSave={saveJob}
    submitLabel="Save changes"
    cancelHref={`/jobs/view?id=${job.id}`}
  />
{/if}

<style>
  .narrow { max-width: 480px; margin: 32px auto; }
</style>