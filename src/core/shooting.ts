// Pure computation of a shooting summary (Kill Team 3rd edition).
// Takes a weapon profile + battlefield conditions and returns what to roll
// and which rules apply at each step. No DOM here — see screens/shoot.ts.

import type { RangedWeapon } from "./killTeamTypes.ts";
import { parseRule, isKnownRule, ruleLabel, WEAPON_RULES, type ParsedRule } from "./weaponRules.ts";

export interface ShotConditions {
  /** Target is in cover (à couvert). */
  inCover: boolean;
  /** Target is obscured (masquée). */
  obscured: boolean;
  /** Target has a Conceal order (Dissimulation). */
  targetConceal: boolean;
  /** Shooter is injured (blessé): Hit stat worsened by 1. */
  shooterInjured: boolean;
  /** Target's Save stat (3 for 3+). */
  targetSave: number;
}

export interface RuleLine {
  label: string;
  en: string;
  text: string;
}

export interface ShotSummary {
  valid: boolean;
  /** Messages about target validity (shown prominently). */
  validity: string[];
  /** Reminders before shooting (Heavy, Range, Limited, Silent...). */
  before: string[];
  attack: {
    dice: number;
    hit: number;
    crit: number;
    /** Base hit stat before injury, to show the modifier. */
    baseHit: number;
    steps: string[];
  };
  defence: {
    /** Defence dice collected after Piercing. */
    dice: number;
    /** Dice actually rolled (cover save removes one). */
    rolled: number;
    coverSave: boolean;
    save: number;
    steps: string[];
  };
  damage: {
    normal: number;
    crit: number;
    steps: string[];
  };
  after: string[];
  rules: RuleLine[];
  /** Team-specific rules (marked * on the datacard). */
  special: { name: string; text?: string }[];
  unknownRules: string[];
}

export const DEFENCE_DICE = 3;

