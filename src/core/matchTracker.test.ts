import { describe, expect, it } from "vitest";
import {
  adjustPlayerCp,
  adjustPlayerVp,
  adjustTurningPoint,
  applyTurningPointAdvance,
  createInitialMatchTracker,
  setInitiativeHolder,
  setPlayerName,
} from "./matchTracker.ts";

describe("createInitialMatchTracker", () => {
  it("starts at turning point 1 with 2 CP each and 0 VP, no initiative set", () => {
    const state = createInitialMatchTracker();

    expect(state.turningPoint).toBe(1);
    expect(state.initiativeHolder).toBeNull();
    expect(state.players).toEqual([
      { name: "Joueur 1", cp: 2, vp: 0 },
      { name: "Joueur 2", cp: 2, vp: 0 },
    ]);
  });
});

describe("applyTurningPointAdvance", () => {
  it("increments the turning point", () => {
    const state = createInitialMatchTracker();
    const next = applyTurningPointAdvance(state);
    expect(next.turningPoint).toBe(2);
  });

  it("grants 1 CP to the initiative holder and 2 CP to the other player", () => {
    const state = setInitiativeHolder(createInitialMatchTracker(), 0);
    const next = applyTurningPointAdvance(state);

    expect(next.players[0].cp).toBe(3); // 2 + 1
    expect(next.players[1].cp).toBe(4); // 2 + 2
  });

  it("flips correctly when the other player holds initiative", () => {
    const state = setInitiativeHolder(createInitialMatchTracker(), 1);
    const next = applyTurningPointAdvance(state);

    expect(next.players[0].cp).toBe(4);
    expect(next.players[1].cp).toBe(3);
  });

  it("does not change CP when initiative hasn't been set yet", () => {
    const state = createInitialMatchTracker();
    const next = applyTurningPointAdvance(state);

    expect(next.players[0].cp).toBe(2);
    expect(next.players[1].cp).toBe(2);
  });

  it("does not mutate the input state", () => {
    const state = setInitiativeHolder(createInitialMatchTracker(), 0);
    const snapshot = JSON.parse(JSON.stringify(state));
    applyTurningPointAdvance(state);
    expect(state).toEqual(snapshot);
  });
});

describe("adjustTurningPoint", () => {
  it("moves the turning point up or down", () => {
    const state = createInitialMatchTracker();
    expect(adjustTurningPoint(state, 1).turningPoint).toBe(2);
    expect(adjustTurningPoint({ ...state, turningPoint: 3 }, -1).turningPoint).toBe(2);
  });

  it("never drops below 1", () => {
    const state = createInitialMatchTracker();
    expect(adjustTurningPoint(state, -5).turningPoint).toBe(1);
  });
});

describe("adjustPlayerCp / adjustPlayerVp", () => {
  it("adjusts only the targeted player", () => {
    const state = createInitialMatchTracker();
    const next = adjustPlayerCp(state, 1, 3);
    expect(next.players[0].cp).toBe(2);
    expect(next.players[1].cp).toBe(5);
  });

  it("clamps CP and VP at 0", () => {
    const state = createInitialMatchTracker();
    expect(adjustPlayerCp(state, 0, -10).players[0].cp).toBe(0);
    expect(adjustPlayerVp(state, 0, -10).players[0].vp).toBe(0);
  });

  it("VP can rise freely", () => {
    const state = createInitialMatchTracker();
    expect(adjustPlayerVp(state, 1, 12).players[1].vp).toBe(12);
  });
});

describe("setPlayerName / setInitiativeHolder", () => {
  it("renames only the targeted player", () => {
    const state = createInitialMatchTracker();
    const next = setPlayerName(state, 1, "Space Marines");
    expect(next.players[0].name).toBe("Joueur 1");
    expect(next.players[1].name).toBe("Space Marines");
  });

  it("sets and clears the initiative holder", () => {
    const state = createInitialMatchTracker();
    expect(setInitiativeHolder(state, 0).initiativeHolder).toBe(0);
    expect(setInitiativeHolder(state, null).initiativeHolder).toBeNull();
  });
});
