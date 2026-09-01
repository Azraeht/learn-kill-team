import type { CardProgress } from "./types.ts";

const MIN_BOX = 0;
const MAX_BOX = 5;
const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const DEFAULT_EASE = 2.5;

const HOUR_MS = 60 * 60 * 1000;

/** Baseline interval (in hours) for each Leitner box, before the ease multiplier is applied. */
export const BOX_INTERVAL_HOURS: readonly number[] = [
  0, // box 0: due immediately
  1 / 6, // box 1: 10 minutes
  1, // box 2: 1 hour
  8, // box 3: 8 hours
  24 * 3, // box 4: 3 days ("mastered" threshold)
  24 * 10, // box 5: 10 days
];

/** A card is considered mastered once it reaches this box. */
export const MASTERED_BOX = 4;

export function createInitialCardProgress(now: number): CardProgress {
  return {
    box: MIN_BOX,
    ease: DEFAULT_EASE,
    dueAt: now,
    lastSeenAt: null,
    timesSeen: 0,
    timesCorrect: 0,
    consecutiveCorrect: 0,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pure state transition for a single answered question. Takes `now` explicitly
 * (rather than reading Date.now()) so scheduling behavior is deterministic and testable.
 */
export function nextCardProgress(card: CardProgress, correct: boolean, now: number): CardProgress {
  const ease = clamp(card.ease + (correct ? 0.1 : -0.2), MIN_EASE, MAX_EASE);
  const box = correct ? clamp(card.box + 1, MIN_BOX, MAX_BOX) : clamp(card.box - 2, MIN_BOX, MAX_BOX);

  const intervalHours = BOX_INTERVAL_HOURS[box] * (ease / DEFAULT_EASE);
  const dueAt = now + intervalHours * HOUR_MS;

  return {
    box,
    ease,
    dueAt,
    lastSeenAt: now,
    timesSeen: card.timesSeen + 1,
    timesCorrect: card.timesCorrect + (correct ? 1 : 0),
    consecutiveCorrect: correct ? card.consecutiveCorrect + 1 : 0,
  };
}

export function isDue(card: CardProgress, now: number): boolean {
  return card.dueAt <= now;
}

export function isMastered(card: CardProgress): boolean {
  return card.box >= MASTERED_BOX;
}
