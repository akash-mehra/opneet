import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  Flag,
  FlaskConical,
  History as HistoryIcon,
  LayoutDashboard,
  Leaf,
  ListFilter,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { reviewed, samples } from "./data/questions";
import { downloadJSON, loadStudy, saveStudy, STORAGE_KEY, validateBackup } from "./data/storage";
import {
  checkpoint,
  complete,
  createSession,
  emptyState,
  poolQuestions,
  selectAnswer,
  shuffled,
  summarize,
} from "./domain/engine";
import { SUBJECTS } from "./domain/types";
import type { Mode, Pool, Question, Session, StudyState, Subject } from "./domain/types";
import { Brand, Dialog, duration, Empty, letters, SectionTitle } from "./components/ui";

type Page = "home" | "qbank" | "tests" | "review" | "progress" | "settings";
const icons: Record<Subject, LucideIcon> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Leaf,
};
const subjectDescriptions: Record<Subject, string> = {
  Physics: "Understand the why behind the formula.",
  Chemistry: "Connect the concepts. Keep the clarity.",
  Biology: "From the cell to the bigger picture.",
};
const navigation: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Overview", icon: LayoutDashboard },
  { id: "qbank", label: "Question bank", icon: BookOpen },
  { id: "tests", label: "Practice & tests", icon: Timer },
  { id: "review", label: "Your revision", icon: Bookmark },
  { id: "progress", label: "Progress", icon: Target },
];
const pools: { id: Pool; name: string; description: string }[] = [
  { id: "all", name: "All questions", description: "A fresh mix from your bank" },
  { id: "unseen", name: "Not attempted", description: "Make room for something new" },
  { id: "incorrect", name: "Incorrect", description: "Turn mistakes into understanding" },
  { id: "guessed", name: "Guessed", description: "Build confidence in uncertain answers" },
  { id: "changed", name: "Changed answers", description: "Revisit your first instinct" },
  { id: "bookmarked", name: "Bookmarked", description: "The questions you saved" },
];
const dateLabel = (time: number) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(time);

