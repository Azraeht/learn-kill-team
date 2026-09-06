import { dayKey } from "./activity.ts";
import {
  adjustPlayerCp,
  adjustPlayerVp,
  adjustTurningPoint,
  applyTurningPointAdvance,
  createInitialMatchTracker,
  setInitiativeHolder,
  setPlayerName,
} from "./matchTracker.ts";
import { createInitialCardProgress, nextCardProgress } from "./srs.ts";
import type {
  Attempt,
  CardProgress,
  CategoryId,
  DayActivity,
  MatchTrackerState,
  PersistedState,
  ScenarioProgress,
  SequenceProgress,
} from "./types.ts";

const STORAGE_KEY = "kt-learn:v1";
const MAX_SESSION_LOG = 500;
const DEFAULT_BATCH_SIZE = 15;

export const BATCH_SIZE_OPTIONS = [5, 10, 15, 20, 30] as const;

function createDefaultState(): PersistedState {
  return {
    version: 1,
    progress: {},
    sessionLog: [],
    settings: { batchSize: DEFAULT_BATCH_SIZE },
    sequenceProgress: {},
    scenarioProgress: {},
    dailyActivity: {},
    matchTracker: createInitialMatchTracker(),
  };
}

/**
 * Fills in any fields missing from a previously persisted state. New fields are
 * added with defaults rather than bumping `version`, so existing users keep their
 * progress when the app gains a feature.
 */
function normalizeState(parsed: Partial<PersistedState>): PersistedState {
  return {
    version: 1,
    progress: parsed.progress ?? {},
    sessionLog: parsed.sessionLog ?? [],
    settings: { batchSize: parsed.settings?.batchSize ?? DEFAULT_BATCH_SIZE },
    sequenceProgress: parsed.sequenceProgress ?? {},
    scenarioProgress: parsed.scenarioProgress ?? {},
    dailyActivity: parsed.dailyActivity ?? {},
    matchTracker: parsed.matchTracker ?? createInitialMatchTracker(),
  };
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return createDefaultState();
    return normalizeState(parsed);
  } catch {
    return createDefaultState();
  }
}

function createInitialSequenceProgress(): SequenceProgress {
  return { timesAttempted: 0, timesFullyCorrect: 0, bestCorrectCount: 0, lastAttemptAt: null };
}

function createInitialScenarioProgress(): ScenarioProgress {
  return { timesAttempted: 0, timesPerfect: 0, bestCorrectSteps: 0, lastAttemptAt: null };
}

function persist(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.) — state stays in-memory only.
  }
}

/**
 * Recognises an object as a state export we can restore. Deliberately shallow: the
 * per-field normalisation in normalizeState() handles anything missing or malformed
 * beyond this point, so a partially-corrupt file degrades instead of being rejected.
 */
export function isImportableState(value: unknown): value is Partial<PersistedState> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PersistedState>;
  if (candidate.version !== 1) return false;
  return typeof candidate.progress === "object" && candidate.progress !== null;
}

type Listener = () => void;

