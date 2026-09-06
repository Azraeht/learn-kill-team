export type CategoryId =
  | "core-rules"
  | "terrain-missions"
  | "aquilon-tempestus"
  | "frelons-vespides"
  | "yaegirs-hernkogs"
  | "exo-armures-stealth"
  | "cibleurs"
  | "cercle-canoptek"
  | "deathwatch";

export type QuestionType = "multiple-choice" | "true-false";

export type QuestionStatus = "draft" | "verified";

export interface Question {
  id: string;
  category: CategoryId;
  subtopic?: string;
  type: QuestionType;
  prompt: string;
  choices?: string[];
  correctIndex: number;
  explanation?: string;
  status: QuestionStatus;
  sourceRef?: string;
  tags?: string[];
}

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
  color: string;
}

export interface CardProgress {
  box: number;
  ease: number;
  dueAt: number;
  lastSeenAt: number | null;
  timesSeen: number;
  timesCorrect: number;
  consecutiveCorrect: number;
}

export interface Attempt {
  questionId: string;
  categoryId: CategoryId;
  correct: boolean;
  at: number;
}

export interface AppSettings {
  batchSize: number;
}

export interface Sequence {
  id: string;
  category: CategoryId;
  title: string;
  description?: string;
  steps: string[];
  status: QuestionStatus;
  sourceRef?: string;
}

export interface SequenceProgress {
  timesAttempted: number;
  timesFullyCorrect: number;
  bestCorrectCount: number;
  lastAttemptAt: number | null;
}

/** One decision point inside a scenario: a situation to read, then a choice to make. */
export interface ScenarioStep {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface Scenario {
  id: string;
  category: CategoryId;
  title: string;
  /** The tabletop situation the player is asked to reason about, read before step 1. */
  situation: string;
  steps: ScenarioStep[];
  status: QuestionStatus;
  sourceRef?: string;
}

export interface ScenarioProgress {
  timesAttempted: number;
  timesPerfect: number;
  bestCorrectSteps: number;
  lastAttemptAt: number | null;
}

/** Answer counts for a single local calendar day, keyed 'YYYY-MM-DD'. */
export interface DayActivity {
  answered: number;
  correct: number;
}

export interface PersistedState {
  version: 1;
  progress: Record<string, CardProgress>;
  sessionLog: Attempt[];
  settings: AppSettings;
  sequenceProgress: Record<string, SequenceProgress>;
  scenarioProgress: Record<string, ScenarioProgress>;
  dailyActivity: Record<string, DayActivity>;
}
