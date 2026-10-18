import { useState } from "react";
import { ArrowRight, Timer } from "lucide-react";
import { Dialog } from "./ui";
import { miniTestBiology, miniTestPhysics } from "../data/mini-test";

export default function MiniTest({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <section className="paper-preset mini-test-card" aria-labelledby="mini-test-title">
      <div>
        <h2 id="mini-test-title">Mini Test 01 · Physiology &amp; Mechanics</h2>
        <p>100 questions · 110 minutes · 60 Biology + 40 Physics</p>
        <small>40 easy · 40 medium · 20 hard · Original draft paper</small>
      </div>
      <button className="button primary" onClick={() => setOpen(true)}>View mini test <ArrowRight size={17} /></button>
    </section>
    {open && <Dialog title="Mini Test 01" onClose={() => setOpen(false)}>
      <p className="dialog-description">A focused NEET UG practice paper. All 100 questions count toward your score; you can leave any unanswered.</p>
      <div className="mini-test-summary"><Timer size={23} /><strong>110 minutes</strong><span>400 marks maximum</span></div>
      <div className="mini-test-syllabus">
        <section><h3>Biology · 60 questions</h3><p>10 questions from each area:</p><ul>{[...new Set(miniTestBiology.map(q => q.chapter))].map(c => <li key={c}>{c}</li>)}</ul></section>
        <section><h3>Physics · 40 questions</h3><ul>{[...new Set(miniTestPhysics.map(q => q.chapter))].map(c => <li key={c}>{c}</li>)}</ul></section>
      </div>
      <p><strong>Difficulty:</strong> 40 easy, 40 medium and 20 hard. Difficulty labels are author estimates.</p>
      <p><strong>Scoring:</strong> +4 correct, −1 incorrect, 0 unanswered. Answers and explanations unlock after submission.</p>
      <p><strong>Before you begin:</strong> the timer starts immediately and keeps running if you close the app. Your attempt is saved in this browser. Questions are mixed within Biology (1–60) and Physics (61–100).</p>
      <p className="field-help">Original NEET-style draft questions, inspired by past-paper concepts. These are not actual PYQs or an official NTA paper.</p>
      <div className="dialog-actions"><button className="button secondary" onClick={() => setOpen(false)}>Not now</button><button className="button primary" onClick={() => { setOpen(false); onStart(); }}>Begin 110-minute test</button></div>
    </Dialog>}
  </>;
}
