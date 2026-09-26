import { glossary } from "../data/glossary.ts";
import { shootingDiagramPhases } from "../data/shootingDiagram.ts";
import type { FlowNode } from "../data/shootingDiagram.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

function weaponRuleChip(term: string): string {
  const entry = glossary.find((g) => g.term === term);
  const title = entry ? escapeHtml(entry.definition) : "";
  return `<span class="diagram-chip" title="${title}">${escapeHtml(term)}</span>`;
}

function weaponRulesHtml(rules?: string[]): string {
  if (!rules || rules.length === 0) return "";
  return `<div class="diagram-chip-list">${rules.map(weaponRuleChip).join("")}</div>`;
}

function noteHtml(note?: string): string {
  if (!note) return "";
  return `<p class="diagram-note">${escapeHtml(note)}</p>`;
}

function draftBadgeHtml(draft?: boolean): string {
  return draft ? '<span class="badge badge--draft">Brouillon — non vérifié</span>' : "";
}

function renderNode(node: FlowNode): string {
  if (node.kind === "outcome") {
    return `
      <div class="diagram-node diagram-node--outcome diagram-node--${node.tone}">
        <p>${escapeHtml(node.text)}</p>
        ${draftBadgeHtml(node.draft)}
      </div>
    `;
  }

  if (node.kind === "link") {
    return `
      <button class="diagram-node diagram-node--link" data-jump="${escapeHtml(node.phaseId)}">
        <span>↳ ${escapeHtml(node.label)}</span>
      </button>
    `;
  }

  if (node.kind === "step") {
    return `
      <div class="diagram-node diagram-node--step">
        <p>${escapeHtml(node.text)}</p>
        ${draftBadgeHtml(node.draft)}
        ${weaponRulesHtml(node.weaponRules)}
      </div>
      <div class="diagram-connector"></div>
      ${renderNode(node.next)}
    `;
  }

  return `
    <div class="diagram-node diagram-node--decision">
      <p>${escapeHtml(node.question)}</p>
      ${weaponRulesHtml(node.weaponRules)}
      ${noteHtml(node.note)}
    </div>
    <div class="diagram-branches">
      <div class="diagram-branch diagram-branch--oui">
        <span class="diagram-branch__label">OUI</span>
        ${renderNode(node.oui)}
      </div>
      <div class="diagram-branch diagram-branch--non">
        <span class="diagram-branch__label">NON</span>
        ${renderNode(node.non)}
      </div>
    </div>
  `;
}

function phaseHtml(phaseIndex: number): string {
  const phase = shootingDiagramPhases[phaseIndex];
  return `
    <section class="diagram-phase" data-phase="${escapeHtml(phase.id)}">
      <h3 class="diagram-phase__title">${escapeHtml(phase.title)}</h3>
      <div class="diagram-tree">${renderNode(phase.root)}</div>
    </section>
  `;
}

export function renderShootingDiagram(root: HTMLElement): void {
  const phasesHtml = shootingDiagramPhases.map((_, index) => phaseHtml(index)).join("");

  root.innerHTML = `
    <h2 class="screen-title">Diagramme de tir</h2>
    <p class="text-muted">
      Résolution complète de l'action Tirer, phase par phase : éligibilité, choix de la cible, jets de
      dés, couvert, et règles d'armes qui modifient les relances ou le couvert. Suivez OUI/NON à chaque
      étape ; les flèches ↳ font passer à la phase suivante.
    </p>
    ${phasesHtml}
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = root.querySelector<HTMLElement>(`[data-phase="${btn.dataset.jump}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
