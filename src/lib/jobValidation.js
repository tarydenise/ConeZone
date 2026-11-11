/** Today's date as "YYYY-MM-DD" in local time (toISOString would use UTC). */
export function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Blank values for the New job form. */
export function emptyJob() {
  return {
    title: '',
    client_name: '',
    address: '',
    date: todayLocal(),
    start_time: '',
    end_time: '',
    workers_needed: 1,
    notes: ''
  };
}

/** Returns a message per bad field. An empty object means the job is valid. */
export function validateJob(values) {
  const errors = {};
  const title = String(values.title ?? '').trim();
  const address = String(values.address ?? '').trim();
  const workers = Number(values.workers_needed);

  if (title.length < 1 || title.length > 120) {
    errors.title = 'Enter a title (1 to 120 characters).';
  }
  if (String(values.client_name ?? '').trim().length > 120) {
    errors.client_name = 'Client name must be 120 characters or fewer.';
  }
  if (address.length < 1 || address.length > 200) {
    errors.address = 'Enter an address (1 to 200 characters).';
  }
  if (!values.date) errors.date = 'Choose a date.';
  if (!values.start_time) errors.start_time = 'Choose a start time.';
  if (!values.end_time) errors.end_time = 'Choose an end time.';

  // Compare hours and minutes only, so "07:00" and "07:00:00" count as equal.
  // An earlier end time is fine: that's an overnight job.
  if (values.start_time && values.end_time &&
      values.start_time.slice(0, 5) === values.end_time.slice(0, 5)) {
    errors.end_time = 'End time must be different from the start time.';
  }
  if (!Number.isInteger(workers) || workers < 1 || workers > 50) {
    errors.workers_needed = 'Enter a whole number from 1 to 50.';
  }
  if (String(values.notes ?? '').length > 2000) {
    errors.notes = 'Notes must be 2000 characters or fewer.';
  }

  return errors;
}

/** Clean form values into a row for the jobs table (blank optional fields become null). */
export function toJobRow(values) {
  return {
    title: values.title.trim(),
    client_name: values.client_name.trim() || null,
    address: values.address.trim(),
    date: values.date,
    start_time: values.start_time,
    end_time: values.end_time,
    workers_needed: Number(values.workers_needed),
    notes: values.notes.trim() || null
  };
}

/** Turn a Supabase error into a message the user can act on. */
export function friendlyJobError(error) {
  console.error('Job save failed:', error);
  if (error.code === 'PT409') return `${error.message}.`; // rule messages written in the database
  if (error.code === '23514') return 'Some job details are invalid. Review the fields and try again.';
  if (error.code === '42501') return 'You do not have permission to do this.';
  return 'Could not save the job. Check your connection and try again.';
}

/** Turn a jobs row into values for the form ("07:00:00" -> "07:00", null -> ""). */
export function toFormValues(job) {
  return {
    title: job.title,
    client_name: job.client_name ?? '',
    address: job.address,
    date: job.date,
    start_time: job.start_time.slice(0, 5),
    end_time: job.end_time.slice(0, 5),
    workers_needed: job.workers_needed,
    notes: job.notes ?? ''
  };
}