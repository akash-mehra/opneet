# Architecture and next steps

## Current application

```text
React screens
  ├── domain/engine.ts — session transitions, first answer, scoring, revision filters
  ├── data/questions.ts — sample catalog and approved JSON catalog
  └── data/storage.ts — versioned local state and backup validation
```

All study logic is original. No extracted Marrow code runs here.

### Session rules

- A session snapshots its question content when it starts.
- Selecting an option sets the first selection once; later choices update only the current selection.
- Practice locks an answer after checking; “Try a different answer” explicitly unlocks it while retaining the first selection.
- Exam hides explanations until submission. Flagging does not change answer scoring.
- Timed sessions persist a deadline; selection is rejected at/after that deadline even before the next timer tick. The timer loop completes expired attempts locally.
- Practice reloads in a paused state. Resuming resets the active-time checkpoint.
- Completing an attempt creates a snapshot, clears active state and updates latest-answer history only for answered questions. Blank reattempts do not erase previous learning history.
- Revision “changed” means the first and final selections differed in the latest completed answered attempt. The history also retains the earliest recorded first answer separately.
- Incorrect revision uses the latest answer; a correct reattempt removes it from that pool. Bookmarks remain manually controlled.

### Honest limits

Storage writes are browser-local and may fail; the interface reports that and offers export. No account synchronization, secure examination, background server job, personalized scheduling algorithm, national percentile or predicted rank is implied. Time-per-question is an approximation based on the active question's checkpoints, including elapsed time while an active exam is away.

## Future Railway phase

When a backend becomes useful:

1. Add authentication and a durable database on Railway, deployed from a separate GitHub service directory/repository.
2. Introduce an authenticated catalog/state adapter at the existing data boundaries.
3. Version answer/session events, define conflict handling across devices, and migrate local v1 records with an explicit preview/backup.
4. Keep final attempt snapshots immutable; use content ID + revision in synchronization.
5. Keep secrets on the server. Only public API base URLs belong in the frontend build environment.
6. Add server-authoritative deadlines only if real assessment integrity is required.

No unimplemented API client or placeholder Railway endpoint is included in this build. The current app works independently.
