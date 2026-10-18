# opneet

A personal NEET **UG** question bank for Physics, Chemistry and Biology. React + TypeScript + Vite, with a static build for GitHub Pages. No account or backend is required.

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
npm test                  # 13 learning-engine/content/backup regressions
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
