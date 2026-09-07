import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const questionsDir = path.join(__dirname, "..", "src", "data", "questions");
const sequencesDir = path.join(__dirname, "..", "src", "data", "sequences");
const scenariosDir = path.join(__dirname, "..", "src", "data", "scenarios");
const glossaryDir = path.join(__dirname, "..", "src", "data", "glossary");
const questionSchemaPath = path.join(__dirname, "..", "src", "data", "schema", "question.schema.json");
const sequenceSchemaPath = path.join(__dirname, "..", "src", "data", "schema", "sequence.schema.json");
const scenarioSchemaPath = path.join(__dirname, "..", "src", "data", "schema", "scenario.schema.json");
const glossarySchemaPath = path.join(__dirname, "..", "src", "data", "schema", "glossary.schema.json");

interface RawQuestion {
  id: string;
  category: string;
  type: string;
  choices?: string[];
  correctIndex: number;
  status: string;
  sourceRef?: string;
}

interface RawSequence {
  id: string;
  category: string;
  steps: string[];
  status: string;
  sourceRef?: string;
}

interface RawScenario {
  id: string;
  category: string;
  steps: { prompt: string; choices: string[]; correctIndex: number }[];
  status: string;
  sourceRef?: string;
}

interface RawGlossaryEntry {
  id: string;
  term: string;
  category: string;
  status: string;
  sourceRef?: string;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function validateEntries<T extends { id: string; status: string; sourceRef?: string }>(
  dir: string,
  schemaPath: string,
  checkEntry: (label: string, entry: T, errors: string[]) => void,
): ValidationResult {
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Map<string, string>();

  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = JSON.parse(readFileSync(filePath, "utf-8")) as T[];

    if (!Array.isArray(content)) {
      errors.push(`${file}: expected a JSON array`);
      continue;
    }

    for (const [index, entry] of content.entries()) {
      const label = `${file}[${index}]${entry?.id ? ` (${entry.id})` : ""}`;

      if (entry?.id) {
        const prevFile = seenIds.get(entry.id);
        if (prevFile) {
          errors.push(`${label}: duplicate id "${entry.id}" also found in ${prevFile}`);
        } else {
          seenIds.set(entry.id, file);
        }
      }

      if (!validate(entry)) {
        for (const err of validate.errors ?? []) {
          errors.push(`${label}: ${err.instancePath || "/"} ${err.message}`);
        }
        continue;
      }

      checkEntry(label, entry, errors);

      if (entry.status === "verified" && !entry.sourceRef?.trim()) {
        warnings.push(`${label}: status is "verified" but sourceRef is empty`);
      }
    }
  }

  return { errors, warnings };
}

export function validateContent(dir: string = questionsDir): ValidationResult {
  return validateEntries<RawQuestion>(dir, questionSchemaPath, (label, question, errors) => {
    if (question.type === "multiple-choice" && question.choices) {
      if (question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
        errors.push(
          `${label}: correctIndex ${question.correctIndex} is out of bounds for ${question.choices.length} choices`,
        );
      }
    }
  });
}

export function validateSequences(dir: string = sequencesDir): ValidationResult {
  return validateEntries<RawSequence>(dir, sequenceSchemaPath, (label, sequence, errors) => {
    const uniqueSteps = new Set(sequence.steps);
    if (uniqueSteps.size !== sequence.steps.length) {
      errors.push(`${label}: steps must be unique within a sequence`);
    }
  });
}

export function validateScenarios(dir: string = scenariosDir): ValidationResult {
  return validateEntries<RawScenario>(dir, scenarioSchemaPath, (label, scenario, errors) => {
    for (const [index, step] of scenario.steps.entries()) {
      if (step.correctIndex < 0 || step.correctIndex >= step.choices.length) {
        errors.push(
          `${label}: step ${index} correctIndex ${step.correctIndex} is out of bounds for ${step.choices.length} choices`,
        );
      }
      if (new Set(step.choices).size !== step.choices.length) {
        errors.push(`${label}: step ${index} has duplicate choices`);
      }
    }
  });
}

export function validateGlossary(dir: string = glossaryDir): ValidationResult {
  const seenTerms = new Map<string, string>();

  return validateEntries<RawGlossaryEntry>(dir, glossarySchemaPath, (label, entry, errors) => {
    const prevLabel = seenTerms.get(entry.term);
    if (prevLabel) {
      errors.push(`${label}: duplicate term "${entry.term}" also defined at ${prevLabel}`);
    } else {
      seenTerms.set(entry.term, label);
    }
  });
}

function main() {
  const questionResult = validateContent();
  const sequenceResult = validateSequences();
  const scenarioResult = validateScenarios();
  const glossaryResult = validateGlossary();

  const errors = [
    ...questionResult.errors,
    ...sequenceResult.errors,
    ...scenarioResult.errors,
    ...glossaryResult.errors,
  ];
  const warnings = [
    ...questionResult.warnings,
    ...sequenceResult.warnings,
    ...scenarioResult.warnings,
    ...glossaryResult.warnings,
  ];

  for (const warning of warnings) {
    console.warn(`WARNING: ${warning}`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR: ${error}`);
    }
    console.error(`\nContent validation failed: ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log(`Content validation passed (${warnings.length} warning(s)).`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
