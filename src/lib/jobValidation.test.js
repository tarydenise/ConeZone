import { describe, it, expect } from 'vitest';
import { validateJob, toJobRow } from './jobValidation.js';

const good = {
  title: 'Lane closure', client_name: '', address: '123 Main St', date: '2026-11-20',
  start_time: '07:00', end_time: '15:00', workers_needed: 2, notes: ''
};

describe('validateJob', () => {
  it('accepts a valid job', () => expect(validateJob(good)).toEqual({}));
  it('accepts an overnight job', () => {
    expect(validateJob({ ...good, start_time: '21:00', end_time: '05:00' })).toEqual({});
  });
  it('rejects a missing title', () => expect(validateJob({ ...good, title: '' }).title).toBeDefined());
  it('rejects a title of only spaces', () => expect(validateJob({ ...good, title: '   ' }).title).toBeDefined());
  it('rejects a 121-character title', () => {
    expect(validateJob({ ...good, title: 'a'.repeat(121) }).title).toBeDefined();
  });
  it('rejects equal start and end times', () => {
    expect(validateJob({ ...good, end_time: '07:00' }).end_time).toBeDefined();
  });
  it('treats 07:00 and 07:00:00 as equal', () => {
    expect(validateJob({ ...good, start_time: '07:00:00', end_time: '07:00' }).end_time).toBeDefined();
  });
  it('accepts 1 and 50 workers', () => {
    expect(validateJob({ ...good, workers_needed: 1 })).toEqual({});
    expect(validateJob({ ...good, workers_needed: 50 })).toEqual({});
  });
  it('rejects 0, 51, and 2.5 workers', () => {
    expect(validateJob({ ...good, workers_needed: 0 }).workers_needed).toBeDefined();
    expect(validateJob({ ...good, workers_needed: 51 }).workers_needed).toBeDefined();
    expect(validateJob({ ...good, workers_needed: 2.5 }).workers_needed).toBeDefined();
  });
  it('rejects notes over 2000 characters', () => {
    expect(validateJob({ ...good, notes: 'a'.repeat(2001) }).notes).toBeDefined();
  });
});

describe('toJobRow', () => {
  it('trims text and turns blank optional fields into null', () => {
    const row = toJobRow({ ...good, title: '  Lane closure  ', client_name: '  ', notes: '' });
    expect(row.title).toBe('Lane closure');
    expect(row.client_name).toBeNull();
    expect(row.notes).toBeNull();
  });
});