# Shared Town Sync Local Mock Adapter Plan

## Status / Scope

Status: Local mock adapter plan only.

No code is implemented by this document. This plan does not introduce a
backend, network request, database, account system, QQ Bot, webhook,
import/export flow, production sync, source file, test file, package dependency,
or Tauri change.

The local mock adapter is a future low-risk implementation slice. Its purpose
is to exercise the shared-town API contract and client adapter boundary without
transmitting status data anywhere.

## Source Documents

This plan depends on the current shared-town-sync baseline:

- `docs/shared-town-sync-architecture.md`
- `docs/shared-town-sync-api-contract.md`
- `docs/shared-town-sync-implementation-plan.md`
- `docs/shared-town-sync-privacy-review.md`
- `docs/shared-town-sync-phase2-readiness.md`
- `docs/adr/0003-shared-town-credential-storage.md`

## Goal

The future local mock adapter slice should validate these boundaries before any
real backend or networking work starts:

- Shared sync type boundary.
- API-contract-shaped request and response behavior.
- Client adapter seam between shared state and display-ready town data.
- Local-only fallback remains the default and remains usable.
- No network, no backend, no QQ data, and no real shared persistence.

The mock should behave like a small in-memory contract double, not like a
hidden server.

## Explicit Non-Goals

This planning round and the future local mock slice must not include:

- Real backend.
- Network calls.
- `fetch`, WebSocket, or SSE.
- Database.
- Account system.
- QQ Bot.
- QQ monitoring.
- Chat import or export.
- Production sync.
- Credential persistence implementation.
- UI feature expansion in this planning round.
- Real QQ IDs, QQ chat content, QQ credentials, or raw Bot command text.
- Server process, webhook, hosting choice, or server logs.

## Future File Boundary

These files are future candidates only. Do not create them in this planning
round.

| Future file | Responsibility |
| --- | --- |
| `src/shared-sync/types.ts` | Define shared room, member, status, credential, state, and error types that match the API contract. |
| `src/shared-sync/localMockSyncClient.ts` | Provide an in-memory mock implementation of the shared-town client contract for tests and development-only experiments. |
| `src/shared-sync/localMockSyncClient.test.ts` | Prove create, join, state, status update, leave, credential, and no-network behavior before implementation is accepted. |
| `src/shared-sync/sharedSyncClient.ts` | Define the client interface that both mock and future network clients must satisfy. |
| `src/shared-sync/sharedSyncClient.test.ts` | Prove shared client contract expectations that do not depend on a specific implementation. |
| `src/shared-sync/sharedStateAdapter.ts` | Convert `SharedTownState` into display-ready member and status data without mutating local `AppState`. |
| `src/shared-sync/sharedStateAdapter.test.ts` | Prove adapter behavior for status mapping, expiration fallback, invalid shared state, and local-only isolation. |

These files are future candidates only. Do not create them in this planning
round.

The future implementation may refine names during slice review, but the review
must still preserve the same boundaries: types, client contract, local mock,
adapter, and tests remain separate.

## Mock Behavior Contract

The future mock client should implement a contract-shaped local flow:

| Operation | Planned behavior |
| --- | --- |
| `createRoom(input)` | Creates an in-memory room, returns room data, plaintext invite code, first member, and first member credential. |
| `joinRoom(inviteCode, memberProfile)` | Validates the invite code and returns member credential plus current room state. |
| `getRoomState(roomId)` | Returns complete contract-shaped room state with `serverTime`. |
| `setMemberStatus(roomId, memberId, credential, statusInput)` | Validates room, member, credential, and status input, then returns updated status and `serverTime`. |
| `leaveRoom(roomId, memberId, credential)` | Marks the member left or removes it from active mock state, then prevents later status updates for that member. |

Required constraints:

- No real HTTP.
- No `Authorization` header logging.
- No real `memberSecret` persistence.
- No server process.
- No invite-code or secret material in console output.
- `unknown` remains display fallback only and cannot be submitted.
- A member can update only that member's own status.
- Leave wins over later status updates until a separately reviewed rejoin flow
  exists.

## Data Model Plan

The future mock should use a small in-memory model that is separate from the
current local `AppState`:

| Mock model | Purpose |
| --- | --- |
| `MockRoom` | Stores room identity, room name, invite-code verifier material, timestamps, and member IDs for the mock instance. |
| `MockMember` | Stores room-scoped member identity, display fields, timestamps, and left state. |
| `MockStatus` | Stores one current explicit status per member, with server-time timestamps and optional expiration. |
| `MockCredential` | Represents test-only room/member secret material used to authorize mock mutations. |

