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
/** Reading order: numbered chapters first, then appendices (file names sort that way). */
const chapterOrder = [...bySlug.keys()].filter((s) => s !== INDEX_SLUG).sort();

function chapterTitle(slug: string): string {
  const heading = bySlug.get(slug)?.match(/^#\s+(.+)$/m)?.[1] ?? slug;
  return heading.replace(/^Chapitre\s+\d+\s*:\s*/, "").replace(/^Annexe\s*:\s*/, "");
}

const CALLOUTS: Record<string, string> = { NOTE: "exemple", TIP: "astuce", IMPORTANT: "resume" };

/**
 * GitHub-style alerts (> [!NOTE], > [!TIP], > [!IMPORTANT]) mark examples, tips
 * and summaries so they render as distinct boxes, both on GitHub and in the app.
 */
function styleCallouts(html: string): string {
  return html.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT)\]\s*/g,
    (_m, kind: string) => `<blockquote class="callout callout--${CALLOUTS[kind]}"><p>`,
  );
}

/** Turns links between chapter files (./03-x.md) into in-app routes. */
function rewriteChapterLinks(html: string): string {
  return html.replace(/href="\.\/([^"#]+)\.md(#[^"]*)?"/g, (_m, slug: string) => `href="#/livre/${slug}"`);
}

export function renderRulebook(root: HTMLElement, slug?: string): void {
  const key = slug && bySlug.has(slug) ? slug : INDEX_SLUG;
  const markdown = bySlug.get(key) ?? "# Livre de règles\n\nAucun chapitre disponible.";
  const body = styleCallouts(rewriteChapterLinks(marked.parse(markdown, { async: false })));

  const position = chapterOrder.indexOf(key);
  const prev = position > 0 ? chapterOrder[position - 1] : undefined;
  const next = key === INDEX_SLUG ? chapterOrder[0] : chapterOrder[position + 1];
  const pager = `
    <div class="mode-grid">
      ${prev ? `<button class="btn" data-goto="${prev}">← ${chapterTitle(prev)}</button>` : "<span></span>"}
      ${next ? `<button class="btn" data-goto="${next}">${chapterTitle(next)} →</button>` : ""}
    </div>`;

  const nav =
    key === INDEX_SLUG
      ? `${pager}<button class="btn btn--block" data-home>Retour à l'accueil</button>`
      : `${pager}<button class="btn btn--block" data-index>Sommaire du livre</button>
         <button class="btn btn--block" data-home>Retour à l'accueil</button>`;

  root.innerHTML = `
    <article class="rulebook">${body}</article>
    ${nav}
  `;

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
  root.querySelector("[data-index]")?.addEventListener("click", () => navigate("livre"));
  root.querySelectorAll<HTMLButtonElement>("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(`livre/${btn.dataset.goto}`));
  });
}
