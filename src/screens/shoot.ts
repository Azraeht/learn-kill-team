import { killTeams, getKillTeam } from "../data/killteams/index.ts";
import type { KillTeam, Operative, RangedWeapon } from "../core/killTeamTypes.ts";
import { computeShot, type ShotConditions, type ShotSummary } from "../core/shooting.ts";
import { parseRule, ruleLabel } from "../core/weaponRules.ts";

const STORAGE_KEY = "kt-learn:shoot:v1";

interface ShootState {
  teamId?: string;
  operativeId?: string;
  weaponId?: string;
  pickerOpen: boolean;
  conditions: ShotConditions;
}

const defaultConditions: ShotConditions = {
  inCover: false,
  obscured: false,
  targetConceal: false,
  shooterInjured: false,
  targetSave: 3,
};

function loadState(): ShootState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ShootState>;
      return {
        teamId: parsed.teamId,
        operativeId: parsed.operativeId,
        weaponId: parsed.weaponId,
        pickerOpen: !parsed.weaponId,
        conditions: { ...defaultConditions, ...parsed.conditions },
      };
    }
  } catch {
    // ignore corrupted storage
  }
  return { pickerOpen: true, conditions: { ...defaultConditions } };
}

function saveState(state: ShootState): void {
  try {
    const { teamId, operativeId, weaponId, conditions } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamId, operativeId, weaponId, conditions }));
  } catch {
    // storage unavailable — keep in memory only
  }
}

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

const weaponRulesShort = (w: RangedWeapon): string =>
  w.rules.length ? w.rules.map((r) => ruleLabel(parseRule(r))).join(" · ") : "—";

const profile = (w: RangedWeapon): string => `A${w.atk} · ${w.hit}+ · ${w.dmg[0]}/${w.dmg[1]}`;

let state: ShootState = loadState();

export function renderShoot(root: HTMLElement): void {
  const team: KillTeam | undefined = getKillTeam(state.teamId) ?? (killTeams.length === 1 ? killTeams[0] : undefined);
  const operative: Operative | undefined = team?.operatives.find((o) => o.id === state.operativeId);
  const weapon: RangedWeapon | undefined = operative?.weapons.find((w) => w.id === state.weaponId);
  const pickerOpen = state.pickerOpen || !weapon;

  const draftBadge = team?.status === "draft" ? `<span class="badge badge--draft">Profils à vérifier</span>` : "";

  const selectionHtml = pickerOpen
    ? renderPicker(team, operative, weapon)
    : `
      <button class="shoot-selection" data-open-picker>
        <span class="shoot-selection__main">
          <span class="shoot-selection__op">${esc(operative!.name)}</span>
          <span class="shoot-selection__weapon">${esc(weapon!.name)} — ${profile(weapon!)}</span>
        </span>
        <span class="shoot-selection__edit">Changer</span>
      </button>`;

  root.innerHTML = `
    <div class="shoot-header">
      <h2 class="screen-title">Assistant de tir</h2>
      ${draftBadge}
    </div>
    ${selectionHtml}
    ${weapon && operative ? renderConditions(operative) + renderSummary(computeShot(weapon, state.conditions)) : ""}
  `;

  bind(root, team, operative);
}

