import { describe, it, expect } from 'vitest';
import { toMinutes, isOvernight, jobWindow, formatTime, hasEnded } from './time.js';

describe('time helper', () => {
  it('converts times to minutes', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('09:30:00')).toBe(570);
  });
  it('detects overnight jobs', () => {
    expect(isOvernight('21:00', '05:00')).toBe(true);
    expect(isOvernight('07:00', '15:00')).toBe(false);
  });
  it('puts the end of an overnight job on the next day', () => {
    const w = jobWindow('2026-10-30', '21:00', '05:00');
    expect(w.end.getDate()).toBe(31);
  });
  it('rolls over the month for overnight jobs', () => {
    const w = jobWindow('2026-10-31', '21:00', '05:00');
    expect(w.end.getMonth()).toBe(10);
    expect(w.end.getDate()).toBe(1);
  });
  it('keeps same-day jobs on the same day', () => {
    const w = jobWindow('2026-10-30', '07:00', '15:00');
    expect(w.end.getDate()).toBe(30);
  });
  it('formats times', () => {
    expect(formatTime('17:00:00')).toBe('5:00 PM');
    expect(formatTime('00:30')).toBe('12:30 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });
});

describe('hasEnded', () => {
  it('overnight job that started yesterday is still running at 1 AM', () => {
    expect(hasEnded('2026-10-30', '21:00', '05:00', new Date(2026, 9, 31, 1, 0))).toBe(false);
  });
  it('overnight job has ended at 5 AM', () => {
    expect(hasEnded('2026-10-30', '21:00', '05:00', new Date(2026, 9, 31, 5, 0))).toBe(true);
  });
  it('same-day job ends at its end time', () => {
    expect(hasEnded('2026-10-30', '07:00', '15:00', new Date(2026, 9, 30, 14, 59))).toBe(false);
    expect(hasEnded('2026-10-30', '07:00', '15:00', new Date(2026, 9, 30, 15, 1))).toBe(true);
  });
});