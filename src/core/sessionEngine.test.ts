import { describe, expect, it } from "vitest";
import { applyAnswer, createSessionState, pickNextQuestion } from "./sessionEngine.ts";
import { createInitialCardProgress } from "./srs.ts";
import type { CardProgress, Question } from "./types.ts";

const NOW = 1_700_000_000_000;

function q(id: string): Question {
  return {
    id,
    category: "core-rules",
    type: "true-false",
    prompt: id,
    correctIndex: 0,
    status: "draft",
  };
}

describe("applyAnswer", () => {
  it("awards points and grows streak on correct answers, with a capped bonus", () => {
    let session = createSessionState();
    session = applyAnswer(session, true);
    expect(session.score).toBe(10);
    expect(session.streak).toBe(1);

    session = applyAnswer(session, true);
    expect(session.streak).toBe(2);
    expect(session.score).toBe(10 + (10 + 2)); // +10 base, +2 bonus for streak-1

    session = applyAnswer(session, false);
    expect(session.streak).toBe(0);
    expect(session.bestStreak).toBe(2);
    expect(session.answeredCount).toBe(3);
    expect(session.correctCount).toBe(2);
  });
});

describe("pickNextQuestion", () => {
  it("returns null for an empty pool", () => {
    expect(pickNextQuestion([], () => createInitialCardProgress(NOW), new Set(), NOW)).toBeNull();
  });

  it("prefers due questions over never-seen ones", () => {
    const due = q("due-1");
    const notDue = q("not-due-1");
    const progress: Record<string, CardProgress> = {
      "due-1": { ...createInitialCardProgress(NOW), dueAt: NOW - 1000 },
      "not-due-1": { ...createInitialCardProgress(NOW), dueAt: NOW + 999_999, timesSeen: 0 },
    };

    const picked = pickNextQuestion(
      [due, notDue],
      (id) => progress[id]!,
      new Set(),
      NOW,
      () => 0,
    );
    expect(picked?.id).toBe("due-1");
  });

  it("falls back to never-seen questions when nothing is due", () => {
    const seen = q("seen-1");
    const unseen = q("unseen-1");
    const progress: Record<string, CardProgress> = {
      "seen-1": { ...createInitialCardProgress(NOW), dueAt: NOW + 999_999, timesSeen: 3 },
      "unseen-1": { ...createInitialCardProgress(NOW), dueAt: NOW + 999_999, timesSeen: 0 },
    };

    const picked = pickNextQuestion(
      [seen, unseen],
      (id) => progress[id]!,
      new Set(),
      NOW,
      () => 0,
    );
    expect(picked?.id).toBe("unseen-1");
  });

  it("falls back to the soonest-due question when everything is seen and nothing is due", () => {
    const soon = q("soon-1");
    const later = q("later-1");
    const progress: Record<string, CardProgress> = {
      "soon-1": { ...createInitialCardProgress(NOW), dueAt: NOW + 1000, timesSeen: 2 },
      "later-1": { ...createInitialCardProgress(NOW), dueAt: NOW + 5000, timesSeen: 2 },
    };

    const picked = pickNextQuestion(
      [later, soon],
      (id) => progress[id]!,
      new Set(),
      NOW,
      () => 0,
    );
    expect(picked?.id).toBe("soon-1");
  });

  it("avoids repeating already-shown questions while alternatives remain", () => {
    const a = q("a");
    const b = q("b");
    const progress: Record<string, CardProgress> = {
      a: { ...createInitialCardProgress(NOW), dueAt: NOW - 1 },
      b: { ...createInitialCardProgress(NOW), dueAt: NOW - 1 },
    };

    const picked = pickNextQuestion(
      [a, b],
      (id) => progress[id]!,
      new Set(["a"]),
      NOW,
      () => 0,
    );
    expect(picked?.id).toBe("b");
  });
});
