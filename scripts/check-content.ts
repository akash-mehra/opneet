import { readFile } from "node:fs/promises";
import { validateQuestions } from "../src/domain/engine";
import { validateMiniTest } from "../src/data/mini-test";
validateMiniTest();
const bank = validateQuestions(
  JSON.parse(await readFile(new URL("../content/reviewed.json", import.meta.url), "utf8")),
  true,
);
console.log(
  `Content validation passed: ${bank.length} approved NEET UG PYQs. Samples remain separate.`,
);
console.log("Mini Test 01: 100 original drafts; 60 Biology / 40 Physics; 40 Easy / 40 Medium / 20 Hard.");
