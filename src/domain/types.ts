export const SUBJECTS = ["Physics", "Chemistry", "Biology"] as const;
export type Subject = (typeof SUBJECTS)[number];
export type Mode = "practice" | "exam";
export interface Question {
  id: string;
  revision: number;
  subject: Subject;
  chapter: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
  takeaway: string;
  tags: string[];
  source: { kind: "sample" | "original" | "pyq"; label: string; year?: number; reference?: string };
  review: { status: "sample" | "draft" | "approved"; reviewedBy?: string; reviewedAt?: string };
}
export interface Answer {
  selected: number | null;
  firstSelected: number | null;
  guessed: boolean;
  flagged: boolean;
  checked: boolean;
  timeSpentMs: number;
}
export interface Session {
  id: string;
  title: string;
  mode: Mode;
  questions: Question[];
  answers: Record<string, Answer>;
  current: number;
  status: "active" | "paused" | "completed";
  startedAt: number;
  lastActiveAt: number;
  deadline: number | null;
  completedAt?: number;
  completionReason?: "submitted" | "timeout";
}
export interface History {
  questionId: string;
  firstAnswer: number;
  latestAnswer: number;
  correct: boolean;
  guessed: boolean;
  changed: boolean;
  attempts: number;
  lastSeen: number;
}
export interface Preferences {
  theme: "light" | "sepia" | "dark";
  fontSize: "normal" | "large";
  bank: "sample" | "reviewed" | "original";
}
export interface StudyState {
  version: 1;
  active: Session | null;
  sessions: Session[];
  history: Record<string, History>;
  bookmarks: string[];
  preferences: Preferences;
}
export type Pool = "all" | "unseen" | "incorrect" | "guessed" | "changed" | "bookmarked";
