import type { KillTeam } from "../../core/killTeamTypes.ts";

// Every JSON file in this folder is a kill team: drop a file here and it shows
// up in the shooting helper's team dropdown (sorted by name).
const modules = import.meta.glob<KillTeam>("./*.json", { eager: true, import: "default" });

export const killTeams: KillTeam[] = Object.values(modules).sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function getKillTeam(id: string | undefined): KillTeam | undefined {
  return killTeams.find((t) => t.id === id);
}
