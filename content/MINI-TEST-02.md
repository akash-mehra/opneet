# Mini Test 02 · Biology

An original NEET UG draft practice paper for personal study. These are not actual PYQs or an official NTA paper. The paper contains 90 Biology questions, four options and one correct answer per question. Default duration: 90 minutes; +4 correct, −1 incorrect, 0 unanswered; maximum 360 marks. Every question has an explanation. The complete author copy is [MINI-TEST-02-REVIEW.md](MINI-TEST-02-REVIEW.md).

## Blueprint

| Area | Questions | New | Repeated from Test 01 |
| --- | ---: | ---: | ---: |
| The Living World | 12 | 12 | 0 |
| Biological Classification | 18 | 18 | 0 |
| Plant Kingdom | 18 | 18 | 0 |
| Breathing and Exchange of Gases | 7 | 5 | 2 |
| Excretory Products and Their Elimination | 7 | 5 | 2 |
| Body Fluids and Circulation | 7 | 5 | 2 |
| Locomotion and Movement | 7 | 5 | 2 |
| Neural Control and Coordination | 7 | 5 | 2 |
| Chemical Coordination and Integration | 7 | 5 | 2 |
| **Total** | **90** | **78** | **12** |

The internal difficulty target is 27 Easy (30%), 40 Medium (44.4%) and 23 Hard (25.6%). Test 01 used 40% / 40% / 20%. The slightly higher demand comes from cross-group comparisons, statement combinations, ploidy and hierarchical inference, multi-step ventilation, and integrated physiology. These are author estimates, not calibrated outcomes. Per-question topic/difficulty metadata remains in the data model and saved attempts but is hidden from question and result-review tags.

The entire paper shuffles on a new attempt; an active attempt retains its order, answers and wall-clock deadline on reload. Explanations are available only after submission in exam mode. A new test does not replace an unfinished attempt without the existing confirmation. Completed Test 01 attempts remain unchanged.

## Repeat identity

Exactly these existing IDs are reused, preserving their stems, options, keys, difficulty, revisions and metadata:

`mini01-b01`, `mini01-b06`, `mini01-b12`, `mini01-b17`, `mini01-b22`, `mini01-b26`, `mini01-b31`, `mini01-b35`, `mini01-b43`, `mini01-b47`, `mini01-b51`, `mini01-b55`.

They comprise six Easy and six Medium items, two per physiology chapter. Reuse connects bookmarks and history to the same item. New content has separate `mini02-…` IDs. The combined original practice bank has 178 unique questions (100 + 78), not 190; repeats are not duplicated there. The approved PYQ bank remains separate.

## Images and provenance

Six original vector schematics are authored directly in `src/components/BiologyDrawings.tsx`, with versioned identities and alternatives in `src/data/biology-diagrams.ts`:

| Question | Diagram | Skill tested |
| --- | --- | --- |
| mini02-bc05 | Cyanobacterial filament, enlarged cell X | Recognise a heterocyst and infer function |
| mini02-bc13 | Spore sac on fungal hyphae | Distinguish enclosed asexual spores |
| mini02-pk09 | Underside of fern prothallus | Locate female organs and connect fertilisation with water |
| mini02-ex02 | Nephron loop, limbs X and Y | Interpret segment permeability |
| mini02-ci02 | ECG events X, Y, Z | Map waveform to electrical events |
| mini02-lo02 | Sarcomere and A band | Infer changes during shortening |

No third-party images, textbook scans, traced figures or hotlinks are included. The drawings are original opneet instructional geometry, so no external image licence or attribution is required. They are embedded in the app bundle for offline availability, adapt to the existing themes and appear both during the test and in expanded answer review. Titles and alternative descriptions give visible information without naming the answer. The review Markdown contains diagram descriptions; use the app for the rendered images.

## Curriculum and fact-check references

Scope follows Biology Units 1 (Diversity in Living World) and 5 (Human Physiology) of the [official NTA NEET UG 2026 syllabus](https://neet.nta.nic.in/document/syllabus-for-neet-ug-2026-examination/), inspected during authoring on 25 October 2026. Human Physiology retains the six areas used in Test 01. Digestion, reproduction, animal kingdom and unrelated chapters are not added.

The first three NCERT Class XI Biology chapters and the six physiology chapters provide the conceptual reference. Public NCERT PDF downloads failed in this environment; indexed NCERT material on the IIT Kanpur / Ministry of Education SATHEE service was used to cross-check the relevant concepts, rather than claiming complete PDF access:

- [Biological Classification](https://sathee.iitk.ac.in/sathee-neet/ncert-books/neet-ncert-books/neet-nb-bio-11/bio-11-chapter-2-biological-classification/) — heterocysts, prokaryotes, fungal groups, spore locations and dikaryotic stages.
- [Plant Kingdom](https://sathee.iitk.ac.in/ncert-books/ncert-books-theory/class-11/nbt-bio-11/bio-11-chapter-3-plant-kingdom/) and [chapter exercises](https://sathee.iitk.ac.in/ncert-books/neet-ncert-solutions/neet-biology-11-excercises/bio-11-chapter-3-plant-kingdom-exercise/) — algae, prothallus, heterospory, seed-habit precursors and ploidy.
- [Excretory Products and Their Elimination](https://sathee.iitk.ac.in/sathee-neet/ncert-books/neet-ncert-books/neet-nb-bio-11/bio-11-chapter-19-excretory-products-and-their-elimination/) — filtration, reabsorption and renal regulation.
- [Locomotion and Movement exemplar](https://sathee.iitk.ac.in/ncert-books/ncert-exemplar-v2/ncert_b11_exemplar/locomotion_and_movement/) — cross-bridge cycling, ATP, calcium and unchanged filament/A-band lengths.

All stems, distractors, explanations and artwork are newly authored except the 12 explicitly reused opneet questions. Traditional syllabus classifications are identified as such where needed; no PG clinical material is introduced. Source review and software checks do not constitute subject-specialist approval. The review state remains `draft`.
