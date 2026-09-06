import { describe, expect, it } from "vitest";
import { answerLabel, filterQuestions, normalizeText, questionMatches } from "./search.ts";
import type { Question } from "./types.ts";

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: "test-001",
    category: "core-rules",
    type: "multiple-choice",
    prompt: "Quelle est la portée de contrôle ?",
    choices: ["1\"", "2\"", "3\""],
    correctIndex: 0,
    explanation: "Une règle sur les dégâts et le couvert.",
    status: "verified",
    ...overrides,
  };
}

describe("normalizeText", () => {
  it("lowercases and strips diacritics", () => {
    expect(normalizeText("Dégâts À Portée")).toBe("degats a portee");
  });

  it("leaves unaccented text alone", () => {
    expect(normalizeText("cover")).toBe("cover");
  });
});

describe("answerLabel", () => {
  it("resolves a true-false question to Vrai or Faux", () => {
    expect(answerLabel(question({ type: "true-false", choices: undefined, correctIndex: 0 }))).toBe("Vrai");
    expect(answerLabel(question({ type: "true-false", choices: undefined, correctIndex: 1 }))).toBe("Faux");
  });

  it("returns the chosen option for a multiple-choice question", () => {
    expect(answerLabel(question({ correctIndex: 1 }))).toBe("2\"");
  });

  it("returns an empty string when the choice is missing", () => {
    expect(answerLabel(question({ choices: [], correctIndex: 0 }))).toBe("");
  });
});

describe("questionMatches", () => {
  it("matches everything on an empty query", () => {
    expect(questionMatches(question(), "")).toBe(true);
    expect(questionMatches(question(), "   ")).toBe(true);
  });

  it("matches on the prompt, ignoring accents and case", () => {
    expect(questionMatches(question(), "PORTEE")).toBe(true);
  });

  it("matches on the explanation", () => {
    expect(questionMatches(question(), "couvert")).toBe(true);
  });

  it("matches on tags and subtopic", () => {
    const q = question({ tags: ["deploiement"], subtopic: "mise-en-place" });
    expect(questionMatches(q, "deploiement")).toBe(true);
    expect(questionMatches(q, "mise-en-place")).toBe(true);
  });

  it("matches on the answer text", () => {
    expect(questionMatches(question({ choices: ["Brutale", "Choc"], correctIndex: 0 }), "brutale")).toBe(true);
  });

  it("requires every term to match, narrowing rather than widening", () => {
    expect(questionMatches(question(), "portee couvert")).toBe(true);
    expect(questionMatches(question(), "portee inexistant")).toBe(false);
  });

  it("does not match an unrelated term", () => {
    expect(questionMatches(question(), "necron")).toBe(false);
  });
});

describe("filterQuestions", () => {
  const pool = [
    question({ id: "a-001", category: "core-rules", prompt: "Couvert et visibilité" }),
    question({ id: "b-001", category: "deathwatch", prompt: "Règle de faction" }),
  ];

  it("returns everything for the 'all' category and an empty query", () => {
    expect(filterQuestions(pool, "all", "")).toHaveLength(2);
  });

  it("filters by category", () => {
    const result = filterQuestions(pool, "deathwatch", "");
    expect(result.map((q) => q.id)).toEqual(["b-001"]);
  });

  it("applies category and query together", () => {
    expect(filterQuestions(pool, "core-rules", "faction")).toEqual([]);
    expect(filterQuestions(pool, "core-rules", "couvert").map((q) => q.id)).toEqual(["a-001"]);
  });
});
