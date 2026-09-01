import { isDue, isMastered } from "./srs.ts";
import type { CardProgress, CategoryId, Question } from "./types.ts";

export interface CategoryStats {
  categoryId: CategoryId;
  total: number;
  masteredCount: number;
  masteryPercent: number;
  accuracyPercent: number | null;
  dueCount: number;
  draftCount: number;
}

export function computeCategoryStats(
  categoryId: CategoryId,
  questions: Question[],
  getProgress: (questionId: string) => CardProgress,
  now: number,
): CategoryStats {
  const total = questions.length;
  let masteredCount = 0;
  let dueCount = 0;
  let draftCount = 0;
  let timesSeenTotal = 0;
  let timesCorrectTotal = 0;

  for (const question of questions) {
    const progress = getProgress(question.id);
    if (isMastered(progress)) masteredCount += 1;
    if (isDue(progress, now)) dueCount += 1;
    if (question.status === "draft") draftCount += 1;
    timesSeenTotal += progress.timesSeen;
    timesCorrectTotal += progress.timesCorrect;
  }

  return {
    categoryId,
    total,
    masteredCount,
    masteryPercent: total === 0 ? 0 : Math.round((masteredCount / total) * 100),
    accuracyPercent: timesSeenTotal === 0 ? null : Math.round((timesCorrectTotal / timesSeenTotal) * 100),
    dueCount,
    draftCount,
  };
}
