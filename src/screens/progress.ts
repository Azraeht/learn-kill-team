import { categories, getQuestionsForCategory } from "../data/categories.ts";
import { store } from "../core/store.ts";
import { computeCategoryStats } from "../core/stats.ts";
import { activityTotals, buildHeatmap, currentStreak, longestStreak } from "../core/activity.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

const HEATMAP_DAYS = 84;

function heatmapHtml(now: number): string {
  const { dailyActivity } = store.getState();
  const cells = buildHeatmap(dailyActivity, now, HEATMAP_DAYS);
  const totals = activityTotals(dailyActivity);

  const grid = cells
    .map((cell) => {
      const label =
        cell.answered === 0
          ? `${cell.key} — aucune révision`
          : `${cell.key} — ${cell.answered} réponse(s)`;
      return `<span class="heatmap__cell heatmap__cell--${cell.level}" title="${escapeHtml(label)}"></span>`;
    })
    .join("");

  return `
    <section class="settings-section">
      <h3 class="settings-section__title">Assiduité</h3>
      <div class="stat-grid">
        <div class="stat-tile">
          <div class="stat-tile__value">${currentStreak(dailyActivity, now)}</div>
          <div class="stat-tile__label">Série en cours</div>
        </div>
        <div class="stat-tile">
          <div class="stat-tile__value">${longestStreak(dailyActivity)}</div>
          <div class="stat-tile__label">Meilleure série</div>
        </div>
      </div>
      <div class="heatmap" role="img" aria-label="Activité des ${HEATMAP_DAYS} derniers jours">${grid}</div>
      <p class="text-muted">
        ${totals.answered} réponse(s) sur ${totals.activeDays} jour(s)${
          totals.accuracyPercent === null ? "" : ` · ${totals.accuracyPercent}% de réussite globale`
        }.
      </p>
    </section>
  `;
}

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
            <span class="category-card__label">${escapeHtml(category.label)}</span>
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
    ${heatmapHtml(now)}
    <div class="category-list">${rows}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
