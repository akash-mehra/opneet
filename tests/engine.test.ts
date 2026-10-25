import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkpoint,
  complete,
  createSession,
  emptyState,
  poolQuestions,
  selectAnswer,
  summarize,
  validateQuestions,
} from "../src/domain/engine";
import { samples } from "../src/data/questions";
import { validateBackup } from "../src/data/storage";
import { MINI_TEST, createMiniTestPaper, miniTestQuestions, validateMiniTest } from "../src/data/mini-test";
import { BIOLOGY_TEST, BIOLOGY_REPEAT_IDS, biologyTestQuestions, createBiologyTestPaper, validateBiologyTest } from "../src/data/biology-test";
import { originalQuestions } from "../src/data/original-questions";

test("biology paper covers only the requested chapters with exact difficulty, repeat and diagram counts", () => {
  assert.doesNotThrow(validateBiologyTest);
  const paper = createBiologyTestPaper();
  assert.equal(paper.length, 90);
  assert.equal(new Set(paper.map(q => q.id)).size, 90);
  assert.ok(paper.every(q => q.subject === "Biology"));
  assert.equal(new Set(paper.map(q => q.chapter)).size, 9);
  for (const [chapter, count] of Object.entries(BIOLOGY_TEST.chapters))
    assert.equal(paper.filter(q => q.chapter === chapter).length, count);
  for (const [difficulty, count] of Object.entries(BIOLOGY_TEST.difficulty))
    assert.equal(paper.filter(q => q.difficulty === difficulty).length, count);
  const repeats = paper.filter(q => miniTestQuestions.some(old => old.id === q.id));
  assert.deepEqual(new Set(repeats.map(q => q.id)), new Set(BIOLOGY_REPEAT_IDS));
  for (const q of repeats) assert.strictEqual(q, miniTestQuestions.find(old => old.id === q.id));
  assert.equal(paper.filter(q => q.diagram).length, 6);
  assert.equal(originalQuestions.length, 178);
  assert.equal(new Set(originalQuestions.map(q => q.id)).size, 178);
  assert.throws(() => validateQuestions(biologyTestQuestions, true), /approved PYQs/);
});

test("biology exam restores diagram metadata and a 90-minute deadline, with scoring out of 360", () => {
  const state = emptyState();
  state.preferences.bank = "original";
  state.active = createSession(createBiologyTestPaper(), BIOLOGY_TEST.title, "exam", BIOLOGY_TEST.minutes, 1000);
  assert.equal(state.active.deadline, 1000 + 90 * 60_000);
  const restored = validateBackup(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.active, state.active);
  for (const q of state.active.questions) state.active.answers[q.id].selected = q.correct;
  assert.equal(summarize(state.active).score, 360);
  for (const q of state.active.questions) state.active.answers[q.id].selected = (q.correct + 1) % 4;
  assert.equal(summarize(state.active).score, -90);
});

test("a repeated biology item retains history/bookmark identity without altering the previous snapshot", () => {
  const q = biologyTestQuestions.find(q => q.id === BIOLOGY_REPEAT_IDS[0])!;
  let state = emptyState();
  state.bookmarks = [q.id];
  state.active = selectAnswer(createSession([q], "Test 01", "exam", 110, 1000), (q.correct + 1) % 4, 2000);
  state = complete(state, "submitted", 3000);
  const snapshot = JSON.stringify(state.sessions[0]);
  state.active = selectAnswer(createSession([q], "Test 02", "exam", 90, 4000), q.correct, 5000);
  state = complete(state, "submitted", 6000);
  assert.equal(state.history[q.id].attempts, 2);
  assert.equal(state.history[q.id].correct, true);
  assert.deepEqual(state.bookmarks, [q.id]);
  assert.equal(JSON.stringify(state.sessions[1]), snapshot);
});

