import type { Sequence } from "../core/types.ts";
import coreRulesSequences from "./sequences/core-rules.json";

export const sequences: Sequence[] = [...(coreRulesSequences as Sequence[])];

export function getSequenceById(id: string): Sequence | undefined {
  return sequences.find((s) => s.id === id);
}
