/** "09:30" or "09:30:00" -> minutes since midnight */
export function toMinutes(t) {
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + m;
}

/** An end time earlier than the start time means the job ends the next day. */
export function isOvernight(start, end) {
  return toMinutes(end) < toMinutes(start);
}

/** Real start and end moments. The end is on the next day for overnight jobs. */
export function jobWindow(dateStr, start, end) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  return {
    start: new Date(y, mo - 1, d, 0, startMin),
    end: new Date(y, mo - 1, d + (endMin < startMin ? 1 : 0), 0, endMin)
  };
}

/** "17:00:00" -> "5:00 PM" */
export function formatTime(t) {
  const mins = toMinutes(t);
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h24 % 12 || 12}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
}

/** "2026-10-30" -> "Fri, Oct 30, 2026" */
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

/** True once the job's end moment has passed (overnight jobs end on the next day). */
export function hasEnded(dateStr, start, end, now = new Date()) {
  return jobWindow(dateStr, start, end).end <= now;
}