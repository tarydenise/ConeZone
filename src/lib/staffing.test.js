import { describe, it, expect } from 'vitest';
import { statusAfterStaffing, checkAssign } from './staffing.js';

describe('statusAfterStaffing', () => {
  it('open becomes staffed when full', () => expect(statusAfterStaffing('open', 2, 2)).toBe('staffed'));
  it('open stays open when not full', () => expect(statusAfterStaffing('open', 1, 2)).toBe('open'));
  it('staffed goes back to open', () => expect(statusAfterStaffing('staffed', 1, 2)).toBe('open'));
  it('staffed stays staffed when full', () => expect(statusAfterStaffing('staffed', 2, 2)).toBe('staffed'));
  it('in progress never changes', () => expect(statusAfterStaffing('in_progress', 2, 2)).toBe('in_progress'));
  it('completed never changes', () => expect(statusAfterStaffing('completed', 0, 2)).toBe('completed'));
  it('cancelled never changes', () => expect(statusAfterStaffing('cancelled', 2, 2)).toBe('cancelled'));
});

describe('checkAssign', () => {
  it('allows adding when there is room', () => {
    expect(checkAssign({ status: 'open', assigned: 1, needed: 2, adding: 1 })).toBeNull();
  });
  it('allows adding on an in-progress job', () => {
    expect(checkAssign({ status: 'in_progress', assigned: 1, needed: 2, adding: 1 })).toBeNull();
  });
  it('rejects a full job', () => {
    expect(checkAssign({ status: 'staffed', assigned: 2, needed: 2, adding: 1 })).toMatch(/fully staffed/);
  });
  it('rejects adding more people than spots', () => {
    expect(checkAssign({ status: 'open', assigned: 1, needed: 2, adding: 2 })).toMatch(/1 spot left/);
  });
  it('rejects completed and cancelled jobs', () => {
    expect(checkAssign({ status: 'completed', assigned: 0, needed: 2, adding: 1 })).toBeTruthy();
    expect(checkAssign({ status: 'cancelled', assigned: 0, needed: 2, adding: 1 })).toBeTruthy();
  });
});