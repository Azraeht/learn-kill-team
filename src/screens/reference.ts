import { allQuestions, categories } from "../data/categories.ts";
import { answerLabel, filterQuestions } from "../core/search.ts";
import type { Question } from "../core/types.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

/** Kept at module scope so returning to the antisèche restores the last search. */
let query = "";
let activeCategory = "all";

function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

function entryHtml(question: Question): string {
  const source = question.sourceRef
    ? `<p class="reference-entry__source">${escapeHtml(question.sourceRef)}</p>`
    : "";
  const draft =
    question.status === "draft"
      ? '<span class="badge badge--draft">Brouillon — non vérifié</span>'
      : "";

  return `
    <article class="reference-entry">
      <div class="reference-entry__top">
        <span class="badge badge--muted">${escapeHtml(categoryLabel(question.category))}</span>
        ${draft}
      </div>
      <p class="reference-entry__prompt">${escapeHtml(question.prompt)}</p>
      <p class="reference-entry__answer">${escapeHtml(answerLabel(question))}</p>
      ${question.explanation ? `<p class="reference-entry__explanation">${escapeHtml(question.explanation)}</p>` : ""}
      ${source}
    </article>
  `;
}

function resultsHtml(): string {
  const matches = filterQuestions(allQuestions, activeCategory, query);

  if (matches.length === 0) {
    return `<div class="empty-state"><p>Aucune règle ne correspond à « ${escapeHtml(query)} ».</p></div>`;
  }

  return `
    <p class="text-muted">${matches.length} règle${matches.length > 1 ? "s" : ""} affichée${matches.length > 1 ? "s" : ""}.</p>
    <div class="reference-list">${matches.map(entryHtml).join("")}</div>
  `;
}

function filterChipsHtml(): string {
  const chips = [{ id: "all", label: "Tout" }, ...categories.map((c) => ({ id: c.id, label: c.label }))];

  return chips
    .map(
      (chip) => `
        <button
          class="filter-chip${chip.id === activeCategory ? " filter-chip--active" : ""}"
          data-filter="${escapeHtml(chip.id)}"
        >${escapeHtml(chip.label)}</button>
      `,
    )
    .join("");
}

export function renderReference(root: HTMLElement): void {
  root.innerHTML = `
    <h2 class="screen-title">Antisèche</h2>
    <p class="text-muted">Toutes les règles du jeu de questions, avec leur réponse et leur source — consultable pendant une partie.</p>
    <input
      class="search-input"
      type="search"
      inputmode="search"
      placeholder="Rechercher : couvert, dissimulation, PA…"
      value="${escapeHtml(query)}"
      data-search
    />
    <div class="filter-chips" data-chips>${filterChipsHtml()}</div>
    <div data-results>${resultsHtml()}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  const results = root.querySelector<HTMLElement>("[data-results]");
  const chips = root.querySelector<HTMLElement>("[data-chips]");

  // Only the results and chips are re-rendered on input, so the search field keeps
  // focus and caret position while typing.
  const refresh = (): void => {
    if (results) results.innerHTML = resultsHtml();
    if (chips) chips.innerHTML = filterChipsHtml();
    bindChips();
  };

  function bindChips(): void {
    root.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.filter ?? "all";
        refresh();
      });
    });
  }

  bindChips();

  root.querySelector<HTMLInputElement>("[data-search]")?.addEventListener("input", (event) => {
    query = (event.target as HTMLInputElement).value;
    if (results) results.innerHTML = resultsHtml();
  });

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
