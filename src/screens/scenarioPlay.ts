import { getScenarioById } from "../data/scenarios.ts";
import { store } from "../core/store.ts";
import type { Scenario } from "../core/types.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

interface PlayState {
  scenario: Scenario;
  /** Index of the decision currently on screen. */
  stepIndex: number;
  /** The choice picked for the current step, or null while it is still open. */
  selectedIndex: number | null;
  correctSteps: number;
  finished: boolean;
}

let active: PlayState | null = null;

function startScenario(scenario: Scenario): void {
  active = { scenario, stepIndex: 0, selectedIndex: null, correctSteps: 0, finished: false };
}

export function renderScenarioPlay(root: HTMLElement, scenarioId: string): void {
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    root.innerHTML = `
      <div class="empty-state">
        <p>Cas pratique introuvable.</p>
        <button class="btn" data-back>Retour</button>
      </div>
    `;
    root.querySelector("[data-back]")?.addEventListener("click", () => navigate("scenarios"));
    return;
  }

  if (!active || active.scenario.id !== scenarioId) {
    startScenario(scenario);
  }
  if (!active) return;

  if (active.finished) {
    renderOutcome(root, scenarioId);
    return;
  }

  const { stepIndex, selectedIndex } = active;
  const step = scenario.steps[stepIndex]!;
  const total = scenario.steps.length;
  const answered = selectedIndex !== null;
  const isLastStep = stepIndex === total - 1;

  const choiceButtons = step.choices
    .map((choice, index) => {
      let cls = "choice-btn";
      if (answered) {
        if (index === step.correctIndex) cls += " choice-btn--correct";
        else if (index === selectedIndex) cls += " choice-btn--incorrect";
      }
      return `<button class="${cls}" data-choice="${index}" ${answered ? "disabled" : ""}>${escapeHtml(choice)}</button>`;
    })
    .join("");

  const explanation = answered
    ? `
      <div class="explanation">
        <div class="explanation__feedback">${selectedIndex === step.correctIndex ? "Correct !" : "Pas tout à fait."}</div>
        <div>${escapeHtml(step.explanation)}</div>
        <button class="btn btn--primary btn--block" data-next>${isLastStep ? "Voir le bilan" : "Décision suivante"}</button>
      </div>
    `
    : "";

  root.innerHTML = `
    <div class="hud">
      <span>${escapeHtml(scenario.title)}</span>
      <span>Décision ${stepIndex + 1}/${total}</span>
    </div>
    <div class="scenario-situation">
      <span class="sequence-zone__label">Situation</span>
      <p>${escapeHtml(scenario.situation)}</p>
    </div>
    <div class="question-card">
      <p class="question-card__prompt">${escapeHtml(step.prompt)}</p>
      <div class="choice-list">${choiceButtons}</div>
      ${explanation}
    </div>
    <button class="btn btn--block" data-back>Abandonner le cas</button>
  `;

  if (!answered) {
    root.querySelectorAll<HTMLButtonElement>("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => handleChoice(root, scenarioId, Number(btn.dataset.choice)));
    });
  } else {
    root.querySelector("[data-next]")?.addEventListener("click", () => handleNext(root, scenarioId));
  }

  root.querySelector("[data-back]")?.addEventListener("click", () => navigate("scenarios"));
}

function renderOutcome(root: HTMLElement, scenarioId: string): void {
  if (!active) return;
  const { scenario, correctSteps } = active;
  const total = scenario.steps.length;
  const perfect = correctSteps === total;

  root.innerHTML = `
    <h2 class="screen-title">${escapeHtml(scenario.title)}</h2>
    <div class="results-summary">
      <span class="badge badge--muted">Cas pratique</span>
      <div class="results-summary__score">${correctSteps}/${total}</div>
      <p class="text-muted">${
        perfect
          ? "Sans faute — l'enchaînement est maîtrisé."
          : "Relisez les explications, puis retentez le cas pour ancrer l'enchaînement."
      }</p>
      ${scenario.sourceRef ? `<p class="text-muted">Source : ${escapeHtml(scenario.sourceRef)}</p>` : ""}
    </div>
    <button class="btn btn--primary btn--block" data-retry>Refaire ce cas</button>
    <button class="btn btn--block" data-back>Retour aux cas pratiques</button>
  `;

  root.querySelector("[data-retry]")?.addEventListener("click", () => {
    startScenario(scenario);
    renderScenarioPlay(root, scenarioId);
  });
  root.querySelector("[data-back]")?.addEventListener("click", () => navigate("scenarios"));
}

function handleChoice(root: HTMLElement, scenarioId: string, choiceIndex: number): void {
  if (!active || active.selectedIndex !== null) return;

  const step = active.scenario.steps[active.stepIndex]!;
  active.selectedIndex = choiceIndex;
  if (choiceIndex === step.correctIndex) active.correctSteps += 1;

  renderScenarioPlay(root, scenarioId);
}

function handleNext(root: HTMLElement, scenarioId: string): void {
  if (!active) return;

  if (active.stepIndex === active.scenario.steps.length - 1) {
    active.finished = true;
    store.recordScenarioAttempt(
      active.scenario.id,
      active.correctSteps,
      active.scenario.steps.length,
      Date.now(),
    );
  } else {
    active.stepIndex += 1;
    active.selectedIndex = null;
  }

  renderScenarioPlay(root, scenarioId);
}
