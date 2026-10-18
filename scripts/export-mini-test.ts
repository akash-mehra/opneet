import { writeFile } from "node:fs/promises";
import { miniTestQuestions } from "../src/data/mini-test";

const lines = ["# Mini Test 01 — author review copy", "", "100 original draft questions. This copy includes the answer key and explanations; the student app hides them until submission. Question order here follows stable author IDs; student attempts shuffle within each subject.", ""];
for (const [i, q] of miniTestQuestions.entries()) {
  lines.push(`## ${i + 1}. ${q.id} · ${q.subject} · ${q.difficulty}`, "", `${q.chapter} / ${q.topic}`, "", q.prompt, "");
  for (const [j, option] of q.options.entries()) lines.push(`${String.fromCharCode(65 + j)}. ${option}`);
  lines.push("", `**Answer: ${String.fromCharCode(65 + q.correct)} — ${q.options[q.correct]}**`, "", q.explanation, "");
}
await writeFile(new URL("../content/MINI-TEST-01-REVIEW.md", import.meta.url), lines.join("\n"));
console.log("Exported the complete draft, answer key and explanations to content/MINI-TEST-01-REVIEW.md");
