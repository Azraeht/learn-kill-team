import { scenarios } from "../data/scenarios.ts";
import { store } from "../core/store.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

export function renderScenarios(root: HTMLElement): void {
  const cards = scenarios
    .map((scenario) => {
      const progress = store.getScenarioProgress(scenario.id);
      const total = scenario.steps.length;
      const meta =
        progress.timesAttempted === 0
          ? `${total} décisions · jamais essayé`
          : `${total} décisions · meilleur score ${progress.bestCorrectSteps}/${total} · ${progress.timesPerfect} sans faute`;

      return `
        <button class="sequence-card" data-scenario="${escapeHtml(scenario.id)}">
          <div class="sequence-card__top">
            <span class="sequence-card__title">${escapeHtml(scenario.title)}</span>
          </div>
          <p class="sequence-card__desc">${escapeHtml(scenario.situation)}</p>
          <p class="category-card__meta">${escapeHtml(meta)}</p>
        </button>
      `;
    })
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Cas pratiques</h2>
    <p class="text-muted">Une situation de table, plusieurs décisions à enchaîner. C'est là que les règles se combinent : ordres, portée de contrôle, couvert et coûts en PA au même moment.</p>
    <div class="category-list">${cards}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-scenario]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`scenario/${btn.dataset.scenario}`));
  });
  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
