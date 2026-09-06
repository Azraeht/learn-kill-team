import { getSequenceById } from "../data/sequences.ts";
import { store } from "../core/store.ts";
import { checkSequenceOrder, shuffle } from "../core/sequenceGame.ts";
import type { Sequence } from "../core/types.ts";
import { navigate } from "../router.ts";

interface GameState {
  sequence: Sequence;
  pool: string[];
  answer: string[];
  submitted: boolean;
  result: ReturnType<typeof checkSequenceOrder> | null;
}

let active: GameState | null = null;

function startGame(sequence: Sequence): void {
  active = {
    sequence,
    pool: shuffle(sequence.steps),
    answer: [],
    submitted: false,
    result: null,
  };
}

export function renderSequenceGame(root: HTMLElement, sequenceId: string): void {
  const sequence = getSequenceById(sequenceId);

  if (!sequence) {
    root.innerHTML = `
      <div class="empty-state">
        <p>Séquence introuvable.</p>
        <button class="btn" data-back>Retour</button>
      </div>
    `;
    root.querySelector("[data-back]")?.addEventListener("click", () => navigate("sequences"));
    return;
  }

  if (!active || active.sequence.id !== sequenceId) {
    startGame(sequence);
  }
  if (!active) return;

  const { pool, answer, submitted, result } = active;

  const poolHtml = pool
    .map(
      (step) => `<button class="sequence-step-btn" data-pool-step="${escapeAttr(step)}">${step}</button>`,
    )
    .join("");

  const answerHtml = answer
    .map((step, index) => {
      let cls = "sequence-step-btn";
      if (submitted && result) {
        cls += result.correctPositions[index] ? " sequence-step-btn--correct" : " sequence-step-btn--incorrect";
      }
      return `
        <button class="${cls}" data-answer-index="${index}" ${submitted ? "disabled" : ""}>
          <span class="sequence-step-btn__index">${index + 1}</span>
          <span>${step}</span>
        </button>
      `;
    })
    .join("");

  const emptySlots = Math.max(0, sequence.steps.length - answer.length);
  const slotPlaceholders = submitted
    ? ""
    : Array.from({ length: emptySlots })
        .map(() => `<div class="sequence-slot"></div>`)
        .join("");

  const feedback =
    submitted && result
      ? `
        <div class="explanation">
          <div class="explanation__feedback">${result.fullyCorrect ? "Ordre parfait !" : `${result.correctCount}/${result.total} étapes bien placées.`}</div>
          <button class="btn btn--primary btn--block" data-retry>Réessayer</button>
        </div>
      `
      : "";

  root.innerHTML = `
    <h2 class="screen-title">${sequence.title}</h2>
    ${sequence.description ? `<p class="text-muted">${sequence.description}</p>` : ""}
    <div class="sequence-zone">
      <span class="sequence-zone__label">Votre ordre</span>
      <div class="sequence-slot-list">${answerHtml}${slotPlaceholders}</div>
    </div>
    ${
      !submitted
        ? `
          <div class="sequence-zone">
            <span class="sequence-zone__label">Étapes mélangées (touchez pour les placer)</span>
            <div class="sequence-slot-list">${poolHtml}</div>
          </div>
          <button class="btn btn--primary btn--block" data-validate ${answer.length < sequence.steps.length ? "disabled" : ""}>Valider</button>
        `
        : feedback
    }
    <button class="btn btn--block" data-back>Retour aux séquences</button>
  `;

  if (!submitted) {
    root.querySelectorAll<HTMLButtonElement>("[data-pool-step]").forEach((btn) => {
      btn.addEventListener("click", () => handlePick(root, sequenceId, btn.dataset.poolStep ?? ""));
    });
    root.querySelectorAll<HTMLButtonElement>("[data-answer-index]").forEach((btn) => {
      btn.addEventListener("click", () => handleUnpick(root, sequenceId, Number(btn.dataset.answerIndex)));
    });
    root.querySelector("[data-validate]")?.addEventListener("click", () => handleValidate(root, sequenceId));
  } else {
    root.querySelector("[data-retry]")?.addEventListener("click", () => {
      startGame(sequence);
      renderSequenceGame(root, sequenceId);
    });
  }

  root.querySelector("[data-back]")?.addEventListener("click", () => navigate("sequences"));
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function handlePick(root: HTMLElement, sequenceId: string, step: string): void {
  if (!active) return;
  const poolIndex = active.pool.indexOf(step);
  if (poolIndex === -1) return;

  active.pool = [...active.pool.slice(0, poolIndex), ...active.pool.slice(poolIndex + 1)];
  active.answer = [...active.answer, step];

  renderSequenceGame(root, sequenceId);
}

function handleUnpick(root: HTMLElement, sequenceId: string, index: number): void {
  if (!active) return;
  const step = active.answer[index];
  if (step === undefined) return;

  active.answer = [...active.answer.slice(0, index), ...active.answer.slice(index + 1)];
  active.pool = [...active.pool, step];

  renderSequenceGame(root, sequenceId);
}

function handleValidate(root: HTMLElement, sequenceId: string): void {
  if (!active || active.answer.length < active.sequence.steps.length) return;

  const result = checkSequenceOrder(active.sequence.steps, active.answer);
  active.submitted = true;
  active.result = result;

  store.recordSequenceAttempt(active.sequence.id, result.correctCount, result.fullyCorrect, Date.now());

  renderSequenceGame(root, sequenceId);
}
