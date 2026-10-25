import type { Question } from "../domain/types";

// Original opneet vector schematics; no third-party artwork is redistributed.
// Neutral titles and descriptive alternatives identify only the visible givens.
export const biologyDiagrams: Record<string, NonNullable<Question["diagram"]>> = {
  "mini02-bc05": { id: "bio-filament-v1", title: "Labelled cyanobacterial filament", alt: "A curved chain of small round cells includes one larger, thick-bordered cell labelled X. The surrounding cells are smaller and thin-bordered." },
  "mini02-bc13": { id: "bio-sporangium-v1", title: "Labelled fungal spore-bearing structure", alt: "A stalk arises from horizontal fungal hyphae and ends in a round sac labelled X. Numerous small spores are enclosed inside the sac; branching rhizoids extend below the hyphae." },
  "mini02-pk09": { id: "bio-prothallus-v1", title: "Underside of a fern prothallus", alt: "A heart-shaped prothallus has a notch at the top, region X immediately below the notch, small round structures nearer the lower central region, and rhizoids at its base." },
  "mini02-ex02": { id: "bio-nephron-v1", title: "Labelled nephron loop", alt: "Tubular fluid passes from a renal corpuscle through a coiled tubule, down the left limb X, around a hairpin turn, and up the right limb Y before another coiled segment leads to a collecting duct. Arrows indicate the direction of tubular flow." },
  "mini02-ci02": { id: "bio-ecg-v1", title: "Labelled schematic ECG", alt: "A trace over time shows a small rounded upward wave labelled X, then a sharp narrow complex with a tall upward spike labelled Y, followed by a broader rounded upward wave labelled Z. The vertical axis is electrical potential and the horizontal axis is time." },
  "mini02-lo02": { id: "bio-sarcomere-v1", title: "Single sarcomere schematic", alt: "Two Z lines bound a sarcomere. Thin filaments extend inward from each Z line and overlap the ends of central thick filaments. A bracket labelled A band spans the full thick-filament length; a central M line and the two Z lines are marked." },
};
