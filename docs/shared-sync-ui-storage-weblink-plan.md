# Shared Sync UI, Storage, And Weblink Entry Plan

## Status / Scope

Status: product entry plan only.

No UI, storage, network, backend, QQ Bot, database, account, import/export, or
production sync code is implemented by this document. This document plans how
future shared-sync product entry work can proceed without bypassing the current
privacy, no-network, and review gates.

This document does not approve a real backend, production shared mode, QQ Bot,
network client, credential storage implementation, or React integration by
itself.

## Current Baseline

The current `master` branch already has these local-first capabilities:

| Area | Current state | Boundary |
| --- | --- | --- |
| Web MVP local `AppState` | Existing local members, statuses, settings, and fallback behavior. | Local-only app remains the default product path. |
| Pixel town map | Existing product surface for displaying local status/home state. | Not connected to shared-sync code yet. |
| Tauri shell spike | Existing desktop shell/productization exploration. | No shared-sync Tauri integration yet. |
| Shared-sync types | `src/shared-sync/types.ts` defines room, member, status, credential, and state shapes. | Type boundary only. |
| Local mock client | `src/shared-sync/localMockSyncClient.ts` models create, join, state, status, and leave in memory. | No network, persistence, backend, or security boundary. |
| Validation guards | `src/shared-sync/sharedStateValidation.ts` rejects or filters invalid shared state. | Pure TypeScript guard logic. |
| Display adapter | `src/shared-sync/sharedStateAdapter.ts` projects shared state into display-ready data. | Does not mutate local `AppState` or convert expired to `offline`. |
| Local shared session | `src/shared-sync/localSharedTownSession.ts` composes the mock, validation-backed adapter, and in-memory credentials. | No localStorage, network, UI, or credential persistence. |
| No-network guard | `src/shared-sync/noNetwork.test.ts` scans shared-sync non-test source files. | Blocks direct `fetch`, WebSocket, EventSource, and XMLHttpRequest usage. |

This baseline is enough for a local mock demonstration. It is not enough for
real shared synchronization.

## Product Direction

The next product direction should be staged:

1. Build a local mock shared-town UI demo entry that uses
   `localSharedTownSession`.
2. Add local credential storage only after storage semantics and deletion
   behavior are reviewed.
3. Design invite and join links as local parsing affordances before any real
   backend exists.

The intended product feel is playful and inspectable: a user should be able to
open a small shared-town experiment, create a mock room, invite a second mock
member, and see status changes in a shared projection without transmitting
anything.

Real backend work remains blocked by the existing readiness gates: hosting,
server verifier/hash storage, logging redaction, abuse limits, retention,
failure behavior, and UI privacy copy.

## Phase A: UI Demo Entry, No Storage / No Network

Phase A should add a visible shared-town experiment entry, but only after a
separate implementation slice explicitly approves files and tests.

Future behavior:

- Add a "shared town experiment" entry.
- Use `localSharedTownSession`.
- Keep all shared-session state in memory.
- Lose the session on refresh or app restart.
- Do not write `localStorage`.
- Do not start network traffic.
- Do not mutate the current local-only `AppState`.
- Do not upload local members or statuses.
- Do not make shared mode the default path.

Future candidate files only:

- `src/app/useLocalSharedTownDemo.ts`
- `src/app/useLocalSharedTownDemo.test.ts`
- `src/components/SharedTownDemoPanel.tsx`
- `src/components/SharedTownDemoPanel.test.tsx`

Future acceptance goals:

- Create a mock room.
- Show the invite code as local demo data.
- Join a second mock member.
- Set an `exam_paper` status for one member.
- Set a `scope_shrinking` status for another member.
- Show the shared display projection in a small demo surface.
- Leave the demo without changing local-only `AppState`.
- Refreshing or restarting clears the in-memory demo session.

Browser smoke is required for the future UI slice because it changes the user
surface. This planning round does not require browser smoke because it changes
documentation only.

## Phase B: Credential Storage, Local Only

Phase B should persist room-scoped shared credentials only after a separate
storage slice is approved. It must preserve the ADR 0003 separation between
local app state and shared credential material.

Future behavior:

- Store shared credentials under `status4fpb:shared-credentials:v1`.
- Do not store shared credentials under `qq-status-pixel-home:v1`.
- Do not store real QQ IDs.
- Do not store QQ cookies, tokens, passwords, or client credentials.
- Do not store raw chat content.
- Do not store raw Bot command text.
- Treat Reset Home and Clear Shared Credentials as separate operations.
- Do not clear shared credentials by default when local home is reset.
- Provide a clearly named clear-credentials action for the future UI.
- Recover safely from missing, corrupt, or version-mismatched credential data.

