import { allQuestions, categories, getQuestionsForCategory } from "../data/categories.ts";
import { store } from "../core/store.ts";
import { applyAnswer, createSessionState, pickNextQuestion } from "../core/sessionEngine.ts";
import type { SessionState } from "../core/sessionEngine.ts";
import type { Question } from "../core/types.ts";
import { navigate } from "../router.ts";

export interface QuizSessionSummary {
  categoryLabel: string;
  score: number;
  bestStreak: number;
  answeredCount: number;
  correctCount: number;
}

interface ActiveSession {
  categoryId: string;
  pool: Question[];
  shownIds: Set<string>;
  session: SessionState;
  current: Question | null;
  answered: boolean;
  selectedIndex: number | null;
}

let active: ActiveSession | null = null;
let lastSummary: QuizSessionSummary | null = null;

export function getLastSummary(): QuizSessionSummary | null {
  return lastSummary;
}

function poolFor(categoryId: string): Question[] {
  return categoryId === "all" ? allQuestions : getQuestionsForCategory(categoryId);
}

function categoryLabel(categoryId: string): string {
  if (categoryId === "all") return "All Categories";
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

function startSession(categoryId: string): void {
  const pool = poolFor(categoryId);
  const session = createSessionState();
  const shownIds = new Set<string>();
  const now = Date.now();
  const current = pickNextQuestion(pool, (id) => store.getCardProgress(id, now), shownIds, now);
  if (current) shownIds.add(current.id);

  active = { categoryId, pool, shownIds, session, current, answered: false, selectedIndex: null };
}

function finishSession(): void {
  if (!active) return;
  lastSummary = {
    categoryLabel: categoryLabel(active.categoryId),
    score: active.session.score,
    bestStreak: active.session.bestStreak,
    answeredCount: active.session.answeredCount,
    correctCount: active.session.correctCount,
  };
  active = null;
  navigate("results");
}

function choiceLabels(question: Question): string[] {
  return question.type === "true-false" ? ["True", "False"] : (question.choices ?? []);
}

export function renderQuizSession(root: HTMLElement, categoryId: string): void {
  if (!active || active.categoryId !== categoryId) {
    startSession(categoryId);
  }
  if (!active) return;

  if (!active.current) {
    root.innerHTML = `
      <div class="empty-state">
        <p>No questions available in this category yet.</p>
        <button class="btn" data-home>Back home</button>
      </div>
    `;
    root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
    return;
  }

  const { current, session, answered, selectedIndex } = active;
  const batchSize = store.getState().settings.batchSize;
  const labels = choiceLabels(current);
  const draftBadge =
    current.status === "draft" ? '<span class="badge badge--draft">Draft — unverified</span>' : "";

  const choiceButtons = labels
    .map((label, index) => {
      let cls = "choice-btn";
      if (answered) {
        if (index === current.correctIndex) cls += " choice-btn--correct";
        else if (index === selectedIndex) cls += " choice-btn--incorrect";
      }
      return `<button class="${cls}" data-choice="${index}" ${answered ? "disabled" : ""}>${label}</button>`;
    })
    .join("");

  const explanation = answered
    ? `
      <div class="explanation">
        <div class="explanation__feedback">${selectedIndex === current.correctIndex ? "Correct!" : "Not quite."}</div>
        ${current.explanation ? `<div>${current.explanation}</div>` : ""}
        ${draftBadge}
        <button class="btn btn--primary btn--block" data-next>Next</button>
      </div>
    `
    : "";

  root.innerHTML = `
    <div class="hud">
      <span>Score: ${session.score}</span>
      <span>${session.answeredCount}/${batchSize}</span>
      <span class="hud__streak">${session.streak > 0 ? `${session.streak}🔥` : ""}</span>
    </div>
    <div class="question-card">
      <div class="question-card__top">
        <span class="badge badge--muted">${categoryLabel(active.categoryId)}</span>
        ${!answered ? draftBadge : ""}
      </div>
      <p class="question-card__prompt">${current.prompt}</p>
      <div class="choice-list">${choiceButtons}</div>
      ${explanation}
    </div>
  `;

  if (!answered) {
    root.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => handleAnswer(root, categoryId, Number(btn.dataset.choice)));
    });
  } else {
    root.querySelector("[data-next]")?.addEventListener("click", () => handleNext(root, categoryId));
  }
}

function handleAnswer(root: HTMLElement, categoryId: string, choiceIndex: number): void {
  if (!active || !active.current || active.answered) return;
  const now = Date.now();
  const correct = choiceIndex === active.current.correctIndex;

  store.recordAnswer(active.current.id, active.current.category, correct, now);
  active.session = applyAnswer(active.session, correct);
  active.answered = true;
  active.selectedIndex = choiceIndex;

  renderQuizSession(root, categoryId);
}

function handleNext(root: HTMLElement, categoryId: string): void {
  if (!active) return;
  const batchSize = store.getState().settings.batchSize;

  if (active.session.answeredCount >= batchSize) {
    finishSession();
    return;
  }

  const now = Date.now();
  const nextQuestion = pickNextQuestion(
    active.pool,
    (id) => store.getCardProgress(id, now),
    active.shownIds,
    now,
  );

  if (!nextQuestion) {
    finishSession();
    return;
  }

  active.shownIds.add(nextQuestion.id);
  active.current = nextQuestion;
  active.answered = false;
  active.selectedIndex = null;

  renderQuizSession(root, categoryId);
}
