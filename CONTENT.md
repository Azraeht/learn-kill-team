# Adding and editing questions

Questions live in `src/data/questions/`, one JSON file per category:

- `core-rules.json`
- `terrain-missions.json`
- `angels-of-death.json`

Each file is a flat JSON array of question objects. To add a new kill team
(faction) later: add a new file here, add one entry to the `categories`
array in `src/data/categories.ts`, and register it in
`questionsByCategory` in that same file.

## Field reference

```jsonc
{
  "id": "core-006",                 // required, unique across ALL files, format "<prefix>-###"
  "category": "core-rules",         // required, must match a category id
  "subtopic": "activation",         // optional, free text, for future filtering
  "type": "multiple-choice",        // required: "multiple-choice" | "true-false"
  "prompt": "Your question text",   // required
  "choices": ["A", "B", "C", "D"],  // required for multiple-choice (2-6 items); omit for true-false
  "correctIndex": 1,                // required: index into choices, or 0=True/1=False for true-false
  "explanation": "Why that's the answer, shown after answering.", // optional but recommended
  "status": "draft",                // required: "draft" | "verified"
  "sourceRef": "Core Rules p.12, 'Actions'", // recommended once status is "verified"
  "tags": ["apl", "activation"]     // optional, free text
}
```

- `type: "true-false"` questions render as True/False automatically — don't
  add a `choices` field for them, and `correctIndex` must be `0` (True) or
  `1` (False).
- Set `"status": "verified"` only once you've checked the question against
  the official rules, and fill in `sourceRef` (page/section) when you do —
  the app shows a `DRAFT — unverified` badge on anything still `"draft"`.

## Template to copy-paste

```json
{
  "id": "core-XXX",
  "category": "core-rules",
  "type": "multiple-choice",
  "prompt": "",
  "choices": ["", "", "", ""],
  "correctIndex": 0,
  "explanation": "",
  "status": "draft",
  "sourceRef": ""
}
```

## Validating your edits

After editing any file in `src/data/questions/`, run:

```bash
npm run validate-content
```

This checks each question against `src/data/schema/question.schema.json`
and additionally checks (in `scripts/validate-content.ts`):

- every `id` is unique across all category files,
- `correctIndex` is within bounds of `choices` for multiple-choice questions,
- a `"verified"` question has a non-empty `sourceRef` (warning, not a hard
  failure).

This same check runs in CI on every push, so a malformed question fails the
build before it ever reaches the deployed site.