The mock model must not be serialized into `qq-status-pixel-home:v1`. It must
not implement the ADR 0003 credential store. It may use test-controlled
in-memory data only until a separate credential-storage implementation slice is
approved.

The mock should return contract-shaped `SharedTownState` values instead of
reusing local `AppState`. The adapter is responsible for producing
display-ready data.

## Test-First Plan

Future implementation must start with failing tests before mock code is written.
At minimum, tests should cover:

- Create room returns `roomId`, `inviteCode`, first member, and member
  credential.
- Join room with invite code creates a new member and credential.
- Unknown or fallback-only status cannot be submitted.
- A member cannot update another member's status.
- Invalid credential fails safely and does not mutate mock state.
- Leave disables later status updates for that member.
- `getRoomState` returns `serverTime`.
- Expired status fallback is adapter/display behavior, not a submitted
  `unknown`.
- Local `AppState` remains unchanged by mock operations.
- Reset Home remains local-only and does not call mock leave/delete behavior.
- Clear mock credentials is not implemented unless a separate credential slice
  approves it.
- No network APIs are called.

The first future code commit should include the failing tests, the minimal mock
implementation, and the green verification for that exact slice.

## No-Network Enforcement

The future mock tests must prove the slice is local-only:

- `globalThis.fetch` must not be called.
- `WebSocket` must not be constructed.
- `EventSource` must not be constructed.

Recommended enforcement:

- Install spies or stubs in the test environment before mock operations run.
- Fail the test immediately if `fetch`, `WebSocket`, or `EventSource` is used.
- Keep no-network tests near the mock client tests so the boundary is visible
  during review.
- Do not add a network library, server process, dev proxy, mock service worker,
  or local HTTP server for the local mock slice.

This no-network proof is a blocker for accepting the first mock implementation.

## Client Adapter Boundary

The future shared sync client should return `SharedTownState`. A separate
adapter should convert shared state into display-ready member and status data.

Boundary rules:

- Current domain `AppState` remains local-only.
- Shared members are not written into local `AppState` implicitly.
- Local members are not uploaded automatically.
- Local statuses are not broadcast automatically.
- Local-only path remains the default.
- A user must explicitly enter shared mode before any shared operation runs.
- Reset Home affects local state only.
- Leave Room affects shared membership only.
- Backend unavailable or invalid shared state must not corrupt local state.
- Invalid shared payloads are rejected before they reach rendering.

This boundary keeps the current MVP usable without sync and prevents accidental
data sharing.

## Privacy / Safety Constraints

The local mock slice must preserve the privacy baseline:

- No real QQ IDs.
- No QQ chat content.
- No QQ credentials.
- No raw Bot command text.
- No real backend logs.
- No `memberSecret` logs.
- No plaintext invite-code logs.
- No request or response body logging as a substitute for assertions.
- `memberSecret` in the mock is test data only.
- ADR 0003 remains Proposed unless a separate decision changes it.

The mock can model credential success and failure, but it must not implement
real credential persistence or server verifier storage.

## Browser / Manual Acceptance Later

Browser checks are not required for this planning round because it changes
documentation only.

If a later UI or app behavior slice uses the mock, manual acceptance should
include:

1. Local-only app still works before shared mode is entered.
2. Mock create room path is available only in test or development mode.
3. Two mock clients can share state when they use the same in-memory mock
   instance.
4. Setting `exam_paper` for one mock member appears through shared state.
5. Setting `scope_shrinking` later proves newest valid status wins.
6. Invalid credential does not mutate status.
7. Leave room clears shared mode participation.
8. Reset Home does not remote-delete or mock-delete room state.
9. Backend-unavailable simulation keeps local-only mode usable.

This plan does not approve UI work by itself.

## Go / No-Go

Allowed after this plan is reviewed and accepted:

- A test-only local mock adapter implementation slice.
- Shared sync type boundary and local mock tests, if a later instruction names
  exact files and tests.
- Adapter tests that prove shared state does not mutate local `AppState`.

Still not allowed:

- Real backend.
- Network sync.
- `fetch`, WebSocket, or SSE.
- QQ Bot.
- Production sync.
- Account system.
- Database schema or migration.
- Credential persistence implementation.
- UI feature expansion without a separate approved slice.

If the future implementation slice cannot prove no-network behavior and
local-only fallback, the correct next step is more planning or review, not
shipping code.

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

- Only `docs/shared-town-sync-local-mock-plan.md` was added.
- No functional code changed.
- No Tauri files changed.
- No dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, or sync code
  was added.
- No `src/shared-sync/*` files were created.
- No predecessor documents or ADR statuses were changed.
- The document clearly states no-network, no-backend, and no-real-sync.
- The document lists future file boundaries but does not create them.
- The document includes a test-first plan and no-network enforcement.
