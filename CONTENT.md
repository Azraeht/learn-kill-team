# Adding and editing content

There are two kinds of content: **questions** (quiz cards) and **sequences**
(the "remettre dans l'ordre" game mode for learning game flow/phases).

## Questions

Questions live in `src/data/questions/`, one JSON file per category:

- `core-rules.json`
- `terrain-missions.json`
- `aquilon-tempestus.json`
- `frelons-vespides.json`
- `yaegirs-hernkogs.json`
- `exo-armures-stealth.json`
- `cibleurs.json`
- `cercle-canoptek.json`
- `deathwatch.json`

Each file is a flat JSON array of question objects. To add a new kill team
(faction) later: add a new file here, add one entry to the `categories`
array in `src/data/categories.ts`, register it in `questionsByCategory` in
that same file, and add the category id to `CategoryId` in
`src/core/types.ts` and to the `category` enum in
`src/data/schema/question.schema.json`.

### Field reference

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

### Template to copy-paste

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

## Sequences (game-flow ordering game)

Sequences live in `src/data/sequences/`, one JSON file per category (today
just `core-rules.json`). Each sequence is a named, ordered list of steps —
the app shuffles them and the player taps them back into the correct order.
Good candidates: a phase's step-by-step breakdown, an action's resolution
sequence, anything that's a **procedure** rather than an isolated fact.

```jsonc
{
  "id": "seq-006",                     // required, unique across ALL sequence files, format "<prefix>-###"
  "category": "core-rules",            // required, must match a category id
  "title": "Séquence de Tir",          // required, shown as the card/screen title
  "description": "Optional subtitle.", // optional
  "steps": [                            // required, 3-8 items, IN THEIR CORRECT ORDER
    "First step...",
    "Second step...",
    "Third step..."
  ],
  "status": "verified",
  "sourceRef": "Core Rules, 'Tirer'"
}
```

- The order the `steps` array is written in **is** the correct answer — the
  app shuffles a copy for play.
- Steps within one sequence must be unique text (so the checker can compare
  by string equality); this is enforced by `validate-content`.
- To add a new sequence category: add a file here, add it to the `sequences`
  array in `src/data/sequences.ts`.

## Validating your edits

After editing any file in `src/data/questions/` or `src/data/sequences/`, run:

```bash
npm run validate-content
```

This checks every question against `src/data/schema/question.schema.json`
and every sequence against `src/data/schema/sequence.schema.json`, and
additionally checks (in `scripts/validate-content.ts`):

- every `id` is unique across all files of its kind,
- `correctIndex` is within bounds of `choices` for multiple-choice questions,
- steps are unique within a sequence,
- a `"verified"` entry has a non-empty `sourceRef` (warning, not a hard
  failure).

This same check runs in CI on every push, so malformed content fails the
build before it ever reaches the deployed site.
