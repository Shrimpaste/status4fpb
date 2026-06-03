# Shared Town Sync Phase 2 Readiness Checklist

## Status

Status: Phase 2 readiness checklist only.

This document does not approve implementation by itself. It does not implement
backend code, frontend networking, database schema, account login, QQ Bot,
webhook handling, import/export, or sync.

The purpose is to summarize the shared-town-sync pre-implementation documents,
identify which gates are complete enough for a safe next planning slice, and
make clear which gates still block real backend work.

## Source Documents

Current baseline documents:

- `docs/shared-town-sync-architecture.md`
- `docs/shared-town-sync-api-contract.md`
- `docs/shared-town-sync-implementation-plan.md`
- `docs/shared-town-sync-privacy-review.md`
- `docs/adr/0003-shared-town-credential-storage.md`
- `docs/qq-bot-command-research.md`
- `docs/continuity.md`

## Completed Design Artifacts

| Artifact | Status | Purpose | Blocks implementation? | Notes |
| --- | --- | --- | --- | --- |
| Architecture | Completed draft. | Defines invite-code shared town, short polling, privacy boundaries, and Phase 2 scope. | Blocks real backend if contradicted. | Does not implement sync. |
| API contract | Completed draft. | Defines endpoints, request/response shapes, validation, errors, credential model, time semantics, and retry behavior. | Sufficient for local mock planning; blocks real backend until reviewed for implementation. | Remains draft. |
| Implementation plan | Completed draft. | Slices future work into type boundary, mock adapter, client adapter, credential storage, UI, polling, and backend planning. | Sufficient for planning; not permission to implement. | Recommends local mock before hosting. |
| Privacy review | Completed draft. | Defines data classification, data flow, risks, logging policy, reset/leave semantics, and blockers. | Blocks real backend until accepted as implementation evidence. | No real QQ IDs, chat content, or QQ credentials. |
| Credential storage ADR | Proposed. | Decides separate localStorage key and server verifier/hash direction. | Blocks credential implementation until accepted or explicitly approved for a slice. | Status is not Accepted. |
| QQ Bot command research | Completed research. | Establishes official-bot boundary and rejects ordinary group monitoring. | Blocks any future QQ Bot work until separate design. | QQ Bot is not Phase 2. |
| Continuity notes | Active process note. | Preserves persistent collaboration and hard privacy boundaries. | Does not block implementation. | Keeps review loop explicit. |

## Phase 2 Allowed Scope

Future Phase 2 work may only move inside this narrow product boundary:

- Local mock adapter first.
- Shared sync type boundary.
- Client adapter boundary from shared room state to display state.
- Credential storage only after ADR review is explicitly accepted for a slice.
- Create room.
- Join room with invite code.
- Leave room.
- Post manual status.
- Short-poll room state.
- Preserve local-only mode.

Real backend remains blocked until hosting, server verifier storage, logging,
abuse baseline, and failure behavior are reviewed.

## Phase 2 Explicit Non-Goals

Phase 2 must not include:

- QQ Bot.
- QQ monitoring.
- Ordinary group message ingestion.
- Chat import or export.
- Real QQ IDs.
- QQ cookies, tokens, passwords, or client credentials.
- Mandatory account registration.
- SSE or WebSocket.
- Admin UI.
- Tauri tray shortcut status.
- End-to-end encryption design.
- Production backend before gates.
- Automatic status inference from messages, activity, clock behavior, keywords,
  or social behavior.

## Readiness Matrix

