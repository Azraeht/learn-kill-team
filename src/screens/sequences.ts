import { sequences } from "../data/sequences.ts";
import { store } from "../core/store.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

export function renderSequences(root: HTMLElement): void {
  const cards = sequences
    .map((sequence) => {
      const progress = store.getSequenceProgress(sequence.id);
      const meta =
        progress.timesAttempted === 0
          ? "jamais essayé"
          : `${progress.bestCorrectCount}/${sequence.steps.length} meilleur score · ${progress.timesFullyCorrect} réussite(s) complète(s)`;

      return `
        <button class="sequence-card" data-sequence="${escapeHtml(sequence.id)}">
          <div class="sequence-card__top">
            <span class="sequence-card__title">${escapeHtml(sequence.title)}</span>
          </div>
          ${sequence.description ? `<p class="sequence-card__desc">${escapeHtml(sequence.description)}</p>` : ""}
          <p class="category-card__meta">${escapeHtml(meta)}</p>
        </button>
      `;
    })
    .join("");

  root.innerHTML = `
    <h2 class="screen-title">Séquences de jeu</h2>
    <p class="text-muted">Remettez les étapes dans le bon ordre pour apprendre le déroulement d'une phase ou d'une action.</p>
    <div class="category-list">${cards}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-sequence]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`sequence/${btn.dataset.sequence}`));
  });
  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
