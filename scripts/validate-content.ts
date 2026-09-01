import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Ajv from "ajv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const questionsDir = path.join(__dirname, "..", "src", "data", "questions");
const schemaPath = path.join(__dirname, "..", "src", "data", "schema", "question.schema.json");

interface RawQuestion {
  id: string;
  category: string;
  type: string;
  choices?: string[];
  correctIndex: number;
  status: string;
  sourceRef?: string;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateContent(dir: string = questionsDir): ValidationResult {
  const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Map<string, string>();

  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = JSON.parse(readFileSync(filePath, "utf-8")) as RawQuestion[];

    if (!Array.isArray(content)) {
      errors.push(`${file}: expected a JSON array of questions`);
      continue;
    }

    for (const [index, question] of content.entries()) {
      const label = `${file}[${index}]${question?.id ? ` (${question.id})` : ""}`;

      if (question?.id) {
        const prevFile = seenIds.get(question.id);
        if (prevFile) {
          errors.push(`${label}: duplicate id "${question.id}" also found in ${prevFile}`);
        } else {
          seenIds.set(question.id, file);
        }
      }

      if (!validate(question)) {
        for (const err of validate.errors ?? []) {
          errors.push(`${label}: ${err.instancePath || "/"} ${err.message}`);
        }
        continue;
      }

      if (question.type === "multiple-choice" && question.choices) {
        if (question.correctIndex < 0 || question.correctIndex >= question.choices.length) {
          errors.push(
            `${label}: correctIndex ${question.correctIndex} is out of bounds for ${question.choices.length} choices`,
          );
        }
      }

      if (question.status === "verified" && !question.sourceRef?.trim()) {
        warnings.push(`${label}: status is "verified" but sourceRef is empty`);
      }
    }
  }

  return { errors, warnings };
}

function main() {
  const { errors, warnings } = validateContent();

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
