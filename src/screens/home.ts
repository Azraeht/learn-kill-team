import { categories, getQuestionsForCategory, allQuestions } from "../data/categories.ts";
import { store } from "../core/store.ts";
import { computeCategoryStats } from "../core/stats.ts";
import { isDue } from "../core/srs.ts";
import { navigate } from "../router.ts";

export function renderHome(root: HTMLElement): void {
  const now = Date.now();
  const getProgress = (id: string) => store.getCardProgress(id, now);

  const totalDue = allQuestions.filter((q) => isDue(getProgress(q.id), now)).length;

  const cards = categories
    .map((category) => {
      const questions = getQuestionsForCategory(category.id);
      const stats = computeCategoryStats(category.id, questions, getProgress, now);
      const draftNote = stats.draftCount > 0 ? `<span class="badge badge--draft">${stats.draftCount}/${stats.total} draft</span>` : "";

      return `
        <button class="category-card" data-category="${category.id}">
          <div class="category-card__top">
            <span class="category-card__label">${category.label}</span>
            ${draftNote}
          </div>
          <p class="category-card__desc">${category.description}</p>
          <div class="progress-bar"><div class="progress-bar__fill" style="width:${stats.masteryPercent}%; background:${category.color}"></div></div>
          <div class="category-card__meta">
            <span>${stats.masteryPercent}% mastered</span>
            <span>${stats.dueCount} due</span>
            <span>${stats.accuracyPercent === null ? "no attempts yet" : `${stats.accuracyPercent}% accuracy`}</span>
          </div>
        </button>
      `;
    })
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Study</h2>
    <div class="stat-grid">
      <div class="stat-tile">
        <div class="stat-tile__value">${totalDue}</div>
        <div class="stat-tile__label">Due today</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile__value">${allQuestions.length}</div>
        <div class="stat-tile__label">Total questions</div>
      </div>
    </div>
    <button class="btn btn--primary btn--block" data-start-all>Study all categories</button>
    <div class="category-list">${cards}</div>
    <button class="btn btn--block" data-progress>View progress</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`quiz/${btn.dataset.category}`));
  });
  root.querySelector("[data-start-all]")?.addEventListener("click", () => navigate("quiz/all"));
  root.querySelector("[data-progress]")?.addEventListener("click", () => navigate("progress"));
}
