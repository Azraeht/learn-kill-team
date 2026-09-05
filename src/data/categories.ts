import type { Category, Question } from "../core/types.ts";
import coreRulesQuestions from "./questions/core-rules.json";
import terrainMissionsQuestions from "./questions/terrain-missions.json";
import aquilonTempestusQuestions from "./questions/aquilon-tempestus.json";
import frelonsVespidesQuestions from "./questions/frelons-vespides.json";
import yaegirsHernkogsQuestions from "./questions/yaegirs-hernkogs.json";
import exoArmuresStealthQuestions from "./questions/exo-armures-stealth.json";
import cibleursQuestions from "./questions/cibleurs.json";
import cercleCanoptekQuestions from "./questions/cercle-canoptek.json";
import deathwatchQuestions from "./questions/deathwatch.json";

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
    id: "aquilon-tempestus",
    label: "Aquilon du Tempestus",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#e0a020",
  },
  {
    id: "frelons-vespides",
    label: "Frelons Vespides",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#c9d42f",
  },
  {
    id: "yaegirs-hernkogs",
    label: "Yaegirs Hernkogs",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#b5651d",
  },
  {
    id: "exo-armures-stealth",
    label: "Exo-Armures XV26 Stealth",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#4fa3c4",
  },
  {
    id: "cibleurs",
    label: "Cibleurs",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#e0793c",
  },
  {
    id: "cercle-canoptek",
    label: "Cercle Canoptek",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#3ecf8e",
  },
  {
    id: "deathwatch",
    label: "Deathwatch",
    description: "Règle de faction, équipement, subterfuges et opératifs de la kill team.",
    color: "#6b6f7a",
  },
];

const questionsByCategory: Record<string, Question[]> = {
  "core-rules": coreRulesQuestions as Question[],
  "terrain-missions": terrainMissionsQuestions as Question[],
  "aquilon-tempestus": aquilonTempestusQuestions as Question[],
  "frelons-vespides": frelonsVespidesQuestions as Question[],
  "yaegirs-hernkogs": yaegirsHernkogsQuestions as Question[],
  "exo-armures-stealth": exoArmuresStealthQuestions as Question[],
  "cibleurs": cibleursQuestions as Question[],
  "cercle-canoptek": cercleCanoptekQuestions as Question[],
  "deathwatch": deathwatchQuestions as Question[],
};

export const allQuestions: Question[] = Object.values(questionsByCategory).flat();

export function getQuestionsForCategory(categoryId: string): Question[] {
  return questionsByCategory[categoryId] ?? [];
}
