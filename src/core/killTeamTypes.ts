// Data model for kill team rosters used by the shooting helper.
// Rosters live in src/data/killteams/*.json — see KILLTEAMS.md.

/** draft: typed by hand, unchecked; imported: generated from KTDash; verified: checked against official cards. */
export type DataStatus = "draft" | "imported" | "verified";

export interface SpecialRule {
  /** Name as printed on the datacard, without the leading asterisk. */
  name: string;
  /** Rule text from the operative's abilities, when known. */
  text?: string;
}

export interface RangedWeapon {
  id: string;
  name: string;
  /** Official English name as printed on the datacard. */
  nameEn?: string;
  /** Attack stat (A): number of attack dice. */
  atk: number;
  /** Hit stat, e.g. 3 for 3+. */
  hit: number;
  /** Damage stat: [normal, critical]. */
  dmg: [number, number];
  /** Weapon rules as printed on the datacard, in English: "Piercing 1", "Lethal 5+", "Heavy (Dash only)"... */
  rules: string[];
  /** Team-specific weapon rules (marked * on the datacard). */
  special?: SpecialRule[];
}

export interface Operative {
  id: string;
  name: string;
  nameEn?: string;
  apl: number;
  /** Move stat in inches. */
  move: number;
  /** Save stat, e.g. 3 for 3+. */
  save: number;
  wounds: number;
  weapons: RangedWeapon[];
}

export interface KillTeam {
  id: string;
  name: string;
  nameEn?: string;
  status: DataStatus;
  sourceRef?: string;
  operatives: Operative[];
}
