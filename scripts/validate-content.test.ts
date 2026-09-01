import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateContent } from "./validate-content.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("validateContent", () => {
  it("passes for the real question bank", () => {
    const { errors } = validateContent();
    expect(errors).toEqual([]);
  });

  it("passes for a well-formed fixture", () => {
    const { errors } = validateContent(path.join(__dirname, "__fixtures__", "valid-questions"));
    expect(errors).toEqual([]);
  });

  it("catches schema violations, duplicate ids, and out-of-bounds correctIndex", () => {
    const { errors } = validateContent(path.join(__dirname, "__fixtures__", "bad-questions"));

    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("out of bounds"))).toBe(true);
    expect(errors.some((e) => e.includes("must have required property 'choices'"))).toBe(true);
    expect(errors.some((e) => e.includes("must be equal to one of the allowed values"))).toBe(true);
  });
});
