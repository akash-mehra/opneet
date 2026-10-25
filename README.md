# opneet

A personal NEET **UG** question bank for Physics, Chemistry and Biology. React + TypeScript + Vite, with a static build for GitHub Pages. No account or backend is required.

Live app: https://akash-mehra.github.io/opneet/

## Mini Test 02 · Biology

Choose **View biology test** on Overview or Practice & tests. This paper has **90 Biology questions**, a **90-minute** deadline and a **360-mark** maximum (+4/−1/0). It covers The Living World (12), Biological Classification (18), Plant Kingdom (18), and Human Physiology (42; seven in each of the six areas used in Test 01).

There are **78 new questions, 12 unchanged repeats from Test 01, and six original diagram questions**. The internal difficulty target is 27 Easy / 40 Medium / 23 Hard, a step up from Test 01 by author estimate. Question and review tags hide topic/difficulty; metadata is retained. All 90 questions shuffle together on a fresh attempt. Diagrams work offline and appear in expanded answer review after submission. Repeated IDs share bookmarks/history; completed attempts remain snapshots.

See [the blueprint, repeat list and image provenance](content/MINI-TEST-02.md) and [the complete author review copy](content/MINI-TEST-02-REVIEW.md). Regenerate it with `node --import tsx scripts/export-biology-test.ts`. The combined original bank contains 178 unique questions, with repeats included once. All test content remains draft practice, separate from approved PYQs.

## Mini Test 01

Choose **View mini test** on Overview or Practice & tests. The paper has **100 original NEET UG-style draft questions**, a **110-minute** deadline and a **400-mark** maximum (+4/−1/0). Biology contributes 60 questions across breathing, excretion, circulation/heart, locomotion, neural control and endocrine coordination. Physics contributes 40 across the requested mechanics and fluid topics. Difficulty is exactly 40 Easy / 40 Medium / 20 Hard by author estimate.

Each physiology chapter has ten questions. New attempts shuffle chapters/difficulty within Biology (1–60) and Physics (61–100). Answers and explanations appear after submission. The original practice bank also supports chapter practice, bookmarks and revision; these drafts remain separate from the verified PYQ bank.

Ten Physics questions include responsive SVG diagrams where the setup benefits from one: projectile, connected blocks/pulley, incline, angled pull, vertical circle, disc geometry/axes and pipe flow. They also appear in post-test review and work offline. Unchanged older attempts can display the new diagrams without resetting saved answers or the timer.

See [the blueprint and references](content/MINI-TEST-01.md) and [the complete author review copy with answer key](content/MINI-TEST-01-REVIEW.md). To regenerate the latter after editing, run `node --import tsx scripts/export-mini-test.ts`. Difficulty has not been calibrated with student performance, and drafts are not claimed as subject-specialist-approved material.

## Install as a web app

Open the live site directly in your browser. A dismissible suggestion appears outside study sessions, only in browser mode. Supported browsers offer **Install opneet** when their native installer is available; otherwise **How to install** explains the browser menu steps. Installed standalone windows do not show this suggestion. Dismissal lasts seven days. Accepting the installer is described as a request, not proof of a finished Android installation.

The manifest's identity, launch URL and scope resolve to `/opneet/`, separate from other apps on the same GitHub Pages domain. Production builds generate a service worker that precaches the app, fonts and sample/reviewed content included in that build. After the first successful online load, the cached build can relaunch offline. Future question content is bundled locally until a backend is added. Updates wait for existing app tabs/windows to close; reopen online to pick up an activated update. No forced reload interrupts a study session.

If Android says **already installed** but cannot open the app, export your study backup first. Check Android Settings → Apps for a broken opneet installation and uninstall it if present; remove any stale home-screen shortcut. Reopen the live URL directly in an updated Chrome and install again. Browser installation state and Android WebAPK delivery are controlled by the browser/OS; this app cannot clear a broken device package remotely. Avoid clearing browser site data without a backup.

To check the production PWA under the GitHub Pages subpath, run `npm run build` then `npm run test:pwa`. The suite checks manifest/icon/scope validity, Chromium installability errors, browser-only UI, native-prompt handoff/error handling and offline session restoration. Native installer events are simulated; a physical Android install is not claimed.