export function computeShot(weapon: RangedWeapon, c: ShotConditions): ShotSummary {
  const parsed = weapon.rules.map(parseRule);
  const get = (key: string): ParsedRule | undefined => parsed.find((r) => r.key === key);

  const seek = get("seek");
  const seekLight = get("seek-light");
  const saturate = get("saturate");
  const piercing = get("piercing");
  const piercingCrits = get("piercing-crits");
  const lethal = get("lethal");
  const devastating = get("devastating");

  // --- Target validity -------------------------------------------------
  const validity: string[] = [];
  let valid = true;
  if (c.targetConceal && c.inCover) {
    if (seek) {
      validity.push("Cible en Dissimulation à couvert, mais Traque ignore le couvert : cible valide.");
    } else if (seekLight) {
      validity.push(
        "Cible en Dissimulation à couvert : valide seulement si son couvert vient d'un décor léger (Traque Légère).",
      );
    } else {
      valid = false;
      validity.push("Cible en Dissimulation et à couvert : ce n'est pas une cible valide.");
    }
  }

  // --- Before shooting -------------------------------------------------
  const before: string[] = [];
  for (const key of ["range", "heavy", "limited", "silent"]) {
    const r = get(key);
    if (r) before.push(`${ruleLabel(r)} : ${WEAPON_RULES[key].describe(r)}`);
  }

  // --- Attack ----------------------------------------------------------
  const baseHit = weapon.hit;
  const hit = Math.min(6, baseHit + (c.shooterInjured ? 1 : 0));
  const crit = lethal?.x !== undefined ? Math.max(hit, Math.min(6, lethal.x)) : 6;
  const attackSteps: string[] = [];
  if (c.shooterInjured) attackSteps.push(`Tireur blessé : Touche ${baseHit}+ → ${hit}+.`);
  if (lethal) attackSteps.push(`${ruleLabel(lethal)} : critique sur ${crit}+ au lieu de 6.`);
  for (const key of ["accurate", "balanced", "ceaseless", "relentless"]) {
    const r = get(key);
    if (r) attackSteps.push(`${ruleLabel(r)} : ${WEAPON_RULES[key].describe(r)}`);
  }
  if (c.obscured) {
    attackSteps.push(
      "Cible masquée : après le jet, tous vos critiques deviennent des succès normaux, puis défaussez un succès de votre choix.",
    );
  }
  for (const key of ["severe", "rending", "punishing"]) {
    const r = get(key);
    if (r) attackSteps.push(`${ruleLabel(r)} : ${WEAPON_RULES[key].describe(r)}`);
  }
  const critDependent = ["rending", "punishing", "piercing-crits", "devastating", "stun"].filter((k) => get(k));
  if (c.obscured && critDependent.length > 0) {
    attackSteps.push(
      `Masquée : aucun critique n'est conservé, donc ${critDependent
        .map((k) => ruleLabel(get(k)!))
        .join(", ")} ne se déclenche(nt) pas.`,
    );
  }

  // --- Defence ---------------------------------------------------------
  const dice = Math.max(0, DEFENCE_DICE - (piercing?.x ?? 0));
  const defenceSteps: string[] = [];
  if (piercing) defenceSteps.push(`${ruleLabel(piercing)} : ${DEFENCE_DICE} → ${dice} dé(s) de défense.`);

  let coverSave = false;
  if (c.inCover) {
    if (saturate) {
      defenceSteps.push("Saturation : pas de sauvegarde de couvert.");
    } else if (seek) {
      defenceSteps.push("Traque : la cible ne peut pas utiliser le décor comme couvert, pas de sauvegarde de couvert.");
    } else if (dice > 0) {
      coverSave = true;
      defenceSteps.push("À couvert : un dé est conservé d'office comme sauvegarde normale, sans le lancer.");
      if (seekLight) {
        defenceSteps.push("Traque Légère : pas de sauvegarde de couvert si le couvert vient d'un décor léger.");
      }
    }
  }
  const rolled = dice - (coverSave ? 1 : 0);

  if (piercingCrits) {
    const reduced = Math.max(0, dice - (piercingCrits.x ?? 0));
    const reducedRolled = Math.max(0, reduced - (coverSave && reduced > 0 ? 1 : 0));
    defenceSteps.push(
      `${ruleLabel(piercingCrits)} : si l'attaquant conserve au moins un critique, ${dice} → ${reduced} dé(s) de défense` +
        (coverSave ? ` (donc ${reducedRolled} à lancer + couvert).` : "."),
    );
  }
  defenceSteps.push(
    "Annulation : 1 sauvegarde normale annule 1 succès normal ; 2 sauvegardes normales ou 1 sauvegarde critique annulent 1 critique ; 1 sauvegarde critique annule aussi 1 succès normal.",
  );

  // --- Damage ----------------------------------------------------------
  const [normal, critDmg] = weapon.dmg;
  const damageSteps: string[] = [];
  if (devastating) damageSteps.push(`${ruleLabel(devastating)} : ${WEAPON_RULES.devastating.describe(devastating)}`);
  const stun = get("stun");
  if (stun) damageSteps.push(`${ruleLabel(stun)} : ${WEAPON_RULES.stun.describe(stun)}`);

  // --- After -----------------------------------------------------------
  const after: string[] = [];
  const hot = get("hot");
  if (hot) {
    after.push(
      `${ruleLabel(hot)} : lancez 1D6 après le tir. Sur ${hit - 1 <= 1 ? "1" : `1 à ${hit - 1}`}, le tireur subit le résultat × 2 dégâts.`,
    );
  }
  for (const key of ["blast", "torrent"]) {
    const r = get(key);
    if (r) after.push(`${ruleLabel(r)} : ${WEAPON_RULES[key].describe(r)}`);
  }

  const rules: RuleLine[] = parsed.filter(isKnownRule).map((r) => ({
    label: ruleLabel(r),
    en: r.raw,
    text: WEAPON_RULES[r.key].describe(r),
  }));
  const unknownRules = parsed.filter((r) => !isKnownRule(r)).map((r) => r.raw);

  return {
    valid,
    validity,
    before,
    attack: { dice: weapon.atk, hit, crit, baseHit, steps: attackSteps },
    defence: { dice, rolled, coverSave, save: c.targetSave, steps: defenceSteps },
    damage: { normal, crit: critDmg, steps: damageSteps },
    after,
    rules,
    special: weapon.special ?? [],
    unknownRules,
  };
}
