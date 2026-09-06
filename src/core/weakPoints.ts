import type { CardProgress, Question } from "./types.ts";

/**
 * Questions the player has gotten wrong at least once, worst accuracy first.
 * Never-seen questions aren't "weak" — they're just unseen, and already
 * surfaced by the normal review flow — so this only looks at questions with
 * a real track record of at least one attempt.
 */
export function getWeakQuestions(
  questions: Question[],
  getProgress: (questionId: string) => CardProgress,
): Question[] {
  return questions
    .filter((question) => {
      const progress = getProgress(question.id);
      return progress.timesSeen > 0 && progress.timesCorrect < progress.timesSeen;
    })
    .sort((a, b) => {
      const progressA = getProgress(a.id);
      const progressB = getProgress(b.id);
      const accuracyA = progressA.timesCorrect / progressA.timesSeen;
      const accuracyB = progressB.timesCorrect / progressB.timesSeen;
      if (accuracyA !== accuracyB) return accuracyA - accuracyB;
      return progressA.box - progressB.box;
    });
}
