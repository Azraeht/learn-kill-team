import type { Scenario } from "../core/types.ts";
import coreRulesScenarios from "./scenarios/core-rules.json";

export const scenarios: Scenario[] = [...(coreRulesScenarios as Scenario[])];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