export default function App() {
  const [loaded] = useState(loadStudy);
  const [state, setState] = useState<StudyState>(loaded.state);
  const [storageError, setStorageError] = useState(loaded.error);
  const [writeError, setWriteError] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<Subject | "All">("All");
  const [builder, setBuilder] = useState<{
    pool: Pool;
    subject: Subject | "All";
    mode: Mode;
  } | null>(null);
  const [result, setResult] = useState<Session | null>(null);
  const [studyOpen, setStudyOpen] = useState(Boolean(loaded.state.active));
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    action: () => void;
    label: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        searchInput.current &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName)
      ) {
        event.preventDefault();
        searchInput.current.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const bank = state.preferences.bank === "sample" ? samples : reviewed;
  const showToast = (message: string) => setToast(message);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
    document.documentElement.dataset.font = state.preferences.fontSize;
  }, [state.preferences.theme, state.preferences.fontSize]);
  useEffect(() => {
    if (storageError) return;
    try {
      saveStudy(state);
      setWriteError(false);
    } catch {
      setWriteError(true);
    }
  }, [state, storageError]);
  useEffect(() => {
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      setState((s) => {
        if (!s.active || s.active.status !== "active") return s;
        if (s.active.deadline && time >= s.active.deadline) {
          const finished = complete(s, "timeout", time);
          setResult(finished.sessions[0]);
          return finished;
        }
        return { ...s, active: checkpoint(s.active, time) };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!state.active) window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, state.active?.id, result?.id]);
  function go(next: Page) {
    setPage(next);
    setResult(null);
    setSearch("");
  }
  function openBuilder(
    pool: Pool = "all",
    selected: Subject | "All" = "All",
    mode: Mode = "practice",
  ) {
    setBuilder({ pool, subject: selected, mode });
  }
  function start(questions: Question[], title: string, mode: Mode, minutes: number) {
    if (storageError) {
      showToast("Recover or clear the unreadable saved data in Settings first.");
      return;
    }
    const launch = () => {
      setState((s) => ({ ...s, active: createSession(questions, title, mode, minutes) }));
      setBuilder(null);
      setResult(null);
      setStudyOpen(true);
    };
    if (state.active)
      setConfirm({
        title: "Replace your unfinished session?",
        body: "Its unfinished answers will be discarded. Your completed attempts and bookmarks will stay.",
        label: "Replace session",
        action: launch,
      });
    else launch();
  }
  function toggleBookmark(id: string) {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id],
    }));
  }
  function finish() {
    setState((s) => {
      const next = complete(s);
      setResult(next.sessions[0] ?? null);
      return next;
    });
  }
  function backup() {
    downloadJSON(state, `opneet-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }
  const active = state.active;
  return (
    <>
      {active && studyOpen && !result ? (
        <StudySession
          session={active}
          bookmarks={state.bookmarks}
          now={now}
          onChange={(session) => setState((s) => ({ ...s, active: session }))}
          onBookmark={toggleBookmark}
          onFinish={finish}
          onLeave={() => {
            setStudyOpen(false);
            go("home");
          }}
          onOverview={() => {
            setStudyOpen(false);
            go("home");
          }}
        />
      ) : (
        <div className="app-shell">
          <aside className="sidebar">
            <button className="brand-button" onClick={() => go("home")} aria-label="opneet home">
              <Brand />
            </button>
            <div className="sidebar-caption">Your personal study space</div>
            <nav aria-label="Main navigation">
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`nav-item ${page === id ? "active" : ""}`}
                  aria-label={label}
                  title={label}
                  onClick={() => go(id)}
                  aria-current={page === id ? "page" : undefined}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                  {id === "review" && state.bookmarks.length > 0 && (
                    <small>{state.bookmarks.length}</small>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="ug-note">
                <Leaf size={19} />
                <div>
                  <strong>NEET UG, all the way.</strong>
                  <span>Physics · Chemistry · Biology</span>
                </div>
              </div>
              <button
                className={`nav-item ${page === "settings" ? "active" : ""}`}
                onClick={() => go("settings")}
                aria-label="Settings & data"
                title="Settings & data"
              >
                <Settings2 size={19} />
                <span>Settings & data</span>
              </button>
              <span className="save-status">
                <span className={writeError || storageError ? "status-dot error" : "status-dot"} />
                {writeError || storageError ? "Changes need attention" : "Saved on this device"}
              </span>
            </div>
          </aside>
          <div className="main-shell">
            <header className="topbar">
              <div className="mobile-brand">
                <Brand />
              </div>
              <div className="search-field">
                <Search size={18} />
                <input
                  ref={searchInput}
                  aria-label="Search your question bank"
                  placeholder="Search a chapter, topic or question"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage("qbank");
                    setResult(null);
                  }}
                />
                <kbd>/</kbd>
              </div>
              <div className="topbar-end">
                <span className="ug-tag">NEET UG</span>
                <button
                  className="avatar"
                  onClick={() => go("settings")}
                  aria-label="Open personal settings"
                >
                  You
                </button>
              </div>
            </header>
            <main id="main-content" className="page-content">
              {(writeError || storageError) && (
                <div className="notice warning" role="alert">
                  <CircleHelp size={19} />
                  <div>
                    {storageError ??
                      "Browser storage is full or unavailable. Your current changes are not saved. Export a backup now."}
                    <button
                      className="text-button"
                      onClick={storageError ? () => go("settings") : backup}
                    >
                      {storageError ? "Recover data" : "Export backup"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
              <div className="bank-strip">
                <span>
                  <span className="status-dot" />
                  {state.preferences.bank === "sample" ? "Sample bank" : "Reviewed PYQ bank"}
                  <span className="bank-strip-detail">
                    {" "}
                    · {bank.length} questions
                    {state.preferences.bank === "sample" ? " · original demos, not PYQs" : ""}
                  </span>
                </span>
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      preferences: {
                        ...s.preferences,
                        bank: s.preferences.bank === "sample" ? "reviewed" : "sample",
                      },
                    }))
                  }
                >
                  Switch bank
                  <ChevronDown size={14} />
                </button>
              </div>
              {result ? (
                <Results
                  session={result}
                  bookmarks={state.bookmarks}
                  onBookmark={toggleBookmark}
                  onClose={() => setResult(null)}
                  onRetry={(qs) => start(qs, "Focused revision", "practice", qs.length)}
                />
              ) : (
                <>
                  {page === "home" && (
                    <>
                      <div className="page-heading">
                        <div>
                          <h1>A little clearer, every day.</h1>
                          <p>Build understanding, one good question at a time.</p>
                        </div>
                        <span className="today-label">
                          {new Intl.DateTimeFormat("en-IN", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          }).format(now)}
                        </span>
                      </div>
                      {state.active && (
                        <button
                          className="resume-banner"
                          onClick={() => {
                            setStudyOpen(true);
                            setState((s) =>
                              s.active
                                ? {
                                    ...s,
                                    active: {
                                      ...s.active,
                                      status: "active",
                                      lastActiveAt: Date.now(),
                                    },
                                  }
                                : s,
                            );
                          }}
                        >
                          <span className="resume-icon">
                            <Play size={20} />
                          </span>
                          <span>
                            <strong>Pick up where you left off</strong>
                            <small>
                              {state.active.title} · Question {state.active.current + 1} of{" "}
                              {state.active.questions.length}
                            </small>
                          </span>
                          <ArrowRight size={20} />
                        </button>
                      )}
                      <div className="home-feature-grid">
                        <section className="start-panel">
                          <div className="start-panel-top">
                            <span className="small-orbit">
                              <Atom size={42} strokeWidth={1} />
                            </span>
                          </div>
                          <h2>
                            Small sessions.
                            <br />
                            Stronger foundations.
                          </h2>
                          <p>
                            Make space for a few questions. Understand the answers. Carry a little
                            more clarity into tomorrow.
                          </p>
                          <div className="button-row">
                            <button
                              className="button cream"
                              disabled={!bank.length}
                              onClick={() =>
                                start(shuffled(bank).slice(0, 6), "Quick practice", "practice", 6)
                              }
                            >
                              Start quick practice
                              <ArrowRight size={17} />
                            </button>
                            <span>{Math.min(6, bank.length)} questions · at your pace</span>
                          </div>
                        </section>
                        <section className="revision-panel">
                          <div className="section-title">
                            <h2>Make it stick.</h2>
                            <Sparkles size={22} />
                          </div>
                          <p>
                            Your mistakes and uncertain answers are the starting point for your next
                            breakthrough.
                          </p>
                          <div className="revision-pool-lines">
                            <div>
                              <span>To revisit</span>
                              <strong>{poolQuestions(bank, state, "incorrect").length}</strong>
                            </div>
                            <div>
                              <span>Marked as guesses</span>
                              <strong>{poolQuestions(bank, state, "guessed").length}</strong>
                            </div>
                            <div>
                              <span>Saved for later</span>
                              <strong>{poolQuestions(bank, state, "bookmarked").length}</strong>
                            </div>
                          </div>
                          <button className="text-button" onClick={() => go("review")}>
                            Find your revision focus
                            <ArrowUpRight size={17} />
                          </button>
                        </section>
                      </div>
                      <SectionTitle
                        title="Three subjects. One goal."
                        action="Explore question bank"
                        onClick={() => go("qbank")}
                      />
                      <div className="subjects-grid">
                        {SUBJECTS.map((name) => {
                          const Icon = icons[name];
                          const qs = bank.filter((q) => q.subject === name);
                          const done = qs.filter((q) => state.history[q.id]).length;
                          return (
                            <button
                              className={`subject-card ${name.toLowerCase()}`}
                              key={name}
                              onClick={() => {
                                setSubject(name);
                                go("qbank");
                              }}
                            >
                              <span className="subject-top">
                                <span className="subject-icon">
                                  <Icon size={25} strokeWidth={1.5} />
                                </span>
                                <ArrowUpRight size={19} />
                              </span>
                              <h3>{name}</h3>
                              <p>{subjectDescriptions[name]}</p>
                              <div className="subject-footer">
                                <span>{qs.length} questions</span>
                                <span>{done} attempted</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="home-bottom">
                        <section>
                          <SectionTitle
                            title="Your recent sessions"
                            action="See progress"
                            onClick={() => go("progress")}
                          />
                          {state.sessions.length ? (
                            <SessionRows sessions={state.sessions.slice(0, 3)} onOpen={setResult} />
                          ) : (
                            <div className="quiet-empty">
                              <HistoryIcon size={23} />
                              <div>
                                <strong>Your first session starts the story.</strong>
                                <p>Completed sessions and honest progress will appear here.</p>
                              </div>
                              <button
                                className="icon-button"
                                aria-label="Build your first session"
                                onClick={() => openBuilder()}
                              >
                                <ArrowRight size={19} />
                              </button>
                            </div>
                          )}
                        </section>
                        <section className="note-panel">
                          <span className="note-line" />
                          <h3>Understanding over rushing.</h3>
                          <p>
                            Use Practice mode to think out loud. Use Exam mode when you want to test
                            what stays.
                          </p>
                          <button className="text-button" onClick={() => openBuilder()}>
                            Choose your mode
                            <ArrowRight size={16} />
                          </button>
                        </section>
                      </div>
                    </>
                  )}
                  {page === "qbank" && (
                    <>
                      <div className="page-heading">
                        <div>
                          <h1>Your question bank.</h1>
                          <p>Find a chapter. Follow your curiosity. Build the foundations.</p>
                        </div>
                        <button
                          className="button primary"
                          onClick={() => openBuilder("all", subject)}
                          disabled={!bank.length}
                        >
                          <Plus size={17} />
                          Custom session
                        </button>
                      </div>
                      <div className="filter-tabs" aria-label="Filter by subject">
                        {(["All", ...SUBJECTS] as const).map((s) => (
                          <button
                            key={s}
                            className={subject === s ? "selected" : ""}
                            onClick={() => setSubject(s)}
                          >
                            {s === "All" ? "All subjects" : s}
                          </button>
                        ))}
                      </div>
                      <QuestionBank
                        questions={bank}
                        state={state}
                        subject={subject}
                        search={search}
                        onStart={(qs) =>
                          start(qs, qs[0]?.chapter ?? "Practice", "practice", qs.length)
                        }
                        onBuilder={() => openBuilder()}
                        onSample={() =>
                          setState((s) => ({
                            ...s,
                            preferences: { ...s.preferences, bank: "sample" },
                          }))
                        }
                      />
                    </>
                  )}
                  {page === "tests" && (
                    <>
                      <div className="page-heading">
                        <div>
                          <h1>Practice with a purpose.</h1>
                          <p>Learn with feedback, or give yourself room to remember.</p>
                        </div>
                      </div>
                      <div className="mode-grid">
                        <section className="mode-panel">
                          <BookOpen size={28} />
                          <h2>Learn as you go</h2>
                          <p>
                            Check each answer, understand the explanation, and pause whenever you
                            need.
                          </p>
                          <ul>
                            <li>Immediate explanations</li>
                            <li>Bookmarks and guess tracking</li>
                            <li>Resume at your own pace</li>
                          </ul>
                          <button
                            className="button primary"
                            disabled={!bank.length}
                            onClick={() => openBuilder("all", "All", "practice")}
                          >
                            Build a practice session
                            <ArrowRight size={17} />
                          </button>
                        </section>
                        <section className="mode-panel exam">
                          <Timer size={28} />
                          <h2>Test what stays</h2>
                          <p>
                            A timed session with answers and explanations revealed after submission.
                          </p>
                          <ul>
                            <li>Deadline survives a page reload</li>
                            <li>Change answers and flag for review</li>
                            <li>+4 correct · −1 incorrect · 0 skipped</li>
                          </ul>
                          <button
                            className="button primary"
                            disabled={!bank.length}
                            onClick={() => openBuilder("all", "All", "exam")}
                          >
                            Build a timed test
                            <ArrowRight size={17} />
                          </button>
                        </section>
                      </div>
                      <section className="paper-preset">
                        <div>
                          <h2>A full NEET UG paper, when you’re ready.</h2>
                          <p>45 Physics · 45 Chemistry · 90 Biology · 180 minutes</p>
                          <small>
                            Available once the reviewed bank has enough questions in each subject.
                          </small>
                        </div>
                        <button
                          className="button secondary"
                          disabled={SUBJECTS.some(
                            (s) =>
                              reviewed.filter((q) => q.subject === s).length <
                              (s === "Biology" ? 90 : 45),
                          )}
                          onClick={() =>
                            start(
                              SUBJECTS.flatMap((s) =>
                                shuffled(reviewed.filter((q) => q.subject === s)).slice(
                                  0,
                                  s === "Biology" ? 90 : 45,
                                ),
                              ),
                              "NEET UG full paper",
                              "exam",
                              180,
                            )
                          }
                        >
                          Start full paper
                          <ArrowRight size={17} />
                        </button>
                      </section>
                      <SectionTitle title="Previous attempts" />
                      {state.sessions.length ? (
                        <SessionRows sessions={state.sessions} onOpen={setResult} />
                      ) : (
                        <Empty icon={<Timer size={28} />} title="A clear starting line.">
                          Your completed practice sessions and timed tests will be saved here.
                        </Empty>
                      )}
                    </>
                  )}
                  {page === "review" && (
                    <>
                      <div className="page-heading">
                        <div>
                          <h1>Turn a mistake into a strength.</h1>
                          <p>A smaller, more meaningful set of questions to return to.</p>
                        </div>
                      </div>
                      <div className="review-pools">
                        {pools
                          .filter((p) => !["all", "unseen"].includes(p.id))
                          .map(({ id, name, description }) => {
                            const qs = poolQuestions(bank, state, id);
                            return (
                              <section className="review-pool" key={id}>
                                <div className="review-pool-number">{qs.length}</div>
                                <div>
                                  <h2>{name}</h2>
                                  <p>{description}</p>
                                </div>
                                <button
                                  className="button secondary"
                                  disabled={!qs.length}
                                  onClick={() => openBuilder(id)}
                                  aria-label={`Review ${name.toLowerCase()}`}
                                >
                                  Review
                                  <ArrowRight size={16} />
                                </button>
                              </section>
                            );
                          })}
                      </div>
                      <div className="notice">
                        <CircleHelp size={19} />
                        <span>
                          Revision uses your most recent completed answer. A correct reattempt
                          clears a question from Incorrect; bookmarks stay until you remove them.
                        </span>
                      </div>
                      {!Object.keys(state.history).length && (
                        <Empty
                          icon={<Sparkles size={28} />}
                          title="Your revision grows with you."
                          action={
                            <button
                              className="button primary"
                              onClick={() => openBuilder()}
                              disabled={!bank.length}
                            >
                              Start your first session
                              <ArrowRight size={17} />
                            </button>
                          }
                        >
                          Finish a session to find your weak spots. You can bookmark questions while
                          studying, too.
                        </Empty>
                      )}
                    </>
                  )}
                  {page === "progress" && (
                    <Progress
                      state={state}
                      bank={bank}
                      onOpen={setResult}
                      onStart={() => openBuilder()}
                    />
                  )}
                  {page === "settings" && (
                    <Settings
                      state={state}
                      onChange={setState}
                      onBackup={backup}
                      onToast={showToast}
                      storageError={storageError}
                      onRecover={() => {
                        setStorageError(null);
                        setWriteError(false);
                        setState(emptyState());
                      }}
                      onConfirm={setConfirm}
                    />
                  )}
                </>
              )}
              <footer className="page-footer">
                <span>Thoughtful practice. Your own pace.</span>
                <span>
                  Built for NEET UG <span className="footer-dot">·</span> Personal edition
                </span>
              </footer>
            </main>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {navigation.slice(0, 4).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  aria-label={label}
                  className={page === id ? "active" : ""}
                  onClick={() => go(id)}
                >
                  <Icon size={21} />
                  <span>
                    {id === "home"
                      ? "Home"
                      : id === "qbank"
                        ? "QBank"
                        : id === "tests"
                          ? "Practice"
                          : "Revision"}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      {builder && (
        <Builder
          initial={builder}
          questions={bank}
          state={state}
          onClose={() => setBuilder(null)}
          onStart={start}
        />
      )}
      {confirm && (
        <Dialog title={confirm.title} onClose={() => setConfirm(null)}>
          <p>{confirm.body}</p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={() => setConfirm(null)}>
              Keep current
            </button>
            <button
              className="button primary"
              onClick={() => {
                confirm.action();
                setConfirm(null);
              }}
            >
              {confirm.label}
            </button>
          </div>
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

function QuestionBank({
  questions,
  state,
  subject,
  search,
  onStart,
  onBuilder,
  onSample,
}: {
  questions: Question[];
  state: StudyState;
  subject: Subject | "All";
  search: string;
  onStart: (qs: Question[]) => void;
  onBuilder: () => void;
  onSample: () => void;
}) {
  const filtered = questions.filter(
    (q) =>
      (subject === "All" || q.subject === subject) &&
      `${q.chapter} ${q.topic} ${q.prompt} ${q.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const chapters = filtered.reduce<Record<string, Question[]>>((groups, q) => {
    const key = `${q.subject}:${q.chapter}`;
    (groups[key] ??= []).push(q);
    return groups;
  }, {});
  if (!questions.length)
    return (
      <Empty
        icon={<FileCheck2 size={32} />}
        title="A clean slate for reviewed PYQs."
        action={
          <button className="button primary" onClick={onSample}>
            Explore with sample questions
            <ArrowRight size={17} />
          </button>
        }
      >
        The app is ready. Add questions and explanations after you’ve reviewed their source and
        answer key. Nothing unreviewed is published here.
      </Empty>
    );
  if (!filtered.length)
    return (
      <Empty icon={<Search size={28} />} title="No matches in this bank.">
        Try a different topic or switch to All subjects.
      </Empty>
    );
  return (
    <div className="chapter-list">
      {Object.entries(chapters).map(([key, qs]) => {
        if (!qs) return null;
        const q = qs[0];
        const Icon = icons[q.subject];
        const count = qs.filter((x) => state.history[x.id]).length;
        return (
          <section className="chapter-row" key={key}>
            <div className={`subject-icon ${q.subject.toLowerCase()}`}>
              <Icon size={23} />
            </div>
            <div className="chapter-info">
              <span className="chapter-subject">{q.subject}</span>
              <h2>{q.chapter}</h2>
              <p>{[...new Set(qs.map((x) => x.topic))].join(" · ")}</p>
              {search && <small>{qs.map((x) => x.id).join(", ")}</small>}
            </div>
            <div className="chapter-progress">
              <span>
                {count} / {qs.length} attempted
              </span>
              <div className="progress-track">
                <span style={{ width: `${(100 * count) / qs.length}%` }} />
              </div>
            </div>
            <button className="button secondary" onClick={() => onStart(qs)}>
              Practice
              <Play size={15} />
            </button>
          </section>
        );
      })}
      <button className="custom-row" onClick={onBuilder}>
        <SlidersHorizontal size={21} />
        <span>
          <strong>Make this session yours.</strong>
          <small>Choose subjects, topics, question history and your feedback mode.</small>
        </span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
}

function Builder({
  initial,
  questions,
  state,
  onClose,
  onStart,
}: {
  initial: { pool: Pool; subject: Subject | "All"; mode: Mode };
  questions: Question[];
  state: StudyState;
  onClose: () => void;
  onStart: (qs: Question[], title: string, mode: Mode, minutes: number) => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>(
    initial.subject === "All" ? [...SUBJECTS] : [initial.subject],
  );
  const [pool, setPool] = useState<Pool>(initial.pool);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [chapter, setChapter] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [count, setCount] = useState(6);
  const [minutes, setMinutes] = useState(6);
  const matching = poolQuestions(questions, state, pool).filter(
    (q) =>
      subjects.includes(q.subject) &&
      (chapter === "All" || q.chapter === chapter) &&
      (difficulty === "All" || q.difficulty === difficulty),
  );
  const availableChapters = [
    ...new Set(questions.filter((q) => subjects.includes(q.subject)).map((q) => q.chapter)),
  ];
  const actual = Math.min(count, matching.length);
  return (
    <Dialog title="Build your session" onClose={onClose}>
      <p className="dialog-description">
        A little focus goes a long way. Choose what you want to work on.
      </p>
      <fieldset>
        <legend>Subjects</legend>
        <div className="choice-row">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              className={`choice ${subjects.includes(s) ? "selected" : ""}`}
              aria-pressed={subjects.includes(s)}
              onClick={() => {
                setSubjects((old) => (old.includes(s) ? old.filter((x) => x !== s) : [...old, s]));
                setChapter("All");
              }}
            >
              {s}
              {subjects.includes(s) && <Check size={15} />}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="form-grid">
        <label>
          Question source
          <select value={pool} onChange={(e) => setPool(e.target.value as Pool)}>
            {pools.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Chapter
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option>All</option>
            {availableChapters.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Questions
          <input
            type="number"
            min={1}
            max={Math.max(1, matching.length)}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(180, Number(e.target.value) || 1)))}
          />
        </label>
      </div>
      <fieldset>
        <legend>How would you like to study?</legend>
        <div className="mode-choices">
          <button
            className={`mode-choice ${mode === "practice" ? "selected" : ""}`}
            onClick={() => setMode("practice")}
            aria-pressed={mode === "practice"}
          >
            <BookOpen size={21} />
            <strong>Practice</strong>
            <span>Check answers as you go. Pause anytime.</span>
          </button>
          <button
            className={`mode-choice ${mode === "exam" ? "selected" : ""}`}
            onClick={() => setMode("exam")}
            aria-pressed={mode === "exam"}
          >
            <Timer size={21} />
            <strong>Exam</strong>
            <span>Timed. Feedback after submission.</span>
          </button>
        </div>
      </fieldset>
      {mode === "exam" && (
        <>
          <label className="duration-field">
            Time limit (minutes)
            <input
              type="number"
              min={1}
              max={360}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(360, Number(e.target.value) || 1)))}
            />
          </label>
          <p className="field-help">
            The clock starts when you begin and keeps running if you leave. Unanswered questions
            score 0; review flags don’t exclude an answer.
          </p>
        </>
      )}
      <div className="builder-summary">
        <span>
          <strong>{actual}</strong> matching {actual === 1 ? "question" : "questions"}
          {matching.length < count && matching.length > 0 ? " · fewer than requested" : ""}
        </span>
        <span>
          {questions[0]?.source.kind === "sample" ? "Sample content · not PYQs" : "Reviewed PYQs"}
        </span>
      </div>
      {!matching.length && (
        <p className="form-error" role="status">
          No questions match these filters. Try another source or select a subject.
        </p>
      )}
      <div className="dialog-actions">
        <button className="button secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="button primary"
          disabled={!actual}
          onClick={() =>
            onStart(
              shuffled(matching).slice(0, actual),
              pool === "all"
                ? `${subjects.length === 1 ? subjects[0] : "Mixed"} ${mode === "practice" ? "practice" : "test"}`
                : `${pools.find((p) => p.id === pool)?.name} revision`,
              mode,
              minutes,
            )
          }
        >
          Begin {mode === "practice" ? "practice" : "test"}
          <ArrowRight size={17} />
        </button>
      </div>
    </Dialog>
  );
}

