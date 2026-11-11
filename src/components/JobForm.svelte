<script>
  import { validateJob } from '../lib/jobValidation.js';
  import { isOvernight } from '../lib/time.js';

  let { initial, onSave, submitLabel = 'Save job', cancelHref = '/jobs' } = $props();

  // A copy of the starting values that the inputs can change
  let values = $state({ ...initial });
  let errors = $state({});
  let formError = $state('');
  let submitting = $state(false);

  const overnight = $derived(
    Boolean(values.start_time && values.end_time && isOvernight(values.start_time, values.end_time))
  );

  async function handleSubmit(event) {
    event.preventDefault();
    formError = '';
    errors = validateJob(values);
    if (Object.keys(errors).length) return;

    submitting = true;
    try {
      const result = await onSave({ ...values });
      if (result?.error) formError = result.error;
    } catch (error) {
      console.error('Could not save job:', error);
      formError = 'Could not save the job. Try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<form class="card" onsubmit={handleSubmit} novalidate>
  {#if formError}<p class="error" role="alert">{formError}</p>{/if}

  <label>Title
    <input bind:value={values.title} maxlength="120"
      aria-invalid={!!errors.title} aria-describedby="title-error" />
    {#if errors.title}<span id="title-error" class="error">{errors.title}</span>{/if}
  </label>

  <label>Client name (optional)
    <input bind:value={values.client_name} maxlength="120"
      aria-invalid={!!errors.client_name} aria-describedby="client-error" />
    {#if errors.client_name}<span id="client-error" class="error">{errors.client_name}</span>{/if}
  </label>

  <label>Address
    <input bind:value={values.address} maxlength="200"
      aria-invalid={!!errors.address} aria-describedby="address-error" />
    {#if errors.address}<span id="address-error" class="error">{errors.address}</span>{/if}
  </label>

  <label>Date
    <input type="date" bind:value={values.date}
      aria-invalid={!!errors.date} aria-describedby="date-error" />
    {#if errors.date}<span id="date-error" class="error">{errors.date}</span>{/if}
  </label>

  <div class="row">
    <label>Start time
      <input type="time" bind:value={values.start_time}
        aria-invalid={!!errors.start_time} aria-describedby="start-error" />
      {#if errors.start_time}<span id="start-error" class="error">{errors.start_time}</span>{/if}
    </label>
    <label>End time
      <input type="time" bind:value={values.end_time}
        aria-invalid={!!errors.end_time} aria-describedby="end-error" />
      {#if errors.end_time}<span id="end-error" class="error">{errors.end_time}</span>{/if}
    </label>
  </div>
  {#if overnight}<p class="hint">Overnight: this job ends the next day.</p>{/if}

  <label>Workers needed
    <input type="number" min="1" max="50" bind:value={values.workers_needed}
      aria-invalid={!!errors.workers_needed} aria-describedby="workers-error" />
    {#if errors.workers_needed}<span id="workers-error" class="error">{errors.workers_needed}</span>{/if}
  </label>

  <label>Notes (optional)
    <textarea rows="4" bind:value={values.notes}
      aria-invalid={!!errors.notes} aria-describedby="notes-error"></textarea>
    {#if errors.notes}<span id="notes-error" class="error">{errors.notes}</span>{/if}
  </label>

  <div class="actions">
    <button class="btn" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
    <a class="btn secondary" href={cancelHref}>Cancel</a>
  </div>
</form>

<style>
  form { display: flex; flex-direction: column; gap: 16px; max-width: 560px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; }
  input, textarea { min-height: 44px; padding: 0 12px; border: 1.5px solid var(--line); border-radius: 6px; font: inherit; font-size: 14px; font-weight: 400; box-sizing: border-box; }
  textarea { padding: 10px 12px; }
  [aria-invalid='true'] { border-color: #a40000; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hint { margin: -8px 0 0; font-size: 13px; color: #555; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>