function renderPicker(team: KillTeam | undefined, operative: Operative | undefined, weapon: RangedWeapon | undefined): string {
  const teamSelect = `<div class="shoot-section">
      <label class="shoot-label" for="team-select">Équipe</label>
      <select id="team-select" class="team-select" data-team-select>
        ${team ? "" : `<option value="" selected disabled>Choisir une équipe…</option>`}
        ${killTeams
          .map(
            (t) =>
              `<option value="${t.id}" ${t.id === team?.id ? "selected" : ""}>${esc(t.name)}${
                t.nameEn && t.nameEn !== t.name ? ` (${esc(t.nameEn)})` : ""
              }</option>`,
          )
          .join("")}
      </select>
    </div>`;

  const agents = team
    ? `<div class="shoot-section">
        <div class="shoot-label">Agent</div>
        <div class="pick-grid">${team.operatives
          .map(
            (o) =>
              `<button class="pick-btn ${o.id === operative?.id ? "pick-btn--on" : ""}" data-operative="${o.id}">
                <span class="pick-btn__title">${esc(o.name)}</span>
                <span class="pick-btn__sub">Svg ${o.save}+ · ${o.wounds} PV</span>
              </button>`,
          )
          .join("")}</div>
      </div>`
    : "";

  const weapons = operative
    ? `<div class="shoot-section">
        <div class="shoot-label">Arme</div>
        <div class="weapon-list">${operative.weapons
          .map(
            (w) =>
              `<button class="weapon-btn ${w.id === weapon?.id ? "weapon-btn--on" : ""}" data-weapon="${w.id}">
                <span class="weapon-btn__top">
                  <span class="weapon-btn__name">${esc(w.name)}</span>
                  <span class="weapon-btn__profile">${profile(w)}</span>
                </span>
                <span class="weapon-btn__rules">${esc(weaponRulesShort(w))}</span>
              </button>`,
          )
          .join("")}</div>
      </div>`
    : "";

  return `<div class="shoot-picker">${teamSelect}${agents}${weapons}</div>`;
}

function toggle(key: keyof ShotConditions, label: string, sub = ""): string {
  const on = Boolean(state.conditions[key]);
  return `<button class="toggle ${on ? "toggle--on" : ""}" data-toggle="${key}" aria-pressed="${on}">
    <span class="toggle__label">${label}</span>${sub ? `<span class="toggle__sub">${sub}</span>` : ""}
  </button>`;
}

function renderConditions(operative: Operative): string {
  const saves = [2, 3, 4, 5, 6]
    .map(
      (s) =>
        `<button class="chip ${state.conditions.targetSave === s ? "chip--on" : ""}" data-save="${s}">${s}+</button>`,
    )
    .join("");
  return `
    <div class="shoot-section">
      <div class="shoot-label shoot-label--row">Cible <button class="link-btn" data-reset>Réinitialiser</button></div>
      <div class="toggle-grid">
        ${toggle("inCover", "À couvert")}
        ${toggle("obscured", "Masquée", "Obscured")}
        ${toggle("targetConceal", "Dissimulation", "Ordre Conceal")}
        ${toggle("shooterInjured", "Tireur blessé", `PV < ${Math.ceil(operative.wounds / 2)}`)}
      </div>
      <div class="save-row">
        <span class="shoot-label">Sauvegarde de la cible</span>
        <div class="chip-row">${saves}</div>
      </div>
    </div>`;
}

const list = (title: string, items: string[]): string =>
  items.length
    ? `<div class="summary-block"><div class="summary-block__title">${title}</div><ul>${items
        .map((i) => `<li>${esc(i)}</li>`)
        .join("")}</ul></div>`
    : "";

