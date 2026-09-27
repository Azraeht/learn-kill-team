import { glossary } from "../data/glossary.ts";
import { shootingDiagramPhases } from "../data/shootingDiagram.ts";
import type { FlowNode } from "../data/shootingDiagram.ts";
import { navigate } from "../router.ts";
import { escapeHtml } from "../ui/html.ts";

type ArrowTone = "oui" | "non" | "through";

interface FlowEdge {
  from: string;
  to: string;
  tone: ArrowTone;
  label?: string;
  /** For "non" edges only: how many decision-ancestors deep this connection sits. */
  railDepth?: number;
}

const RAIL_MARGIN = 14;
const RAIL_STEP = 10;
/** Must match `.flow-canvas`'s `padding-right` in cards.css — the gutter the rails run through. */
const RAIL_GUTTER = 48;

let nodeCounter = 0;
function nextNodeId(): string {
  nodeCounter += 1;
  return `fn-${nodeCounter}`;
}

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

/**
 * Renders one node plus everything under it, and records every parent-child
 * connection along the way. The "oui" branch of a decision continues in the
 * same column right after it — its arrow is always short, adjacent boxes —
 * while the "non" branch is wrapped in `.flow-indent` and rendered afterwards,
 * so its arrow has to skip over the entire "oui" subtree. That "non" arrow is
 * routed through a side rail instead of cutting straight across the page (see
 * `drawArrows`); `depth` (incremented on every decision, oui or non alike)
 * picks which rail lane it uses so nested "non" arrows never overlap.
 */
function renderTree(node: FlowNode, edges: FlowEdge[], depth: number): { html: string; rootId: string } {
  const id = nextNodeId();

  if (node.kind === "outcome") {
    const html = `
      <div class="flow-box flow-box--outcome flow-box--${node.tone}" data-node-id="${id}">
        <p>${escapeHtml(node.text)}</p>
        ${draftBadgeHtml(node.draft)}
      </div>
    `;
    return { html, rootId: id };
  }

  if (node.kind === "link") {
    const html = `
      <button class="flow-box flow-box--link" data-node-id="${id}" data-jump="${escapeHtml(node.phaseId)}">
        <span class="flow-box__icon" aria-hidden="true">⇒</span>
        <p>${escapeHtml(node.label)}</p>
      </button>
    `;
    return { html, rootId: id };
  }

  if (node.kind === "step") {
    const child = renderTree(node.next, edges, depth);
    edges.push({ from: id, to: child.rootId, tone: "through" });
    const html = `
      <div class="flow-box flow-box--step" data-node-id="${id}">
        <p>${escapeHtml(node.text)}</p>
        ${draftBadgeHtml(node.draft)}
        ${weaponRulesHtml(node.weaponRules)}
      </div>
      ${child.html}
    `;
    return { html, rootId: id };
  }

  // decision
  const ouiChild = renderTree(node.oui, edges, depth + 1);
  edges.push({ from: id, to: ouiChild.rootId, tone: "oui", label: "OUI" });
  const nonChild = renderTree(node.non, edges, depth + 1);
  edges.push({ from: id, to: nonChild.rootId, tone: "non", label: "NON", railDepth: depth });

  const html = `
    <div class="flow-box flow-box--decision" data-node-id="${id}">
      <span class="flow-box__icon" aria-hidden="true">?</span>
      <p>${escapeHtml(node.question)}</p>
      ${weaponRulesHtml(node.weaponRules)}
      ${noteHtml(node.note)}
    </div>
    ${ouiChild.html}
    <div class="flow-indent">${nonChild.html}</div>
  `;
  return { html, rootId: id };
}

/** Builds the SVG arrow marker defs, shared by every phase's overlay. */
function arrowDefsHtml(): string {
  return `
    <defs>
      <marker id="arrow-oui" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="var(--ok)" />
      </marker>
      <marker id="arrow-non" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="var(--danger)" />
      </marker>
      <marker id="arrow-through" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 Z" fill="var(--border-bright)" />
      </marker>
    </defs>
  `;
}

