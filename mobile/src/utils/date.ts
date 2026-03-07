/**
 * Returns today's date string in YYYY-MM-DD format (local time).
 */
export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the Monday of the week containing dateStr.
 */
export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/**
 * Shifts a date string by the given number of days.
 */
export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Returns a localized date string (e.g. "Mo., 3. März 2025").
 */
export function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Returns how many calendar days past the deadline the given date string is.
 * Returns 0 if not yet overdue.
 */
export function getDaysOverdue(deadline: string): number {
  const deadlineMs = new Date(deadline + 'T23:59:59').getTime();
  const nowMs = Date.now();
  if (nowMs <= deadlineMs) return 0;
  return Math.floor((nowMs - deadlineMs) / 86400000);
}
