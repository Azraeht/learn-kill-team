import { getLastSummary } from "./quizSession.ts";
import { navigate } from "../router.ts";

export function renderResults(root: HTMLElement): void {
  const summary = getLastSummary();

  if (!summary) {
    root.innerHTML = `
      <div class="empty-state">
        <p>Aucune session récente à afficher.</p>
        <button class="btn" data-home>Retour à l'accueil</button>
      </div>
    `;
    root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
    return;
  }

  const accuracy =
    summary.answeredCount === 0 ? 0 : Math.round((summary.correctCount / summary.answeredCount) * 100);

  root.innerHTML = `
    <h2 class="screen-title">Session terminée</h2>
    <div class="results-summary">
      <span class="badge badge--muted">${summary.categoryLabel}</span>
      <div class="results-summary__score">${summary.score} pts</div>
      <p class="text-muted">${summary.correctCount}/${summary.answeredCount} bonnes réponses (${accuracy}%) &middot; meilleure série ${summary.bestStreak}🔥</p>
    </div>
    <div class="action-row">
      <button class="btn btn--primary btn--block" data-again>Rejouer</button>
    </div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-again]")?.addEventListener("click", () => navigate("home"));
}
