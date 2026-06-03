# Shared Town Sync API Contract

## Status

Status: Draft contract only.

This document does not implement a backend, frontend networking, QQ Bot,
webhook, database, account system, import/export, or sync. It refines the Phase
2 shared-room shape from `docs/shared-town-sync-architecture.md` so the next
review can reason about API behavior before any networked status data is
transmitted.

No code should be written from this contract until privacy review, API review,
hosting review, credential storage review, and abuse review are completed.

## Scope

This contract covers the first minimal shared-town API shape:

- Create a shared room.
- Join a room with an invite code.
- Fetch complete room state by short polling.
- Update the authenticated member's own status.
- Leave a room.

The API is intentionally small. It is for a casual group status town, not for
monitoring QQ groups, importing chat logs, or building a full account product.

## Design Principles

- Local-only mode remains available and valid.
- Short polling comes first; SSE and WebSocket are out of Phase 2.
- No mandatory account registration.
- No real QQ ID.
- No raw QQ chat content.
- No QQ cookies, tokens, passwords, or client credentials.
- `qq_bot_command` means an explicit supported `@Bot` command only.
- `memberSecret` is a scoped capability credential for one room member.
- The newest valid status update for a member wins.
- Unknown or missing status is a display fallback, not a manually submitted
  status.

## Credential Model

The first shared implementation should use room-scoped member credentials
instead of user accounts.

| Field | Visibility | Purpose |
| --- | --- | --- |
| `roomId` | Public within the room URL/API path. | Identifies one shared town. |
| `inviteCode` | Shared privately by users. | Lets a person join a room. |
| `memberId` | Public within a room. | Identifies one town member. |
| `memberSecret` | Client-held secret. | Authorizes mutations for one member. |

`memberSecret` is not an account password. A future server should not store it
in plaintext. Store only a verifier or hash, and compare submitted credentials
through a constant-time check where the platform provides one.

Mutating requests for a member require proof of that member's `memberSecret`.
This draft uses the standard bearer form:

```http
Authorization: Bearer <memberSecret>
```

The concrete secret format is an implementation detail. Logs must redact the
`Authorization` header and must never print a raw `memberSecret`.

## Endpoint Summary

```http
POST /v1/rooms
POST /v1/rooms/{inviteCode}/join
GET /v1/rooms/{roomId}/state
POST /v1/rooms/{roomId}/members/{memberId}/status
POST /v1/rooms/{roomId}/members/{memberId}/leave
```

Future admin endpoint, not in the Phase 2 minimal slice:

```http
POST /v1/rooms/{roomId}/invite/rotate
```

## Common Types

IDs below are illustrative. Actual generation format, entropy, and prefixes are
implementation details, but they must be non-guessable where privacy depends on
them.

```ts
type SharedTownRoom = {
  roomId: string
  name: string
  createdAt: string
  updatedAt: string
}

type SharedTownMember = {
  roomId: string
  memberId: string
  displayName: string
  avatarKey: string
  color?: string
  createdAt: string
  updatedAt: string
  leftAt?: string
}

type SharedStatusSource =
  | 'desktop_manual'
  | 'web_manual'
  | 'qq_bot_command'
  | 'timer_rule'

type SharedStatus = {
  roomId: string
  memberId: string
  statusKey: SelectableStatusKey
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
  source: SharedStatusSource
}

type SelectableStatusKey =
  | 'exam_paper'
  | 'scope_shrinking'
  | 'fishing'
  | 'vocabulary'
  | 'sleeping'
  | 'deadline'
  | 'offline'
  | 'idle'
```

`unknown` is intentionally omitted from `SelectableStatusKey`. It is a client
fallback for missing or expired status, not a valid submitted value.

## POST /v1/rooms

Creates a shared town room and the creator's first member record.

Request:

```json
{
  "roomName": "Evening Study Town",
  "displayName": "Bei",
  "avatarKey": "blue",
  "color": "#7aa2ff"
}
```

Response `201 Created`:

