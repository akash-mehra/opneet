# Reviewed question publishing

The study app comes first. Real NEET UG PYQs are added only after source and explanation review.

## Review procedure

1. Identify the original exam year, paper/set, question number and source reference.
2. Check the final official answer key, including corrections or dropped questions.
3. Transcribe the stem/options accurately; review notation, units and any necessary diagram.
4. Write and independently review the explanation and a short transferable takeaway.
5. Classify the question under **Physics, Chemistry or Biology**, with chapter, topic and difficulty. Chapter labels in the demo are a small starter catalog, not a complete syllabus.
6. Record `reviewedBy` and `reviewedAt`, then set `review.status` to `approved`.
7. Add the entry to `content/reviewed.json`, validate, and review the Git diff before pushing.

## Contract example — placeholder, not a real question

```json
{
  "id": "neet-YYYY-set-qNNN",
  "revision": 1,
  "subject": "Physics",
  "chapter": "Reviewed chapter",
  "topic": "Reviewed topic",
  "difficulty": "Medium",
  "prompt": "Reviewed question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "explanation": "Reviewed explanation of the correct answer and reasoning.",
  "takeaway": "One idea worth remembering.",
  "tags": ["Reviewed topic"],
  "source": {
    "kind": "pyq",
    "label": "NEET UG YYYY · paper/set · question NNN",
    "year": 2020,
    "reference": "Original source and final key reference"
  },
  "review": {
    "status": "approved",
    "reviewedBy": "Reviewer name",
    "reviewedAt": "2026-10-18"
  }
}
```

`correct` is zero-indexed: A=0, B=1, C=2, D=3. Replace all placeholder values. The year above only illustrates the number type; it is not source attribution. Use a new unique ID for a new question. For a correction, retain identity and increment `revision`. Completed sessions keep snapshots so old results remain explainable after later content corrections.

The current schema supports plain text and Unicode notation; it does not yet support diagram uploads or LaTeX rendering. Add those capabilities before importing questions that depend on a figure. Do not remove required context to fit the current schema. Only publish material you are entitled to use.

## Guardrails implemented in code

- Four distinct options; a single valid correct index.
- Required question, explanation, takeaway, topic/chapter and revision.
- Only the three UG subjects.
- Unique IDs per file.
- Published bank accepts only approved PYQs with year, reference, reviewer and review date.
- Sample questions stay in a separate source and cannot pass the reviewed-bank check.

`npm run content:check` is also part of the GitHub deployment workflow. Validation checks structure and review metadata; a human must verify educational correctness.
## Original mini-test drafts

Mini Test 01 is authored in `src/data/mini-test.ts` with `source.kind: "original"` and `review.status: "draft"`. It is available through a separate original practice bank and the fixed test launcher. Its questions must not be copied into the approved-PYQ file or assigned fabricated examination years. The existing approved-PYQ gate still requires actual PYQ provenance and an approval record.

`content/MINI-TEST-01.md` records the topic/difficulty contract and source references. `content/MINI-TEST-01-REVIEW.md` is a generated author copy with all questions, correct choices and explanations. Preserve question identities and increment revisions for corrections. `npm run content:check` validates exact quotas alongside the reviewed-bank gate.
