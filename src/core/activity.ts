import type { DayActivity } from "./types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Formats a timestamp as a 'YYYY-MM-DD' key in the *local* timezone.
 * Built from the local date parts rather than toISOString(), which would shift
 * the day boundary to UTC and mis-attribute late-evening study sessions.
 */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Midnight (local) of the day containing `timestamp`. */
function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Shifts by whole days using local midnights, so a day is never lost or repeated
 * across a daylight-saving transition (where a "day" is 23 or 25 hours long).
 */
function addDays(timestamp: number, days: number): number {
  return startOfDay(startOfDay(timestamp) + days * DAY_MS + DAY_MS / 2);
}

/**
 * Number of consecutive days with activity, counting back from today.
 * Yesterday still counts as an active streak (the day isn't over yet), but a gap
 * of two or more days breaks it.
 */
export function currentStreak(activity: Record<string, DayActivity>, now: number): number {
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));

  let cursor: number;
  if (activity[today]) cursor = now;
  else if (activity[yesterday]) cursor = addDays(now, -1);
  else return 0;

  let streak = 0;
  while (activity[dayKey(cursor)]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Local midday timestamp for a 'YYYY-MM-DD' key — midday keeps DST shifts from changing the date. */
function parseDayKey(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year!, month! - 1, day!, 12).getTime();
}

/** Longest run of consecutive active days ever recorded. */
export function longestStreak(activity: Record<string, DayActivity>): number {
  const keys = Object.keys(activity).sort();
  if (keys.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < keys.length; i++) {
    const dayBefore = dayKey(addDays(parseDayKey(keys[i]!), -1));
    run = dayBefore === keys[i - 1] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

export interface HeatmapCell {
  key: string;
  answered: number;
  /** 0 = no activity, 1–4 = increasing intensity buckets. */
  level: number;
}

/**
 * Builds `days` cells ending today (oldest first), ready to lay out as a grid.
 * Intensity is bucketed against the busiest day in the window so the scale stays
 * meaningful whether someone answers 5 or 200 questions a day.
 */
export function buildHeatmap(
  activity: Record<string, DayActivity>,
  now: number,
  days = 84,
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const key = dayKey(addDays(now, -offset));
    cells.push({ key, answered: activity[key]?.answered ?? 0, level: 0 });
  }

  const busiest = Math.max(...cells.map((c) => c.answered), 0);
  if (busiest === 0) return cells;

  for (const cell of cells) {
    if (cell.answered === 0) continue;
    cell.level = Math.min(4, Math.ceil((cell.answered / busiest) * 4));
  }
  return cells;
}

export interface ActivityTotals {
  activeDays: number;
  answered: number;
  correct: number;
  accuracyPercent: number | null;
}

export function activityTotals(activity: Record<string, DayActivity>): ActivityTotals {
  let answered = 0;
  let correct = 0;
  for (const day of Object.values(activity)) {
    answered += day.answered;
    correct += day.correct;
  }
  return {
    activeDays: Object.keys(activity).length,
    answered,
    correct,
    accuracyPercent: answered === 0 ? null : Math.round((correct / answered) * 100),
  };
}
