import { describe, expect, it } from "vitest";
import { convert, normaliseRule, TEAMS } from "./import-ktdash.ts";
import { killTeams } from "../src/data/killTeams.ts";

describe("normaliseRule", () => {
  it.each([
    ['Rng 8"', 'Range 8"'],
    ['Rng3"', 'Range 3"'],
    ["Prc1", "Piercing 1"],
    ["Piercing 1", "Piercing 1"],
    ["PrcCrit 1", "Piercing Crits 1"],
    ["Lethal 5+", "Lethal 5+"],
    ["Rnd", "Rending"],
    ["Dev4", "Devastating 4"],
    ['2" Dev2', '2" Devastating 2'],
    ["Sat", "Saturate"],
    ['Tor2"', 'Torrent 2"'],
    ['Blast 2"', 'Blast 2"'],
    ["Hvy(Dash)", "Heavy (Dash only)"],
    ["HVY(Repos)", "Heavy (Reposition only)"],
    ["Hvy", "Heavy"],
    ["Lim 1", "Limited 1"],
    ["Acc1", "Accurate 1"],
    ["Sil", "Silent"],
    ["Sev", "Severe"],
    ["Bal", "Balanced"],
    ["Seek Light", "Seek Light"],
  ])("%s → %s", (input, expected) => {
    expect(normaliseRule(input)).toBe(expected);
  });

  it("leaves team-specific rules alone", () => {
    expect(normaliseRule("*Poison")).toBeNull();
    expect(normaliseRule("Wreathed*")).toBeNull();
  });
});

describe("convert", () => {
  it("keeps ranged profiles, drops melee, and attaches special rule text", () => {
    const team = convert(
      {
        killteamId: "X-T",
        killteamName: "Test Team",
        opTypes: [
          {
            opTypeId: "X-T-A",
            seq: 0,
            opTypeName: "Gunner",
            MOVE: '6"',
            APL: 2,
            SAVE: "4+",
            WOUNDS: 8,
            abilities: [{ abilityName: "*Blaze", description: "Sets things on fire." }],
            weapons: [
              {
                wepId: "g",
                seq: 0,
                wepName: "Gun",
                wepType: "R",
                profiles: [
                  { wepprofileId: "g-0", seq: 0, profileName: "Hot", ATK: "4", HIT: "3+", DMG: "3/4", WR: "Prc1, *Blaze" },
                ],
              },
              {
                wepId: "k",
                seq: 1,
                wepName: "Knife",
                wepType: "M",
                profiles: [{ wepprofileId: "k-0", seq: 0, profileName: "", ATK: "3", HIT: "4+", DMG: "2/3", WR: "" }],
              },
            ],
          },
        ],
      },
      "2026-01-01",
    );
    expect(team.operatives).toHaveLength(1);
    expect(team.operatives[0]).toMatchObject({ apl: 2, move: 6, save: 4, wounds: 8 });
    expect(team.operatives[0].weapons).toEqual([
      {
        id: "g-0",
        name: "Gun (Hot)",
        atk: 4,
        hit: 3,
        dmg: [3, 4],
        rules: ["Piercing 1"],
        special: [{ name: "Blaze", text: "Sets things on fire." }],
      },
    ]);
  });
});

describe("imported kill teams", () => {
  it("are exactly the teams listed in TEAMS, with their French names", () => {
    expect(killTeams.map((t) => t.id).sort()).toEqual(Object.keys(TEAMS).sort());
    for (const t of killTeams) expect(t.name).toBe(TEAMS[t.id]);
  });
});
