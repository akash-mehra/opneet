# Validation · 18 October 2026

## Executed successfully

- Physics diagrams: **14 browser flows** and **7 production PWA checks** passed. All ten selected diagrams render with named/description-linked SVGs and unclipped labels; no Biology item is illustrated. The 320px phone/dark-mode, results, unchanged legacy snapshots, saved answers/deadline and offline-diagram relaunch checks passed. All 26 figure captures were recentered and checked unobstructed after the reviewer requested clearer evidence. The subsequent full manual review returned **SHIP**, including scientific geometry/givens checks on all ten diagrams; no diagram supplies a calculated answer.

- Mini Test 01: exact 100-question contract passed (60 Biology / 40 Physics; 40 Easy / 40 Medium / 20 Hard). Nine final home/instructions/study screenshots across desktop, phone and tablet reported no horizontal overflow or page errors. All questions have four options, one keyed answer and an explanation. Original drafts remain excluded from the approved-PYQ bank.
- The mini-test reviewer sanity-checked all 100 keys/explanations, requested one explicit friction-direction assumption and five stronger integrated Biology items, then scored those listed fixes **resolved / SHIP** after correction and fresh captures. This is not subject-specialist certification. The documenter confirmed existing design tokens remain appropriate; a preexisting design-sidecar schema drift was left unchanged.

- PWA update: `npm run build`, **6 production PWA checks**, and **9 existing browser flows** passed. Chromium reported no installability errors; manifest identity/start/scope and decoded icons resolve correctly under `/opneet/`. Offline first relaunch restored saved practice and its explanation. Native install acceptance/failure events and standalone display mode were simulated; these do not prove Android WebAPK installation on a physical device.
- The install popup received a scoped manual **SHIP** review using desktop, phone, tablet and phone-help captures. The design documenter confirmed the extension preserves the existing system. The automated context/detector engine was unavailable; no automated design-engine pass is claimed.
- `npm run build`: strict TypeScript check and static production build passed on the final implementation.
- `npm test`: **16 tests passed** for mini-test subject/difficulty quotas, 110-minute deadline, 400-mark scoring, original-draft backup compatibility,  first/current answer handling, practice locking, expired selection rejection, UG scoring/flags/blanks, guess score, snapshots, completion idempotency, revision pools, content approval and backup validation.
- `npm run content:check`: passed; **0 published PYQs**, sample questions remain separate.
- `npm run test:e2e`: **14 browser flows passed** including all ten diagrams, legacy snapshot/results handling, narrow-phone diagrams, and the 100-question mini-test launch, subject boundary navigation, saved deadline, submission, phone navigator, and the opneet rename: migration from the previous storage key; practice/explanations/bookmarks/reload; exam answer hiding/deadline reload; empty reviewed bank; subject filtering/leave/resume; expired attempt completion; phone layout; tablet navigation/dialog/keyboard/focus return; validated backup restoration. The resume test targets the pause overlay rather than the background sidebar button.
- Desktop (1440px), phone (390px), dark-theme and tablet (800px) captures were inspected. The main desktop/phone home and study captures reported no horizontal overflow or page errors.
- Android 15 (API 35) was booted in the Android Studio emulator engine with KVM. Android Chrome 124 passed the practice/explanation/guess/bookmark/reload/results/session-builder/timed-test smoke flows at **412 × 783 CSS pixels** and at a tablet display override of **800 × 1080 CSS pixels**. All ten captured flow states reported no horizontal overflow or JavaScript errors. The phone landscape study layout also passed at **863 × 304 CSS pixels**. Reports and screenshots are under `.impeccable/review/android/`.
- A CDP touch-start/touch-end event on Android's tablet study page toggled the guess control successfully; its separate touch report also showed no overflow or page errors.

## Review outcome

An independent manual finish review requested accessible tablet labels/tooltips and named dialogs. Those were corrected. A stronger keyboard test exposed unreliable focus restoration on dialog dismissal; the shared dialog now explicitly restores focus after unmount, and the check passes. The decorative hero eyebrow was removed.

The reviewer scored the listed fixes resolved and returned **SHIP**, conditional on the final build; that build subsequently passed. Review and capture artifacts are checkout-local under `.impeccable/review/` and ignored by Git.

## Limits

- Mini-test difficulty labels are author estimates, not calibrated student outcomes. The paper remains original draft content, not official PYQs or subject-specialist-approved material. An answer-key sanity review cannot establish that every item is scientifically unambiguous.

- Tested with Playwright Chromium and Chrome 124 bundled in the Android 15 emulator image. This does not establish physical-device performance, current Chrome compatibility, every browser, screen reader or mobile OS. The tablet run used a size/density override on the same emulator, not a separate tablet hardware profile. No APK was built.
- The Impeccable launcher/detector engine was unavailable after actual attempts. Manual review was used; no automated design-detector pass is claimed.
- GitHub Pages is live at `https://akash-mehra.github.io/opneet/` from the public `akash-mehra/opneet` repository. Railway is not deployed.
- Storage quota failure, multi-tab concurrency and cross-device synchronization were not proven by the test suite. Storage errors have visible recovery/export handling; synchronization is not implemented.
- Sample question correctness was checked during authoring; no claim is made that the samples are PYQs or a complete NEET UG syllabus.
- The full-paper preset remains disabled until the approved bank has at least 45 Physics, 45 Chemistry and 90 Biology questions.

Build output is approximately 349 KB JavaScript (110 KB gzip), 43 KB CSS (9 KB gzip), plus self-hosted font files. Bundling emits non-fatal `use client` directive warnings from Lucide; this is a client-only static application.
