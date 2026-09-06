import type { Question } from "./types.ts";

/**
 * Lowercases and strips diacritics so "portee" finds "portée" and "degats" finds
 * "dégâts" — the content is French, but phones are often typed on without accents.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** The answer text to display for a question, resolving true/false to its label. */
export function answerLabel(question: Question): string {
  if (question.type === "true-false") return question.correctIndex === 0 ? "Vrai" : "Faux";
  return question.choices?.[question.correctIndex] ?? "";
}

/** Every field a reference search should look through, as one normalized string. */
function haystack(question: Question): string {
  return normalizeText(
    [
      question.prompt,
      question.explanation ?? "",
      question.subtopic ?? "",
      answerLabel(question),
      ...(question.tags ?? []),
    ].join(" "),
  );
}

/**
 * Matches when every whitespace-separated term appears somewhere in the question,
 * so "couvert tir" narrows rather than widens.
 */
export function questionMatches(question: Question, query: string): boolean {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const text = haystack(question);
  return terms.every((term) => text.includes(term));
}

export function filterQuestions(
  questions: Question[],
  categoryId: string,
  query: string,
): Question[] {
  return questions.filter(
    (question) =>
      (categoryId === "all" || question.category === categoryId) &&
      questionMatches(question, query),
  );
}
