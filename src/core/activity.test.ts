import { describe, expect, it } from "vitest";
import { activityTotals, buildHeatmap, currentStreak, dayKey, longestStreak } from "./activity.ts";
import type { DayActivity } from "./types.ts";

/** Local midday on a given date, so tests never straddle a UTC day boundary. */
function at(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day, 12).getTime();
}

function days(...keys: string[]): Record<string, DayActivity> {
  return Object.fromEntries(keys.map((key) => [key, { answered: 5, correct: 3 }]));
}

describe("dayKey", () => {
  it("formats a timestamp as a local YYYY-MM-DD key", () => {
    expect(dayKey(at(2026, 3, 7))).toBe("2026-03-07");
  });

  it("pads single-digit months and days", () => {
    expect(dayKey(at(2026, 1, 1))).toBe("2026-01-01");
  });

  it("keeps late-evening activity on the local day, not the UTC one", () => {
    const lateEvening = new Date(2026, 2, 7, 23, 30).getTime();
    expect(dayKey(lateEvening)).toBe("2026-03-07");
  });
});

describe("currentStreak", () => {
  const now = at(2026, 3, 7);

  it("is 0 with no activity at all", () => {
    expect(currentStreak({}, now)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const activity = days("2026-03-05", "2026-03-06", "2026-03-07");
    expect(currentStreak(activity, now)).toBe(3);
  });

  it("still counts a streak that ends yesterday, since today is not over", () => {
    const activity = days("2026-03-05", "2026-03-06");
    expect(currentStreak(activity, now)).toBe(2);
  });

  it("breaks when the most recent activity is two days old", () => {
    const activity = days("2026-03-04", "2026-03-05");
    expect(currentStreak(activity, now)).toBe(0);
  });

  it("stops at a gap rather than counting earlier runs", () => {
    const activity = days("2026-03-01", "2026-03-02", "2026-03-06", "2026-03-07");
    expect(currentStreak(activity, now)).toBe(2);
  });

  it("counts a run that spans a month boundary", () => {
    const activity = days("2026-02-27", "2026-02-28", "2026-03-01");
    expect(currentStreak(activity, at(2026, 3, 1))).toBe(3);
  });
});

describe("longestStreak", () => {
  it("is 0 with no activity", () => {
    expect(longestStreak({})).toBe(0);
  });

  it("finds the longest run even when it is not the most recent one", () => {
    const activity = days(
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-10",
      "2026-03-11",
    );
    expect(longestStreak(activity)).toBe(4);
  });

  it("counts a single isolated day as 1", () => {
    expect(longestStreak(days("2026-03-01"))).toBe(1);
  });

  it("spans a year boundary", () => {
    expect(longestStreak(days("2025-12-31", "2026-01-01"))).toBe(2);
  });
});

describe("buildHeatmap", () => {
  const now = at(2026, 3, 7);

  it("returns the requested number of cells ending today, oldest first", () => {
    const cells = buildHeatmap({}, now, 5);
    expect(cells).toHaveLength(5);
    expect(cells[0]!.key).toBe("2026-03-03");
    expect(cells[4]!.key).toBe("2026-03-07");
  });

  it("leaves every level at 0 when there is no activity", () => {
    expect(buildHeatmap({}, now, 5).every((cell) => cell.level === 0)).toBe(true);
  });

  it("scales intensity against the busiest day in the window", () => {
    const activity: Record<string, DayActivity> = {
      "2026-03-07": { answered: 40, correct: 20 },
      "2026-03-06": { answered: 10, correct: 5 },
    };
    const cells = buildHeatmap(activity, now, 5);
    expect(cells.find((c) => c.key === "2026-03-07")!.level).toBe(4);
    expect(cells.find((c) => c.key === "2026-03-06")!.level).toBe(1);
    expect(cells.find((c) => c.key === "2026-03-05")!.level).toBe(0);
  });

  it("gives any active day a non-zero level, however small", () => {
    const activity: Record<string, DayActivity> = {
      "2026-03-07": { answered: 100, correct: 50 },
      "2026-03-06": { answered: 1, correct: 1 },
    };
    const cells = buildHeatmap(activity, now, 5);
    expect(cells.find((c) => c.key === "2026-03-06")!.level).toBe(1);
  });

  it("ignores activity older than the window", () => {
    const cells = buildHeatmap(days("2025-01-01"), now, 5);
    expect(cells.every((cell) => cell.answered === 0)).toBe(true);
  });
});

describe("activityTotals", () => {
  it("reports nulls-free zeroes for an empty history", () => {
    expect(activityTotals({})).toEqual({
      activeDays: 0,
      answered: 0,
      correct: 0,
      accuracyPercent: null,
    });
  });

  it("sums answers across days and computes accuracy", () => {
    const activity: Record<string, DayActivity> = {
      "2026-03-06": { answered: 10, correct: 8 },
      "2026-03-07": { answered: 10, correct: 4 },
    };
    expect(activityTotals(activity)).toEqual({
      activeDays: 2,
      answered: 20,
      correct: 12,
      accuracyPercent: 60,
    });
  });
});
