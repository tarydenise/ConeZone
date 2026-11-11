import { describe, it, expect } from 'vitest';
import { isOvernight, getJobMoments, hasJobEnded, formatTime, formatDate } from './time.js';

const sameDay = { date: '2026-11-20', start_time: '07:00:00', end_time: '15:00:00'};
const overnight = { date: '2026-11-30', start_time: '23:00:00', end_time: '00:30:00'};

describe('isOvernight', () => {
    it('is true when the end is earlier than the start', () => {
        expect(isOvernight('21:00:00', '05:00:00')).toBe(true);
    });
    it('is false for a same-day job', () => {
        expect(isOvernight('07:00:00', '15:00:00')).toBe(false);
    });
    it('works when a form time has no seconds', () => {
        expect(isOvernight('21:00', '05:00:00')).toBe(true);
    });
});

describe('getJobMoments', () => {
    it('keeps a same-day job on the same day', () => {
        expect(getJobMoments(sameDay).end.getDate()).toBe(20);
    });
    it('moves an overnight end into the next month', () => {
        const { end } = getJobMoments(overnight);
        expect(end.getMonth()).toBe(11); // December (months count from 0)
        expect(end.getDate()).toBe(1);
    });
});

describe('hasJobEnded', () => {
    it('is false one minute before the end', () => {
        expect(hasJobEnded(sameDay, new Date(2026, 10, 20, 14, 59))).toBe(false);
    });
    it('is true at the moment', () => {
        expect(hasJobEnded(sameDay, new Date(2026, 10, 20, 15, 0))).toBe(true);
    });
    it('keeps an overnight job running just after midnight', () => {
        expect(hasJobEnded(overnight, new Date(2026, 11, 1, 0, 15))).toBe(false);
    });
});

describe('formatting', () => {
    it('formats times', () => {
        expect(formatTime('17:00:00')).toBe('5:00 PM');
        expect(formatTime('00:30:00')).toBe('12:30 AM');
    });
    it('formats dates', () => {
        expect(formatDate('2026-11-20')).toBe('Fri, Nov 20, 2026');
    });
});