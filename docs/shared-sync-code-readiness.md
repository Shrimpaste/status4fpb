# Shared Sync Code Readiness

## Status / Scope

Status: code readiness summary only.

This document adds no code, UI, storage, network, backend, QQ Bot, database,
account, import/export, or production sync behavior. It summarizes the
shared-sync code that is already merged to `master` and records the remaining
boundaries before any real shared sync work can proceed.

This document does not approve a network client, backend, UI integration,
credential storage implementation, or production sync implementation.

## Implemented Code Slices

The current shared-sync implementation is intentionally small and local.

| File | Responsibility | Current boundary |
| --- | --- | --- |
| `src/shared-sync/types.ts` | Defines the shared room, member, status, credential, state, source, and status input type boundary. | Type-only; no storage, network, AppState mutation, or UI behavior. |
| `src/shared-sync/localMockSyncClient.ts` | Provides an in-memory contract-shaped mock client for room creation, joining, state reads, status updates, and leave behavior. | Test/dev shape only; no persistence, server, fetch, WebSocket, SSE, EventSource, or XMLHttpRequest. |
| `src/shared-sync/sharedStateAdapter.ts` | Converts `SharedTownState` into display-ready member and status projection data. | Pure function; does not mutate local `AppState`, call domain actions, store data, or convert expired statuses to `offline`. |
| `src/shared-sync/noNetwork.test.ts` | Guards shared-sync non-test source files against direct network APIs. | Scans current shared-sync source files and fails on forbidden network client patterns. |

These slices establish a local, reviewable boundary. They do not connect the
application to a remote room, backend, account system, QQ Bot, database, or
production synchronization service.

## Current Test Coverage

The shared-sync test suite currently includes:

- `src/shared-sync/types.test.ts`
- `src/shared-sync/localMockSyncClient.test.ts`
- `src/shared-sync/sharedStateAdapter.test.ts`
- `src/shared-sync/noNetwork.test.ts`

Current coverage proves:

- Shared status sources are modeled explicitly.
- `unknown` is kept out of submitted manual status input.
- `timer_rule` is kept out of client-submitted status sources.
- Shared town state includes server time.
- Member credentials are modeled without real QQ identifiers.
- Room creation returns invite code, creator credential, and state.
- Joining with an invite code creates a room member and credential.
- Room state is returned without member secrets.
- Status updates are scoped to the authenticated member.
- Invalid member secrets are rejected.
- Cross-member status updates are rejected.
- Runtime-forced `unknown` status submissions are rejected.
- Runtime-forced `timer_rule` source submissions are rejected.
- Leaving marks a member left and prevents later status updates.
- Repeated status updates converge to one current status per member.
- Orphan status entries are filtered from display projection output.
- Left member status entries are filtered from display projection output.
- Expired shared statuses are marked with `isExpired` only.
- Expired shared statuses are not converted to `offline` by the shared adapter.
- Adapter output does not expose `memberSecret`.
- Adapter input state is not mutated.
- Shared-sync non-test source files do not contain direct network clients.

## Explicitly Not Implemented

The following are still not implemented:

- No `sharedSyncClient.ts`.
- No network client.
- No `fetch`.
- No WebSocket.
- No SSE or `EventSource`.
- No `XMLHttpRequest`.
- No React or UI integration.
- No localStorage credential storage.
- No `AppState` integration.
- No Tauri integration.
- No backend.
- No QQ Bot.
- No QQ monitoring.
- No account system.
- No database.
- No import/export.
- No production sync.
- No server verifier or hash implementation.
- No credential rotation or revocation implementation.
- No polling lifecycle.
- No shared-mode user-facing copy.

Any future work in these areas requires a separate reviewed slice with exact
allowed files, tests, privacy constraints, and rollback behavior.

## Preserved Boundaries

The current code preserves these boundaries:

- The local-only app remains unchanged.
- Shared-sync code does not mutate local `AppState`.
- Shared-sync code does not call domain actions.
- Shared-sync code does not write to `localStorage`.
- Shared-sync code does not start polling or network traffic.
- Shared room state remains separate from the current local domain model.
- Shared credentials remain separate from public room state.
- `memberSecret` remains out of returned room state and display projection.
- The local mock client is in-memory only.
- The local mock client is not a security boundary.
- The shared adapter is pure display projection logic.
- The shared adapter does not convert expired statuses to `offline`.
- Domain effective-status fallback remains separate from shared state.
- Reset Home, Leave Room, and Clear Shared Credentials semantics remain future
  UI/storage concerns, not current shared-sync behavior.

## Known Risks / Deferred Issues

Known deferred issues:

- Invalid ISO date strings are not runtime-validated by the shared adapter.
- Shared state payload validation is not implemented as a separate guard.
- The local mock client is not persistent.
- The local mock client is not a security boundary.
- Credential storage is not implemented.
- Server verifier/hash storage and comparison are not implemented.
- Secret rotation and revocation behavior are not implemented.
- Real backend hosting remains undecided.
- Logging redaction is policy-only and has no backend mechanism yet.
- Rate limits and abuse controls are not implemented.
- Backend-unavailable behavior is not implemented in client code.
- UI privacy copy for create, join, leave, backend unavailable, reset, and
  credential clearing is not written.
- Browser/manual acceptance is not applicable until UI or runtime behavior
  changes.

These risks block real network sync and production shared mode. They do not
block further docs-only planning or a narrowly scoped validation guard slice.

## Go / No-Go

Allowed next:

- A narrowly scoped shared-state validation/guard code slice.
- A docs-only shared sync client boundary plan.
- A docs-only backend readiness or hosting review.

Not allowed yet:

- Real network client.
- Backend implementation.
- UI shared mode.
- Credential storage implementation.
- Polling lifecycle.
- QQ Bot.
- Account system.
- Database schema or migration.
- Import/export sync.
- Production sync.

The current code is ready for another small local validation slice, but it is
not ready for real shared synchronization.

## Recommended Next Slice

Recommended next code slice: shared state validation guards.

Potential future files:

- `src/shared-sync/sharedStateValidation.ts`
- `src/shared-sync/sharedStateValidation.test.ts`

Possible later integration, only after separate approval:

- A small update to `src/shared-sync/sharedStateAdapter.ts` to call validation
  before adapting shared state.
- A small update to `src/shared-sync/noNetwork.test.ts` so the no-network guard
  scans any new non-test shared-sync source file.

The validation guard should focus on malformed shared state before display
projection. It should not introduce network, storage, UI, backend, QQ Bot,
credential persistence, or production sync behavior.

Possible validation scope for that future slice:

- Required room fields are present.
- `serverTime` is a valid ISO date string.
- Status `startedAt`, `updatedAt`, and optional `expiresAt` values are valid ISO
  date strings.
- Status map keys match `status.memberId`.
- Status member IDs exist in `members`.
- Left member statuses are rejected or filtered before display.
- Public room state does not contain `memberSecret`.
- Unknown or fallback-only status values are rejected if they are forced through
  runtime input.

This is only a recommendation. The next slice still needs separate review and a
fresh exact file/test list before code is written.

## Validation For This Documentation Round

This docs-only readiness document should be validated with:

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

The review report should confirm:

- Only `docs/shared-sync-code-readiness.md` was added.
- No code files changed.
- No `src/shared-sync/*` files changed.
- No tests were added or modified.
- No Tauri files changed.
- No package dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, storage, UI, or
  production sync code was added.
- The document states the current implemented slices.
- The document states explicit non-implemented areas.
- The document preserves current local-only and no-network boundaries.
- The document lists known deferred risks.
- The document makes the next allowed and disallowed work explicit.