## Run locally

Use Node 24 (`.nvmrc`):

```sh
npm ci
npm run dev
```

The development server prints its local URL. In the current workspace, the downloaded compatible Node tools are at `/home/happy/codex/.rea-toolchain/node_modules/.bin`:

```sh
export PATH="/home/happy/codex/.rea-toolchain/node_modules/.bin:$PATH"
cd /home/happy/codex/opneet
npm run dev
```

## What works

- Responsive overview, subject/chapter QBank, search, custom sessions and focused revision.
- Practice: explicit answer checking, explanation/takeaway, pause/resume, bookmarks and guessing.
- Exam: delayed feedback, changeable answers, review flags, persisted deadline and automatic local completion on expiry.
- Results: +4/−1/0 scoring, accuracy, guess score, immutable attempt snapshots and review filters.
- History: distinct first/current selections, correctness, guessed/starred state and reattempt counts.
- Light, sepia and dark themes; larger reading text; keyboard option selection; mobile navigation.
- Local browser persistence with validated backup/restore and visible storage-failure recovery.
- Versioned, validated content with an approval gate for future PYQs.

The app includes **18 original demonstration questions** marked as samples. They are not PYQs. The reviewed bank intentionally starts empty. No Marrow branding, assets, question content or implementation was copied.

## Publish on GitHub Pages

1. Create or select the GitHub repository you want to use and push this project's source to its `main` branch.
2. In the repository, open **Settings → Pages → Source → GitHub Actions**.
3. The included `.github/workflows/pages.yml` validates reviewed content, runs engine tests, builds and deploys `dist`.
4. Use the URL shown by the deployment. The build uses relative asset paths and no URL router, so repository subpaths work without custom rewrites.

No GitHub repository has been created or deployment claimed by this local build. GitHub Pages serves a static website; personal use does not automatically mean the URL has access control. Do not put personal study backups in the repository. Browser history stays on the device and origin unless exported.

Workflow references: [Vite deployment guide](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Add reviewed PYQs later

See [CONTENT.md](CONTENT.md). Approved entries go into `content/reviewed.json`. Keep source identity, year, question numbering/set information, final answer-key verification, explanation and reviewer/date. Run:

```sh
npm run content:check
npm test
npm run build
```

Drafts must never go into the published reviewed file. Do not relabel sample content as PYQs. The supported published question contract is four options with one accepted correct answer. Ambiguous, dropped or multiple-correct source questions need an explicit content-policy decision before publishing; the app does not invent an adjudication.

## Verification

```sh
npm test                  # 19 learning-engine/content/backup regressions
npm run content:check
npm run build             # strict TypeScript + static production build
npx playwright install chromium
npm run test:e2e          # browser flows and phone layout
```

On this workstation, the test browser lives at `/home/happy/codex/.browser-cache`. Set `PLAYWRIGHT_BROWSERS_PATH` to that directory when running the browser tests here.

## Data and future Railway backend

`src/domain/engine.ts` contains framework-independent learning/scoring logic. `src/data/storage.ts` owns persistence and backup validation. `src/data/questions.ts` supplies catalog content. A future Railway API can replace those data boundaries without rewriting the study screens or scoring rules. See [ARCHITECTURE.md](ARCHITECTURE.md).

Current data uses localStorage (`opneet.study.v1`). Existing data under the previous `recall-ug.study.v1` key is read as a fallback and saved under the new name. Storage is origin-specific and finite. Export backups before clearing browser data or changing hosting URLs. An exam deadline is a convenience for personal practice, not secure proctoring or server-authoritative timing. Content is delivered to the browser as part of a static app.

## NEET UG assumptions

Defaults were checked against the [NTA NEET UG 2026 bulletin, examination scheme, page 21](https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf): Physics 45, Chemistry 45, Biology 90; 180 minutes; +4 correct, −1 incorrect, 0 unanswered. Review flags do not exclude a selected answer. This app is a personal learning tool, not an official NTA product. Recheck the applicable year's bulletin before changing full-paper assumptions.

## Design and status

See [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) and [VALIDATION.md](VALIDATION.md). The first build is an original study interface informed by general learning patterns from the earlier analysis.