/** Measures every node box inside `canvas` and draws the edges connecting them into `svg`. */
function drawArrows(canvas: HTMLElement, svg: SVGSVGElement, edges: FlowEdge[]): void {
  const width = canvas.scrollWidth;
  const height = canvas.scrollHeight;
  if (width === 0 || height === 0) return;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const canvasRect = canvas.getBoundingClientRect();
  const parts: string[] = [arrowDefsHtml()];

  for (const edge of edges) {
    const fromEl = canvas.querySelector<HTMLElement>(`[data-node-id="${edge.from}"]`);
    const toEl = canvas.querySelector<HTMLElement>(`[data-node-id="${edge.to}"]`);
    if (!fromEl || !toEl) continue;

    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();

    let d: string;
    let lx: number;
    let ly: number;

    if (edge.tone === "non") {
      // Skips over the whole "oui" subtree rendered between these two boxes,
      // so a direct line would cut straight through it. Route it around
      // instead: out the right edge, down a dedicated side rail, back in
      // from the left — one rail lane per nesting depth so nested "non"
      // arrows never run along the same line.
      const railX = width - RAIL_MARGIN - (edge.railDepth ?? 0) * RAIL_STEP;
      const fx = fr.right - canvasRect.left;
      const fy = fr.top + fr.height / 2 - canvasRect.top;
      const tx = tr.left - canvasRect.left;
      const ty = tr.top + tr.height / 2 - canvasRect.top;
      d = `M${fx},${fy} L${railX},${fy} L${railX},${ty} L${tx},${ty}`;
      // Anchored at the gutter's horizontal center (same spot regardless of
      // rail depth — every rail lives in the same gutter) and at the height
      // where the arrow leaves its source box, not at the rail's geometric
      // midpoint: a long rail can run past many unrelated boxes on its way
      // to a distant target, and a midpoint label would land in the middle
      // of one of them instead of reading as "this decision's".
      lx = width - RAIL_GUTTER / 2;
      ly = fy;
    } else {
      const fx = fr.left + fr.width / 2 - canvasRect.left;
      const fy = fr.bottom - canvasRect.top;
      const tx = tr.left + tr.width / 2 - canvasRect.left;
      const ty = tr.top - canvasRect.top;
      const midY = (fy + ty) / 2;
      d = `M${fx},${fy} C${fx},${midY} ${tx},${midY} ${tx},${ty}`;
      lx = (fx + tx) / 2;
      ly = midY;
    }

    parts.push(`<path class="flow-arrow flow-arrow--${edge.tone}" d="${d}" marker-end="url(#arrow-${edge.tone})" />`);

    if (edge.label) {
      parts.push(
        `<g class="flow-arrow-label flow-arrow-label--${edge.tone}"><rect x="${lx - 18}" y="${ly - 9}" width="36" height="18" rx="2" /><text x="${lx}" y="${ly + 4}" text-anchor="middle">${edge.label}</text></g>`,
      );
    }
  }

  svg.innerHTML = parts.join("");
}

function mountPhaseArrows(canvas: HTMLElement, svg: SVGSVGElement, edges: FlowEdge[]): void {
  const redraw = () => drawArrows(canvas, svg, edges);
  redraw();

  const observer = new ResizeObserver(() => {
    if (!canvas.isConnected) {
      observer.disconnect();
      return;
    }
    redraw();
  });
  observer.observe(canvas);

  document.fonts?.ready.then(redraw).catch(() => {});
}

function phaseHtml(phaseIndex: number, edgesByPhase: Map<string, FlowEdge[]>): string {
  const phase = shootingDiagramPhases[phaseIndex];
  const edges: FlowEdge[] = [];
  const { html } = renderTree(phase.root, edges, 0);
  edgesByPhase.set(phase.id, edges);

  return `
    <section class="diagram-phase" data-phase="${escapeHtml(phase.id)}">
      <h3 class="diagram-phase__title">${escapeHtml(phase.title)}</h3>
      <div class="flow-canvas" data-canvas="${escapeHtml(phase.id)}">
        <svg class="flow-arrows" data-arrows="${escapeHtml(phase.id)}"></svg>
        ${html}
      </div>
    </section>
  `;
}

export function renderShootingDiagram(root: HTMLElement): void {
  nodeCounter = 0;
  const edgesByPhase = new Map<string, FlowEdge[]>();
  const phasesHtml = shootingDiagramPhases.map((_, index) => phaseHtml(index, edgesByPhase)).join("");

  root.innerHTML = `
    <h2 class="screen-title">Diagramme de tir</h2>
    <p class="text-muted">
      Résolution complète de l'action Tirer, phase par phase : éligibilité, choix de la cible, jets de
      dés, couvert, et règles d'armes qui modifient les relances ou le couvert. Suivez les flèches OUI/NON
      à chaque étape ; ⇒ fait passer à la phase suivante.
    </p>
    ${phasesHtml}
    <button class="btn btn--block" data-home>Retour à l'accueil</button>
  `;

  for (const phase of shootingDiagramPhases) {
    const canvas = root.querySelector<HTMLElement>(`[data-canvas="${phase.id}"]`);
    const svg = root.querySelector<SVGSVGElement>(`[data-arrows="${phase.id}"]`);
    const edges = edgesByPhase.get(phase.id);
    if (canvas && svg && edges) mountPhaseArrows(canvas, svg, edges);
  }

  root.querySelectorAll<HTMLButtonElement>("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = root.querySelector<HTMLElement>(`[data-phase="${btn.dataset.jump}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  root.querySelector("[data-home]")?.addEventListener("click", () => navigate("home"));
}