test("mini-test paper has exact subject, topic and difficulty quotas without repeated questions", () => {
  assert.doesNotThrow(validateMiniTest);
  const paper = createMiniTestPaper();
  assert.equal(paper.length, 100);
  assert.equal(new Set(paper.map(q => q.id)).size, 100);
  assert.ok(paper.slice(0, 60).every(q => q.subject === "Biology"));
  assert.ok(paper.slice(60).every(q => q.subject === "Physics"));
  for (const [difficulty, count] of Object.entries(MINI_TEST.difficulty))
    assert.equal(paper.filter(q => q.difficulty === difficulty).length, count);
  assert.deepEqual(new Set(paper.map(q => q.id)), new Set(miniTestQuestions.map(q => q.id)));
});
test("100-question mini-test uses a 110-minute deadline and scores out of 400", () => {
  const session = createSession(createMiniTestPaper(), MINI_TEST.title, "exam", MINI_TEST.minutes, 1000);
  assert.equal(session.deadline, 1000 + 110 * 60_000);
  for (const q of session.questions) session.answers[q.id].selected = q.correct;
  assert.equal(summarize(session).score, 400);
  for (const q of session.questions) session.answers[q.id].selected = (q.correct + 1) % 4;
  assert.equal(summarize(session).score, -100);
});
test("original mini-test snapshots restore while remaining excluded from verified PYQs", () => {
  const state = emptyState();
  state.preferences.bank = "original";
  state.active = createSession(createMiniTestPaper(), MINI_TEST.title, "exam", MINI_TEST.minutes, 1000);
  assert.equal(validateBackup(JSON.parse(JSON.stringify(state))).active?.questions.length, 100);
  assert.ok(miniTestQuestions.every(q => q.source.kind === "original" && q.review.status === "draft"));
  assert.throws(() => validateQuestions(miniTestQuestions, true), /approved PYQs/);
});