class Store {
  private state: PersistedState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = loadState();
  }

  getState(): PersistedState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  private commit(next: PersistedState): void {
    this.state = next;
    persist(this.state);
    this.notify();
  }

  /**
   * Records study activity against today's local date. Every mode (quiz, sequence,
   * scenario) funnels through here so the streak reflects all practice, not just quizzes.
   */
  private withDailyActivity(
    state: PersistedState,
    answered: number,
    correct: number,
    now: number,
  ): PersistedState {
    const key = dayKey(now);
    const existing: DayActivity = state.dailyActivity[key] ?? { answered: 0, correct: 0 };
    return {
      ...state,
      dailyActivity: {
        ...state.dailyActivity,
        [key]: { answered: existing.answered + answered, correct: existing.correct + correct },
      },
    };
  }

  getCardProgress(questionId: string, now: number): CardProgress {
    return this.state.progress[questionId] ?? createInitialCardProgress(now);
  }

  recordAnswer(questionId: string, categoryId: CategoryId, correct: boolean, now: number): void {
    const current = this.getCardProgress(questionId, now);
    const updated = nextCardProgress(current, correct, now);

    const attempt: Attempt = { questionId, categoryId, correct, at: now };
    const sessionLog = [...this.state.sessionLog, attempt].slice(-MAX_SESSION_LOG);

    this.commit(
      this.withDailyActivity(
        {
          ...this.state,
          progress: { ...this.state.progress, [questionId]: updated },
          sessionLog,
        },
        1,
        correct ? 1 : 0,
        now,
      ),
    );
  }

  getSequenceProgress(sequenceId: string): SequenceProgress {
    return this.state.sequenceProgress[sequenceId] ?? createInitialSequenceProgress();
  }

  recordSequenceAttempt(
    sequenceId: string,
    correctCount: number,
    fullyCorrect: boolean,
    now: number,
    totalSteps = correctCount,
  ): void {
    const current = this.getSequenceProgress(sequenceId);
    const updated: SequenceProgress = {
      timesAttempted: current.timesAttempted + 1,
      timesFullyCorrect: current.timesFullyCorrect + (fullyCorrect ? 1 : 0),
      bestCorrectCount: Math.max(current.bestCorrectCount, correctCount),
      lastAttemptAt: now,
    };

    this.commit(
      this.withDailyActivity(
        { ...this.state, sequenceProgress: { ...this.state.sequenceProgress, [sequenceId]: updated } },
        totalSteps,
        correctCount,
        now,
      ),
    );
  }

  getScenarioProgress(scenarioId: string): ScenarioProgress {
    return this.state.scenarioProgress[scenarioId] ?? createInitialScenarioProgress();
  }

  recordScenarioAttempt(
    scenarioId: string,
    correctSteps: number,
    totalSteps: number,
    now: number,
  ): void {
    const current = this.getScenarioProgress(scenarioId);
    const updated: ScenarioProgress = {
      timesAttempted: current.timesAttempted + 1,
      timesPerfect: current.timesPerfect + (correctSteps === totalSteps ? 1 : 0),
      bestCorrectSteps: Math.max(current.bestCorrectSteps, correctSteps),
      lastAttemptAt: now,
    };

    this.commit(
      this.withDailyActivity(
        { ...this.state, scenarioProgress: { ...this.state.scenarioProgress, [scenarioId]: updated } },
        totalSteps,
        correctSteps,
        now,
      ),
    );
  }

  setBatchSize(batchSize: number): void {
    this.commit({ ...this.state, settings: { ...this.state.settings, batchSize } });
  }

  getMatchTracker(): MatchTrackerState {
    return this.state.matchTracker;
  }

  private commitMatchTracker(next: MatchTrackerState): void {
    this.commit({ ...this.state, matchTracker: next });
  }

  advanceTurningPoint(): void {
    this.commitMatchTracker(applyTurningPointAdvance(this.state.matchTracker));
  }

  adjustTurningPoint(delta: number): void {
    this.commitMatchTracker(adjustTurningPoint(this.state.matchTracker, delta));
  }

  adjustPlayerCp(index: 0 | 1, delta: number): void {
    this.commitMatchTracker(adjustPlayerCp(this.state.matchTracker, index, delta));
  }

  adjustPlayerVp(index: 0 | 1, delta: number): void {
    this.commitMatchTracker(adjustPlayerVp(this.state.matchTracker, index, delta));
  }

  setPlayerName(index: 0 | 1, name: string): void {
    this.commitMatchTracker(setPlayerName(this.state.matchTracker, index, name));
  }

  setInitiativeHolder(index: 0 | 1 | null): void {
    this.commitMatchTracker(setInitiativeHolder(this.state.matchTracker, index));
  }

  resetMatchTracker(): void {
    this.commitMatchTracker(createInitialMatchTracker());
  }

  /** Serialised progress for the export-to-file button on the settings screen. */
  exportState(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /** Replaces all progress with an imported export. Returns false if it isn't one. */
  importState(raw: string): boolean {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return false;
    }
    if (!isImportableState(parsed)) return false;

    this.commit(normalizeState(parsed));
    return true;
  }

  /**
   * Resets learning progress only. The match tracker is a separate concept — an
   * in-progress tabletop game's score — and resetting your quiz history shouldn't
   * also wipe VP/CP you're tracking live at the table; use resetMatchTracker() for that.
   */
  resetProgress(): void {
    this.commit({ ...createDefaultState(), matchTracker: this.state.matchTracker });
  }
}

export const store = new Store();
