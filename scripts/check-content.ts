import { readFile } from "node:fs/promises";
import { validateQuestions } from "../src/domain/engine";
import { validateMiniTest } from "../src/data/mini-test";
import { validateBiologyTest } from "../src/data/biology-test";
validateMiniTest();
validateBiologyTest();
const bank = validateQuestions(
  JSON.parse(await readFile(new URL("../content/reviewed.json", import.meta.url), "utf8")),
  true,
);
console.log(
  `Content validation passed: ${bank.length} approved NEET UG PYQs. Samples remain separate.`,
);
console.log("Mini Test 01: 100 original drafts; 60 Biology / 40 Physics; 40 Easy / 40 Medium / 20 Hard.");
console.log("Mini Test 02: 90 Biology drafts; 78 new / 12 repeats; 27 Easy / 40 Medium / 23 Hard; 6 original diagrams.");
