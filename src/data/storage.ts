import { emptyState, validateQuestions } from "../domain/engine";
import type { Session, StudyState } from "../domain/types";
export const STORAGE_KEY = "opneet.study.v1";
function validateSession(s: Session, completed: boolean) {
  if (
    !s ||
    typeof s.id !== "string" ||
    typeof s.title !== "string" ||
    !["practice", "exam"].includes(s.mode) ||
    !["active", "paused", "completed"].includes(s.status)
  )
    throw new Error("Invalid session.");
  validateQuestions(s.questions);
  if (
    !s.questions.length ||
    !Number.isInteger(s.current) ||
    s.current < 0 ||
    s.current >= s.questions.length ||
    !s.answers
  )
    throw new Error("Invalid question position.");
  if (
    ![s.startedAt, s.lastActiveAt].every((x) => Number.isFinite(x) && x >= 0) ||
    (s.mode === "practice" && s.deadline !== null) ||
    (s.mode === "exam" &&
      (!Number.isFinite(s.deadline) || s.deadline! < s.startedAt || s.status === "paused"))
  )
    throw new Error("Invalid session timer.");
  if (completed && (s.status !== "completed" || !Number.isFinite(s.completedAt)))
    throw new Error("Invalid completed attempt.");
  if (!completed && s.status === "completed")
    throw new Error("Completed attempt cannot be active.");
  for (const q of s.questions) {
    const a = s.answers[q.id];
    if (
      !a ||
      ![a.selected, a.firstSelected].every(
        (n) => n === null || (Number.isInteger(n) && n >= 0 && n <= 3),
      ) ||
      ![a.guessed, a.flagged, a.checked].every((x) => typeof x === "boolean") ||
      !Number.isFinite(a.timeSpentMs) ||
      a.timeSpentMs < 0
    )
      throw new Error("Invalid answer record.");
  }
}
export function validateBackup(value: unknown): StudyState {
  const d = value as StudyState;
  if (
    !d ||
    d.version !== 1 ||
    !Array.isArray(d.sessions) ||
    !Array.isArray(d.bookmarks) ||
    !d.bookmarks.every((id) => typeof id === "string") ||
    !d.history ||
    typeof d.history !== "object" ||
    Array.isArray(d.history)
  )
    throw new Error("This is not a opneet v1 backup.");
  if (
    !d.preferences ||
    !["light", "sepia", "dark"].includes(d.preferences.theme) ||
    !["normal", "large"].includes(d.preferences.fontSize) ||
    !["sample", "reviewed"].includes(d.preferences.bank)
  )
    throw new Error("Invalid reading preferences.");
  const ids = new Set<string>();
  for (const s of d.sessions) {
    validateSession(s, true);
    if (ids.has(s.id)) throw new Error("Duplicate session.");
    ids.add(s.id);
  }
  if (d.active !== null) {
    validateSession(d.active, false);
    if (ids.has(d.active.id)) throw new Error("Active attempt is also completed.");
  }
  for (const [id, h] of Object.entries(d.history)) {
    if (
      !h ||
      h.questionId !== id ||
      ![h.firstAnswer, h.latestAnswer].every((n) => Number.isInteger(n) && n >= 0 && n <= 3) ||
      ![h.correct, h.guessed, h.changed].every((x) => typeof x === "boolean") ||
      !Number.isInteger(h.attempts) ||
      h.attempts < 1 ||
      !Number.isFinite(h.lastSeen)
    )
      throw new Error("Invalid learning history.");
  }
  return d;
}
export function loadStudy(): { state: StudyState; error: string | null } {
  try {
    const text = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("recall-ug.study.v1");
    if (!text) return { state: emptyState(), error: null };
    const state = validateBackup(JSON.parse(text));
    if (state.active?.mode === "practice") state.active = { ...state.active, status: "paused" };
    return { state, error: null };
  } catch {
    return {
      state: emptyState(),
      error:
        "Saved data could not be read. It has been left untouched. Download it before starting fresh, or restore a backup.",
    };
  }
}
export function saveStudy(state: StudyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
export function downloadJSON(data: unknown, name: string) {
  const blob = new Blob([typeof data === "string" ? data : JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
