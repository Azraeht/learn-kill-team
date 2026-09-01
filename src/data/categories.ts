import type { Category, Question } from "../core/types.ts";
import coreRulesQuestions from "./questions/core-rules.json";
import terrainMissionsQuestions from "./questions/terrain-missions.json";
import angelsOfDeathQuestions from "./questions/angels-of-death.json";

export const categories: Category[] = [
  {
    id: "core-rules",
    label: "Core Rules",
    description: "Activations, APL, actions, engagement range, cover, injured state.",
    color: "#5b8def",
  },
  {
    id: "terrain-missions",
    label: "Terrain & Missions",
    description: "Kill zones, terrain traits, and mission objectives.",
    color: "#2fb380",
  },
  {
    id: "angels-of-death",
    label: "Angels of Death",
    description: "Space Marines kill team rules and keywords.",
    color: "#c9463f",
  },
];

const questionsByCategory: Record<string, Question[]> = {
  "core-rules": coreRulesQuestions as Question[],
  "terrain-missions": terrainMissionsQuestions as Question[],
  "angels-of-death": angelsOfDeathQuestions as Question[],
};

export const allQuestions: Question[] = Object.values(questionsByCategory).flat();

export function getQuestionsForCategory(categoryId: string): Question[] {
  return questionsByCategory[categoryId] ?? [];
}
