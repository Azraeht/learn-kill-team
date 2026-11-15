// Data model for kill team rosters used by the shooting helper.
// Rosters live in src/data/killteams/*.json — see KILLTEAMS.md.

export type DataStatus = "draft" | "verified";

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
