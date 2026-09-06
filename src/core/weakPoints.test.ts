import { describe, expect, it } from "vitest";
import { getWeakQuestions } from "./weakPoints.ts";
import type { CardProgress, Question } from "./types.ts";

function question(id: string): Question {
  return {
    id,
    category: "core-rules",
    type: "true-false",
    prompt: `Prompt ${id}`,
    correctIndex: 0,
    status: "verified",
  };
}

function progress(overrides: Partial<CardProgress> = {}): CardProgress {
  return {
    box: 0,
    ease: 2.5,
    dueAt: 0,
    lastSeenAt: null,
    timesSeen: 0,
    timesCorrect: 0,
    consecutiveCorrect: 0,
    ...overrides,
  };
}

describe("getWeakQuestions", () => {
  it("excludes never-seen questions", () => {
    const questions = [question("a")];
    const progressMap: Record<string, CardProgress> = { a: progress({ timesSeen: 0 }) };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!)).toEqual([]);
  });

  it("excludes questions answered perfectly", () => {
    const questions = [question("a")];
    const progressMap: Record<string, CardProgress> = {
      a: progress({ timesSeen: 5, timesCorrect: 5 }),
    };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!)).toEqual([]);
  });

  it("includes a question with at least one wrong answer", () => {
    const questions = [question("a")];
    const progressMap: Record<string, CardProgress> = {
      a: progress({ timesSeen: 3, timesCorrect: 2 }),
    };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!).map((q) => q.id)).toEqual(["a"]);
  });

  it("sorts worst accuracy first", () => {
    const questions = [question("good"), question("bad"), question("mid")];
    const progressMap: Record<string, CardProgress> = {
      good: progress({ timesSeen: 10, timesCorrect: 9 }), // 90%
      bad: progress({ timesSeen: 4, timesCorrect: 1 }), // 25%
      mid: progress({ timesSeen: 2, timesCorrect: 1 }), // 50%
    };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!).map((q) => q.id)).toEqual([
      "bad",
      "mid",
      "good",
    ]);
  });

  it("breaks accuracy ties by lower box first", () => {
    const questions = [question("higherBox"), question("lowerBox")];
    const progressMap: Record<string, CardProgress> = {
      higherBox: progress({ timesSeen: 2, timesCorrect: 1, box: 3 }),
      lowerBox: progress({ timesSeen: 2, timesCorrect: 1, box: 0 }),
    };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!).map((q) => q.id)).toEqual([
      "lowerBox",
      "higherBox",
    ]);
  });

  it("returns an empty list when nothing has ever been attempted", () => {
    const questions = [question("a"), question("b")];
    const progressMap: Record<string, CardProgress> = {
      a: progress(),
      b: progress(),
    };

    expect(getWeakQuestions(questions, (id) => progressMap[id]!)).toEqual([]);
  });
});