```json
{
  "room": {
    "roomId": "room_7x9k2",
    "name": "Evening Study Town",
    "createdAt": "2026-06-03T07:00:00.000Z",
    "updatedAt": "2026-06-03T07:00:00.000Z"
  },
  "inviteCode": "TOWN-ABCD-EFGH",
  "member": {
    "roomId": "room_7x9k2",
    "memberId": "member_3q6p",
    "displayName": "Bei",
    "avatarKey": "blue",
    "color": "#7aa2ff",
    "createdAt": "2026-06-03T07:00:00.000Z",
    "updatedAt": "2026-06-03T07:00:00.000Z"
  },
  "memberSecret": "secret_example_value"
}
```

The server may store only an invite-code hash. The plaintext invite code should
only be returned at creation or rotation time.

## POST /v1/rooms/{inviteCode}/join

Adds a member to an existing room by invite code.

Request:

```json
{
  "displayName": "Nan",
  "avatarKey": "green",
  "color": "#64c282"
}
```

Response `201 Created`:

```json
{
  "room": {
    "roomId": "room_7x9k2",
    "name": "Evening Study Town",
    "createdAt": "2026-06-03T07:00:00.000Z",
    "updatedAt": "2026-06-03T07:05:00.000Z"
  },
  "member": {
    "roomId": "room_7x9k2",
    "memberId": "member_8h2d",
    "displayName": "Nan",
    "avatarKey": "green",
    "color": "#64c282",
    "createdAt": "2026-06-03T07:05:00.000Z",
    "updatedAt": "2026-06-03T07:05:00.000Z"
  },
  "memberSecret": "secret_example_value"
}
```

Invite codes must not be enumerable. Failed joins should return the same error
shape for missing, expired, or malformed invite codes.

## GET /v1/rooms/{roomId}/state

Returns the complete room state for short polling.

Request headers:

```http
Accept: application/json
```

Response `200 OK`:

```json
{
  "room": {
    "roomId": "room_7x9k2",
    "name": "Evening Study Town",
    "createdAt": "2026-06-03T07:00:00.000Z",
    "updatedAt": "2026-06-03T07:12:00.000Z"
  },
  "members": [
    {
      "roomId": "room_7x9k2",
      "memberId": "member_3q6p",
      "displayName": "Bei",
      "avatarKey": "blue",
      "color": "#7aa2ff",
      "createdAt": "2026-06-03T07:00:00.000Z",
      "updatedAt": "2026-06-03T07:00:00.000Z"
    }
  ],
  "statuses": [
    {
      "roomId": "room_7x9k2",
      "memberId": "member_3q6p",
      "statusKey": "exam_paper",
      "note": "second paper",
      "startedAt": "2026-06-03T07:10:00.000Z",
      "expiresAt": "2026-06-03T09:10:00.000Z",
      "updatedAt": "2026-06-03T07:10:00.000Z",
      "source": "desktop_manual"
    }
  ],
  "serverTime": "2026-06-03T07:12:00.000Z"
}
```

MVP polling returns complete room state. Clients should poll at a modest
interval suitable for a casual status toy, compare `expiresAt` against
`serverTime`, and compute local fallback display without submitting `unknown`.

No SSE, WebSocket, or long-polling behavior is part of this contract round.

## POST /v1/rooms/{roomId}/members/{memberId}/status

Sets the authenticated member's current status.

Request headers:

```http
Authorization: Bearer <memberSecret>
Content-Type: application/json
```

Request:

```json
{
  "statusKey": "scope_shrinking",
  "note": "reviewing the last chapter",
  "expiresAt": "2026-06-03T08:30:00.000Z",
  "source": "desktop_manual"
}
```

Response `200 OK`:

```json
{
  "status": {
    "roomId": "room_7x9k2",
    "memberId": "member_3q6p",
    "statusKey": "scope_shrinking",
    "note": "reviewing the last chapter",
    "startedAt": "2026-06-03T07:30:00.000Z",
    "expiresAt": "2026-06-03T08:30:00.000Z",
    "updatedAt": "2026-06-03T07:30:00.000Z",
    "source": "desktop_manual"
  },
  "serverTime": "2026-06-03T07:30:00.000Z"
}
```

The server sets `startedAt` and `updatedAt` from server time. The request may
include `expiresAt`, but the server must validate that it is a future ISO date
within product limits.

`source: 'qq_bot_command'` is valid only for a future explicit bot command
integration after a separate QQ Bot review. It never means ordinary QQ group
message monitoring.

