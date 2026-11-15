import { marked } from "marked";
import { navigate } from "../router.ts";

/**
 * The narrative rulebook lives as Markdown in /livre-de-regles so it stays easy
 * to read and edit on GitHub. Vite inlines every chapter at build time.
 */
const chapters = import.meta.glob("../../livre-de-regles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

const bySlug = new Map(Object.entries(chapters).map(([path, md]) => [slugFromPath(path), md]));
const INDEX_SLUG = "README";

/** Turns links between chapter files (./03-x.md) into in-app routes. */
function rewriteChapterLinks(html: string): string {
  return html.replace(/href="\.\/([^"#]+)\.md(#[^"]*)?"/g, (_m, slug: string) => `href="#/livre/${slug}"`);
}

export function renderRulebook(root: HTMLElement, slug?: string): void {
  const key = slug && bySlug.has(slug) ? slug : INDEX_SLUG;
  const markdown = bySlug.get(key) ?? "# Livre de règles\n\nAucun chapitre disponible.";
  const body = rewriteChapterLinks(marked.parse(markdown, { async: false }));

  const nav =
    key === INDEX_SLUG
      ? `<button class="btn btn--block" data-home>Retour à l'accueil</button>`
      : `<button class="btn btn--block" data-index>Sommaire du livre</button>
         <button class="btn btn--block" data-home>Retour à l'accueil</button>`;

  root.innerHTML = `
    <article class="rulebook">${body}</article>
    ${nav}
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-index]")?.addEventListener("click", () => navigate("livre"));
}
