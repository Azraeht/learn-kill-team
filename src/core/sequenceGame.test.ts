import { describe, expect, it } from "vitest";
import { checkSequenceOrder, shuffle } from "./sequenceGame.ts";

describe("checkSequenceOrder", () => {
  const canonical = ["A", "B", "C", "D"];

  it("reports fully correct when the submitted order matches exactly", () => {
    const result = checkSequenceOrder(canonical, ["A", "B", "C", "D"]);
    expect(result.fullyCorrect).toBe(true);
    expect(result.correctCount).toBe(4);
    expect(result.correctPositions).toEqual([true, true, true, true]);
  });

  it("flags only the mismatched positions", () => {
    const result = checkSequenceOrder(canonical, ["A", "C", "B", "D"]);
    expect(result.fullyCorrect).toBe(false);
    expect(result.correctCount).toBe(2);
    expect(result.correctPositions).toEqual([true, false, false, true]);
  });

  it("is not fully correct when the submission is shorter than the canonical sequence", () => {
    const result = checkSequenceOrder(canonical, ["A", "B", "C"]);
    expect(result.fullyCorrect).toBe(false);
    expect(result.correctCount).toBe(3);
  });

  it("handles a completely wrong order", () => {
    const result = checkSequenceOrder(canonical, ["D", "C", "B", "A"]);
    expect(result.correctCount).toBe(0);
    expect(result.fullyCorrect).toBe(false);
  });
});

describe("shuffle", () => {
  it("returns all the same items without mutating the input", () => {
    const input = ["A", "B", "C", "D"];
    const result = shuffle(input, () => 0.5);

    expect(result).toHaveLength(4);
    expect([...result].sort()).toEqual([...input].sort());
    expect(input).toEqual(["A", "B", "C", "D"]);
  });

  it("is deterministic for a given random source", () => {
    const input = ["A", "B", "C", "D"];
    const a = shuffle(input, () => 0.9);
    const b = shuffle(input, () => 0.9);
    expect(a).toEqual(b);
  });
});
