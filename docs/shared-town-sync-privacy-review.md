# Shared Town Sync Privacy Review

## Status

Status: Privacy review draft for future Phase 2 implementation.

No code, backend, client networking, database, QQ Bot, webhook, account, import
or export, or sync is implemented by this document. This review is a gate for a
future shared-town implementation, not permission to start that implementation.

If a future implementation cannot satisfy the requirements in this document,
the correct next step is more design or review, not code.

## Source Documents

This review depends on:

- `docs/shared-town-sync-architecture.md`
- `docs/shared-town-sync-api-contract.md`
- `docs/shared-town-sync-implementation-plan.md`
- `docs/qq-bot-command-research.md`
- `docs/continuity.md`

The architecture and API contract define what Phase 2 may collect. The
implementation plan defines the future slices. The QQ Bot research document is
only a boundary reference: QQ Bot work is not part of Phase 2.

## Data Classification

| Data | Category | Collected in Phase 2? | Stored where? | Purpose | Retention | Sensitivity | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `roomId` | Shared room identifier. | Yes. | Server and joined clients. | Address one shared town. | Until room expires or is deleted under reviewed policy. | Medium. | Must be non-guessable enough to avoid room enumeration. |
| `inviteCode` | Join secret. | Yes, but plaintext should be transient. | Client display/copy flow; server should store only verifier or hash. | Let intended members join. | Plaintext only at create or rotate time. | High. | Do not log plaintext invite codes. |
| `inviteCodeHash` | Server verifier. | Yes. | Server. | Validate invite attempts. | Until room expires, invite rotates, or room is deleted. | High. | Treat as credential-adjacent material. |
| `memberId` | Room member identifier. | Yes. | Server and joined clients. | Identify one member inside one room. | Until member leaves or room expires. | Medium. | Not a QQ ID and not a global account ID. |
| `memberSecret` | Member capability credential. | Yes, client-held and sent for mutation auth. | Client secret storage; server stores only verifier/hash. | Authorize one member's updates. | Until local credential is cleared, rotated, revoked, or room/member expires. | High. | Never log; never store server-side plaintext. |
| `displayName` | User-chosen town name. | Yes. | Server and joined clients. | Render a member in town. | Until member leaves or room expires. | Medium. | Must not be treated as a legal name or QQ identity. |
| `avatarKey` | App-local avatar choice. | Yes. | Server and joined clients. | Render a stable marker. | Until member leaves or room expires. | Low. | Use app-local vocabulary. |
| `color` | Optional display color. | Yes, optional. | Server and joined clients. | Render a marker. | Until changed, member leaves, or room expires. | Low. | Validate format or palette. |
| `statusKey` | Status preset. | Yes. | Server and joined clients. | Show explicit status. | Until replaced, cleared, expired, member leaves, or room expires. | Medium. | Must be selectable; `unknown` is fallback only. |
| `note` | Optional user-authored status note. | Yes, optional. | Server and joined clients. | Add explicit context to a status. | Until replaced, cleared, expired, member leaves, or room expires. | Medium to high. | Keep short; do not log by default. |
| `expiresAt` | Status expiration. | Yes, optional. | Server and joined clients. | Support fallback display and stale-status cleanup. | Until status is replaced, cleared, expired, or room expires. | Low to medium. | Compare against `serverTime`. |
| `startedAt` / `updatedAt` | Status timestamps. | Yes. | Server and joined clients. | Order updates and display freshness. | Same as status. | Low to medium. | Server-generated or server-normalized. |
| `source` | Status source enum. | Yes. | Server and joined clients. | Preserve explicit source such as `desktop_manual`. | Same as status. | Low to medium. | `qq_bot_command` is future explicit command only. |
| Server `requestId` | Operational metadata. | Yes. | Server logs and responses. | Debug errors without logging bodies. | Short operational retention. | Low. | Must not encode secrets or user content. |
| IP / rate-limit metadata | Abuse-control metadata. | Yes, if backend is public. | Server rate-limit store and minimal logs. | Reduce spam, enumeration, and brute force. | Short and documented. | Medium to high. | Keep separate from status content where possible. |
| Server logs | Operational metadata. | Yes, minimized. | Server logging system. | Reliability and abuse response. | Short and documented. | Medium to high. | No request bodies, notes, invite codes, or credentials by default. |
| Real QQ ID | QQ personal identifier. | No. | Nowhere. | Not needed. | None. | High. | Must not be collected or inferred. |
| QQ chat content | QQ message content. | No. | Nowhere. | Not needed. | None. | High. | Ordinary group chat is out of scope. |
| Raw QQ Bot command text | Raw command content. | No by default. | Nowhere by default. | Parsed fields are enough if Bot exists later. | None unless separately reviewed. | High. | Phase 2 has no QQ Bot. |
| QQ cookies/tokens/credentials | QQ authentication material. | No. | Nowhere. | Not needed. | None. | Critical. | Never collect. |

## Data Flow

### Create Room

Client sends:

