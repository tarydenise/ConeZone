import { toMinutes } from './time.js';

/** Read the job form fields as trimmed strings. */
export function readJobForm(data) {
  const get = (key) => String(data.get(key) ?? '').trim();
  return {
    title: get('title'),
    clientName: get('clientName'),
    address: get('address'),
    date: get('date'),
    startTime: get('startTime'),
    endTime: get('endTime'),
    workersNeeded: get('workersNeeded') || '1',
    notes: get('notes')
  };
}

/** Returns an object of messages by field. Empty object = valid. */
export function validateJob(v) {
  const errors = {};
  if (!v.title || v.title.length > 120) errors.title = 'Enter a title (up to 120 characters).';
  if (v.clientName.length > 120) errors.clientName = 'Client name can be up to 120 characters.';
  if (!v.address || v.address.length > 200) errors.address = 'Enter an address (up to 200 characters).';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(Date.parse(v.date))) errors.date = 'Choose a date.';
  if (!/^\d{2}:\d{2}$/.test(v.startTime)) errors.startTime = 'Choose a start time.';
  if (!/^\d{2}:\d{2}$/.test(v.endTime)) errors.endTime = 'Choose an end time.';
  if (!errors.startTime && !errors.endTime && toMinutes(v.startTime) === toMinutes(v.endTime)) {
    errors.endTime = 'End time must be different from the start time.';
  }
  const n = Number(v.workersNeeded);
  if (!Number.isInteger(n) || n < 1 || n > 50) errors.workersNeeded = 'Enter a whole number from 1 to 50.';
  if (v.notes.length > 2000) errors.notes = 'Notes can be up to 2000 characters.';
  return errors;
}