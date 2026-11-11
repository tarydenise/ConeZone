<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { requireAction } from '../lib/auth.js';
  import { emptyJob, toJobRow, friendlyJobError } from '../lib/jobValidation.js';
  import JobForm from './JobForm.svelte';
  import Loading from './Loading.svelte';
  import AccessDenied from './AccessDenied.svelte';

  let state = $state('loading'); // 'loading' | 'denied' | 'ready'

  onMount(async () => {
    const access = await requireAction('job.create');
    if (!access) return; // being sent to Login
    state = access.allowed ? 'ready' : 'denied';
  });

  async function saveJob(values) {
    const { data, error } = await supabase
      .from('jobs')
      .insert(toJobRow(values)) // status and created_by come from the database defaults
      .select('id')
      .single();

    if (error) return { error: friendlyJobError(error) };
    location.href = `/jobs/view?id=${encodeURIComponent(data.id)}`;
  }
</script>

{#if state === 'loading'}
  <Loading />
{:else if state === 'denied'}
  <AccessDenied />
{:else}
  <h1>New job</h1>
  <JobForm initial={emptyJob()} onSave={saveJob} submitLabel="Create job" />
{/if}