- `roomName`
- `displayName`
- `avatarKey`
- optional `color`

Server stores:

- `roomId`
- invite-code verifier or hash
- creator member record
- `memberSecret` verifier or hash
- timestamps

Server returns:

- room summary
- plaintext `inviteCode`
- creator member record
- plaintext `memberSecret` for local client storage

Logs must not include:

- plaintext `inviteCode`
- plaintext `memberSecret`
- request body
- status notes

### Join Room

Client sends:

- `inviteCode` in the URL path
- `displayName`
- `avatarKey`
- optional `color`

Server stores:

- new member record
- new `memberSecret` verifier or hash
- timestamps

Server returns:

- room summary
- new member record
- plaintext `memberSecret` for local client storage

Logs must not include:

- plaintext `inviteCode`
- plaintext `memberSecret`
- request body

Join failures must not reveal whether an invite code existed.

### Store Local Credential

Client stores:

- `roomId`
- `memberId`
- `memberSecret`

Client must not store:

- QQ cookies
- QQ tokens
- QQ passwords
- real QQ IDs
- raw QQ chat content

Local credential storage must be clearable by the user. Clearing local
credentials disconnects shared mode but does not imply remote room deletion.

### Post Manual Status

Client sends:

- `Authorization: Bearer <memberSecret>`
- `statusKey`
- optional `note`
- optional `expiresAt`
- explicit source such as `desktop_manual` or `web_manual`

Server stores:

- current status for that `roomId` and `memberId`
- server timestamps

Server returns:

- stored status
- `serverTime`

Logs must not include:

- `Authorization`
- `memberSecret`
- request body
- `note`

`unknown` must not be accepted as a submitted status. It is display fallback
only.

### Short-Poll Room State

Client sends:

- `GET /v1/rooms/{roomId}/state`

Server returns:

- room summary
- members
- current statuses
- `serverTime`

Logs must not include:

- response body by default
- notes
- credentials

The client uses `serverTime` to decide expiration display. Polling must not
start until a user explicitly joins a room.

### Leave Room

Client sends:

- `Authorization: Bearer <memberSecret>`
- optional leave reason from a controlled enum

Server stores:

- member left/tombstone state or reviewed deletion state
- timestamp

Server returns:

- left member state
- `serverTime`

Logs must not include:

- `Authorization`
- `memberSecret`
- request body

Leaving stops future shared status updates for that member. It does not reset
the local home.

### Backend Unavailable

Client behavior:

- Keep local-only mode usable.
- Stop or back off shared polling.
- Show a non-blocking shared-mode failure state in a future UI.
- Do not corrupt local `AppState`.
- Do not delete local data unless the user explicitly chooses local cleanup.

## Threat And Risk Review

| Risk | Scenario | Impact | Mitigation | Blocking before implementation? |
| --- | --- | --- | --- | --- |
| Invite code leak | Invite code is shared outside the intended group. | Unwanted members may join or view room state. | High-entropy codes, no public discovery, join rate limits, future rotation/removal policy. | Yes: define entropy, rate limits, and removal policy. |
| `memberSecret` leak | A local secret is copied from a device or logs. | Attacker can update one member's status. | Scope secret to one room/member, never log it, store verifier only, plan rotate/revoke. | Yes: define storage and redaction. |
| Room enumeration | Attackers guess room IDs or invite codes. | Private rooms may be discovered. | Non-guessable IDs, uniform invite errors, rate limits, no public listing. | Yes: define ID entropy and join limits. |
| Status spam | Client posts frequent updates. | Noisy town and service load. | Per-member update limits, payload size limits, backoff, `rate_limited` errors. | Yes: define baseline limits. |
| Impersonation by display name | User joins with another person's display name. | Confusion inside the group. | Identity is `memberId` plus credential; duplicate-name policy documented; member markers remain stable. | No, unless product requires unique display names. |
| Over-logging notes or secrets | Logs include request bodies, notes, invite codes, or auth headers. | Private data leaks through infrastructure. | Disable body logging, redact headers, redact invite codes, avoid note logs. | Yes: logging policy required. |
| Raw QQ Bot command retention | Future bot stores raw command text. | Incidental chat content may be retained. | Phase 2 has no Bot; future Bot stores parsed fields by default. | Yes before any Bot work, not before Phase 2. |
| Delete or leave not propagating | Member leaves but old status remains visible. | User cannot escape stale shared data. | Tombstone or hard-delete policy, stop future updates, clear stale status. | Yes: leave semantics required. |
| Local reset confused with remote delete | User resets local home expecting remote deletion, or deletes remote state accidentally. | Data loss or unexpected retention. | Separate reset home, leave room, clear credential, and future delete remote actions. | Yes: UI semantics required before shared UI. |
| Backend unavailable | Shared service is down. | App may appear broken or lose local data. | Local-only fallback, non-blocking status, safe cache rejection. | Yes: failure mode required. |
| Rate-limit abuse metadata over-collection | Abuse controls collect too much IP/device metadata. | Operational privacy risk. | Short retention, minimal fields, documented purpose. | Yes before public backend. |
| Invalid server state | Server returns malformed members or statuses. | Local state corruption or unsafe display. | Validate shared payloads, reject invalid state, keep local `AppState` unchanged. | Yes before client networking. |

