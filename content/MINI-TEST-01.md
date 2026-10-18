# Mini Test 01 — authoring blueprint

This is an original NEET UG-style **draft practice paper**, not an NTA paper or a collection of verified PYQs. All questions use four options and one intended correct answer. Explanations are included. The intended audience is NEET UG students; no postgraduate clinical subject is introduced.

## Paper contract

- 100 questions, 110 minutes, maximum 400 marks.
- +4 correct, −1 incorrect, 0 unanswered; all 100 questions count.
- Biology: 60 questions, 24 Easy / 24 Medium / 12 Hard.
- Physics: 40 questions, 16 Easy / 16 Medium / 8 Hard.
- Total: 40 Easy / 40 Medium / 20 Hard. Difficulty is an editorial estimate, not calibrated student-performance data.
- Biology appears as questions 1–60; Physics as 61–100. Chapters and difficulty are shuffled within each subject on a new attempt. Options are not shuffled, preserving the authored answer indices.
- Feedback appears after submission or timeout. Reload retains the deadline and responses. The timer cannot pause.

## Coverage

| Subject | Chapter / requested topic group | Questions |
|---|---|---:|
| Biology | Breathing and exchange of gases | 10 |
| Biology | Excretory products and their elimination | 10 |
| Biology | Body fluids, vascular circulation and heart | 10 |
| Biology | Locomotion and muscle contraction | 10 |
| Biology | Neural control, neurons and central nervous system | 10 |
| Biology | Chemical coordination and endocrine regulation | 10 |
| Physics | Kinematics | 6 |
| Physics | Forces and Newton's laws | 6 |
| Physics | Friction | 4 |
| Physics | Circular motion | 4 |
| Physics | Work, energy and power | 5 |
| Physics | Centre of mass | 3 |
| Physics | Linear momentum and collisions | 4 |
| Physics | Rotational mechanics | 4 |
| Physics | Mechanical properties of fluids | 4 |

## Curriculum and inspiration references

The official [NMC/NTA NEET UG 2026 syllabus](https://nta.ac.in/Download/Notice/Notice_20260108180635.pdf) was checked for topic inclusion: Physics units on kinematics, laws of motion, work/energy, rotation and the fluid subset of properties of solids/liquids, plus Biology's human physiology unit. This custom test excludes Chemistry, digestion, plant physiology, solids, thermal physics and all other unrequested chapters.

Relevant NCERT Biology chapters: [circulation](https://ncert.nic.in/textbook/pdf/kebo115.pdf), [excretion](https://ncert.nic.in/textbook/pdf/kebo116.pdf), [neural control](https://ncert.nic.in/textbook/pdf/kebo118.pdf), and [endocrine coordination](https://ncert.nic.in/textbook/pdf/kebo119.pdf). The [official textbook contents](https://www.ncert.nic.in/textbook/pdf/kebo1ps.pdf) identify the accompanying breathing and locomotion chapters. NCERT Physics sections on motion, work/energy, and fluids were also consulted. References support scope and concepts; the stems, numerical data, distractors and explanations were authored for this paper.

PYQ-pattern examples consulted through IIT Kanpur's SATHEE indexed pages:

- [NEET 2018 Physics question 33](https://sathee.iitk.ac.in/sathee-neet/neet-pyq/2018/physics/neet_solved_paper_2018_ques_33/): conceptual discrimination about friction. Used to inform distractors distinguishing actual static friction from its limiting value; not reproduced.
- [NEET 2019 Biology question 26](https://sathee.iitk.ac.in/sathee-neet/neet-pyq/2019/biology/neet_solved_paper_2019_ques_26/): a cardiac-output relationship. The paper uses independently chosen numerical data and a different requested quantity.
- [SATHEE rotational-motion problem](https://sathee.iitk.ac.in/sathee-neet/previous-year-neet-exam-problems/previous_year_problems/rotational_motion/rotational-motion-about-a-fixed-axis-angular-momentum-system-of-particles-and-rotational-motion-lecture-8-by-prof-m-v-satyanarayana-p-3/): combining rotational energy and moment of inertia. Used as a problem-style reference, not copied.

Some SATHEE direct page requests were blocked; the indexed question/solution text was available through search. No original question is assigned a real examination year, and no claim is made of one-to-one PYQ derivation or official-key verification.

## Review and maintenance

Ten Physics setup questions include versioned, code-drawn SVG diagrams: `mini01-p04`, `p11`, `p12`, `p15`, `p16`, `p20`, `p28`, `p35`, `p38` and `p39` (each with the `mini01-` prefix). They illustrate supplied geometry and givens, without worked-out answers. These ten question records are revision 2; all stems, options and keys are unchanged. The other 30 Physics items and all Biology items have no diagram.

Diagrams have accessible titles/descriptions and theme-aware, responsive labels. They appear during attempts and in expanded result review. An older saved item without diagram metadata is supplemented only if its stable ID, stem, all options and answer key exactly match the current item; its stored answers, revision and deadline are not rewritten. Versioned drawing IDs preserve the illustrated givens.

Authoring data: `src/data/mini-test.ts`. Source kind `original` and review state `draft` keep these out of `content/reviewed.json`. The original practice bank makes them available for chapter practice and bookmarked revision as well as the fixed mini test. Subject-specialist review and student performance calibration remain future editorial steps.

`npm run content:check` checks shape and quota integrity. `npm test` checks the paper contract and engine. `npm run test:e2e` checks the launch, submission and persistence flow. These automated checks establish application behaviour, not independent scientific validation.

After publication, preserve the generated `mini01-b01`…`mini01-b60` and `mini01-p01`…`mini01-p40` identities: edit a record in place and increment its revision for content corrections. Do not insert or reorder tuples within a subject, because those positions determine identity in this first fixed paper. Future papers should use a different ID prefix.
