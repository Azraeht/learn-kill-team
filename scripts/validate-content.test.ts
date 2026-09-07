import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateContent, validateGlossary, validateScenarios, validateSequences } from "./validate-content.ts";

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

describe("validateSequences", () => {
  it("passes for the real sequence bank", () => {
    const { errors } = validateSequences();
    expect(errors).toEqual([]);
  });

  it("passes for a well-formed fixture", () => {
    const { errors } = validateSequences(path.join(__dirname, "__fixtures__", "valid-sequences"));
    expect(errors).toEqual([]);
  });

  it("catches too few steps, duplicate ids, repeated steps, and invalid category", () => {
    const { errors } = validateSequences(path.join(__dirname, "__fixtures__", "bad-sequences"));

    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("steps must be unique"))).toBe(true);
    expect(errors.some((e) => e.includes("must NOT have fewer than 3 items"))).toBe(true);
    expect(errors.some((e) => e.includes("must be equal to one of the allowed values"))).toBe(true);
  });
});

describe("validateScenarios", () => {
  it("passes for the real scenario bank", () => {
    const { errors } = validateScenarios();
    expect(errors).toEqual([]);
  });

  it("passes for a well-formed fixture", () => {
    const { errors } = validateScenarios(path.join(__dirname, "__fixtures__", "valid-scenarios"));
    expect(errors).toEqual([]);
  });

  it("catches out-of-bounds correctIndex, duplicate choices, duplicate ids, too few steps, and invalid category", () => {
    const { errors } = validateScenarios(path.join(__dirname, "__fixtures__", "bad-scenarios"));

    expect(errors.some((e) => e.includes("correctIndex 5 is out of bounds"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate choices"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("must NOT have fewer than 2 items"))).toBe(true);
    expect(errors.some((e) => e.includes("must be equal to one of the allowed values"))).toBe(true);
  });
});

describe("validateGlossary", () => {
  it("passes for the real glossary bank", () => {
    const { errors } = validateGlossary();
    expect(errors).toEqual([]);
  });

  it("passes for a well-formed fixture", () => {
    const { errors } = validateGlossary(path.join(__dirname, "__fixtures__", "valid-glossary"));
    expect(errors).toEqual([]);
  });

  it("catches duplicate terms, duplicate ids, and invalid category", () => {
    const { errors } = validateGlossary(path.join(__dirname, "__fixtures__", "bad-glossary"));

    expect(errors.some((e) => e.includes('duplicate term "Duplicate Term"'))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate id"))).toBe(true);
    expect(errors.some((e) => e.includes("must be equal to one of the allowed values"))).toBe(true);
  });
});
