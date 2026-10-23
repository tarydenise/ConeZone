import { describe, it, expect } from 'vitest';
import { validateJob } from './jobForm.js';

const good = {
  title: 'Lane closure', clientName: '', address: '123 Main St', date: '2026-10-30',
  startTime: '07:00', endTime: '15:00', workersNeeded: '2', notes: ''
};

describe('validateJob', () => {
  it('accepts a valid job', () => expect(validateJob(good)).toEqual({}));
  it('rejects a missing title', () => expect(validateJob({ ...good, title: '' }).title).toBeDefined());
  it('rejects a 121-character title', () => expect(validateJob({ ...good, title: 'a'.repeat(121) }).title).toBeDefined());
  it('rejects 0 workers', () => expect(validateJob({ ...good, workersNeeded: '0' }).workersNeeded).toBeDefined());
  it('rejects 51 workers', () => expect(validateJob({ ...good, workersNeeded: '51' }).workersNeeded).toBeDefined());
  it('rejects an end time equal to the start time', () => {
    expect(validateJob({ ...good, endTime: '07:00' }).endTime).toBeDefined();
  });
  it('accepts an overnight job', () => {
    expect(validateJob({ ...good, startTime: '21:00', endTime: '05:00' })).toEqual({});
  });
});