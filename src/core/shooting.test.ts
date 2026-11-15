import { describe, expect, it } from "vitest";
import { computeShot, type ShotConditions } from "./shooting.ts";
import { parseRule, isKnownRule } from "./weaponRules.ts";
import type { RangedWeapon } from "./killTeamTypes.ts";
import { killTeams } from "../data/killTeams.ts";

const open: ShotConditions = {
  inCover: false,
  obscured: false,
  targetConceal: false,
  shooterInjured: false,
  targetSave: 3,
};

const weapon = (rules: string[], over: Partial<RangedWeapon> = {}): RangedWeapon => ({
  id: "w",
  name: "Test",
  atk: 4,
  hit: 3,
  dmg: [3, 4],
  rules,
  ...over,
});

describe("parseRule", () => {
  it("parses names, values, distances and notes", () => {
    expect(parseRule("Piercing 1")).toMatchObject({ key: "piercing", x: 1 });
    expect(parseRule("Piercing Crits 1")).toMatchObject({ key: "piercing-crits", x: 1 });
    expect(parseRule("Lethal 5+")).toMatchObject({ key: "lethal", x: 5 });
    expect(parseRule('Torrent 1"')).toMatchObject({ key: "torrent", x: 1 });
    expect(parseRule("Heavy (Dash only)")).toMatchObject({ key: "heavy", note: "Dash only" });
    expect(parseRule('1" Devastating 2')).toMatchObject({ key: "devastating", x: 2, distance: 1 });
    expect(parseRule("Seek Light")).toMatchObject({ key: "seek-light" });
  });
});

describe("computeShot", () => {
  it("gives the base roll with no modifiers", () => {
    const s = computeShot(weapon([]), open);
    expect(s.valid).toBe(true);
    expect(s.attack).toMatchObject({ dice: 4, hit: 3, crit: 6 });
    expect(s.defence).toMatchObject({ dice: 3, rolled: 3, coverSave: false, save: 3 });
    expect(s.damage).toMatchObject({ normal: 3, crit: 4 });
  });

  it("worsens Hit when the shooter is injured, capped at 6+", () => {
    expect(computeShot(weapon([]), { ...open, shooterInjured: true }).attack.hit).toBe(4);
    expect(computeShot(weapon([], { hit: 6 }), { ...open, shooterInjured: true }).attack.hit).toBe(6);
  });

  it("applies Lethal, never below the Hit stat", () => {
    expect(computeShot(weapon(["Lethal 5+"]), open).attack.crit).toBe(5);
    expect(computeShot(weapon(["Lethal 5+"], { hit: 6 }), open).attack.crit).toBe(6);
  });

  it("grants a cover save that removes a rolled die", () => {
    const s = computeShot(weapon([]), { ...open, inCover: true });
    expect(s.defence).toMatchObject({ dice: 3, rolled: 2, coverSave: true });
  });

  it("combines Piercing with cover", () => {
    const s = computeShot(weapon(["Piercing 1"]), { ...open, inCover: true });
    expect(s.defence).toMatchObject({ dice: 2, rolled: 1, coverSave: true });
  });

  it("denies the cover save with Saturate or Seek", () => {
    expect(computeShot(weapon(["Saturate"]), { ...open, inCover: true }).defence.coverSave).toBe(false);
    expect(computeShot(weapon(["Seek"]), { ...open, inCover: true }).defence.coverSave).toBe(false);
  });

  it("flags a concealed target in cover as invalid unless Seek", () => {
    const c = { ...open, inCover: true, targetConceal: true };
    expect(computeShot(weapon([]), c).valid).toBe(false);
    expect(computeShot(weapon(["Seek"]), c).valid).toBe(true);
    expect(computeShot(weapon(["Seek Light"]), c).valid).toBe(true);
    expect(computeShot(weapon([]), { ...open, targetConceal: true }).valid).toBe(true);
  });

  it("explains obscured and which crit rules it switches off", () => {
    const s = computeShot(weapon(["Piercing Crits 1"]), { ...open, obscured: true });
    expect(s.attack.steps.join(" ")).toMatch(/masquée/i);
    expect(s.attack.steps.join(" ")).toMatch(/Perforante Crit\. 1/);
  });

  it("puts Hot in the after-shot reminders using the effective Hit stat", () => {
    const s = computeShot(weapon(["Hot"]), { ...open, shooterInjured: true });
    expect(s.after.join(" ")).toMatch(/1 à 3/);
  });

  it("reports unknown rules instead of dropping them", () => {
    expect(computeShot(weapon(["Made Up Rule"]), open).unknownRules).toEqual(["Made Up Rule"]);
  });
});

describe("kill team data", () => {
  it("ships the app's kill teams, each with shooting operatives", () => {
    expect(killTeams.length).toBeGreaterThan(0);
    for (const team of killTeams) expect(team.operatives.length, team.id).toBeGreaterThan(0);
  });

  it("uses only weapon rules the helper understands, with unique ids", () => {
    for (const team of killTeams) {
      const opIds = new Set<string>();
      for (const op of team.operatives) {
        expect(opIds.has(op.id), `${team.id}/${op.id} duplicate`).toBe(false);
        opIds.add(op.id);
        const wIds = new Set<string>();
        for (const w of op.weapons) {
          expect(wIds.has(w.id), `${op.id}/${w.id} duplicate`).toBe(false);
          wIds.add(w.id);
          for (const r of w.rules) expect(isKnownRule(parseRule(r)), `${op.id}/${w.id}: "${r}"`).toBe(true);
        }
      }
    }
  });
});
