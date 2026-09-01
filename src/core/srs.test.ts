import { describe, expect, it } from "vitest";
import {
  BOX_INTERVAL_HOURS,
  createInitialCardProgress,
  isDue,
  isMastered,
  nextCardProgress,
} from "./srs.ts";

const NOW = 1_700_000_000_000;
const HOUR_MS = 60 * 60 * 1000;

describe("createInitialCardProgress", () => {
  it("starts new cards due immediately, unseen, at box 0", () => {
    const card = createInitialCardProgress(NOW);
    expect(card.box).toBe(0);
    expect(card.ease).toBe(2.5);
    expect(card.dueAt).toBe(NOW);
    expect(card.timesSeen).toBe(0);
    expect(isDue(card, NOW)).toBe(true);
  });
});

describe("nextCardProgress", () => {
  it("advances the box and pushes dueAt into the future on a correct answer", () => {
    const card = createInitialCardProgress(NOW);
    const next = nextCardProgress(card, true, NOW);

    expect(next.box).toBe(1);
    expect(next.ease).toBeCloseTo(2.5, 5); // starts at max ease (2.5), clamped after +0.1
    expect(next.timesSeen).toBe(1);
    expect(next.timesCorrect).toBe(1);
    expect(next.consecutiveCorrect).toBe(1);
    expect(next.dueAt).toBeGreaterThan(NOW);
  });

  it("drops the box back further than one step and resets streak on an incorrect answer", () => {
    let card = createInitialCardProgress(NOW);
    card = nextCardProgress(card, true, NOW); // box 1
    card = nextCardProgress(card, true, NOW); // box 2
    card = nextCardProgress(card, true, NOW); // box 3

    const next = nextCardProgress(card, false, NOW);

    expect(next.box).toBe(1); // 3 - 2
    expect(next.consecutiveCorrect).toBe(0);
    expect(next.timesCorrect).toBe(3);
    expect(next.timesSeen).toBe(4);
  });

  it("clamps box at 0 when repeatedly missed from a low box", () => {
    let card = createInitialCardProgress(NOW);
    card = nextCardProgress(card, false, NOW);
    card = nextCardProgress(card, false, NOW);

    expect(card.box).toBe(0);
  });

  it("clamps box at the maximum after many correct answers in a row", () => {
    let card = createInitialCardProgress(NOW);
    for (let i = 0; i < 10; i++) {
      card = nextCardProgress(card, true, NOW);
    }
    expect(card.box).toBeLessThanOrEqual(5);
    expect(card.box).toBe(5);
  });

  it("clamps ease between 1.3 and 2.5", () => {
    let card = createInitialCardProgress(NOW);
    for (let i = 0; i < 20; i++) {
      card = nextCardProgress(card, false, NOW);
    }
    expect(card.ease).toBeCloseTo(1.3, 5);

    card = createInitialCardProgress(NOW);
    for (let i = 0; i < 20; i++) {
      card = nextCardProgress(card, true, NOW);
    }
    expect(card.ease).toBeCloseTo(2.5, 5);
  });

  it("schedules a longer interval for a higher box, scaled by ease", () => {
    let card = createInitialCardProgress(NOW);
    card = nextCardProgress(card, true, NOW); // box 1
    const box1DueIn = card.dueAt - NOW;

    card = nextCardProgress(card, true, NOW); // box 2
    const box2DueIn = card.dueAt - NOW;

    expect(box2DueIn).toBeGreaterThan(box1DueIn);
    expect(box2DueIn).toBeCloseTo(BOX_INTERVAL_HOURS[2] * (card.ease / 2.5) * HOUR_MS, 0);
  });
});

describe("isDue", () => {
  it("is true when dueAt has passed, false otherwise", () => {
    const card = createInitialCardProgress(NOW);
    const scheduled = nextCardProgress(card, true, NOW);

    expect(isDue(scheduled, NOW)).toBe(false);
    expect(isDue(scheduled, scheduled.dueAt)).toBe(true);
    expect(isDue(scheduled, scheduled.dueAt + 1)).toBe(true);
  });
});

describe("isMastered", () => {
  it("is true once box reaches the mastered threshold", () => {
    let card = createInitialCardProgress(NOW);
    expect(isMastered(card)).toBe(false);

    for (let i = 0; i < 4; i++) {
      card = nextCardProgress(card, true, NOW);
    }
    expect(card.box).toBe(4);
    expect(isMastered(card)).toBe(true);
  });
});
