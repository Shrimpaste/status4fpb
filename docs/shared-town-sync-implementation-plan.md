# Shared Town Sync Implementation Plan

## Status

Status: Implementation plan only.

This document does not implement backend code, frontend networking, database
schema, account login, QQ Bot integration, webhook handling, import/export, or
sync. It describes how a future Phase 2 implementation could be sliced after
the required privacy, API, hosting, credential, and abuse reviews are complete.

No source files, tests, server files, database files, package dependencies, or
Tauri configuration should be created from this document in the current round.

## Source Documents

This plan depends on these existing documents:

- `docs/shared-town-sync-architecture.md`
- `docs/shared-town-sync-api-contract.md`
- `docs/qq-bot-command-research.md`
- `docs/continuity.md`

The architecture document defines the product and privacy boundaries. The API
contract defines the draft endpoint, credential, validation, error, time, and
retry behavior. The QQ Bot research document is only a boundary reference:
Phase 2 does not include QQ Bot work.

## Phase 2 Goal

Phase 2 should validate the smallest useful shared-town loop:

1. A user creates a shared town room.
2. A user joins a room with an invite code.
3. The client stores a room-scoped `memberId` and `memberSecret` locally.
4. A member manually broadcasts a status.
5. Another client sees the room state through short polling.
6. A member leaves the room.
7. Local-only mode remains available before, during, and after shared-mode
   failures.

This phase is for explicit, user-controlled status sharing. It must not become
QQ monitoring, chat import, account login, or a general social graph.

## Phase 2 Non-Goals

Phase 2 must not include:

- QQ Bot integration.
- Ordinary QQ group message monitoring.
- QQ private APIs.
- QQ client scraping.
- Chat log import or analysis.
- Real QQ ID storage.
- QQ cookies, tokens, passwords, or client credentials.
- Mandatory account registration.
- SSE or WebSocket.
- Admin UI.
- Import/export sync.
- End-to-end encryption design.
- Tauri tray shortcut status.
- Database migration files before backend choice is reviewed.
- Automatic status inference from messages, activity, clock behavior, keywords,
  or social behavior.

## Implementation Gates

Implementation cannot start until reviewers confirm:

- Privacy review completed.
- API contract reviewed.
- Backend hosting choice documented.
- Credential generation strategy documented.
- Local credential storage strategy documented.
- Server-side secret verifier strategy documented.
- Secret rotation and revocation decision documented.
- Abuse and rate-limit baseline documented.
- Logging redaction policy documented.
- Backend-unavailable behavior documented.
- Local-only mode remains available.
- No QQ monitoring is introduced.
- No real QQ IDs are introduced.
- No raw chat retention is introduced.
- No mandatory account is introduced.
- No SSE or WebSocket is introduced in Phase 2.
- No QQ Bot implementation is introduced in Phase 2.

If any gate is unresolved, the next action is more documentation or review, not
implementation.

## Candidate Technical Shape

The first implementation should start with a local mock adapter and contract
tests before real hosting. This lowers privacy risk, lets the UI and state
boundary be reviewed without transmitting data, and keeps backend decisions
from leaking into the local MVP too early.

### Candidate A: Local Mock Adapter First

Use an in-process or local test double that follows the API contract shape.

Benefits:

- No networked status data leaves the device during the first slice.
- Client adapter behavior can be tested against the contract.
- Failure modes can be exercised deterministically.
- Local-only mode can remain the baseline path.

Costs:

- It does not validate real hosting, rate limits, or server logging.
- It can hide cross-device timing and retry problems until later.

Recommended use: first implementation slice.

### Candidate B: Small Node/TypeScript Service

Build a small service only after the review gates pass.

Benefits:

- Shares language and tooling with the frontend.
- Can reuse contract-oriented TypeScript types after they are reviewed.
- Easier to test request/response behavior in the existing toolchain.

Costs:

- Requires hosting, secret storage, logging, and rate-limit decisions.
- Introduces real networked status data.

Recommended use: second or later slice, after local mock and review.

### Candidate C: Serverless Functions

Use serverless endpoints only after hosting and persistence decisions are clear.

Benefits:

- Lower operational footprint for a small status toy.
- Scales modestly without a long-running service.

Costs:

- Persistence, rate limits, logging redaction, and local development workflows
  can become fragmented.
- Cold starts and platform-specific behavior may complicate polling.

Recommended use: compare during hosting review, not during the first client
slice.

## Work Breakdown

The future implementation should be sliced so each step can be reviewed and
rolled back independently.

### Slice 1: Shared Sync Type Boundary

Goal: define the future shared-sync data boundary without touching UI behavior.

Future candidate files:

- `src/shared-sync/types.ts`
- `src/shared-sync/types.test.ts`

Expected behavior:

- Represent room, member, credential, status, error, and state response shapes
  from `docs/shared-town-sync-api-contract.md`.
- Keep `unknown` out of submitted status types.
- Keep shared state separate from current local `AppState`.
- Include no network code.

Review focus:

- Type names match the API contract.
- Sensitive fields are clearly separated from public room/member state.
- No QQ identifiers, cookies, or tokens appear in the model.

