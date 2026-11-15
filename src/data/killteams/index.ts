import type { KillTeam } from "../../core/killTeamTypes.ts";
import angelsOfDeath from "./angels-of-death.json";

// To add a kill team: drop a JSON file next to this one and add it here.
export const killTeams: KillTeam[] = [angelsOfDeath as KillTeam];

export function getKillTeam(id: string | undefined): KillTeam | undefined {
  return killTeams.find((t) => t.id === id);
}
