import { normalizeText } from "./search.ts";
import type { GlossaryEntry } from "./types.ts";

/**
 * Matches on the term name only, not the definition body — this is a "look up
 * a keyword fast" index, not a full-text search like the Antisèche.
 */
export function glossaryMatches(entry: GlossaryEntry, query: string): boolean {
  const normalizedQuery = normalizeText(query).trim();
  if (normalizedQuery === "") return true;
  return normalizeText(entry.term).includes(normalizedQuery);
}

/** Matching entries, alphabetical by term (French collation, so accents sort naturally). */
export function filterGlossary(entries: GlossaryEntry[], query: string): GlossaryEntry[] {
  return entries
    .filter((entry) => glossaryMatches(entry, query))
    .sort((a, b) => a.term.localeCompare(b.term, "fr"));
}
