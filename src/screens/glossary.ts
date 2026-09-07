import { glossary } from "../data/glossary.ts";
import { categories } from "../data/categories.ts";
import { filterGlossary } from "../core/glossarySearch.ts";
import type { GlossaryEntry } from "../core/types.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

/** Kept at module scope so returning to the glossary restores the last search. */
let query = "";
let expandedId: string | null = null;

function categoryLabel(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? categoryId;
}

function entryHtml(entry: GlossaryEntry): string {
  const expanded = entry.id === expandedId;
  const definitionHtml = expanded
    ? `
      <div class="glossary-entry__definition">
        <p>${escapeHtml(entry.definition)}</p>
        <div class="glossary-entry__meta">
          <span class="badge badge--muted">${escapeHtml(categoryLabel(entry.category))}</span>
          ${entry.sourceRef ? `<span class="reference-entry__source">${escapeHtml(entry.sourceRef)}</span>` : ""}
        </div>
      </div>
    `
    : "";

  return `
    <div class="glossary-entry${expanded ? " glossary-entry--open" : ""}">
      <button class="glossary-entry__term" data-term="${escapeHtml(entry.id)}" aria-expanded="${expanded}">
        <span>${escapeHtml(entry.term)}</span>
        <span class="glossary-entry__chevron" aria-hidden="true">${expanded ? "▾" : "▸"}</span>
      </button>
      ${definitionHtml}
    </div>
  `;
}

function resultsHtml(): string {
  const matches = filterGlossary(glossary, query);

  if (matches.length === 0) {
    return `<div class="empty-state"><p>Aucune règle ne correspond à « ${escapeHtml(query)} ».</p></div>`;
  }

  return `
    <p class="text-muted">${matches.length} terme${matches.length > 1 ? "s" : ""}.</p>
    <div class="glossary-list">${matches.map(entryHtml).join("")}</div>
  `;
}

function bindResults(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>("[data-term]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.term ?? null;
      expandedId = expandedId === id ? null : id;
      const results = root.querySelector<HTMLElement>("[data-results]");
      if (results) results.innerHTML = resultsHtml();
      bindResults(root);
    });
  });
}

export function renderGlossary(root: HTMLElement): void {
  root.innerHTML = `
    <h2 class="screen-title">Glossaire</h2>
    <p class="text-muted">
      Index des règles nommées — armes, ordres, états — pour retrouver une définition en un tap
      pendant une partie.
    </p>
    <input
      class="search-input"
      type="search"
      inputmode="search"
      placeholder="Nom de règle : Brutale, Dissimulation…"
      value="${escapeHtml(query)}"
      data-search
      autofocus
    />
    <div data-results>${resultsHtml()}</div>
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  bindResults(root);

  const results = root.querySelector<HTMLElement>("[data-results]");
  const searchInput = root.querySelector<HTMLInputElement>("[data-search]");

  // Only the results are re-rendered on input, so the search field keeps focus
  // and caret position while typing.
  searchInput?.addEventListener("input", (event) => {
    query = (event.target as HTMLInputElement).value;
    expandedId = null;
    if (results) results.innerHTML = resultsHtml();
    bindResults(root);
  });

  searchInput?.focus({ preventScroll: true });
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
