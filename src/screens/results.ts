import { getLastSummary } from "./quizSession.ts";
import { navigate } from "../router.ts";

export function renderResults(root: HTMLElement): void {
  const summary = getLastSummary();

  if (!summary) {
    root.innerHTML = `
      <div class="empty-state">
        <p>No recent session to show.</p>
        <button class="btn" data-home>Back home</button>
      </div>
    `;
    root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
    return;
  }

  const accuracy =
    summary.answeredCount === 0 ? 0 : Math.round((summary.correctCount / summary.answeredCount) * 100);

  root.innerHTML = `
    <h2 class="screen-title">Session complete</h2>
    <div class="results-summary">
      <span class="badge badge--muted">${summary.categoryLabel}</span>
      <div class="results-summary__score">${summary.score} pts</div>
      <p class="text-muted">${summary.correctCount}/${summary.answeredCount} correct (${accuracy}%) &middot; best streak ${summary.bestStreak}🔥</p>
    </div>
    <div class="action-row">
      <button class="btn btn--primary btn--block" data-again>Study again</button>
    </div>
    <button class="btn btn--block" data-home>Back home</button>
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-again]")?.addEventListener("click", () => navigate("home"));
}