## Privacy Requirements

Phase 2 implementation must satisfy these requirements:

- No real QQ IDs.
- No QQ chat content.
- No QQ cookies, tokens, passwords, or client credentials.
- No raw QQ Bot command content by default.
- No mandatory account.
- No public room discovery.
- No logging `Authorization`.
- No logging `memberSecret`.
- No logging plaintext invite codes.
- No request body logging in production by default.
- No background sync unless a user explicitly joins a room.
- No automatic status inference.
- No SSE or WebSocket in Phase 2.
- Local-only mode must remain available.
- Shared mode must fail safely back toward local-only behavior.
- Notes must be bounded, optional, and not logged by default.
- `unknown` must remain fallback-only and must not be submitted.

## Logging Policy Draft

Allowed by default:

- Method and route template, such as `POST /v1/rooms/{roomId}/join`.
- HTTP status code.
- Server-generated `requestId`.
- Coarse timing and service health metrics.
- Rate-limit decision metadata with short retention.

Forbidden by default:

- `Authorization` header.
- `memberSecret`.
- plaintext `inviteCode`.
- invite-code verifier material.
- request bodies.
- response bodies.
- status notes.
- QQ chat content.
- raw QQ Bot command text.
- QQ cookies, tokens, passwords, or client credentials.

Redaction requirements:

- Authorization headers must be removed before logs are emitted.
- Invite codes should be redacted or hashed before any operational record.
- Request bodies should not be logged in production.
- If a temporary debug log is ever reviewed and enabled, it must be
  short-lived, access-controlled, and explicitly exclude secrets and notes.

## Leave, Delete, And Reset Semantics

These actions must remain distinct:

| Action | Scope | Expected effect |
| --- | --- | --- |
| Leave room | Remote shared room membership. | Marks member left or deletes membership under reviewed policy; stops future shared status updates. |
| Reset home | Local-only app state. | Clears local home data only; must not delete remote room state. |
| Clear shared credential | Local shared-mode credential. | Disconnects this device from shared mode; does not delete remote member by itself. |
| Delete local member | Local-only member record. | Affects local `AppState` only unless a future shared action is explicitly designed. |
| Delete remote data | Future remote privacy operation. | Requires separate design, confirmation, and retention policy. |

UI and implementation must not blur these actions. A user should not trigger
remote deletion by using the existing local reset-home flow.

## QQ Bot Boundary

QQ Bot is not part of Phase 2.

If a bot is added later:

- It may accept only explicit supported `@Bot` commands.
- It must not ingest ordinary group messages.
- It must not monitor group chat.
- It must not infer status from behavior, keywords, timing, or frequency.
- It must not store real QQ IDs.
- It must not store raw command text by default.
- It must not store QQ cookies, tokens, passwords, or client credentials.
- It must map QQ openids only under a separately reviewed consent and retention
  policy.

The `qq_bot_command` source value remains a future explicit command source, not
a monitoring source.

## Implementation Blockers

These must be resolved before networked shared sync implementation starts:

- Backend hosting choice.
- Secret generation format and entropy.
- Server-side secret verifier storage.
- Local credential storage strategy.
- Secret rotation and revocation story.
- Invite-code rotation or removal policy.
- Room/member retention policy.
- Leave versus delete semantics.
- Rate-limit and abuse baseline.
- Log redaction mechanism.
- Request body logging policy.
- UI privacy copy for joining shared mode.
- Failure-mode copy for backend unavailable or invalid credentials.
- API review sign-off.
- Privacy review sign-off.

## Review Checklist

Before implementation, reviewers must confirm:

- No QQ monitoring.
- No raw chat retention.
- No real QQ IDs.
- No QQ credentials.
- No mandatory account.
- Local-only mode remains available.
- No background sync without explicit room join.
- `memberSecret` is not logged.
- `Authorization` is not logged.
- Invite codes are not logged in plaintext.
- Notes are not logged by default.
- Rate limits are specified.
- Leave, delete, reset, and credential-clear semantics are distinct.
- Backend-unavailable behavior is safe.
- Invalid server state cannot corrupt local `AppState`.
- `unknown` cannot be submitted as a status.
- QQ Bot remains outside Phase 2.

## Validation For This Documentation Round

This docs-only review should be validated with:

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

The review report should confirm:

- Only `docs/shared-town-sync-privacy-review.md` was added.
- No functional code changed.
- No Tauri files changed.
- No dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, or sync code
  was added.
- The document remains a privacy review draft only.
- Data classification, data flow, threat/risk review, privacy requirements,
  logging policy, leave/delete/reset semantics, QQ Bot boundary,
  implementation blockers, and review checklist are covered.
