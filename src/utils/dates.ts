// Due dates are calendar days ("2026-10-03"), compared in the user's local time.

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (not UTC — toISOString() would shift near midnight). */
export const toDateOnly = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayDateOnly = (): string => toDateOnly(new Date());

const addDays = (dateOnly: string, days: number): string => {
  const [y, m, d] = dateOnly.split('-').map(Number);
  return toDateOnly(new Date(y, m - 1, d + days));
};

export type DueStatus = 'overdue' | 'today' | 'tomorrow' | 'upcoming';

export const getDueStatus = (dueDate: string, today = todayDateOnly()): DueStatus => {
  if (dueDate < today) return 'overdue';
  if (dueDate === today) return 'today';
  if (dueDate === addDays(today, 1)) return 'tomorrow';
  return 'upcoming';
};

/** "Oct 5" this year, "Oct 5, 2027" otherwise. */
export const formatDueDate = (dueDate: string): string => {
  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(y !== new Date().getFullYear() && { year: 'numeric' }),
  });
};