### Slice 2: Local Mock Sync Client

Goal: exercise the shared-room flow without a server.

Future candidate files:

- `src/shared-sync/localMockSyncClient.ts`
- `src/shared-sync/localMockSyncClient.test.ts`

Expected behavior:

- Create a mock room and invite code.
- Join with an invite code.
- Store mock member credentials only in test-controlled state.
- Set current status for the authenticated mock member.
- Return complete room state with `serverTime`.
- Simulate invalid invite, invalid member secret, rate-limited, and backend
  unavailable outcomes.

Review focus:

- No real network calls.
- Retry and conflict assumptions match the API contract.
- Failure cases do not corrupt local state.

### Slice 3: Client Adapter Boundary

Goal: map shared room state into the existing display surface while keeping
local `AppState` intact.

Future candidate files:

- `src/shared-sync/sharedTownAdapter.ts`
- `src/shared-sync/sharedTownAdapter.test.ts`

Expected behavior:

- Convert `SharedTownState` into renderable member/status data.
- Preserve local-only `AppState`.
- Keep local members from being uploaded automatically.
- Treat shared room join as an explicit user action.
- Keep reset-home separate from leave-room.

Review focus:

- Local reset does not delete shared server state.
- Leave room does not reset local-only home.
- Expired status fallback is display behavior, not a submitted `unknown`.

### Slice 4: Credential Local Storage Strategy

Goal: document and then implement storage for room-scoped credentials only after
the credential review passes.

Future candidate files:

- `src/shared-sync/sharedCredentialStore.ts`
- `src/shared-sync/sharedCredentialStore.test.ts`

Expected behavior:

- Store `roomId`, `memberId`, and `memberSecret` separately from public cached
  room state where the platform allows it.
- Never store QQ cookies, QQ tokens, real QQ IDs, or raw Bot content.
- Support clearing the local credential.
- Do not log secrets.

Review focus:

- Local delete removes credentials and cached shared state.
- Public cache and secret material are not accidentally serialized together.
- Storage failure falls back safely to local-only mode.

### Slice 5: Join, Leave, And Shared Mode UI Plan

Goal: add explicit shared-mode entry and exit only after the adapter and storage
boundaries are proven.

Future candidate files:

- `src/components/SharedTownPanel.tsx`
- `src/components/SharedTownPanel.test.tsx`
- `src/app/useSharedTown.ts`
- `src/app/useSharedTown.test.ts`

Expected behavior:

- Create room.
- Join room with invite code.
- Show non-sensitive shared connection state.
- Leave room.
- Keep local-only mode available.

Review focus:

- Users opt in before sharing.
- Secrets are never shown casually.
- UI copy does not imply QQ monitoring or automatic detection.
- Backend unavailable state is non-blocking.

### Slice 6: Polling Lifecycle

Goal: add short polling only after mock adapter, client boundary, and failure
modes are reviewed.

Future candidate files:

- `src/shared-sync/pollingSharedTownClient.ts`
- `src/shared-sync/pollingSharedTownClient.test.ts`

Expected behavior:

- Poll slowly.
- Back off on rate limits and transient failures.
- Compare status expiration against `serverTime`.
- Stop polling after leave or local credential clear.
- Never use SSE or WebSocket in Phase 2.

Review focus:

- No polling starts before explicit room join.
- Polling failure does not break local-only mode.
- Retry behavior follows the API contract.

### Slice 7: Real Backend Planning

Goal: choose backend and persistence only after local mock and client adapter
behavior are proven.

Future documentation or planning files:

- `docs/shared-town-sync-hosting-review.md`
- `docs/shared-town-sync-privacy-review.md`
- `docs/shared-town-sync-abuse-baseline.md`

Expected behavior:

- Compare hosting candidates.
- Decide secret verifier storage.
- Decide data retention and leave semantics.
- Define logging redaction.
- Define rate limits.
- Define rollback strategy.

Review focus:

- Real networked status data is not transmitted until reviews pass.
- Backend choice does not require accounts or QQ identifiers.

## Future File Boundaries

These files are future candidates only. Do not create them in this planning
round.

| Future file | Responsibility | Must not do |
| --- | --- | --- |
| `src/shared-sync/types.ts` | Shared API and adapter types. | Perform network calls or store secrets. |
| `src/shared-sync/localMockSyncClient.ts` | Mock contract-following sync client. | Contact a backend. |
| `src/shared-sync/sharedTownAdapter.ts` | Convert shared state into display state. | Mutate local `AppState` implicitly. |
| `src/shared-sync/sharedCredentialStore.ts` | Store local room credential. | Store QQ cookies, tokens, or raw Bot data. |
| `src/app/useSharedTown.ts` | Coordinate explicit shared-mode UI state. | Start sync before user joins a room. |
| `src/shared-sync/pollingSharedTownClient.ts` | Future short-polling client. | Use SSE, WebSocket, or passive QQ monitoring. |

The existing local files remain local-first by default:

- `src/types/domain.ts`
- `src/domain/appState.ts`
- `src/storage/localStorageStore.ts`
- `src/app/usePixelHomeApp.ts`
- `src/components/*`

