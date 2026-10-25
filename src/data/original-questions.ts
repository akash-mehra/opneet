import { validateQuestions } from "../domain/engine";
import { miniTestQuestions } from "./mini-test";
import { biologyTestNewQuestions } from "./biology-test";

// Repeated Test 01 items already exist in this bank: include only the 78 new IDs.
export const originalQuestions = validateQuestions([...miniTestQuestions, ...biologyTestNewQuestions]);
