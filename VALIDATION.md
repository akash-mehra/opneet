# Validation · 18 October 2026

## Executed successfully

- PWA update: `npm run build`, **6 production PWA checks**, and **9 existing browser flows** passed. Chromium reported no installability errors; manifest identity/start/scope and decoded icons resolve correctly under `/opneet/`. Offline first relaunch restored saved practice and its explanation. Native install acceptance/failure events and standalone display mode were simulated; these do not prove Android WebAPK installation on a physical device.
- The install popup received a scoped manual **SHIP** review using desktop, phone, tablet and phone-help captures. The design documenter confirmed the extension preserves the existing system. The automated context/detector engine was unavailable; no automated design-engine pass is claimed.
- `npm run build`: strict TypeScript check and static production build passed on the final implementation.
- `npm test`: **13 tests passed** for first/current answer handling, practice locking, expired selection rejection, UG scoring/flags/blanks, guess score, snapshots, completion idempotency, revision pools, content approval and backup validation.
- `npm run content:check`: passed; **0 published PYQs**, sample questions remain separate.
- `npm run test:e2e`: **9 browser flows passed** after the opneet rename: migration from the previous storage key; practice/explanations/bookmarks/reload; exam answer hiding/deadline reload; empty reviewed bank; subject filtering/leave/resume; expired attempt completion; phone layout; tablet navigation/dialog/keyboard/focus return; validated backup restoration. The resume test targets the pause overlay rather than the background sidebar button.
- Desktop (1440px), phone (390px), dark-theme and tablet (800px) captures were inspected. The main desktop/phone home and study captures reported no horizontal overflow or page errors.
- Android 15 (API 35) was booted in the Android Studio emulator engine with KVM. Android Chrome 124 passed the practice/explanation/guess/bookmark/reload/results/session-builder/timed-test smoke flows at **412 × 783 CSS pixels** and at a tablet display override of **800 × 1080 CSS pixels**. All ten captured flow states reported no horizontal overflow or JavaScript errors. The phone landscape study layout also passed at **863 × 304 CSS pixels**. Reports and screenshots are under `.impeccable/review/android/`.
- A CDP touch-start/touch-end event on Android's tablet study page toggled the guess control successfully; its separate touch report also showed no overflow or page errors.

## Review outcome

An independent manual finish review requested accessible tablet labels/tooltips and named dialogs. Those were corrected. A stronger keyboard test exposed unreliable focus restoration on dialog dismissal; the shared dialog now explicitly restores focus after unmount, and the check passes. The decorative hero eyebrow was removed.

The reviewer scored the listed fixes resolved and returned **SHIP**, conditional on the final build; that build subsequently passed. Review and capture artifacts are checkout-local under `.impeccable/review/` and ignored by Git.

## Limits

- Tested with Playwright Chromium and Chrome 124 bundled in the Android 15 emulator image. This does not establish physical-device performance, current Chrome compatibility, every browser, screen reader or mobile OS. The tablet run used a size/density override on the same emulator, not a separate tablet hardware profile. No APK was built.
- The Impeccable launcher/detector engine was unavailable after actual attempts. Manual review was used; no automated design-detector pass is claimed.
- GitHub Pages is live at `https://akash-mehra.github.io/opneet/` from the public `akash-mehra/opneet` repository. Railway is not deployed.
- Storage quota failure, multi-tab concurrency and cross-device synchronization were not proven by the test suite. Storage errors have visible recovery/export handling; synchronization is not implemented.
- Sample question correctness was checked during authoring; no claim is made that the samples are PYQs or a complete NEET UG syllabus.
- The full-paper preset remains disabled until the approved bank has at least 45 Physics, 45 Chemistry and 90 Biology questions.

Build output is approximately 292 KB JavaScript (90 KB gzip), 41 KB CSS (9 KB gzip), plus self-hosted font files. Bundling emits non-fatal `use client` directive warnings from Lucide; this is a client-only static application.