function StudySession({
  session,
  bookmarks,
  now,
  onChange,
  onBookmark,
  onFinish,
  onLeave,
  onOverview,
}: {
  session: Session;
  bookmarks: string[];
  now: number;
  onChange: (s: Session) => void;
  onBookmark: (id: string) => void;
  onFinish: () => void;
  onLeave: () => void;
  onOverview: () => void;
}) {
  const [submit, setSubmit] = useState(false);
  const [leave, setLeave] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const q = session.questions[session.current];
  const a = session.answers[q.id];
  const revealed = session.mode === "practice" && a.checked;
  const paused = session.status === "paused";
  const answered = session.questions.filter((x) => session.answers[x.id].selected !== null).length;
  function patch(updates: Partial<typeof a>) {
    const next = checkpoint(session);
    onChange({
      ...next,
      answers: { ...next.answers, [q.id]: { ...next.answers[q.id], ...updates } },
    });
  }
  function navigate(index: number) {
    const next = checkpoint(session);
    onChange({ ...next, current: index });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) ||
        paused ||
        submit ||
        leave
      )
        return;
      if (["1", "2", "3", "4"].includes(e.key)) onChange(selectAnswer(session, Number(e.key) - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, paused, submit, leave]);
  return (
    <div className="study-shell">
      <header className="study-topbar">
        <button
          className="icon-button"
          aria-label="Leave study session"
          onClick={() => setLeave(true)}
        >
          <ArrowLeft size={22} />
        </button>
        <Brand />
        <span className="study-title">{session.title}</span>
        <span className="study-mode">
          {session.mode === "practice" ? <BookOpen size={15} /> : <Timer size={15} />}
          {session.mode === "practice" ? "Practice" : "Exam"}
        </span>
        <span
          className={`study-clock ${session.deadline && session.deadline - now < 60_000 ? "urgent" : ""}`}
        >
          <Clock3 size={17} />
          {session.deadline
            ? duration(session.deadline - now)
            : duration(Object.values(session.answers).reduce((n, x) => n + x.timeSpentMs, 0))}
        </span>
        <button className="button secondary compact" onClick={() => setSubmit(true)}>
          Finish<span className="hide-mobile"> session</span>
        </button>
      </header>
      <div className="study-layout">
        <main className="question-main">
          <div className="question-meta">
            <span>
              Question {session.current + 1}{" "}
              <span className="muted">of {session.questions.length}</span>
            </span>
            <button
              className={`icon-button ${bookmarks.includes(q.id) ? "bookmarked" : ""}`}
              onClick={() => onBookmark(q.id)}
              aria-label={bookmarks.includes(q.id) ? "Remove bookmark" : "Bookmark question"}
              aria-pressed={bookmarks.includes(q.id)}
            >
              <Bookmark size={21} fill={bookmarks.includes(q.id) ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="question-tags">
            <span className={`subject-text ${q.subject.toLowerCase()}`}>{q.subject}</span>
            <span>{q.topic}</span>
            <span>{q.difficulty}</span>
          </div>
          <h1 className="question-prompt">{q.prompt}</h1>
          <div className="options" role="group" aria-label="Answer options">
            {q.options.map((option, i) => {
              const correct = revealed && i === q.correct;
              const wrong = revealed && a.selected === i && i !== q.correct;
              return (
                <button
                  key={i}
                  disabled={paused || revealed}
                  aria-pressed={a.selected === i}
                  className={`option ${a.selected === i ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                  onClick={() => onChange(selectAnswer(session, i))}
                >
                  <span className="option-letter">{letters[i]}</span>
                  <span>{option}</span>
                  {correct ? (
                    <CheckCircle2 size={20} />
                  ) : wrong ? (
                    <XCircle size={20} />
                  ) : a.selected === i ? (
                    <span className="selection-dot" />
                  ) : null}
                  {correct && <span className="sr-only">Correct answer</span>}
                  {wrong && <span className="sr-only">Your answer was incorrect</span>}
                </button>
              );
            })}
          </div>
          <div className="question-tools">
            <button
              className={`tool-button ${a.guessed ? "active" : ""}`}
              disabled={paused}
              aria-pressed={a.guessed}
              onClick={() => patch({ guessed: !a.guessed })}
            >
              <CircleHelp size={18} />
              {a.guessed ? "Marked as a guess" : "This is a guess"}
            </button>
            <button
              className={`tool-button ${a.flagged ? "active" : ""}`}
              disabled={paused}
              aria-pressed={a.flagged}
              onClick={() => patch({ flagged: !a.flagged })}
            >
              <Flag size={17} />
              {a.flagged ? "Flagged for review" : "Flag for review"}
            </button>
            {a.selected !== null && !revealed && (
              <button
                className="text-button muted"
                disabled={paused}
                onClick={() => patch({ selected: null })}
              >
                Clear answer
              </button>
            )}
          </div>
          {revealed && (
            <section className="explanation" aria-live="polite">
              <div className={`answer-verdict ${a.selected === q.correct ? "right" : "wrong"}`}>
                {a.selected === q.correct ? <CheckCircle2 size={21} /> : <XCircle size={21} />}
                <strong>
                  {a.selected === q.correct ? "You’ve got it." : "A good place to learn."}
                </strong>
                <span>Correct answer: {letters[q.correct]}</span>
              </div>
              <h2>Let’s understand why.</h2>
              <p>{q.explanation}</p>
              <div className="takeaway">
                <Leaf size={19} />
                <div>
                  <strong>Take this with you</strong>
                  <p>{q.takeaway}</p>
                </div>
              </div>
              <button className="text-button" onClick={() => patch({ checked: false })}>
                <RotateCcw size={15} />
                Try a different answer
              </button>
            </section>
          )}
          <div className="question-source">
            <ShieldCheck size={15} />
            <span>
              {q.source.label}
              {q.source.year ? ` · ${q.source.year}` : ""}
            </span>
          </div>
          <div className="question-actions">
            <button
              className="button secondary"
              disabled={session.current === 0 || paused}
              onClick={() => navigate(session.current - 1)}
            >
              <ArrowLeft size={17} />
              <span className="hide-mobile">Previous</span>
            </button>
            <span className="keyboard-hint">Keys 1–4 select an option</span>
            {session.mode === "practice" && !revealed && a.selected !== null ? (
              <button
                className="button primary"
                disabled={paused}
                onClick={() => patch({ checked: true })}
              >
                Check answer
                <Check size={17} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={paused}
                onClick={() =>
                  session.current === session.questions.length - 1
                    ? setSubmit(true)
                    : navigate(session.current + 1)
                }
              >
                {session.current === session.questions.length - 1
                  ? "Review & finish"
                  : a.selected === null
                    ? "Skip for now"
                    : "Next question"}
                <ArrowRight size={17} />
              </button>
            )}
          </div>
          <button
            className="mobile-navigator-toggle"
            onClick={() => setShowNavigator(!showNavigator)}
          >
            <ListFilter size={17} />
            Question navigator ({answered}/{session.questions.length} answered)
            <ChevronDown size={17} />
          </button>
        </main>
        <aside className={`question-sidebar ${showNavigator ? "open" : ""}`}>
          <h2>Your session</h2>
          <p>
            {answered} of {session.questions.length} answered
          </p>
          <div className="question-grid">
            {session.questions.map((item, i) => {
              const answer = session.answers[item.id];
              return (
                <button
                  key={item.id}
                  disabled={paused}
                  aria-label={`Go to question ${i + 1}${answer.flagged ? ", flagged" : ""}${answer.selected !== null ? ", answered" : ""}`}
                  aria-current={i === session.current ? "step" : undefined}
                  className={`${i === session.current ? "current" : ""} ${answer.selected !== null ? "answered" : ""} ${answer.flagged ? "flagged" : ""}`}
                  onClick={() => navigate(i)}
                >
                  {i + 1}
                  {answer.flagged && <span />}
                </button>
              );
            })}
          </div>
          <div className="palette-legend">
            <span>
              <i className="answered" />
              Answered
            </span>
            <span>
              <i />
              Unanswered
            </span>
            <span>
              <Flag size={12} />
              Flagged
            </span>
          </div>
          <div className="study-note">
            <Leaf size={22} />
            <h3>{session.mode === "practice" ? "Think it through." : "Trust your preparation."}</h3>
            <p>
              {session.mode === "practice"
                ? "There’s no rush. Understanding one idea well is progress."
                : "Explanations appear after submission. Flagged answers still count toward your score."}
            </p>
          </div>
          {session.mode === "practice" && (
            <button
              className="button secondary full"
              onClick={() =>
                onChange(
                  paused
                    ? { ...session, status: "active", lastActiveAt: Date.now() }
                    : { ...checkpoint(session), status: "paused" },
                )
              }
            >
              {paused ? <Play size={17} /> : <Pause size={17} />}{" "}
              {paused ? "Resume practice" : "Pause practice"}
            </button>
          )}
        </aside>
      </div>
      {paused && (
        <div className="pause-overlay">
          <div>
            <Pause size={32} />
            <h2>A little breathing room.</h2>
            <p>Your place is saved. Come back when you’re ready.</p>
            <button
              className="button primary"
              onClick={() => onChange({ ...session, status: "active", lastActiveAt: Date.now() })}
            >
              <Play size={17} />
              Resume practice
            </button>
            <button className="text-button" onClick={onOverview}>
              Back to overview
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
      {submit && (
        <Dialog title="Ready to finish?" onClose={() => setSubmit(false)}>
          <p>
            You’ve answered{" "}
            <strong>
              {answered} of {session.questions.length}
            </strong>{" "}
            questions. Unanswered questions score 0. Flagged answers will be scored normally.
          </p>
          <p className="field-help">
            Finishing saves a completed attempt and opens your results. You can start a fresh
            revision session afterward.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={() => setSubmit(false)}>
              Keep studying
            </button>
            <button className="button primary" onClick={onFinish}>
              Submit & see results
              <ArrowRight size={17} />
            </button>
          </div>
        </Dialog>
      )}
      {leave && (
        <Dialog
          title={session.mode === "exam" ? "Your test clock will keep running." : "Pause here?"}
          onClose={() => setLeave(false)}
        >
          <p>
            {session.mode === "exam"
              ? "Leaving this screen won’t stop the deadline. You can return to this test until time expires."
              : "Your answers and position are saved on this device."}
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={() => setLeave(false)}>
              Stay here
            </button>
            <button
              className="button primary"
              onClick={() => {
                if (session.mode === "practice")
                  onChange({ ...checkpoint(session), status: "paused" });
                onLeave();
                setLeave(false);
              }}
            >
              Go to overview
              <ArrowRight size={17} />
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function SessionRows({ sessions, onOpen }: { sessions: Session[]; onOpen: (s: Session) => void }) {
  return (
    <div className="session-rows">
      {sessions.map((s) => {
        const score = summarize(s);
        return (
          <button className="session-row" key={s.id} onClick={() => onOpen(s)}>
            <span className="session-row-icon">
              {s.mode === "practice" ? <BookOpen size={20} /> : <Timer size={20} />}
            </span>
            <span>
              <strong>{s.title}</strong>
              <small>
                {dateLabel(s.completedAt!)} · {s.questions.length} questions ·{" "}
                {s.mode === "practice" ? "Practice" : "Exam"}
              </small>
            </span>
            <span className="session-score">
              {score.score}
              <small> / {score.maximum}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        );
      })}
    </div>
  );
}

function Results({
  session,
  bookmarks,
  onBookmark,
  onClose,
  onRetry,
}: {
  session: Session;
  bookmarks: string[];
  onBookmark: (id: string) => void;
  onClose: () => void;
  onRetry: (qs: Question[]) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const summary = summarize(session);
  const mistakes = session.questions.filter(
    (q) => session.answers[q.id].selected !== null && session.answers[q.id].selected !== q.correct,
  );
  const filters = ["All", "Incorrect", "Correct", "Unanswered", "Guessed", "Changed", "Bookmarked"];
  const qs = session.questions.filter((q) => {
    const a = session.answers[q.id];
    return (
      filter === "All" ||
      (filter === "Incorrect" && a.selected !== null && a.selected !== q.correct) ||
      (filter === "Correct" && a.selected === q.correct) ||
      (filter === "Unanswered" && a.selected === null) ||
      (filter === "Guessed" && a.guessed) ||
      (filter === "Changed" && a.selected !== null && a.firstSelected !== a.selected) ||
      (filter === "Bookmarked" && bookmarks.includes(q.id))
    );
  });
  return (
    <>
      <button className="text-button back-link" onClick={onClose}>
        <ArrowLeft size={16} />
        Back to your study space
      </button>
      <div className="page-heading">
        <div>
          <h1>Every answer tells you something.</h1>
          <p>
            {session.title} · {session.questions.length} questions ·{" "}
            {session.completionReason === "timeout"
              ? "Time limit reached"
              : session.mode === "practice"
                ? "Practice complete"
                : "Test complete"}
          </p>
        </div>
        {mistakes.length > 0 && (
          <button className="button primary" onClick={() => onRetry(mistakes)}>
            Revisit mistakes
            <ArrowRight size={17} />
          </button>
        )}
      </div>
      <div className="results-overview">
        <section className="score-summary">
          <span>Your score</span>
          <strong>
            {summary.score}
            <small> / {summary.maximum}</small>
          </strong>
          <p>{summary.accuracy}% accuracy on answered questions</p>
          <small>+4 correct · −1 incorrect · 0 unanswered</small>
        </section>
        <section className="result-breakdown">
          <h2>A clearer picture</h2>
          <div className="result-bar" aria-hidden="true">
            <span
              className="correct"
              style={{ width: `${(100 * summary.correct) / session.questions.length}%` }}
            />
            <span
              className="wrong"
              style={{ width: `${(100 * summary.incorrect) / session.questions.length}%` }}
            />
            <span
              className="skipped"
              style={{ width: `${(100 * summary.skipped) / session.questions.length}%` }}
            />
          </div>
          <div className="result-counts">
            <span>
              <strong>{summary.correct}</strong>Correct
            </span>
            <span>
              <strong>{summary.incorrect}</strong>Incorrect
            </span>
            <span>
              <strong>{summary.skipped}</strong>Unanswered
            </span>
          </div>
          <p>
            {summary.guessed
              ? `${summary.guessCorrect} of ${summary.guessed} guesses were correct. Net score from guesses: ${summary.guessScore}.`
              : "No answers were marked as guesses in this session."}
          </p>
        </section>
      </div>
      <SectionTitle title="Review, understand, remember." />
      <div className="filter-tabs scrollable">
        {filters.map((f) => (
          <button
            className={filter === f ? "selected" : ""}
            key={f}
            onClick={() => {
              setFilter(f);
              setOpen(null);
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="result-questions">
        {qs.map((q) => {
          const a = session.answers[q.id];
          return (
            <section key={q.id} className="result-question">
              <button
                className="result-question-toggle"
                onClick={() => setOpen(open === q.id ? null : q.id)}
                aria-expanded={open === q.id}
              >
                <span
                  className={`review-status ${a.selected === null ? "skipped" : a.selected === q.correct ? "correct" : "wrong"}`}
                >
                  {a.selected === null ? (
                    <CircleHelp size={20} />
                  ) : a.selected === q.correct ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </span>
                <span>
                  <small>
                    {q.subject} · {q.topic}
                  </small>
                  <strong>{q.prompt}</strong>
                </span>
                <ChevronDown size={19} />
              </button>
              {open === q.id && (
                <div className="result-answer">
                  <div className="review-options">
                    {q.options.map((option, i) => (
                      <div
                        key={i}
                        className={i === q.correct ? "correct" : i === a.selected ? "wrong" : ""}
                      >
                        <span>{letters[i]}</span>
                        <span>{option}</span>
                        {i === q.correct ? (
                          <CheckCircle2 size={17} />
                        ) : i === a.selected ? (
                          <XCircle size={17} />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p>
                    <strong>Your answer:</strong>{" "}
                    {a.selected === null ? "Unanswered" : letters[a.selected]}
                    {a.guessed ? " · Marked as a guess" : ""}
                    {a.firstSelected !== null && a.firstSelected !== a.selected
                      ? ` · First choice: ${letters[a.firstSelected]}`
                      : ""}
                  </p>
                  <h3>Explanation</h3>
                  <p>{q.explanation}</p>
                  <div className="takeaway">
                    <Leaf size={17} />
                    <p>{q.takeaway}</p>
                  </div>
                  <div className="result-answer-footer">
                    <small>{q.source.label}</small>
                    <button
                      className="text-button"
                      aria-pressed={bookmarks.includes(q.id)}
                      onClick={() => onBookmark(q.id)}
                    >
                      <Bookmark size={16} />
                      {bookmarks.includes(q.id) ? "Remove bookmark" : "Save question"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
      {!qs.length && (
        <Empty icon={<ListFilter size={26} />} title="No questions in this filter.">
          Try another review filter to explore this attempt.
        </Empty>
      )}
    </>
  );
}

function Progress({
  state,
  bank,
  onOpen,
  onStart,
}: {
  state: StudyState;
  bank: Question[];
  onOpen: (s: Session) => void;
  onStart: () => void;
}) {
  const answered = bank.filter((q) => state.history[q.id]);
  const correct = answered.filter((q) => state.history[q.id].correct).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Progress you can believe in.</h1>
          <p>Your own answers. Your own starting point.</p>
        </div>
      </div>
      <div className="progress-summary">
        <div>
          <span>Questions attempted</span>
          <strong>
            {answered.length}
            <small> / {bank.length}</small>
          </strong>
        </div>
        <div>
          <span>Latest answers correct</span>
          <strong>{correct}</strong>
        </div>
        <div>
          <span>Completed sessions</span>
          <strong>{state.sessions.length}</strong>
        </div>
      </div>
      <SectionTitle title="Across your subjects" />
      <div className="subject-progress">
        {SUBJECTS.map((s) => {
          const qs = bank.filter((q) => q.subject === s);
          const done = qs.filter((q) => state.history[q.id]);
          const right = done.filter((q) => state.history[q.id].correct).length;
          const Icon = icons[s];
          return (
            <div key={s}>
              <span className={`subject-icon ${s.toLowerCase()}`}>
                <Icon size={23} />
              </span>
              <strong>{s}</strong>
              <div className="progress-track">
                <span style={{ width: `${qs.length ? (done.length / qs.length) * 100 : 0}%` }} />
              </div>
              <span>
                {done.length}/{qs.length} attempted
              </span>
              <small>
                {done.length
                  ? `${Math.round((right / done.length) * 100)}% correct`
                  : "Your starting point"}
              </small>
            </div>
          );
        })}
      </div>
      <SectionTitle title="Your study history" />
      {state.sessions.length ? (
        <SessionRows sessions={state.sessions} onOpen={onOpen} />
      ) : (
        <Empty
          icon={<Target size={29} />}
          title="Begin where you are."
          action={
            <button className="button primary" disabled={!bank.length} onClick={onStart}>
              Build your first session
              <ArrowRight size={17} />
            </button>
          }
        >
          There’s no made-up streak or predicted rank here. Complete a session and your progress
          starts to take shape.
        </Empty>
      )}
    </>
  );
}

function Settings({
  state,
  onChange,
  onBackup,
  onToast,
  storageError,
  onRecover,
  onConfirm,
}: {
  state: StudyState;
  onChange: React.Dispatch<React.SetStateAction<StudyState>>;
  onBackup: () => void;
  onToast: (m: string) => void;
  storageError: string | null;
  onRecover: () => void;
  onConfirm: (c: { title: string; body: string; action: () => void; label: string }) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  async function restore(file: File) {
    try {
      if (file.size > 10_000_000) throw new Error("This backup is larger than 10 MB.");
      const next = validateBackup(JSON.parse(await file.text()));
      onConfirm({
        title: "Restore this backup?",
        body: "This replaces the current device’s study history, bookmarks, preferences and unfinished session. Export your current data first if you want to keep it.",
        label: "Restore backup",
        action: () => {
          if (storageError) onRecover();
          onChange(next);
          onToast("Backup restored.");
        },
      });
    } catch (error) {
      onToast(error instanceof Error ? error.message : "The backup could not be read.");
    } finally {
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Make room for your way.</h1>
          <p>Reading comfort, your content, and the data that belongs to you.</p>
        </div>
      </div>
      <section className="settings-section">
        <div>
          <h2>Reading comfort</h2>
          <p>Find the setting you can settle into.</p>
        </div>
        <div className="settings-controls">
          <fieldset>
            <legend>Theme</legend>
            <div className="choice-row">
              {(["light", "sepia", "dark"] as const).map((theme) => (
                <button
                  key={theme}
                  aria-pressed={state.preferences.theme === theme}
                  className={`choice ${state.preferences.theme === theme ? "selected" : ""}`}
                  onClick={() =>
                    onChange((s) => ({ ...s, preferences: { ...s.preferences, theme } }))
                  }
                >
                  {theme === "dark" && <Moon size={16} />} {theme[0].toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Reading size</legend>
            <div className="choice-row">
              {(["normal", "large"] as const).map((fontSize) => (
                <button
                  key={fontSize}
                  aria-pressed={state.preferences.fontSize === fontSize}
                  className={`choice ${state.preferences.fontSize === fontSize ? "selected" : ""}`}
                  onClick={() =>
                    onChange((s) => ({ ...s, preferences: { ...s.preferences, fontSize } }))
                  }
                >
                  {fontSize === "normal" ? "Standard" : "Larger text"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>
      <section className="settings-section">
        <div>
          <h2>Your question bank</h2>
          <p>Keep demonstrations and reviewed exam material distinct.</p>
        </div>
        <div className="settings-controls">
          <div className="choice-row">
            {(["sample", "reviewed"] as const).map((bank) => (
              <button
                key={bank}
                className={`choice ${state.preferences.bank === bank ? "selected" : ""}`}
                aria-pressed={state.preferences.bank === bank}
                onClick={() => onChange((s) => ({ ...s, preferences: { ...s.preferences, bank } }))}
              >
                {bank === "sample"
                  ? `Sample bank · ${samples.length}`
                  : `Reviewed PYQs · ${reviewed.length}`}
              </button>
            ))}
          </div>
          <p className="field-help">
            The sample questions demonstrate the app; they are not past exam questions. Reviewed
            PYQs will appear after you add approved content to the repository.
          </p>
        </div>
      </section>
      <section className="settings-section">
        <div>
          <h2>Your data, in your hands.</h2>
          <p>Saved in this browser. A backup helps you move devices.</p>
        </div>
        <div className="settings-controls">
          <div className="button-row">
            <button className="button primary" onClick={onBackup}>
              <ArrowDownToLine size={17} />
              Export backup
            </button>
            <button className="button secondary" onClick={() => input.current?.click()}>
              <Upload size={17} />
              Restore backup
            </button>
            <input
              ref={input}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Restore a opneet backup"
              onChange={(e) => {
                if (e.target.files?.[0]) void restore(e.target.files[0]);
              }}
            />
          </div>
          <p className="field-help">
            History and bookmarks are local to this browser and origin. GitHub hosting does not sync
            them. A future account backend can add synchronization.
          </p>
          {storageError && (
            <div className="button-row">
              <button
                className="button secondary"
                onClick={() => {
                  try {
                    downloadJSON(
                      localStorage.getItem(STORAGE_KEY) ?? "",
                      "opneet-unreadable-data.json",
                    );
                  } catch {
                    onToast("Browser storage cannot be accessed.");
                  }
                }}
              >
                Download unreadable data
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  onConfirm({
                    title: "Start with a clean slate?",
                    body: "This replaces unreadable saved data. Download it first if you want to preserve it.",
                    label: "Start fresh",
                    action: onRecover,
                  })
                }
              >
                Start fresh
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="content-ready">
        <FileCheck2 size={28} />
        <div>
          <h2>Ready for a carefully reviewed bank.</h2>
          <p>
            Every future PYQ has a source, year, explanation and approval record. The content check
            prevents drafts from entering the published bank.
          </p>
          <span className="simple-tag">
            {reviewed.length} approved PYQs · no unreviewed questions published
          </span>
        </div>
      </section>
    </>
  );
}
