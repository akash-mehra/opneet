import type { ReactNode } from "react";

// Original instructional geometry. Labels supply only the question's givens.
const label = (x: number, y: number, value: string) => <text x={x} y={y} textAnchor="middle">{value}</text>;
export function biologyDrawing(id: string, arrow: string): ReactNode {
  const flow = (d: string) => <path d={d} markerEnd={`url(#${arrow})`} />;
  switch (id) {
    case "bio-filament-v1": return <g>
      <path d="M49 140 Q190 55 365 140" strokeDasharray="4 5" />
      {[ [65, 133], [98, 116], [133, 104], [211, 101], [247, 107], [282, 119], [315, 133], [346, 150] ].map(([x, y]) => <circle key={x} className="diagram-block" cx={x} cy={y} r="15" />)}
      <circle className="diagram-block" cx="172" cy="99" r="22" strokeWidth="4" />
      <path d="M172 72 V42" />{label(172, 31, "X")}
      {label(210, 216, "Filament segment")}
    </g>;
    case "bio-sporangium-v1": return <g>
      <path d="M70 193 H335 M205 193 V111 M219 193 V111" />
      <circle className="diagram-block" cx="212" cy="70" r="45" />
      {[[190,45],[210,37],[229,45],[184,67],[206,59],[233,66],[195,86],[218,85],[238,87],[214,103]].map(([x,y]) => <circle className="diagram-point" key={`${x}-${y}`} cx={x} cy={y} r="3.5" />)}
      <path d="M258 69 H308" />{label(326, 76, "X")}
      <path d="M117 193 L97 217 L84 224 M117 193 L127 220 M299 193 L282 216 M299 193 L320 218" />
      {label(66, 170, "Hypha")}{label(298, 239, "Rhizoids")}
    </g>;
    case "bio-prothallus-v1": return <g>
      <path className="diagram-block" d="M210 70 C175 2 85 28 103 101 C112 146 174 179 210 199 C246 179 308 146 317 101 C335 28 245 2 210 70 Z" />
      {[190,204,219,232].map(x => <path key={x} d={`M${x} 185 l-10 35 l-9 12 M${x} 205 l14 20`} />)}
      {[196,210,224].map(x => <ellipse className="diagram-cutout" key={x} cx={x} cy="94" rx="4" ry="8" />)}
      {[[192,150],[208,143],[226,151]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" />)}
      <path d="M230 94 H330" />{label(348, 100, "X")}
      {label(89, 238, "Rhizoids")}
      <path d="M135 230 H175" />
    </g>;
    case "bio-nephron-v1": return <g>
      <circle cx="56" cy="44" r="21" /><path d="M42 44 q7 -19 15 0 q8 18 15 -4 M77 44 C95 17 119 18 124 41 S147 64 153 40 S177 20 177 57 V194 Q177 228 214 228 Q251 228 251 194 V62 C252 30 275 24 281 46 S311 65 318 43 H382 M382 24 V233" />
      {flow("M177 105 V153")}{flow("M251 160 V108")}
      {label(145, 137, "X")}{label(281, 137, "Y")}
      {label(210, 250, "Tubular flow")}
      <path d="M27 79 H77" />{label(71, 102, "Corpuscle")}
      {label(321, 202, "Collecting")}{label(321, 224, "duct")}
    </g>;
    case "bio-ecg-v1": return <g>
      {flow("M45 210 V33")}{flow("M45 165 H389")}
      <path d="M52 164 H86 Q102 122 118 164 H151 L160 177 L174 62 L186 188 L196 164 H242 Q273 96 305 164 H371" strokeWidth="2.6" />
      {label(101, 118, "X")}{label(175, 45, "Y")}{label(274, 113, "Z")}
      {label(211, 243, "Time →")}
      <text x="24" y="124" transform="rotate(-90 24 124)" textAnchor="middle">Potential</text>
    </g>;
    case "bio-sarcomere-v1": return <g>
      <path d="M65 65 V202 M355 65 V202 M210 78 V190" strokeWidth="3" />
      {[100,132,164].map(y => <g key={y}>
        <path d={`M65 ${y-8} H186 M234 ${y-8} H355 M65 ${y+8} H186 M234 ${y+8} H355`} />
        <path d={`M133 ${y} H287`} strokeWidth="5" />
        {[145,168,252,275].map(x => <path key={x} d={`M${x} ${y} l${x<210?8:-8} -7 M${x} ${y} l${x<210?8:-8} 7`} />)}
      </g>)}
      <path d="M133 55 V39 H287 V55" />{label(210, 28, "A band")}
      {label(65, 230, "Z line")}{label(210, 230, "M line")}{label(355, 230, "Z line")}
    </g>;
    default: return null;
  }
}
