import type { Answer, History, Mode, Pool, Question, Session, StudyState } from "./types";

export const emptyState = (): StudyState => ({
  version: 1,
  active: null,
  sessions: [],
  history: {},
  bookmarks: [],
  preferences: { theme: "light", fontSize: "normal", bank: "sample" },
});
export const emptyAnswer = (): Answer => ({
  selected: null,
  firstSelected: null,
  guessed: false,
  flagged: false,
  checked: false,
  timeSpentMs: 0,
});
export function createSession(
  questions: Question[],
  title: string,
  mode: Mode,
  minutes = questions.length,
  now = Date.now(),
): Session {
  if (!questions.length) throw new Error("Choose at least one question.");
  if (!Number.isFinite(minutes) || minutes < 1)
    throw new Error("Duration must be at least one minute.");
  return {
    id: crypto.randomUUID(),
    title,
    mode,
    questions: structuredClone(questions),
    answers: Object.fromEntries(questions.map((q) => [q.id, emptyAnswer()])),
    current: 0,
    status: "active",
    startedAt: now,
    lastActiveAt: now,
    deadline: mode === "exam" ? now + minutes * 60_000 : null,
  };
}
export function checkpoint(session: Session, now = Date.now()): Session {
  if (session.status !== "active") return session;
  const end = session.deadline ? Math.min(now, session.deadline) : now;
  const id = session.questions[session.current].id;
  return {
    ...session,
    lastActiveAt: end,
    answers: {
      ...session.answers,
      [id]: {
        ...session.answers[id],
        timeSpentMs: session.answers[id].timeSpentMs + Math.max(0, end - session.lastActiveAt),
      },
    },
  };
}
export function selectAnswer(session: Session, option: number, now = Date.now()): Session {
  if (session.status !== "active" || (session.deadline !== null && now >= session.deadline))
    return session;
  if (!Number.isInteger(option) || option < 0 || option > 3) return session;
  const s = checkpoint(session, now);
  const id = s.questions[s.current].id;
  const a = s.answers[id];
  if (s.mode === "practice" && a.checked) return s;
  return {
    ...s,
    answers: {
      ...s.answers,
      [id]: { ...a, selected: option, firstSelected: a.firstSelected ?? option },
    },
  };
}
export function summarize(session: Session) {
  let correct = 0,
    incorrect = 0,
    skipped = 0,
    guessed = 0,
    guessCorrect = 0,
    changed = 0;
  for (const q of session.questions) {
    const a = session.answers[q.id];
    if (a.selected === null) skipped++;
    else {
      if (a.selected === q.correct) correct++;
      else incorrect++;
      if (a.guessed) {
        guessed++;
        if (a.selected === q.correct) guessCorrect++;
      }
      if (a.firstSelected !== a.selected) changed++;
    }
  }
  return {
    correct,
    incorrect,
    skipped,
    guessed,
    guessCorrect,
    changed,
    guessScore: guessCorrect * 4 - (guessed - guessCorrect),
    score: correct * 4 - incorrect,
    maximum: session.questions.length * 4,
    accuracy: correct + incorrect ? Math.round((100 * correct) / (correct + incorrect)) : 0,
  };
}
export function complete(
  state: StudyState,
  reason: "submitted" | "timeout" = "submitted",
  now = Date.now(),
): StudyState {
  if (!state.active || state.active.status === "completed") return state;
  const s = checkpoint(state.active, now);
  const finished: Session = {
    ...s,
    status: "completed",
    completedAt: reason === "timeout" ? (s.deadline ?? now) : now,
    completionReason: reason,
  };
  const history: Record<string, History> = { ...state.history };
  for (const q of finished.questions) {
    const a = finished.answers[q.id];
    if (a.selected === null) continue;
    const old = history[q.id];
    history[q.id] = {
      questionId: q.id,
      firstAnswer: old?.firstAnswer ?? a.firstSelected ?? a.selected,
      latestAnswer: a.selected,
      correct: a.selected === q.correct,
      guessed: a.guessed,
      changed: a.firstSelected !== a.selected,
      attempts: (old?.attempts ?? 0) + 1,
      lastSeen: finished.completedAt!,
    };
  }
  return {
    ...state,
    active: null,
    history,
    sessions: [finished, ...state.sessions.filter((x) => x.id !== finished.id)],
  };
}
export function poolQuestions(questions: Question[], state: StudyState, pool: Pool): Question[] {
  return questions.filter((q) => {
    const h = state.history[q.id];
    return (
      pool === "all" ||
      (pool === "unseen" && !h) ||
      (pool === "incorrect" && h && !h.correct) ||
      (pool === "guessed" && h?.guessed) ||
      (pool === "changed" && h?.changed) ||
      (pool === "bookmarked" && state.bookmarks.includes(q.id))
    );
  });
}
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function validateQuestions(input: unknown, requireApproved = false): Question[] {
  if (!Array.isArray(input)) throw new Error("The question file must contain an array.");
  const ids = new Set<string>();
  for (let i = 0; i < input.length; i++) {
    const q = input[i] as Question;
    const fail = (message: string) => {
      throw new Error(`Question ${i + 1}: ${message}`);
    };
    if (!q || typeof q !== "object") fail("expected a question object.");
    if (typeof q.id !== "string" || !q.id.trim() || ids.has(q.id)) fail("missing or duplicate ID.");
    ids.add(q.id);
    if (!["Physics", "Chemistry", "Biology"].includes(q.subject))
      fail("subject must be Physics, Chemistry or Biology.");
    for (const field of ["chapter", "topic", "prompt", "explanation", "takeaway"] as const)
      if (typeof q[field] !== "string" || !q[field].trim()) fail(`${field} is required.`);
    if (!Number.isInteger(q.revision) || q.revision < 1)
      fail("revision must be a positive integer.");
    if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) fail("unknown difficulty.");
    if (!Array.isArray(q.tags) || !q.tags.every((t) => typeof t === "string"))
      fail("tags must be text.");
    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((o) => typeof o !== "string" || !o.trim()) ||
      new Set(q.options).size !== 4
    )
      fail("provide four distinct options.");
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3)
      fail("correct must be an option index from 0 to 3.");
    if (q.diagram && [q.diagram.id, q.diagram.title, q.diagram.alt].some(value => typeof value !== "string" || !value.trim()))
      fail("diagrams need an identity, title and text description.");
    if (!q.source || !["sample", "original", "pyq"].includes(q.source.kind) || !q.source.label?.trim())
      fail("source information is required.");
    if (!q.review || !["sample", "draft", "approved"].includes(q.review.status))
      fail("review state is required.");
    if (q.source.kind === "sample" && q.review.status !== "sample")
      fail("sample questions must remain labeled sample.");
    if (
      q.source.kind === "pyq" &&
      (!Number.isInteger(q.source.year) || q.source.year! < 1988 || !q.source.reference?.trim())
    )
      fail("PYQs require a year and source reference.");
    if (requireApproved && (q.review.status !== "approved" || q.source.kind !== "pyq"))
      fail("only approved PYQs belong in the reviewed bank.");
    if (
      q.review.status === "approved" &&
      (!q.review.reviewedBy?.trim() ||
        !q.review.reviewedAt ||
        !Number.isFinite(Date.parse(q.review.reviewedAt)))
    )
      fail("approval needs reviewer and date.");
  }
  return input as Question[];
}
