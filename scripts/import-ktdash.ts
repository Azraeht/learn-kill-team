// Imports kill team datacards from KTDash (https://ktdash.app) into
// src/data/killteams/*.json for the shooting helper.
//
// Usage:
//   npm run import-killteams                 # fetch the teams listed in TEAMS from the KTDash API
//   npm run import-killteams -- --from DIR   # use already-downloaded <killteamId>.json files
//
// Only ranged weapons (and grenade-type equipment) are kept. Weapon rules are
// expanded from KTDash abbreviations ("Prc1", "Hvy(Dash)") to the official
// English wording ("Piercing 1", "Heavy (Dash only)"). Team-specific rules
// (marked with * on the datacard) are kept with their text from the operative's
// abilities when it can be found.

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { KillTeam, Operative, RangedWeapon, SpecialRule } from "../src/core/killTeamTypes.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "src", "data", "killteams");
const API = "https://ktdash.app/api";

/**
 * Kill teams imported, keyed by KTDash id, with the French name used in the
 * app's question categories (src/data/categories.ts). Add a line here to
 * import another team.
 */
export const TEAMS: Record<string, string> = {
  "IMP-TEMPAQ": "Aquilon du Tempestus",
  "TAU-VESP": "Frelons Vespides",
  "VOT-HKY": "Yaegirs Hernkogs",
  "TAU-XV26": "Exo-Armures XV26 Stealth",
  "TAU-PF": "Cibleurs",
  "NEC-CAN": "Cercle Canoptek",
  "IMP-DW": "Deathwatch",
};

interface KtdProfile {
  wepprofileId: string;
  seq: number;
  profileName: string;
  ATK: string;
  HIT: string;
  DMG: string;
  WR: string | null;
}
interface KtdWeapon {
  wepId: string;
  seq: number;
  wepName: string;
  wepType: "R" | "M" | "E";
  profiles: KtdProfile[];
}
interface KtdAbility {
  abilityName: string | null;
  description: string | null;
}
interface KtdOpType {
  opTypeId: string;
  seq: number;
  opTypeName: string;
  MOVE: string;
  APL: number;
  SAVE: string;
  WOUNDS: number;
  weapons: KtdWeapon[];
  abilities: KtdAbility[];
}
interface KtdKillTeam {
  killteamId: string;
  killteamName: string;
  isHomebrew?: boolean;
  opTypes: KtdOpType[];
}

const SIMPLE: Record<string, string> = {
  rnd: "Rending",
  rend: "Rending",
  rending: "Rending",
  sat: "Saturate",
  saturate: "Saturate",
  ceaseless: "Ceaseless",
  bal: "Balanced",
  balanced: "Balanced",
  sil: "Silent",
  silent: "Silent",
  stun: "Stun",
  hot: "Hot",
  sev: "Severe",
  severe: "Severe",
  relentless: "Relentless",
  punishing: "Punishing",
  seek: "Seek",
  "seek light": "Seek Light",
  psychic: "Psychic",
  shock: "Shock",
  brutal: "Brutal",
};

