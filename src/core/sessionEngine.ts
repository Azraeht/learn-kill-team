import { isDue } from "./srs.ts";
import type { CardProgress, Question } from "./types.ts";

const STREAK_BONUS_PER_POINT = 2;
const STREAK_BONUS_CAP = 20;
const CORRECT_POINTS = 10;

export interface SessionState {
  score: number;
  streak: number;
  bestStreak: number;
  answeredCount: number;
  correctCount: number;
}

export function createSessionState(): SessionState {
  return { score: 0, streak: 0, bestStreak: 0, answeredCount: 0, correctCount: 0 };
}

export function applyAnswer(session: SessionState, correct: boolean): SessionState {
  const streak = correct ? session.streak + 1 : 0;
  const bonus = correct ? Math.min(STREAK_BONUS_PER_POINT * (streak - 1), STREAK_BONUS_CAP) : 0;
  const score = session.score + (correct ? CORRECT_POINTS + bonus : 0);

  return {
    score,
    streak,
    bestStreak: Math.max(session.bestStreak, streak),
    answeredCount: session.answeredCount + 1,
    correctCount: session.correctCount + (correct ? 1 : 0),
  };
}

/**
 * Picks the next question to show in a session: prefers due cards (weighted toward
 * lower/struggling boxes), then never-seen questions, then the soonest-due card as a
 * fallback so a session always has content even when nothing is technically due yet.
 * Never repeats a question already shown this session unless the pool is exhausted.
 */
export function pickNextQuestion(
  pool: Question[],
  getProgress: (questionId: string) => CardProgress,
  shownIds: Set<string>,
  now: number,
  random: () => number = Math.random,
): Question | null {
  const remaining = pool.filter((q) => !shownIds.has(q.id));
  const candidates = remaining.length > 0 ? remaining : pool;
  if (candidates.length === 0) return null;

  const due = candidates.filter((q) => isDue(getProgress(q.id), now));
  if (due.length > 0) {
    return weightedPick(due, getProgress, random);
  }

  const neverSeen = candidates.filter((q) => getProgress(q.id).timesSeen === 0);
  if (neverSeen.length > 0) {
    return neverSeen[Math.floor(random() * neverSeen.length)] ?? null;
  }

  return candidates.reduce((soonest, q) =>
    getProgress(q.id).dueAt < getProgress(soonest.id).dueAt ? q : soonest,
  );
}

function weightedPick(
  candidates: Question[],
  getProgress: (questionId: string) => CardProgress,
  random: () => number,
): Question {
  const weights = candidates.map((q) => 1 / (getProgress(q.id).box + 1));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = random() * total;

  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}
