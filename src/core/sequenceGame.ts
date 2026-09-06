export interface SequenceAttemptResult {
  correctPositions: boolean[];
  correctCount: number;
  total: number;
  fullyCorrect: boolean;
}

/** Compares a user-submitted step order against the canonical order, position by position. */
export function checkSequenceOrder(canonicalSteps: string[], submittedSteps: string[]): SequenceAttemptResult {
  const total = canonicalSteps.length;
  const correctPositions = submittedSteps.map((step, index) => step === canonicalSteps[index]);
  const correctCount = correctPositions.filter(Boolean).length;

  return {
    correctPositions,
    correctCount,
    total,
    fullyCorrect: correctCount === total && submittedSteps.length === total,
  };
}

/** Fisher-Yates shuffle; takes a random source so it's deterministic in tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
