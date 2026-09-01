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
            <span class="badge badge--muted">${stats.masteredCount}/${stats.total} mastered</span>
          </div>
          <div class="progress-bar"><div class="progress-bar__fill" style="width:${stats.masteryPercent}%; background:${category.color}"></div></div>
          <div class="category-card__meta">
            <span>${stats.masteryPercent}% mastery</span>
            <span>${stats.accuracyPercent === null ? "no attempts yet" : `${stats.accuracyPercent}% accuracy`}</span>
            <span>${stats.dueCount} due</span>
          </div>
        </div>
      `;
    })
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Progress</h2>
    <div class="category-list">${rows}</div>
    <button class="btn btn--block" data-home>Back home</button>
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
