import { readFile } from "node:fs/promises";
import { validateQuestions } from "../src/domain/engine";
const bank = validateQuestions(
  JSON.parse(await readFile(new URL("../content/reviewed.json", import.meta.url), "utf8")),
  true,
);
console.log(
  `Content validation passed: ${bank.length} approved NEET UG PYQs. Samples remain separate.`,
);