Future candidate files only:

- `src/shared-sync/sharedCredentialStore.ts`
- `src/shared-sync/sharedCredentialStore.test.ts`

Future acceptance goals:

- Save a room-scoped `roomId`, `memberId`, and `memberSecret`.
- Load a valid credential.
- Reject corrupt credential records.
- Clear only shared credentials when requested.
- Prove `memberSecret` is never logged or included in public room/display
  state.
- Prove the existing local home storage key remains unchanged.

Credential storage still does not approve a backend. It only makes a future
local or mock shared mode resumable.

## Phase C: Weblink Invite / Join, Design Only

Phase C should design local invite parsing before any real networked join flow
exists.

Possible link shapes:

- `status4fpb://join?code=TOWN-ABCD`
- `/join#code=TOWN-ABCD`

Rules:

- `inviteCode` may appear in a link.
- `memberSecret` must never appear in a link.
- Real QQ IDs must never appear in a link.
- Links must not include QQ cookies, QQ tokens, passwords, or chat content.
- Link parsing should fill a future UI field, not automatically join a real
  room.
- Link parsing must not start network traffic.
- Link parsing must not create an account.
- Link parsing must not persist credentials by itself.
- Invalid or oversized codes must fail locally and quietly.

Future candidate files only:

- `src/shared-sync/inviteLink.ts`
- `src/shared-sync/inviteLink.test.ts`

Future acceptance goals:

- Parse a valid invite code from a custom protocol link.
- Parse a valid invite code from a hash route.
- Reject links containing `memberSecret`.
- Reject links containing unexpected sensitive parameters.
- Normalize whitespace and casing only if explicitly approved.
- Return parsed data without side effects.

Weblink work should stay local until real backend, route handling, and platform
registration behavior are reviewed.

## Fun Ideas / Creative Direction

These are future ideas, not implementation approval:

- Town gate sign showing the invite code as a playful room placard.
- Friend portal that visually represents a local mock join.
- Shared town notice board for the current demo room.
- Tiny status notes that appear as paper slips near members.
- Temporary "exam paper room" for focused study sessions.
- "Scope shrinking lab" portal for intense review mode.
- Tray menu shortcuts that switch mock statuses in a future desktop demo.
- Link cards that preview a local invite without joining automatically.
- A safe "demo reset" button that clears only the in-memory shared demo.

Fun ideas must not bypass privacy gates:

- No QQ monitoring.
- No real QQ IDs.
- No raw chat content.
- No `memberSecret` in links, logs, or display state.
- No real backend until readiness gates pass.
- No automatic status inference from messages, activity, time, keywords, or
  social behavior.

## Go / No-Go

Allowed next after this plan:

- UI demo entry using `localSharedTownSession` only.
- Credential store design or a narrowly scoped local credential store code
  slice.
- Invite link parser design or a narrowly scoped parser code slice.
- Additional docs that compare UI demo, credential storage, and invite parsing
  order.

Not allowed yet:

- Real backend.
- Real network sync.
- `fetch`, WebSocket, SSE, EventSource, or XMLHttpRequest.
- QQ Bot implementation.
- QQ monitoring.
- Account system.
- Database schema or migration.
- Production shared mode.
- Credential storage implementation without exact tests and clear/delete
  semantics.
- UI shared mode that writes shared data into local `AppState`.

## Recommended Next Slice

Recommended next implementation slice: UI demo entry with
`localSharedTownSession`, no storage, no network.

Reasons:

- The shared-sync code can now run a complete local create, join, status, and
  leave flow.
- A UI demo would make the product idea tangible.
- Keeping the demo in memory avoids credential persistence risk.
- Keeping the demo local avoids backend, hosting, logging, rate-limit, and
  privacy risks.
- Browser smoke can verify the experience without transmitting data.

Suggested future implementation boundary, pending separate approval:

- Add a small local shared-town demo hook.
- Add a compact demo panel.
- Reuse existing pixel-town display language where possible.
- Do not alter local-only state or storage.
- Do not add network or backend code.

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

- Only `docs/shared-sync-ui-storage-weblink-plan.md` was added.
- No code files changed.
- No `src/shared-sync/*` files changed.
- No tests were added or modified.
- No Tauri files changed.
- No package dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, storage, UI, or
  production sync code was added.
- The document defines UI, storage, and weblink phases.
- The document says `memberSecret` must never appear in links.
- The document says real backend remains blocked by readiness gates.
- The recommended next slice is local UI demo entry only.
