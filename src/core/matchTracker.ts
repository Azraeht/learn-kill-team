import type { MatchTrackerPlayer, MatchTrackerState } from "./types.ts";

export function createInitialMatchTracker(): MatchTrackerState {
  return {
    turningPoint: 1,
    initiativeHolder: null,
    players: [
      { name: "Joueur 1", cp: 2, vp: 0 },
      { name: "Joueur 2", cp: 2, vp: 0 },
    ],
  };
}

function clampToZero(value: number): number {
  return Math.max(0, value);
}

/**
 * Moves to the next turning point and, per the core rules (each strategy
 * phase after the first grants 1PC to whoever holds initiative and 2PC to
 * the other player), applies that gain — a no-op on CP if initiative hasn't
 * been set yet, since there's nothing to base the gain on.
 */
export function applyTurningPointAdvance(state: MatchTrackerState): MatchTrackerState {
  const players = state.players.map((player, index): MatchTrackerPlayer => {
    if (state.initiativeHolder === null) return player;
    const gain = index === state.initiativeHolder ? 1 : 2;
    return { ...player, cp: player.cp + gain };
  }) as [MatchTrackerPlayer, MatchTrackerPlayer];

  return { ...state, turningPoint: state.turningPoint + 1, players };
}

export function adjustTurningPoint(state: MatchTrackerState, delta: number): MatchTrackerState {
  return { ...state, turningPoint: Math.max(1, state.turningPoint + delta) };
}

export function adjustPlayerCp(state: MatchTrackerState, index: 0 | 1, delta: number): MatchTrackerState {
  const players = [...state.players] as [MatchTrackerPlayer, MatchTrackerPlayer];
  players[index] = { ...players[index], cp: clampToZero(players[index].cp + delta) };
  return { ...state, players };
}

export function adjustPlayerVp(state: MatchTrackerState, index: 0 | 1, delta: number): MatchTrackerState {
  const players = [...state.players] as [MatchTrackerPlayer, MatchTrackerPlayer];
  players[index] = { ...players[index], vp: clampToZero(players[index].vp + delta) };
  return { ...state, players };
}

export function setPlayerName(state: MatchTrackerState, index: 0 | 1, name: string): MatchTrackerState {
  const players = [...state.players] as [MatchTrackerPlayer, MatchTrackerPlayer];
  players[index] = { ...players[index], name };
  return { ...state, players };
}

export function setInitiativeHolder(state: MatchTrackerState, index: 0 | 1 | null): MatchTrackerState {
  return { ...state, initiativeHolder: index };
}
