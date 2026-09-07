import { describe, expect, it } from "vitest";
import { filterGlossary, glossaryMatches } from "./glossarySearch.ts";
import type { GlossaryEntry } from "./types.ts";

function entry(term: string, definition = "Definition text."): GlossaryEntry {
  return { id: `gl-${term}`, term, category: "core-rules", definition, status: "verified" };
}

describe("glossaryMatches", () => {
  it("matches everything on an empty query", () => {
    expect(glossaryMatches(entry("Brutale"), "")).toBe(true);
    expect(glossaryMatches(entry("Brutale"), "   ")).toBe(true);
  });

  it("matches a term substring, case-insensitively", () => {
    expect(glossaryMatches(entry("Brutale"), "brut")).toBe(true);
    expect(glossaryMatches(entry("Brutale"), "BRUT")).toBe(true);
  });

  it("matches ignoring accents", () => {
    expect(glossaryMatches(entry("Étourdissant"), "etourdi")).toBe(true);
  });

  it("does not match on the definition text", () => {
    const e = entry("Brutale", "Votre adversaire ne peut bloquer qu'avec des critiques.");
    expect(glossaryMatches(e, "adversaire")).toBe(false);
  });

  it("does not match an unrelated term", () => {
    expect(glossaryMatches(entry("Brutale"), "silencieuse")).toBe(false);
  });
});

describe("filterGlossary", () => {
  it("returns all entries sorted alphabetically for an empty query", () => {
    const entries = [entry("Vengeresse"), entry("Brutale"), entry("Étourdissant")];
    expect(filterGlossary(entries, "").map((e) => e.term)).toEqual([
      "Brutale",
      "Étourdissant",
      "Vengeresse",
    ]);
  });

  it("filters down to matching terms only", () => {
    const entries = [entry("Brutale"), entry("Létal x+"), entry("Précision x")];
    expect(filterGlossary(entries, "x").map((e) => e.term)).toEqual(["Létal x+", "Précision x"]);
  });

  it("returns an empty list when nothing matches", () => {
    const entries = [entry("Brutale")];
    expect(filterGlossary(entries, "zzz")).toEqual([]);
  });
});
