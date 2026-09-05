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

export interface PersistedState {
  version: 1;
  progress: Record<string, CardProgress>;
  sessionLog: Attempt[];
  settings: AppSettings;
}
