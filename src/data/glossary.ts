import type { GlossaryEntry } from "../core/types.ts";
import coreRulesGlossary from "./glossary/core-rules.json";

export const glossary: GlossaryEntry[] = [...(coreRulesGlossary as GlossaryEntry[])];
