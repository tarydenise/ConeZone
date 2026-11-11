<script>
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase.js';
  import { requireUser } from '../lib/auth.js';
  import { can } from '../lib/permissions.js';
  import { ROLE_LABELS } from '../lib/nav.js';
  import { STATUS_LABELS, isFinal, allowedStatusChanges } from '../lib/jobStatus.js';
  import { formatDate, formatTime, isOvernight } from '../lib/time.js';
  import Loading from './Loading.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  import ConfirmDialog from './ConfirmDialog.svelte';
  import AssignDialog from './AssignDialog.svelte';

  let state = $state('loading'); // 'loading' | 'notfound' | 'error' | 'loaded'
  let job = $state(null);
  let crew = $state([]);
  let eligible = $state([]);
  let role = $state('');
  let statusError = $state('');
  let crewError = $state('');
  let changing = $state(false);
  let cancelDialog = $state();
  let deleteDialog = $state();
  let assignDialog = $state();

  // Hiding buttons is only for convenience. The database still enforces every rule.
  const office = $derived(can(role, 'job.view_any'));
  const canEdit = $derived(job !== null && can(role, 'job.edit') && !isFinal(job.status));
  const statusOptions = $derived(job && office ? allowedStatusChanges(job.status) : []);
  const canDelete = $derived(job !== null && can(role, 'job.delete'));
  const canManageCrew = $derived(job !== null && can(role, 'assignment.manage') && !isFinal(job.status));
  const backHref = $derived(office ? '/jobs' : '/my-jobs');

  const STATUS_BUTTONS = {
    in_progress: 'Start job (In Progress)',
    completed: 'Mark Completed'
  };

  // quiet: refresh in place without showing Loading (used after a change)
  async function loadJob({ quiet = false } = {}) {
    if (!quiet) state = 'loading';

    const me = await requireUser();
    if (!me) return; // being sent to Login
    role = me.profile.role;

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

      // Missing, or hidden by Row Level Security (not on this crew): both look the same
      if (!data) {
        state = 'notfound';
        return;
      }

      // The crew, with each person's name and role from profiles
      const { data: rows, error: crewLoadError } = await supabase
        .from('assignments')
        .select('id, user_id, profiles(name, role, is_active)')
        .eq('job_id', data.id);
      if (crewLoadError) throw crewLoadError;

      const crewList = rows
        .map((r) => ({
          id: r.id,
          userId: r.user_id,
          name: r.profiles?.name ?? 'Unknown',
          role: r.profiles?.role,
          isActive: r.profiles?.is_active ?? true
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // People who could still be added (office roles only, and not on final jobs)
      let people = [];
      if (can(role, 'assignment.manage') && !isFinal(data.status)) {
        const { data: profiles, error: peopleError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('is_active', true)
          .in('role', ['field_worker', 'supervisor'])
          .order('name');
        if (peopleError) throw peopleError;
        const onJob = new Set(crewList.map((c) => c.userId));
        people = profiles.filter((p) => !onJob.has(p.id));
      }

      job = data;
      crew = crewList;
      eligible = people;
      state = 'loaded';
    } catch (error) {
      console.error('Could not load job:', error);
      state = 'error';
    }
  }

  /** Ask the database to change the status. Returns an error message, or null if it worked. */
  async function changeStatus(status) {
    statusError = '';
    changing = true;
    const { error } = await supabase.rpc('set_job_status', { p_job_id: job.id, p_status: status });
    changing = false;

    if (error) {
      console.error('Status update failed:', error);
      statusError =
        error.code === 'PT403' ? 'You do not have permission to change this job.'
        : error.code === 'PT409' ? 'That status change is not allowed.'
        : 'Could not update the job. Try again.';
      return statusError;
    }

    await loadJob({ quiet: true }); // show what the database actually stored
    return null;
  }

  /** Delete the job. Returns an error message, or nothing if it worked (then goes to the list). */
  async function deleteJob() {
    const { data, error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', job.id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Job delete failed:', error);
      return 'Could not delete the job. Try again.';
    }
    if (!data) return 'The job was not found or you no longer have permission to delete it.';

    location.assign('/jobs');
  }

  /** Turn a crew error from the database into a message. */
  function crewMessage(error) {
    console.error('Crew change failed:', error);
    if (error.code === 'PT403') return 'You do not have permission to change this crew.';
    if (error.code === 'PT400' || error.code === 'PT409') return `${error.message}.`; // the database's own wording
    return 'Could not update the crew. Try again.';
  }

  /** Used by the Assign dialog. Returns an error message, or null if it worked. */
  async function assignWorkers(userIds) {
    const { error } = await supabase.rpc('assign_workers', { p_job_id: job.id, p_user_ids: userIds });
    if (error) return crewMessage(error);
    await loadJob({ quiet: true }); // new count, and maybe Open -> Staffed
    return null;
  }

  async function removeWorker(assignmentId) {
    crewError = '';
    changing = true;
    const { error } = await supabase.rpc('remove_assignment', { p_assignment_id: assignmentId });
    changing = false;
    if (error) {
      crewError = crewMessage(error);
      return;
    }
    await loadJob({ quiet: true }); // new count, and maybe Staffed -> Open
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
  <ErrorMessage message="Could not load this job." onretry={() => loadJob()} />
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

    {#if canEdit || statusOptions.length || canDelete}
      <div class="actions">
        {#if canEdit}
          <a class="btn" href={`/jobs/edit?id=${job.id}`}>Edit</a>
        {/if}

        {#each statusOptions.filter((s) => s !== 'cancelled') as option (option)}
          <button class="btn" disabled={changing} onclick={() => changeStatus(option)}>
            {STATUS_BUTTONS[option]}
          </button>
        {/each}

        {#if statusOptions.includes('cancelled')}
          <button class="btn secondary" disabled={changing} onclick={() => cancelDialog.show()}>Cancel job</button>
        {/if}

        {#if canDelete}
          <button class="btn danger" disabled={changing} onclick={() => deleteDialog.show()}>Delete</button>
        {/if}
      </div>
    {/if}

    {#if statusError}<p class="error" role="alert">{statusError}</p>{/if}
  </section>

  <section class="card crew">
    <div class="crew-head">
      <h2>Crew ({crew.length} of {job.workers_needed})</h2>
      {#if canManageCrew}
        <button class="btn" onclick={() => assignDialog.show()}>+ Assign</button>
      {/if}
    </div>

    {#if crewError}<p class="error" role="alert">{crewError}</p>{/if}

    {#if crew.length === 0}
      <p class="empty">No one assigned yet</p>
    {:else}
      <ul>
        {#each crew as member (member.id)}
          <li>
            <span>
              {member.name}{#if !member.isActive} (inactive){/if}
              <small>{ROLE_LABELS[member.role] ?? ''}</small>
            </span>
            {#if canManageCrew}
              <button class="btn secondary" disabled={changing} aria-label="Remove {member.name}"
                onclick={() => removeWorker(member.id)}>Remove</button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <ConfirmDialog
    bind:this={cancelDialog}
    title="Cancel this job?"
    message="The job stays on record marked Cancelled, but it can't be reopened."
    confirmLabel="Cancel job"
    onconfirm={() => changeStatus('cancelled')}
  />

  <ConfirmDialog
    bind:this={deleteDialog}
    title="Delete this job?"
    message="This permanently removes the job and its crew. This cannot be undone."
    confirmLabel="Delete job"
    onconfirm={deleteJob}
  />

  {#if canManageCrew}
    <AssignDialog bind:this={assignDialog} {eligible} onassign={assignWorkers} />
  {/if}
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
  .error { margin-top: 12px; }

  .crew-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .crew h2 { margin: 0; font-size: 18px; }
  .crew ul { list-style: none; margin: 12px 0 0; padding: 0; }
  .crew li { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; border-top: 1px solid #e3e3e0; }
  .crew small { display: block; color: #666; }
  .empty { color: #666; }

  @media (min-width: 600px) {
    dl { grid-template-columns: 160px 1fr; }
    dt { margin-top: 0; }
  }
</style>