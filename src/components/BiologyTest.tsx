import { useState } from "react";
import { ArrowRight, Timer } from "lucide-react";
import { Dialog } from "./ui";
import { BIOLOGY_TEST } from "../data/biology-test";

export default function BiologyTest({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <section className="paper-preset mini-test-card" aria-labelledby="biology-test-title">
      <div>
        <h2 id="biology-test-title">{BIOLOGY_TEST.title}</h2>
        <p>90 questions · {BIOLOGY_TEST.minutes} minutes · Biology only</p>
        <small>A step up from Test 01 · 12 repeat questions · 6 diagram questions</small>
      </div>
      <button className="button primary" onClick={() => setOpen(true)}>View biology test <ArrowRight size={17} /></button>
    </section>
    {open && <Dialog title="Mini Test 02 · Biology" onClose={() => setOpen(false)}>
      <p className="dialog-description">A NEET UG biology paper combining statement questions, diagrams and applications. All 90 questions count; you can leave any unanswered.</p>
      <div className="mini-test-summary"><Timer size={23} /><strong>{BIOLOGY_TEST.minutes} minutes</strong><span>360 marks maximum</span></div>
      <div className="mini-test-syllabus">
        <section><h3>Diversity in the Living World · 48 questions</h3><ul>
          <li>The Living World · 12</li><li>Biological Classification · 18</li><li>Plant Kingdom · 18</li>
        </ul></section>
        <section><h3>Human Physiology · 42 questions</h3><p>7 questions from each area:</p><ul>
          {Object.keys(BIOLOGY_TEST.chapters).slice(3).map(c => <li key={c}>{c}</li>)}
        </ul></section>
      </div>
      <p><strong>What’s included:</strong> 78 new questions and 12 unchanged biology questions from Test 01. Six questions use original diagrams, also available during answer review.</p>
      <p><strong>Scoring:</strong> +4 correct, −1 incorrect, 0 unanswered. Answers and explanations unlock after submission.</p>
      <p><strong>Before you begin:</strong> the timer starts immediately and keeps running if you close the app. Your attempt is saved in this browser. All 90 questions are mixed together.</p>
      <p className="field-help">Original NEET-style draft practice, not an official NTA paper or actual PYQs. Difficulty is an author estimate.</p>
      <div className="dialog-actions"><button className="button secondary" onClick={() => setOpen(false)}>Not now</button><button className="button primary" onClick={() => { setOpen(false); onStart(); }}>Begin {BIOLOGY_TEST.minutes}-minute biology test</button></div>
    </Dialog>}
  </>;
}
