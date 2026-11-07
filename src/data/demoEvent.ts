// Fixed one calendar month after the owner's request on 8 November 2026.
// Never calculate this from a visitor's clock: revisiting must not postpone it.
export const demoEventDate = "2026-12-08";

export function eventTimestamp(date: string, time: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s+IST)?$/.exec(time);
  if (!match) return NaN;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return NaN;
  const hours = hour % 12 + (match[3] === "PM" ? 12 : 0);
  return Date.parse(`${date}T${String(hours).padStart(2, "0")}:${match[2]}:00+05:30`);
}

export function remainingTime(target: number, now: number) {
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    ended: seconds === 0,
  };
}
