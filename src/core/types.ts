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
  /**
   * Ids of questions to ask right after this one, regardless of session mode
   * or SRS due state — a drill-down "drawer" on the same topic. A follow-up
   * can itself have follow-ups, so a chain can run arbitrarily deep; the
   * session queues them one at a time as each is answered.
   */
  followUps?: string[];
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

/** A single named-rule lookup entry, e.g. a weapon rule keyword or an order. */
export interface GlossaryEntry {
  id: string;
  term: string;
  category: CategoryId;
  definition: string;
  status: QuestionStatus;
  sourceRef?: string;
}

/** Answer counts for a single local calendar day, keyed 'YYYY-MM-DD'. */
export interface DayActivity {
  answered: number;
  correct: number;
}

/** One side's running totals in the live match tracker (not learning progress). */
export interface MatchTrackerPlayer {
  name: string;
  /** Command points (PC). */
  cp: number;
  /** Victory points (VP) — kept as "vp" rather than "pv" to avoid colliding
   *  with "PV" (points de vie / health), already used elsewhere in the app's
   *  own content for a completely different stat. */
  vp: number;
}

export interface MatchTrackerState {
  turningPoint: number;
  /** Index into `players` of whoever currently holds initiative, or null before it's been decided. */
  initiativeHolder: 0 | 1 | null;
  players: [MatchTrackerPlayer, MatchTrackerPlayer];
}

export interface PersistedState {
  version: 1;
  progress: Record<string, CardProgress>;
  sessionLog: Attempt[];
  settings: AppSettings;
  sequenceProgress: Record<string, SequenceProgress>;
  scenarioProgress: Record<string, ScenarioProgress>;
  dailyActivity: Record<string, DayActivity>;
  matchTracker: MatchTrackerState;
}
