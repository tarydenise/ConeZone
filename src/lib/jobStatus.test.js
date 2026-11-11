import { describe, it, expect } from 'vitest';
import { allowedStatusChanges, isFinal } from './jobStatus.js';

describe('allowedStatusChanges', () => {
  it('open can start or be cancelled', () => {
    expect(allowedStatusChanges('open')).toEqual(['in_progress', 'cancelled']);
  });
  it('staffed can start or be cancelled', () => {
    expect(allowedStatusChanges('staffed')).toEqual(['in_progress', 'cancelled']);
  });
  it('in progress can be completed or cancelled', () => {
    expect(allowedStatusChanges('in_progress')).toEqual(['completed', 'cancelled']);
  });
  it('final jobs cannot change', () => {
    expect(allowedStatusChanges('completed')).toEqual([]);
    expect(allowedStatusChanges('cancelled')).toEqual([]);
  });
});

describe('isFinal', () => {
  it('is true only for completed and cancelled', () => {
    expect(isFinal('completed')).toBe(true);
    expect(isFinal('cancelled')).toBe(true);
    expect(isFinal('open')).toBe(false);
    expect(isFinal('in_progress')).toBe(false);
  });
});