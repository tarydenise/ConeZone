// Shared time helper. Supabase sends dates as "YYYY-MM-DD" and times as "HH:MM:SS".
// Forms send times as "HH:MM". Everything here works with both.

/** "07:30" or "07:30:00" -> minutes since midnight */
function toMinutes(time) {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
}

/** Build a local Date from a date string and a time string (never new Date("YYYY-MM-DD")). */
export function toLocalDateTime(date, time) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute, second = 0] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
}

/** An end time earlier than the start time means the job ends the next day. */
export function isOvernight(startTime, endTime) {
    return toMinutes(endTime) < toMinutes(startTime);
}

/** The real start and end moments. Overnight jobs end on the next day. */
export function getJobMoments(job) {
    const start = toLocalDateTime(job.date, job.start_time);
    const end = toLocalDateTime(job.date, job.end_time);
    if (isOvernight(job.start_time, job.end_time)) {
        end.setDate(end.getDate() + 1); // also handles month and year rollover
    }
    return { start, end };
}

/** True once the job's end moment has passed. 'now' can be passed in for testing. */
export function hasJobEnded(job, now = new Date()) {
    return now >= getJobMoments(job).end;
}

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});

/** "17:00:00" -> "5:00 PM" */
export function formatTime(time) {
    // Newer browsers use a narrow no-break space before AM/PM. Swap it for a normal space.
    return timeFormat.format(toLocalDateTime('2000-01-01', time)).replace(/\u202f/g, ' ');
}

/** "2026-11-20" -> "Fri, Nov 20, 2026" */
export function formatDate(date) {
    return dateFormat.format(toLocalDateTime(date, '00:00'));
}