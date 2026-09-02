import { categories, getQuestionsForCategory } from "../data/categories.ts";
import { store } from "../core/store.ts";
import { computeCategoryStats } from "../core/stats.ts";
import { navigate } from "../router.ts";

export function renderProgress(root: HTMLElement): void {
  const now = Date.now();
  const getProgress = (id: string) => store.getCardProgress(id, now);

  const rows = categories
    .map((category) => {
      const questions = getQuestionsForCategory(category.id);
      const stats = computeCategoryStats(category.id, questions, getProgress, now);

      return `
        <div class="category-card">
          <div class="category-card__top">
            <span class="category-card__label">${category.label}</span>
            <span class="badge badge--muted">${stats.masteredCount}/${stats.total} maîtrisées</span>
          </div>
          <div class="progress-bar"><div class="progress-bar__fill" style="width:${stats.masteryPercent}%; background:${category.color}"></div></div>
          <div class="category-card__meta">
            <span>${stats.masteryPercent}% de maîtrise</span>
            <span>${stats.accuracyPercent === null ? "aucune tentative" : `${stats.accuracyPercent}% de réussite`}</span>
            <span>${stats.dueCount} à réviser</span>
          </div>
        </div>
      `;
    })
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Progression</h2>
    <div class="category-list">${rows}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