## POST /v1/rooms/{roomId}/members/{memberId}/leave

Marks the authenticated member as no longer active in the room.

Request headers:

```http
Authorization: Bearer <memberSecret>
Content-Type: application/json
```

Request:

```json
{
  "reason": "user_requested"
}
```

Response `200 OK`:

```json
{
  "member": {
    "roomId": "room_7x9k2",
    "memberId": "member_3q6p",
    "displayName": "Bei",
    "avatarKey": "blue",
    "color": "#7aa2ff",
    "createdAt": "2026-06-03T07:00:00.000Z",
    "updatedAt": "2026-06-03T07:45:00.000Z",
    "leftAt": "2026-06-03T07:45:00.000Z"
  },
  "serverTime": "2026-06-03T07:45:00.000Z"
}
```

The first implementation may tombstone the member instead of hard-deleting it
so other clients can stop rendering stale status. Retention policy must be
reviewed before implementation.

## Validation Rules

General request rules:

- Request bodies must be JSON objects.
- Unknown request fields should be ignored or rejected consistently; prefer
  rejection for mutation endpoints during early implementation.
- String fields are trimmed before validation.
- Payload size must be bounded.
- All timestamps are ISO 8601 strings in UTC.

Room rules:

- `roomName` is trimmed, non-empty, and bounded by a product maximum.
- Room identifiers and invite codes must be high entropy.
- There is no public room discovery in Phase 2.

Member rules:

- `displayName` is trimmed, non-empty, and bounded by a product maximum.
- Duplicate display names may be allowed, because identity is `memberId` plus
  local credential, not display name.
- `avatarKey` must be a known app-local avatar key or replaced by a safe
  fallback.
- `color` is optional and must match an allowed color format or palette.
- `memberId` must belong to the target room.
- Mutations require a valid `memberSecret` for the same `roomId` and
  `memberId`.

Status rules:

- `statusKey` must be one of `exam_paper`, `scope_shrinking`, `fishing`,
  `vocabulary`, `sleeping`, `deadline`, `offline`, or `idle`.
- `unknown` cannot be submitted manually.
- `note` is optional, trimmed, and bounded by a product maximum.
- Empty `note` is treated as absent.
- `expiresAt` is optional, must be a valid future ISO date, and must not exceed
  the maximum allowed status duration.
- `source` must be a supported source. In Phase 2 implementation,
  `desktop_manual` and `web_manual` are the only expected client-submitted
  sources.
- `timer_rule` may be generated by trusted server or client rules later; it is
  not a way to infer status from behavior.

## Error Model

All errors use one envelope:

```json
{
  "error": {
    "code": "invalid_status_key",
    "message": "Status key is not allowed.",
    "requestId": "req_4p9m"
  }
}
```

`message` is for product-safe display or debugging. It must not contain secrets,
raw request bodies, raw QQ content, or infrastructure details.

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `bad_request` | Request is malformed JSON or has an invalid shape. |
| 400 | `validation_failed` | Request fields fail validation. |
| 400 | `invalid_status_key` | Submitted status is unknown or not selectable. |
| 400 | `invalid_invite_code` | Invite code is malformed, missing, expired, or not found. |
| 401 | `invalid_member_secret` | Missing or invalid credential for this member. |
| 404 | `room_not_found` | Room does not exist or is unavailable. |
| 404 | `member_not_found` | Member does not exist in this room. |
| 409 | `member_left` | Member has already left and cannot mutate status. |
| 409 | `room_full` | Room has reached the configured member limit. |
| 429 | `rate_limited` | Client exceeded a rate or abuse limit. |
| 500 | `server_error` | Unexpected server failure. |

Join failures should avoid revealing whether an invite code ever existed. Use
`invalid_invite_code` for malformed, expired, guessed, or missing invite codes.

## Rate Limit And Abuse Controls

The first backend must define conservative limits before public deployment:

- Room creation per IP, device, or anonymous risk bucket.
- Join attempts per invite code and requester.
- Status updates per room/member per minute.
- Leave attempts per room/member.
- Maximum members per room.
- Maximum request body size.
- Maximum `displayName`, `roomName`, and `note` length.
- No public invite listing or public room discovery.
- Secret and invite-code failures should be counted without logging raw values.