/** Converts one KTDash weapon-rule token to the official wording, or null if it's a team-specific rule. */
export function normaliseRule(token: string): string | null {
  const t = token.trim();
  if (t.startsWith("*") || t.endsWith("*")) return null;
  const lower = t.toLowerCase();
  if (SIMPLE[lower]) return SIMPLE[lower];

  let m: RegExpMatchArray | null;
  if ((m = t.match(/^(?:(\d+)"\s*)?(?:Dev|Devastating)\s*(\d+)$/i))) return `${m[1] ? `${m[1]}" ` : ""}Devastating ${m[2]}`;
  if ((m = t.match(/^(?:Rng|Range)\s*(\d+)"?$/i))) return `Range ${m[1]}"`;
  if ((m = t.match(/^(?:PrcCrit|Piercing Crits)\s*(\d+)$/i))) return `Piercing Crits ${m[1]}`;
  if ((m = t.match(/^(?:Prc|Piercing)\s*(\d+)$/i))) return `Piercing ${m[1]}`;
  if ((m = t.match(/^Lethal\s*(\d)\+?$/i))) return `Lethal ${m[1]}+`;
  if ((m = t.match(/^Blast\s*(\d+)"?$/i))) return `Blast ${m[1]}"`;
  if ((m = t.match(/^(?:Tor|Torrent)\s*(\d+)"?$/i))) return `Torrent ${m[1]}"`;
  if ((m = t.match(/^(?:Lim|Limited)\s*(\d+)$/i))) return `Limited ${m[1]}`;
  if ((m = t.match(/^(?:Acc|Accurate)\s*(\d+)$/i))) return `Accurate ${m[1]}`;
  if ((m = t.match(/^(?:Hvy|Heavy)\s*(?:\(\s*(Dash|Repos|Reposition)[^)]*\))?$/i))) {
    if (!m[1]) return "Heavy";
    return m[1].toLowerCase() === "dash" ? "Heavy (Dash only)" : "Heavy (Reposition only)";
  }
  return null;
}

const cleanName = (s: string): string => s.replace(/\*/g, "").replace(/\s+/g, " ").trim().toLowerCase();

function findSpecial(token: string, op: KtdOpType, team: KtdKillTeam): SpecialRule {
  const name = token.replace(/\*/g, "").trim();
  const wanted = cleanName(name);
  const base = wanted.replace(/\s*[\d"]+$/, "");
  const candidates = [op, ...team.opTypes];
  for (const exact of [true, false]) {
    for (const o of candidates) {
      const hit = o.abilities.find((a) => {
        if (!a.abilityName || !a.description) return false;
        const n = cleanName(a.abilityName);
        return exact ? n === wanted || n === base : n.startsWith(base);
      });
      if (hit) return { name, text: hit.description!.trim() };
    }
  }
  return { name };
}

const num = (s: string | number): number => Number(String(s).replace(/[^\d]/g, "")) || 0;

function parseDamage(dmg: string): [number, number] {
  const m = dmg.match(/^(\d+)\/(\d+)$/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

export function convert(team: KtdKillTeam, importedOn: string): KillTeam {
  const operatives: Operative[] = [...team.opTypes]
    .sort((a, b) => a.seq - b.seq)
    .map((op) => {
      const weapons: RangedWeapon[] = [];
      for (const w of [...op.weapons].sort((a, b) => a.seq - b.seq)) {
        if (w.wepType === "M") continue;
        for (const p of [...w.profiles].sort((a, b) => a.seq - b.seq)) {
          const tokens = (p.WR ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const rules: string[] = [];
          const special: SpecialRule[] = [];
          for (const tok of tokens) {
            const rule = normaliseRule(tok);
            if (rule) rules.push(rule);
            else special.push(findSpecial(tok, op, team));
          }
          const weapon: RangedWeapon = {
            id: p.wepprofileId,
            name: p.profileName ? `${w.wepName} (${p.profileName})` : w.wepName,
            atk: num(p.ATK),
            hit: num(p.HIT),
            dmg: parseDamage(p.DMG),
            rules,
          };
          if (special.length) weapon.special = special;
          weapons.push(weapon);
        }
      }
      return {
        id: op.opTypeId,
        name: op.opTypeName,
        apl: Number(op.APL),
        move: num(op.MOVE),
        save: num(op.SAVE),
        wounds: Number(op.WOUNDS),
        weapons,
      };
    })
    .filter((op) => op.weapons.length > 0);

  return {
    id: team.killteamId,
    name: TEAMS[team.killteamId] ?? team.killteamName,
    nameEn: team.killteamName,
    status: "imported",
    sourceRef: `KTDash (ktdash.app), import du ${importedOn}`,
    operatives,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function loadTeams(fromDir: string | undefined): Promise<KtdKillTeam[]> {
  if (fromDir) {
    return readdirSync(fromDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(readFileSync(path.join(fromDir, f), "utf8")) as KtdKillTeam)
      .filter((t) => t.killteamId in TEAMS);
  }
  const teams: KtdKillTeam[] = [];
  for (const killteamId of Object.keys(TEAMS)) {
    teams.push(await fetchJson<KtdKillTeam>(`${API}/killteams/${encodeURIComponent(killteamId)}`));
    await new Promise((r) => setTimeout(r, 500)); // be gentle with the API
  }
  return teams;
}

async function main(): Promise<void> {
  const fromIdx = process.argv.indexOf("--from");
  const fromDir = fromIdx > -1 ? process.argv[fromIdx + 1] : undefined;
  const importedOn = new Date().toISOString().slice(0, 10);

  const teams = await loadTeams(fromDir);
  const missing = Object.keys(TEAMS).filter((id) => !teams.some((t) => t.killteamId === id));
  if (missing.length) throw new Error(`Kill teams not found: ${missing.join(", ")}`);

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  let missingText = 0;
  for (const raw of teams) {
    const team = convert(raw, importedOn);
    missingText += team.operatives.flatMap((o) => o.weapons.flatMap((w) => w.special ?? [])).filter((s) => !s.text).length;
    writeFileSync(path.join(outDir, `${team.id.toLowerCase()}.json`), JSON.stringify(team, null, 2) + "\n");
  }
  console.log(`Imported ${teams.length} kill teams into ${path.relative(process.cwd(), outDir)}`);
  if (missingText) console.log(`${missingText} special weapon rule(s) without text (shown as "see datacard").`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
