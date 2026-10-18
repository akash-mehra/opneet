import { useId } from "react";
import type { ReactNode } from "react";
import type { Question } from "../domain/types";
import { miniTestQuestions } from "../data/mini-test";

export function getQuestionDiagram(question: Question) {
  if (question.diagram) return question.diagram;
  // Old snapshots may predate diagrams. Only supplement an exact, unchanged item;
  // never replace its stem/options/key or reset an in-progress timer.
  return miniTestQuestions.find(q => q.id === question.id && q.prompt === question.prompt &&
    q.correct === question.correct && q.options.every((option, i) => option === question.options[i]))?.diagram;
}

export default function QuestionDiagram({ question }: { question: Question }) {
  const uid = useId();
  const diagram = getQuestionDiagram(question);
  if (!diagram) return null;
  const arrow = `${uid}-arrow`;
  const line = (x1: number, y1: number, x2: number, y2: number, tip = false, dashed = false) =>
    <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={tip ? `url(#${arrow})` : undefined} strokeDasharray={dashed ? "5 5" : undefined} />;
  const text = (x: number, y: number, value: string, anchor: "start" | "middle" | "end" = "middle") =>
    <text x={x} y={y} textAnchor={anchor}>{value}</text>;
  const block = (x: number, y: number, w: number, h: number, label: string) =>
    <g><rect className="diagram-block" x={x} y={y} width={w} height={h} rx="2" />{text(x + w / 2, y + h / 2 + 6, label)}</g>;
  const ground = (y: number) => <g>{line(30, y, 390, y)}{[50, 80, 110, 140, 170, 200, 230, 260, 290, 320, 350, 380].map(x => <line key={x} x1={x} y1={y} x2={x - 8} y2={y + 10} />)}</g>;
  const pipe = (speed: boolean) => <g>
    <path className="diagram-fluid" d="M30 65 H185 L245 81 H390 V159 H245 L185 175 H30 Z" />
    <path d="M30 65 H185 L245 81 H390 M30 175 H185 L245 159 H390" />
    {line(65, 120, 140, 120, true)}{line(285, 120, 360, 120, true)}
    {text(100, 44, speed ? "P₁" : "Area A")}{text(320, 64, speed ? "P₂" : "Area A/2")}
    {text(100, 155, speed ? "2 m s⁻¹" : "Flow")}{text(320, 180, speed ? "4 m s⁻¹" : "Flow")}
    {text(210, 225, "Horizontal pipe")}
  </g>;
  const drawings: Record<string, ReactNode> = {
    "projectile-v1": <g>
      {ground(195)}<path className="diagram-muted" strokeDasharray="5 5" d="M55 195 Q205 108.4 355 195" />
      {line(55, 195, 185, 120, true)}{text(207, 101, "20 m s⁻¹")}
      <path d="M100 195 A45 45 0 0 0 94 172.5" />{text(117, 181, "30°")}
      <circle className="diagram-point" cx="55" cy="195" r="4" />{text(55, 233, "Launch")}{text(355, 233, "Same level")}
    </g>,
    "connected-blocks-v1": <g>
      {ground(180)}{block(55, 115, 85, 65, "2 kg")}{block(225, 115, 85, 65, "3 kg")}
      {line(140, 148, 225, 148)}{text(182, 130, "String")}
      {line(310, 148, 390, 148, true)}{text(351, 126, "10 N")}{text(210, 225, "Smooth horizontal surface")}
    </g>,
    "rough-pulley-v1": <g>
      {line(30, 150, 310, 150)}{line(310, 150, 310, 237)}{block(80, 95, 75, 55, "5 kg")}
      <circle cx="335" cy="138" r="18" />{line(310, 150, 335, 138)}{line(155, 120, 335, 120)}
      <path d="M335 120 A18 18 0 0 1 353 138 V185" />{block(325, 185, 56, 44, "3 kg")}
      {text(151, 186, "μk = 0.20")}{text(151, 216, "Rough table")}{text(335, 85, "Pulley")}
    </g>,
    "incline-v1": <g>
      <path className="diagram-block" d="M50 210 L350 60 V210 Z" />
      <g transform="translate(200 135) rotate(-26.565)">{block(-38, -44, 76, 44, "Block")}</g>
      <path d="M105 210 A55 55 0 0 0 99.2 185.4" />{text(123, 199, "θ")}
      {text(270, 238, "tan θ = 0.5")}
      {line(208, 173, 130, 212, true)}{text(100, 245, "About to slide down")}
    </g>,
    "angled-pull-v1": <g>
      {ground(185)}{block(100, 120, 100, 65, "5 kg")}
      {line(200, 120, 320, 30, true)}{line(200, 120, 340, 120, false, true)}
      <path d="M242 120 A42 42 0 0 0 233.6 94.8" />{text(264, 107, "37°")}{text(326, 62, "25 N")}
      {line(104, 223, 204, 223, true)}{text(153, 212, "Sliding")}{text(321, 225, "μk = 0.20")}
    </g>,
    "vertical-circle-v1": <g>
      <circle cx="210" cy="125" r="85" strokeDasharray="6 5" />
      <circle className="diagram-point" cx="210" cy="125" r="3" />{text(191, 123, "O")}
      {line(210, 125, 210, 210)}{text(228, 175, "R")}
      <circle cx="210" cy="40" r="5" /><circle className="diagram-point" cx="210" cy="210" r="6" />
      {text(210, 22, "Top")}{text(210, 242, "Bottom")}{text(330, 130, "Vertical")}
    </g>,
    "disc-hole-v1": <g>
      <circle className="diagram-block" cx="180" cy="125" r="90" />
      <circle className="diagram-cutout" cx="225" cy="125" r="45" />
      {line(55, 125, 355, 125, true, true)}{text(370, 131, "x")}
      {line(180, 125, 180, 35, true)}{text(165, 77, "R")}
      {line(225, 125, 257, 93, true)}{text(292, 88, "R/2")}
      <circle className="diagram-point" cx="180" cy="125" r="3" /><circle className="diagram-point" cx="225" cy="125" r="3" />
      {text(165, 153, "O")}{text(232, 150, "C")}{line(255, 154, 298, 186)}{text(329, 204, "Removed")}
      {text(141, 235, "O: x = 0")}{text(280, 235, "C: x = R/2")}
    </g>,
    "parallel-axes-v1": <g>
      <circle className="diagram-block" cx="170" cy="125" r="82" />
      {line(180, 125, 241, 125, true)}{text(211, 111, "R")}
      {[170, 252].map(x => <g key={x}><circle className="diagram-cutout" cx={x} cy="125" r="9" /><circle className="diagram-point" cx={x} cy="125" r="2" /></g>)}
      {text(155, 153, "O")}{text(269, 149, "P")}
      {text(210, 235, "View along the parallel axes")}
    </g>,
    "pipe-area-v1": pipe(false),
    "pipe-speed-v1": pipe(true),
  };
  const drawing = drawings[diagram.id];
  if (!drawing) return null;
  return <figure className="question-diagram">
    <svg viewBox="0 0 420 255" role="img" aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-desc`}>
      <title id={`${uid}-title`}>{diagram.title}</title><desc id={`${uid}-desc`}>{diagram.alt}</desc>
      <defs><marker id={arrow} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path className="diagram-arrow" d="M0 0 L10 5 L0 10 Z" /></marker></defs>
      {drawing}
    </svg>
    <figcaption>Schematic · not to scale</figcaption>
  </figure>;
}