| Gate | Status | Required evidence | Owner / next document | Blocks mock adapter? | Blocks real backend? |
| --- | --- | --- | --- | --- | --- |
| Architecture | Draft complete. | `docs/shared-town-sync-architecture.md` merged to master. | No new document needed before mock planning. | No. | No, unless backend design contradicts it. |
| API contract | Draft complete. | `docs/shared-town-sync-api-contract.md` merged to master. | Implementation-slice review must pick the subset used. | No for local mock planning. | Yes until backend implementation review accepts it. |
| Implementation plan | Draft complete. | `docs/shared-town-sync-implementation-plan.md` merged to master. | Local mock plan can reference it. | No. | No, but it does not grant backend approval. |
| Privacy review | Draft complete. | `docs/shared-town-sync-privacy-review.md` merged to master. | Implementation review must confirm applicable requirements. | No for docs-only mock planning. | Yes until accepted as implementation evidence. |
| Credential storage ADR | Proposed. | `docs/adr/0003-shared-town-credential-storage.md` merged to master. | Future implementation review must decide whether Proposed is enough for first slice. | No for docs-only mock planning. | Yes for credential storage and real backend auth. |
| Hosting choice | Missing. | Hosting comparison and decision. | Future hosting review document. | No. | Yes. |
| Server verifier/hash design | Missing. | Exact verifier algorithm, storage, and comparison policy. | Future backend or security design. | No. | Yes. |
| Local credential storage guard | Partially designed. | Exact recovery, validation, and redaction tests. | Future credential implementation plan. | No for mock planning. | Yes for credential implementation. |
| Log redaction | Draft policy only. | Concrete logging mechanism and tests. | Future backend implementation plan. | No. | Yes. |
| Rate limit / abuse baseline | Draft requirement only. | Limits for room creation, joins, status updates, payloads, and invite failures. | Future abuse baseline document. | No. | Yes. |
| Leave/delete/reset semantics | Draft complete. | Distinction documented in implementation plan, privacy review, and ADR. | Future UI/implementation slice must preserve it. | No. | Yes for shared UI/backend. |
| Backend-unavailable failure mode | Draft complete. | Local-only fallback and non-blocking failure behavior documented. | Future client implementation plan must add tests. | No. | Yes for networked client. |
| Local-only fallback | Existing product baseline. | Current app works locally; future shared mode must not break it. | Future tests and browser checks. | No. | Yes if any networked slice risks it. |
| UI privacy copy | Missing. | Copy for join, leave, clear credentials, backend unavailable, and reset distinction. | Future UI copy or implementation plan. | No. | Yes for user-facing shared UI. |
| Invalid server state handling | Planned only. | Validation and rejection behavior for malformed shared state. | Future adapter/mock plan. | No for docs-only mock plan. | Yes for networked client. |
| QQ Bot boundary | Research complete. | `docs/qq-bot-command-research.md` and architecture boundary. | Separate future Bot design if needed. | No. | Blocks any Bot work; Bot is not Phase 2. |

## Go / No-Go Recommendation

Allowed next:

- Docs-only local mock adapter plan.
- Docs-only first implementation slice plan.
- A future local mock adapter implementation only after a separate plan defines
  exact files, tests, no-network boundary, and rollback behavior.

Not allowed yet:

- Real backend implementation.
- Production shared sync.
- QQ Bot integration.
- Account system.
- Database schema or migration.
- SSE or WebSocket.
- Networked client implementation.
- Credential storage implementation without an accepted slice plan.

Recommended next safe slice after this readiness document:

```text
docs/shared-town-sync-local-mock-plan.md
```

That future document should plan a no-network local mock adapter and contract
tests before any real backend is chosen.

## Implementation Preconditions

Before any sync code is written, reviewers must define:

- Whether the first code slice is local mock only.
- Exact files allowed for the slice.
- Exact tests that should fail before implementation.
- No-network boundary for mock work.
- Redaction test expectations.
- Credential storage corruption recovery expectations.
- Local-only fallback behavior.
- Invalid shared state rejection behavior.
- Rollback path.
- Browser or manual acceptance scope if UI changes.

Before any real backend code is written, reviewers must additionally define:

- Hosting choice.
- Server verifier/hash strategy.
- Logging redaction mechanism.
- Rate-limit and abuse baseline.
- Data retention and room expiry.
- Leave/delete policy.
- Operational access policy for logs and stored metadata.

## Review Checklist

Before approving any implementation slice, reviewers must confirm:

- No network in mock slice unless explicitly approved.
- No real QQ data.
- No raw chat content.
- No QQ credentials.
- No `memberSecret` logs.
- No forced account.
- No backend without hosting and security gates.
- Local-only mode remains available.
- Reset Home, Leave Room, and Clear Shared Credentials semantics are preserved.
- `unknown` cannot be submitted as a manual status.
- Shared credentials are not stored in `qq-status-pixel-home:v1`.
- ADR 0003 remains Proposed unless a separate decision changes it.
- Real backend is still blocked until hosting, verifier, logging, and abuse
  gates are reviewed.

## Validation For This Documentation Round

This docs-only readiness checklist should be validated with:

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

The review report should confirm:

- Only `docs/shared-town-sync-phase2-readiness.md` was added.
- No functional code changed.
- No Tauri files changed.
- No dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, or sync code
  was added.
- No predecessor documents or ADR statuses were changed.
- Go / No-Go recommendation is explicit.
- Local mock adapter planning and real backend implementation have different
  gates.
