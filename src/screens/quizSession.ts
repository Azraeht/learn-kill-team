import { allQuestions, categories, getQuestionById, getQuestionsForCategory } from "../data/categories.ts";
import { store } from "../core/store.ts";
import { applyAnswer, createSessionState, pickNextQuestion } from "../core/sessionEngine.ts";
import type { SessionState } from "../core/sessionEngine.ts";
import { getWeakQuestions } from "../core/weakPoints.ts";
import { enqueueFollowUps, popNextFollowUp } from "../core/followUps.ts";
import type { Question } from "../core/types.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

const WEAK_CATEGORY_ID = "weak";

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
  /** Pending drill-down questions queued by followUps, drained before normal picking resumes. */
  followUpQueue: string[];
  /** Whether `current` came from the follow-up queue rather than normal SRS picking. */
  currentIsFollowUp: boolean;
}

let active: ActiveSession | null = null;
let lastSummary: QuizSessionSummary | null = null;

export function getLastSummary(): QuizSessionSummary | null {
  return lastSummary;
}

function poolFor(categoryId: string): Question[] {
  if (categoryId === WEAK_CATEGORY_ID) {
    const now = Date.now();
    return getWeakQuestions(allQuestions, (id) => store.getCardProgress(id, now));
  }
  return categoryId === "all" ? allQuestions : getQuestionsForCategory(categoryId);
}

function categoryLabel(categoryId: string): string {
  if (categoryId === "all") return "Toutes les catégories";
  if (categoryId === WEAK_CATEGORY_ID) return "Points faibles";
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

function startSession(categoryId: string): void {
  const pool = poolFor(categoryId);
  const session = createSessionState();
  const shownIds = new Set<string>();
  const now = Date.now();
  const current = pickNextQuestion(pool, (id) => store.getCardProgress(id, now), shownIds, now);
  if (current) shownIds.add(current.id);

  active = {
    categoryId,
    pool,
    shownIds,
    session,
    current,
    answered: false,
    selectedIndex: null,
    followUpQueue: [],
    currentIsFollowUp: false,
  };
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
  return question.type === "true-false" ? ["Vrai", "Faux"] : (question.choices ?? []);
}

export function renderQuizSession(root: HTMLElement, categoryId: string): void {
  if (!active || active.categoryId !== categoryId) {
    startSession(categoryId);
  }
  if (!active) return;

  if (!active.current) {
    const message =
      categoryId === WEAK_CATEGORY_ID
        ? "Aucun point faible pour l'instant — continuez à réviser pour en dégager, ou bien joué si vous n'avez encore raté aucune question !"
        : "Aucune question disponible dans cette catégorie pour le moment.";
    root.innerHTML = `
      <div class="empty-state">
        <p>${escapeHtml(message)}</p>
        <button class="btn" data-home>Retour à l'accueil</button>
      </div>
    `;
    root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
    return;
  }

  const { current, session, answered, selectedIndex } = active;
  const batchSize = store.getState().settings.batchSize;
  const labels = choiceLabels(current);
  const draftBadge =
    current.status === "draft" ? '<span class="badge badge--draft">Brouillon — non vérifié</span>' : "";

  const choiceButtons = labels
    .map((label, index) => {
      let cls = "choice-btn";
      if (answered) {
        if (index === current.correctIndex) cls += " choice-btn--correct";
        else if (index === selectedIndex) cls += " choice-btn--incorrect";
      }
      return `<button class="${cls}" data-choice="${index}" ${answered ? "disabled" : ""}>${escapeHtml(label)}</button>`;
    })
    .join("");

  const explanation = answered
    ? `
      <div class="explanation">
        <div class="explanation__feedback explanation__feedback--${selectedIndex === current.correctIndex ? "ok" : "miss"}">${selectedIndex === current.correctIndex ? "Correct !" : "Pas tout à fait."}</div>
        ${current.explanation ? `<div>${escapeHtml(current.explanation)}</div>` : ""}
        ${draftBadge}
        <button class="btn btn--primary btn--block" data-next>Suivant</button>
      </div>
    `
    : "";

  root.innerHTML = `
    <div class="hud">
      <span>Score : ${session.score}</span>
      <span>${session.answeredCount}/${batchSize}</span>
      <span class="hud__streak">${session.streak > 0 ? `${session.streak}🔥` : ""}</span>
    </div>
    <div class="question-card">
      <div class="question-card__top">
        <span class="badge badge--muted">${escapeHtml(categoryLabel(current.category))}</span>
        ${active.currentIsFollowUp ? '<span class="badge badge--muted">↳ Suite du sujet</span>' : ""}
        ${!answered ? draftBadge : ""}
      </div>
      <p class="question-card__prompt">${escapeHtml(current.prompt)}</p>
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
  active.followUpQueue = enqueueFollowUps(active.followUpQueue, active.current.followUps, active.shownIds);
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

  // Drain the follow-up queue first — a queued drill-down question always
  // takes priority over normal SRS-driven picking, regardless of session mode.
  const { id: followUpId, remainingQueue } = popNextFollowUp(active.followUpQueue, active.shownIds);
  active.followUpQueue = remainingQueue;
  const followUpQuestion = followUpId ? getQuestionById(followUpId) : undefined;

  const nextQuestion =
    followUpQuestion ??
    pickNextQuestion(active.pool, (id) => store.getCardProgress(id, now), active.shownIds, now);

  if (!nextQuestion) {
    finishSession();
    return;
  }

  active.shownIds.add(nextQuestion.id);
  active.current = nextQuestion;
  active.currentIsFollowUp = Boolean(followUpQuestion);
  active.answered = false;
  active.selectedIndex = null;

  renderQuizSession(root, categoryId);
}