Future shared-sync work should add boundaries around them, not blend remote
state directly into the current local model.

## Client State Boundary

Current `AppState` remains local-only. Shared room state is separate and should
be adapted into the display layer.

Required boundary rules:

- A user must explicitly create or join a shared room.
- Local members are not automatically uploaded.
- Local statuses are not automatically broadcast.
- Shared members are not automatically written into local `AppState`.
- Local reset clears the local home only.
- Leave room stops shared participation but does not reset the local home.
- Clearing local credentials disconnects shared mode but does not imply remote
  room deletion.
- Backend unavailable state keeps the app usable in local-only mode.

This boundary prevents accidental data sharing and keeps the current MVP useful
without sync.

## Privacy And Security Test Plan

Future implementation tests must prove privacy boundaries, not just happy paths.

Required future test cases:

- No real QQ IDs are sent or stored.
- QQ cookies, tokens, passwords, and client credentials are never sent or
  stored.
- Raw Bot command text is not sent or stored in Phase 2.
- `unknown` cannot be submitted as a status.
- `memberSecret` is not logged.
- `Authorization` is not logged.
- Invalid `memberSecret` fails safely.
- A member cannot update another member's status.
- Leave disables future status updates for that member.
- Expired status fallback does not create a submitted `unknown`.
- Local-only mode works when shared backend is unavailable.
- Shared polling does not start before explicit join.
- Reset home does not delete remote room state.
- Clearing local credentials does not expose the secret.

Manual privacy review must inspect logs, storage, and network payloads before
any real backend deployment.

## Failure Mode And Rollback Plan

The app must degrade toward local-only behavior.

| Failure | Expected behavior |
| --- | --- |
| Backend unavailable | Keep local-only app usable; show non-blocking shared-mode failure state. |
| Polling timeout | Keep last safe shared display separate from local state; back off. |
| Rate limited | Back off and show a non-blocking shared-mode notice. |
| Invalid invite code | Do not reveal whether a room exists; keep local app unchanged. |
| Invalid member secret | Disconnect or require rejoin; do not overwrite local state. |
| Server returns invalid state | Reject shared payload and keep local state unchanged. |
| Credential storage fails | Do not join shared mode; keep local-only app usable. |
| User leaves room | Stop polling and prevent further shared status updates. |
| User resets local home | Clear local home only; do not call remote delete. |

Rollback principle: disabling shared mode must leave the existing local MVP
usable with its current `localStorage` data.

## Browser And Manual Acceptance Plan

Future UI implementation should be accepted with both automated tests and a
manual/browser smoke pass.

Manual acceptance scenarios:

1. Create a room.
2. Join the room from a second client or mock client.
3. Set `exam_paper` for one member and observe it through shared state.
4. Set `scope_shrinking` and verify newest valid status wins.
5. Add a short note and expiration, then verify fallback display uses
   `serverTime`.
6. Leave the room and verify future status updates fail safely.
7. Simulate backend offline and verify local-only mode still works.
8. Reset local home and verify it does not delete remote shared state.
9. Clear local shared credentials and verify sync stops.

Browser checks are required only when UI or behavior changes. This planning
round changes documentation only.

## Implementation Sequence

Recommended future order:

1. Finish privacy, hosting, credential, and abuse reviews.
2. Add shared-sync types with tests.
3. Add a local mock sync client with contract-shaped tests.
4. Add adapter tests between shared room state and display state.
5. Add credential storage only after storage review.
6. Add explicit shared-mode UI using the mock client.
7. Add polling lifecycle using a reviewed client boundary.
8. Re-run privacy and failure-mode review.
9. Decide real backend hosting.
10. Plan backend implementation in a separate document.

Each implementation slice should use test-driven development and should commit
separately after tests, lint, build, and relevant browser checks pass.

## Review Checklist For The First Implementation Slice

Before the first implementation slice starts, reviewers should answer:

- Which implementation gate was satisfied by evidence?
- Which files are allowed for this slice?
- Which tests fail before implementation?
- What data is transmitted, if any?
- Where are credentials stored?
- How are logs checked for secrets?
- How does local-only mode behave if the slice fails?
- What is the rollback path?
- Does the slice preserve the API contract?
- Does the slice avoid QQ Bot, QQ monitoring, accounts, and real QQ IDs?

If any answer is unclear, write or update a review document before writing code.

## Non-Goals For This Planning Round

- No implementation in this round.
- No React, CSS, domain, storage, or Tauri changes.
- No package dependencies.
- No tests.
- No server.
- No database schema.
- No webhook.
- No QQ Bot.
- No `fetch` calls.
- No SSE or WebSocket.
- No account login.
- No import/export sync.
- No architecture document changes.
- No API contract changes.

## Validation For This Documentation Round

This docs-only plan should be validated with:

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

The review report should confirm:

- Only `docs/shared-town-sync-implementation-plan.md` was added.
- No functional code changed.
- No Tauri files changed.
- No dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, or sync code
  was added.
- The document remains an implementation plan only.
- Gates, tasks, future file boundaries, failure modes, privacy tests, and
  manual acceptance scenarios are covered.
