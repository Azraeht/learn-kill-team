import { createInitialCardProgress, nextCardProgress } from "./srs.ts";
import type { Attempt, CardProgress, CategoryId, PersistedState } from "./types.ts";

const STORAGE_KEY = "kt-learn:v1";
const MAX_SESSION_LOG = 500;
const DEFAULT_BATCH_SIZE = 15;

function createDefaultState(): PersistedState {
  return {
    version: 1,
    progress: {},
    sessionLog: [],
    settings: { batchSize: DEFAULT_BATCH_SIZE },
  };
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return createDefaultState();
    return {
      version: 1,
      progress: parsed.progress ?? {},
      sessionLog: parsed.sessionLog ?? [],
      settings: { batchSize: parsed.settings?.batchSize ?? DEFAULT_BATCH_SIZE },
    };
  } catch {
    return createDefaultState();
  }
}

function persist(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.) — state stays in-memory only.
  }
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

  getCardProgress(questionId: string, now: number): CardProgress {
    return this.state.progress[questionId] ?? createInitialCardProgress(now);
  }

  recordAnswer(questionId: string, categoryId: CategoryId, correct: boolean, now: number): void {
    const current = this.getCardProgress(questionId, now);
    const updated = nextCardProgress(current, correct, now);

    const attempt: Attempt = { questionId, categoryId, correct, at: now };
    const sessionLog = [...this.state.sessionLog, attempt].slice(-MAX_SESSION_LOG);

    this.state = {
      ...this.state,
      progress: { ...this.state.progress, [questionId]: updated },
      sessionLog,
    };

    persist(this.state);
    this.notify();
  }

  resetProgress(): void {
    this.state = createDefaultState();
    persist(this.state);
    this.notify();
  }
}

export const store = new Store();
