export type RecurrenceType = "daily" | "weekly" | "monthly" | "custom";

export interface RecurrencePattern {
  type: RecurrenceType;
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, ... 6=Sat (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly)
  endDate?: string; // ISO date when recurrence stops
  skipDates?: string[]; // ISO dates to skip
}

export function getNextOccurrence(
  pattern: RecurrencePattern,
  fromDate: Date
): Date | null {
  const next = new Date(fromDate);

  if (pattern.endDate && next >= new Date(pattern.endDate)) {
    return null;
  }

  switch (pattern.type) {
    case "daily":
      next.setDate(next.getDate() + (pattern.interval || 1));
      break;

    case "weekly": {
      const interval = pattern.interval || 1;
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          const daysUntilFirst = 7 * interval - currentDay + sortedDays[0];
          next.setDate(next.getDate() + daysUntilFirst);
        }
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    }

    case "monthly": {
      const interval = pattern.interval || 1;
      next.setMonth(next.getMonth() + interval);
      if (pattern.dayOfMonth) {
        const maxDay = new Date(
          next.getFullYear(),
          next.getMonth() + 1,
          0
        ).getDate();
        next.setDate(Math.min(pattern.dayOfMonth, maxDay));
      }
      break;
    }

    case "custom":
      next.setDate(next.getDate() + (pattern.interval || 1));
      break;
  }

  if (pattern.endDate && next > new Date(pattern.endDate)) {
    return null;
  }

  if (pattern.skipDates?.includes(next.toISOString().split("T")[0])) {
    return getNextOccurrence(pattern, next);
  }

  return next;
}

export function isValidRecurrence(pattern: unknown): pattern is RecurrencePattern {
  if (!pattern || typeof pattern !== "object") return false;
  const p = pattern as Record<string, unknown>;
  return (
    typeof p.type === "string" &&
    ["daily", "weekly", "monthly", "custom"].includes(p.type) &&
    (p.interval === undefined || typeof p.interval === "number")
  );
}