function renderSummary(s: ShotSummary): string {
  const validity = s.validity.length
    ? `<div class="shoot-alert ${s.valid ? "shoot-alert--warn" : "shoot-alert--danger"}">${s.validity
        .map(esc)
        .join("<br>")}</div>`
    : "";

  const hitMod = s.attack.hit !== s.attack.baseHit ? ` <span class="dice-tile__mod">(${s.attack.baseHit}+ ↘)</span>` : "";
  const defenceMain = s.defence.coverSave ? `${s.defence.rolled}D6 <span class="dice-tile__plus">+1</span>` : `${s.defence.rolled}D6`;

  return `
    <section class="shoot-summary ${s.valid ? "" : "shoot-summary--invalid"}">
      ${validity}
      <div class="dice-tiles">
        <div class="dice-tile dice-tile--atk">
          <div class="dice-tile__label">Attaque</div>
          <div class="dice-tile__value">${s.attack.dice}D6</div>
          <div class="dice-tile__detail">Touche ${s.attack.hit}+${hitMod}<br>Crit ${s.attack.crit === 6 ? "6" : `${s.attack.crit}+`}</div>
        </div>
        <div class="dice-tile dice-tile--def">
          <div class="dice-tile__label">Défense</div>
          <div class="dice-tile__value">${defenceMain}</div>
          <div class="dice-tile__detail">Svg ${s.defence.save}+${s.defence.coverSave ? "<br>+1 couvert" : "<br>&nbsp;"}</div>
        </div>
        <div class="dice-tile dice-tile--dmg">
          <div class="dice-tile__label">Dégâts</div>
          <div class="dice-tile__value">${s.damage.normal}<span class="dice-tile__sep">/</span>${s.damage.crit}</div>
          <div class="dice-tile__detail">Normal / Crit<br>&nbsp;</div>
        </div>
      </div>
      ${list("Avant le tir", s.before)}
      ${list("Jet d'attaque", s.attack.steps)}
      ${list("Jet de défense", s.defence.steps)}
      ${list("Dégâts", s.damage.steps)}
      ${list("Après le tir", s.after)}
      ${
        s.rules.length || s.unknownRules.length
          ? `<details class="summary-block summary-rules">
              <summary class="summary-block__title">Règles de l'arme (${s.rules.length + s.unknownRules.length})</summary>
              <dl>${s.rules
                .map((r) => `<dt>${esc(r.label)} <span class="text-muted">(${esc(r.en)})</span></dt><dd>${esc(r.text)}</dd>`)
                .join("")}${s.unknownRules
                .map((r) => `<dt>${esc(r)}</dt><dd class="text-muted">Règle non reconnue par l'outil : voir la fiche.</dd>`)
                .join("")}</dl>
            </details>`
          : ""
      }
    </section>`;
}

function update(root: HTMLElement, patch: Partial<ShootState>): void {
  state = { ...state, ...patch };
  saveState(state);
  renderShoot(root);
}

function bind(root: HTMLElement, team: KillTeam | undefined, operative: Operative | undefined): void {
  root.querySelector("[data-open-picker]")?.addEventListener("click", () => update(root, { pickerOpen: true }));

  root.querySelector<HTMLSelectElement>("[data-team-select]")?.addEventListener("change", (e) => {
    const teamId = (e.target as HTMLSelectElement).value;
    if (teamId === team?.id) return;
    update(root, { teamId, operativeId: undefined, weaponId: undefined, pickerOpen: true });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-operative]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const op = team?.operatives.find((o) => o.id === btn.dataset.operative);
      if (!op) return;
      // Keep the same weapon if the new agent has it too; auto-pick if it only has one.
      const keep = op.weapons.find((w) => w.id === state.weaponId);
      const weaponId = op.weapons.length === 1 ? op.weapons[0].id : keep?.id;
      update(root, {
        teamId: team?.id,
        operativeId: op.id,
        weaponId,
        pickerOpen: op.weapons.length !== 1,
        conditions: { ...state.conditions, shooterInjured: false },
      });
      if (op.weapons.length === 1) window.scrollTo(0, 0);
    }),
  );

  root.querySelectorAll<HTMLButtonElement>("[data-weapon]").forEach((btn) =>
    btn.addEventListener("click", () => {
      update(root, { teamId: team?.id, operativeId: operative?.id, weaponId: btn.dataset.weapon, pickerOpen: false });
      window.scrollTo(0, 0);
    }),
  );

  root.querySelectorAll<HTMLButtonElement>("[data-toggle]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.toggle as keyof ShotConditions;
      update(root, { conditions: { ...state.conditions, [key]: !state.conditions[key] } });
    }),
  );

  root.querySelector("[data-reset]")?.addEventListener("click", () =>
    update(root, { conditions: { ...defaultConditions, targetSave: state.conditions.targetSave } }),
  );

  root.querySelectorAll<HTMLButtonElement>("[data-save]").forEach((btn) =>
    btn.addEventListener("click", () =>
      update(root, { conditions: { ...state.conditions, targetSave: Number(btn.dataset.save) } }),
    ),
  );
}
