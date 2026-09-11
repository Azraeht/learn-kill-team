import { describe, expect, it } from "vitest";
import { enqueueFollowUps, popNextFollowUp } from "./followUps.ts";

describe("enqueueFollowUps", () => {
  it("returns the queue unchanged when there are no follow-ups", () => {
    expect(enqueueFollowUps(["a"], undefined, new Set())).toEqual(["a"]);
    expect(enqueueFollowUps(["a"], [], new Set())).toEqual(["a"]);
  });

  it("appends new follow-up ids to the end of the queue", () => {
    expect(enqueueFollowUps(["a"], ["b", "c"], new Set())).toEqual(["a", "b", "c"]);
  });

  it("does not queue an id already shown this session", () => {
    expect(enqueueFollowUps([], ["b"], new Set(["b"]))).toEqual([]);
  });

  it("does not queue an id that's already in the queue", () => {
    expect(enqueueFollowUps(["b"], ["b", "c"], new Set())).toEqual(["b", "c"]);
  });

  it("does not mutate the input queue", () => {
    const queue = ["a"];
    enqueueFollowUps(queue, ["b"], new Set());
    expect(queue).toEqual(["a"]);
  });
});

describe("popNextFollowUp", () => {
  it("returns null with an empty queue", () => {
    expect(popNextFollowUp([], new Set())).toEqual({ id: null, remainingQueue: [] });
  });

  it("pops the first id and returns the rest", () => {
    expect(popNextFollowUp(["a", "b"], new Set())).toEqual({ id: "a", remainingQueue: ["b"] });
  });

  it("skips ids already shown, popping the next relevant one", () => {
    expect(popNextFollowUp(["a", "b", "c"], new Set(["a", "b"]))).toEqual({
      id: "c",
      remainingQueue: [],
    });
  });

  it("returns null if every queued id has already been shown", () => {
    expect(popNextFollowUp(["a", "b"], new Set(["a", "b"]))).toEqual({ id: null, remainingQueue: [] });
  });

  it("does not mutate the input queue", () => {
    const queue = ["a", "b"];
    popNextFollowUp(queue, new Set());
    expect(queue).toEqual(["a", "b"]);
  });
});
