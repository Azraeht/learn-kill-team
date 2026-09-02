import type { Category, Question } from "../core/types.ts";
import coreRulesQuestions from "./questions/core-rules.json";
import terrainMissionsQuestions from "./questions/terrain-missions.json";
import angelsOfDeathQuestions from "./questions/angels-of-death.json";

export const categories: Category[] = [
  {
    id: "core-rules",
    label: "Règles de Base",
    description: "Activations, LPA, actions, portée de contrôle, couvert, dégâts.",
    color: "#5b8def",
  },
  {
    id: "terrain-missions",
    label: "Terrain et Missions",
    description: "Kill zones, traits de terrain et objectifs de mission.",
    color: "#2fb380",
  },
  {
    id: "angels-of-death",
    label: "Angels of Death",
    description: "Règles et mots-clés de la kill team Space Marines.",
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
