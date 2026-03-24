/**
 * Format a Date as `YYYY-MM-DD` (e.g. "2026-03-24").
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Clamp a day value so it doesn't exceed the last day of the target month.
 * Returns a new Date for (year, month, clampedDay).
 */
export const clampDayToMonth = (day: number, year: number, month: number): Date => {
  const maxDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, maxDay));
};
