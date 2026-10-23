import { describe, it, expect } from 'vitest';
import { checkStatusChange, isFinal } from './jobStatus.js';

const as = (role, from, to, isJobSupervisor = false) =>
  checkStatusChange({ role, isJobSupervisor, from, to });

describe('allowed changes for a dispatcher', () => {
  it('open -> in progress', () => expect(as('dispatcher', 'open', 'in_progress')).toBe('ok'));
  it('staffed -> in progress', () => expect(as('dispatcher', 'staffed', 'in_progress')).toBe('ok'));
  it('in progress -> completed', () => expect(as('dispatcher', 'in_progress', 'completed')).toBe('ok'));
  it('open -> cancelled', () => expect(as('admin', 'open', 'cancelled')).toBe('ok'));
  it('in progress -> cancelled', () => expect(as('dispatcher', 'in_progress', 'cancelled')).toBe('ok'));
});

describe('changes that are not allowed', () => {
  it('open -> completed directly', () => expect(as('dispatcher', 'open', 'completed')).toBe('invalid'));
  it('anything -> staffed by hand', () => expect(as('dispatcher', 'open', 'staffed')).toBe('invalid'));
  it('anything -> open by hand', () => expect(as('dispatcher', 'staffed', 'open')).toBe('invalid'));
  it('completed is final', () => {
    for (const to of ['in_progress', 'completed', 'cancelled']) {
      expect(as('admin', 'completed', to)).toBe('invalid');
    }
  });
  it('cancelled is final', () => {
    for (const to of ['in_progress', 'completed', 'cancelled']) {
      expect(as('admin', 'cancelled', to)).toBe('invalid');
    }
  });
});

describe('supervisors', () => {
  it('may complete their own in-progress job', () => expect(as('supervisor', 'in_progress', 'completed', true)).toBe('ok'));
  it('may start their own job', () => expect(as('supervisor', 'open', 'in_progress', true)).toBe('ok'));
  it('may not cancel', () => expect(as('supervisor', 'in_progress', 'cancelled', true)).toBe('forbidden'));
  it('may not change a job they do not supervise', () => expect(as('supervisor', 'in_progress', 'completed', false)).toBe('forbidden'));
  it('field workers may not change status', () => expect(as('field_worker', 'open', 'in_progress', true)).toBe('forbidden'));
});

describe('isFinal', () => {
  it('is true only for completed and cancelled', () => {
    expect(isFinal('completed')).toBe(true);
    expect(isFinal('cancelled')).toBe(true);
    expect(isFinal('open')).toBe(false);
    expect(isFinal('in_progress')).toBe(false);
  });
});