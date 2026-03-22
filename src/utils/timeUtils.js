/**
 * Shared time-formatting utilities.
 * Pure functions — no side effects.
 */

/** Format seconds → "HH:MM:SS" */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/** Format seconds → human-readable short form, e.g. "2h 4m" or "38m 12s" */
export function formatDurationShort(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '0s';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Format an ISO date string → "Mon, Jan 6" */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO date string → "14:32" */
export function formatTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Return today's date as "YYYY-MM-DD" in local time */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Return "YYYY-MM-DD" from an ISO string */
export function isoToDateKey(isoString) {
  return isoString ? isoString.slice(0, 10) : '';
}

/** Sum seconds from an array of session objects */
export function sumSeconds(sessions) {
  return sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
}

/** Group sessions by date key "YYYY-MM-DD" */
export function groupByDate(sessions) {
  return sessions.reduce((map, s) => {
    const key = isoToDateKey(s.startedAt);
    if (!map[key]) map[key] = [];
    map[key].push(s);
    return map;
  }, {});
}

/** Generate a lightweight unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
