<script>
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';

  let { values, errors = {}, submitLabel = 'Save', cancelHref = '/jobs' } = $props();
  let submitting = $state(false);
</script>

<form
  method="POST"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      await update();
      submitting = false;
    };
  }}
>
  {#if errors.form}<p class="error" role="alert">{errors.form}</p>{/if}

  <label>Title
    <input name="title" value={values.title} aria-invalid={!!errors.title} />
    {#if errors.title}<span class="error">{errors.title}</span>{/if}
  </label>

  <label>Client name (optional)
    <input name="clientName" value={values.clientName} />
    {#if errors.clientName}<span class="error">{errors.clientName}</span>{/if}
  </label>

  <label>Address
    <input name="address" value={values.address} aria-invalid={!!errors.address} />
    {#if errors.address}<span class="error">{errors.address}</span>{/if}
  </label>

  <label>Date
    <input name="date" type="date" value={values.date} aria-invalid={!!errors.date} />
    {#if errors.date}<span class="error">{errors.date}</span>{/if}
  </label>

  <div class="row">
    <label>Start time
      <input name="startTime" type="time" value={values.startTime} aria-invalid={!!errors.startTime} />
      {#if errors.startTime}<span class="error">{errors.startTime}</span>{/if}
    </label>
    <label>End time
      <input name="endTime" type="time" value={values.endTime} aria-invalid={!!errors.endTime} />
      {#if errors.endTime}<span class="error">{errors.endTime}</span>{/if}
    </label>
  </div>
  <p class="hint">An end time earlier than the start time means the job ends the next day.</p>

  <label>Workers needed
    <input name="workersNeeded" type="number" min="1" max="50" value={values.workersNeeded} aria-invalid={!!errors.workersNeeded} />
    {#if errors.workersNeeded}<span class="error">{errors.workersNeeded}</span>{/if}
  </label>

  <label>Notes (optional)
    <textarea name="notes" rows="4">{values.notes}</textarea>
    {#if errors.notes}<span class="error">{errors.notes}</span>{/if}
  </label>

  <div class="actions">
    <button class="btn" disabled={submitting}>{submitting ? 'Saving...' : submitLabel}</button>
    <a class="btn secondary" href={resolve(cancelHref)}>Cancel</a>
  </div>
</form>

<style>
  form { display: flex; flex-direction: column; gap: 16px; max-width: 560px; background: #fff; border: 1.5px solid var(--line); border-radius: 6px; padding: 20px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700; }
  input, textarea { padding: 0 12px; min-height: 44px; border: 1.5px solid var(--line); border-radius: 6px; font: inherit; font-size: 14px; font-weight: 400; }
  textarea { padding: 10px 12px; }
  input[aria-invalid='true'] { border-color: #a40000; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hint { margin: -8px 0 0; font-size: 12px; color: #666; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; }
</style>