These controls are requirements for implementation planning, not implemented by
this document.

## Privacy And Logging Constraints

The API must minimize collected data:

- No real QQ ID.
- No QQ chat content.
- No raw Bot command content by default.
- No cookies, tokens, passwords, or credentials from QQ.
- No mandatory account identity.
- Store town display names, not legal names or QQ identifiers.
- Store parsed status fields, not chat logs.
- Do not log `memberSecret`.
- Do not log `Authorization`.
- Do not log invite codes in plaintext.
- Avoid logging request bodies.
- Redact status notes from server logs unless a reviewed debug policy allows
  short-lived, access-controlled logging.
- Treat invite-code leakage as a room privacy risk.
- Treat `memberSecret` leakage as a member impersonation risk.

Local delete and room leave semantics must be reviewed before implementation:

- Local delete removes local credential and cached room state.
- Room leave stops future rendering of that member's public status.
- Expired status should not preserve stale notes indefinitely.
- Retention defaults should be short and product-specific.

## Short Polling Contract

Phase 2 uses `GET /v1/rooms/{roomId}/state` for complete state polling.

- The client polls at a modest interval.
- The response includes `serverTime`.
- The client uses `serverTime` to compare `expiresAt`.
- The server response can remain complete room state while rooms are small.
- Clients should tolerate transient network failure by keeping local-only mode
  and cached display separate.
- No SSE, WebSocket, or background QQ monitoring is part of Phase 2.

Future optimization can add conditional requests or a lightweight revision field
after the basic product behavior is validated.

## Compatibility With Local AppState

`SharedTownState` is not the same object as the current local `AppState`.

Current local model:

```ts
type AppState = {
  members: Member[]
  statuses: Record<string, MemberStatus>
  settings: AppSettings
}
```

Shared state uses room/member IDs, credentials, server timestamps, and API
responses. A future client adapter will be needed to map shared members and
statuses into the existing rendering surface.

This contract round does not change `AppState`, `localStorage`, domain logic,
React components, CSS, Tauri code, tests, or package dependencies. Local-only
mode remains available when a user never joins a shared room or when a future
backend is unavailable.

## Non-Goals

This contract does not include:

- React, CSS, domain, storage, or Tauri changes.
- Package dependencies.
- Server implementation.
- Client `fetch` calls.
- WebSocket, SSE, or long polling.
- Database schema.
- Account signup or login.
- QQ Bot implementation.
- Webhook implementation.
- QQ private APIs.
- QQ group monitoring.
- Raw chat import or analysis.
- Import/export sync.
- End-to-end encryption design.
- Admin UI.
- Invite rotation implementation.
- Storage migration.

## Open Questions

- Which minimal backend hosting target will be used?
- What exact entropy and format should `roomId`, `memberId`, invite code, and
  `memberSecret` use?
- Should duplicate display names be allowed in the first public test?
- What is the maximum room size for Phase 2?
- What status update rate is gentle enough for a toy but strict enough to limit
  spam?
- Should leave use a tombstone, hard delete, or delayed deletion?
- How long should inactive rooms be retained?
- How can a leaked `memberSecret` be rotated or revoked?
- Does invite-code rotation require a room admin token in the first shared
  implementation?
- Should a future QQ Bot require explicit room linking before any command can
  affect shared state?

## Implementation Gates

Before code is written from this contract, reviewers must confirm:

- Privacy review is complete.
- API review is complete.
- Backend hosting choice is documented.
- Credential generation, local storage, server verifier storage, rotation, and
  revocation are documented.
- Abuse and rate-limit baseline is documented.
- Logging redaction rules are documented.
- No QQ monitoring is introduced.
- No raw QQ chat retention is introduced.
- No real QQ ID is introduced.
- No mandatory account registration is introduced.
- Local-only mode remains available.
- Backend-unavailable behavior is safe.
- Status updates remain explicit user actions or documented timer rules.
- `qq_bot_command` still means explicit supported `@Bot` command only.
- Phase 2 still excludes QQ Bot, SSE, WebSocket, admin UI, account login,
  import/export, storage migration, and Tauri tray shortcut status.
