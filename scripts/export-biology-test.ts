import { writeFile } from "node:fs/promises";
import { BIOLOGY_TEST, BIOLOGY_REPEAT_IDS, biologyTestQuestions } from "../src/data/biology-test";

const lines = ["# Mini Test 02 — author review copy", "", `${BIOLOGY_TEST.questions} Biology questions: 78 new originals and 12 unchanged repeats from Test 01. ${BIOLOGY_TEST.minutes} minutes; +4 / −1 / 0; 360 marks maximum.`, "", "This author copy includes keys, explanations and internal metadata. The student app hides answers until submission, and hides topic/difficulty tags on question and review screens. Student order is shuffled. Diagram descriptions below accompany the actual figures rendered in the app.", ""];
for (const [i, q] of biologyTestQuestions.entries()) {
  lines.push(`## ${i + 1}. ${q.id} · ${q.difficulty}${BIOLOGY_REPEAT_IDS.some(id => id === q.id) ? " · Repeated from Test 01" : ""}`, "", `${q.chapter} / ${q.topic}`, "", q.prompt, "");
  if (q.diagram) lines.push(`**Original diagram: ${q.diagram.title}.** ${q.diagram.alt}`, "");
  for (const [j, option] of q.options.entries()) lines.push(`${String.fromCharCode(65 + j)}. ${option}`);
  lines.push("", `**Answer: ${String.fromCharCode(65 + q.correct)} — ${q.options[q.correct]}**`, "", q.explanation, "");
}
await writeFile(new URL("../content/MINI-TEST-02-REVIEW.md", import.meta.url), lines.join("\n"));
console.log("Exported content/MINI-TEST-02-REVIEW.md");