test("selection preserves the first answer, including option zero", () => {
  const s = createSession([samples[0]], "Test", "exam", 1, 1000);
  const first = selectAnswer(s, 0, 2000);
  const changed = selectAnswer(first, 2, 3000);
  assert.equal(changed.answers[samples[0].id].firstSelected, 0);
  assert.equal(changed.answers[samples[0].id].selected, 2);
  assert.equal(s.answers[samples[0].id].selected, null);
});
test("checking practice locks selection, while exam permits changes", () => {
  const q = samples[0];
  const s = selectAnswer(createSession([q], "Practice", "practice", 1, 1000), 0, 2000);
  const locked = { ...s, answers: { ...s.answers, [q.id]: { ...s.answers[q.id], checked: true } } };
  assert.equal(selectAnswer(locked, 2, 3000).answers[q.id].selected, 0);
});
test("expired exams reject answer changes even before timeout tick", () => {
  const s = createSession([samples[0]], "Exam", "exam", 1, 1000);
  assert.equal(selectAnswer(s, 2, 61000).answers[samples[0].id].selected, null);
});
test("UG scoring includes flagged answers and gives no penalty for blanks", () => {
  let s = createSession(samples.slice(0, 3), "Score", "exam", 3, 1000);
  s = selectAnswer(s, 2, 2000);
  s.answers[samples[0].id].flagged = true;
  s.answers[samples[0].id].guessed = true;
  s = { ...s, current: 1 };
  s = selectAnswer(s, 0, 3000);
  s.answers[samples[1].id].guessed = true;
  const r = summarize(s);
  assert.equal(r.score, 3);
  assert.equal(r.correct, 1);
  assert.equal(r.incorrect, 1);
  assert.equal(r.skipped, 1);
  assert.equal(r.guessScore, 3);
});
test("completion creates an immutable snapshot and preserves history across reattempts", () => {
  const q = samples[0];
  let state = emptyState();
  state.active = selectAnswer(createSession([q], "First", "practice", 1, 1000), 0, 2000);
  state = complete(state, "submitted", 3000);
  const first = state.sessions[0];
  assert.equal(state.history[q.id].correct, false);
  state.active = selectAnswer(createSession([q], "Again", "practice", 1, 4000), q.correct, 5000);
  state = complete(state, "submitted", 6000);
  assert.equal(state.history[q.id].firstAnswer, 0);
  assert.equal(state.history[q.id].latestAnswer, q.correct);
  assert.equal(state.history[q.id].attempts, 2);
  assert.equal(first.answers[q.id].selected, 0);
  assert.equal(poolQuestions([q], state, "incorrect").length, 0);
  assert.equal(complete(state).sessions.length, 2);
});
test("question content is snapshotted, not shared with the live bank", () => {
  const qs = structuredClone(samples.slice(0, 1));
  const s = createSession(qs, "Snapshot", "practice", 1, 0);
  qs[0].prompt = "Edited later";
  assert.notEqual(s.questions[0].prompt, qs[0].prompt);
});
test("checkpoint clamps active exam time to deadline and paused practice does not accumulate", () => {
  const s = createSession([samples[0]], "Timed", "exam", 1, 1000);
  assert.equal(checkpoint(s, 90000).answers[samples[0].id].timeSpentMs, 60000);
  const paused = { ...s, status: "paused" as const };
  assert.equal(checkpoint(paused, 90000).answers[samples[0].id].timeSpentMs, 0);
});
test("timeout uses deadline as completion timestamp", () => {
  const state = emptyState();
  state.active = createSession([samples[0]], "Timed", "exam", 1, 1000);
  const result = complete(state, "timeout", 95000);
  assert.equal(result.sessions[0].completedAt, 61000);
  assert.equal(result.sessions[0].completionReason, "timeout");
});
test("review pools use actual history and bookmarks", () => {
  const q = samples[0];
  let state = emptyState();
  state.active = selectAnswer(createSession([q], "Test", "exam", 1, 0), 0, 10);
  state.active = selectAnswer(state.active, 1, 20);
  state.active.answers[q.id].guessed = true;
  state = complete(state, "submitted", 30);
  state.bookmarks = [q.id];
  for (const pool of ["incorrect", "guessed", "changed", "bookmarked"] as const)
    assert.equal(poolQuestions([q], state, pool).length, 1);
  assert.equal(poolQuestions([q], state, "unseen").length, 0);
});
test("content gate rejects PG subjects, duplicate IDs and unreviewed publishing", () => {
  assert.throws(() => validateQuestions([{ ...samples[0], subject: "Anatomy" }]), /subject/);
  assert.throws(() => validateQuestions([samples[0], samples[0]]), /duplicate/);
  assert.throws(() => validateQuestions([samples[0]], true), /approved PYQs/);
  assert.throws(() => validateQuestions([{ ...samples[0], correct: 8 }]), /correct/);
});
test("approved PYQs require traceable source and approval metadata", () => {
  const q = {
    ...samples[0],
    source: { kind: "pyq", label: "Reviewed source", year: 2020, reference: "Paper A, question 1" },
    review: { status: "approved", reviewedBy: "Owner", reviewedAt: "2026-10-18" },
  };
  assert.equal(validateQuestions([q], true).length, 1);
  assert.throws(
    () => validateQuestions([{ ...q, review: { status: "approved" } }], true),
    /reviewer/,
  );
});
test("backup validation rejects malformed answer data", () => {
  const state = emptyState();
  state.active = createSession([samples[0]], "Backup", "practice", 1, 0);
  assert.equal(validateBackup(JSON.parse(JSON.stringify(state))).version, 1);
  state.active.answers[samples[0].id].selected = 99;
  assert.throws(() => validateBackup(state), /answer/);
});
test("backup validation rejects pausable exams and invalid practice deadlines", () => {
  const state = emptyState();
  state.active = createSession([samples[0]], "Exam", "exam", 1, 1000);
  state.active.status = "paused";
  assert.throws(() => validateBackup(state), /timer/);
  state.active = createSession([samples[0]], "Practice", "practice", 1, 1000);
  state.active.deadline = 4000;
  assert.throws(() => validateBackup(state), /timer/);
});
