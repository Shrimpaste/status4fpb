# Shared Town Sync Architecture

## Status

Draft architecture only. This document does not implement a backend, network
request, QQ Bot, webhook, database, account system, or client sync code.

## Product Goal

The local single-user pixel town is now useful as a manual status home. The
next product question is how several friends could share one town without
turning the toy into a monitoring system or a heavy account product.

The recommended direction is an invite-code shared town:

- A small group creates or joins a room with an invite code.
- Each person keeps a local identity token on their own device.
- Members actively broadcast status changes.
- The app remains playful, low-friction, and explicit.
- Local-first manual use remains valid even without sync.

## Non-Goals

Shared town sync must not introduce any of these:

- QQ private APIs.
- Ordinary QQ group chat monitoring.
- Chat log scraping, import, or analysis.
- ChatLab or `qq-chat-exporter` as a data source.
- Real QQ ID storage.
- Cookie, token, password, or credential collection from QQ clients.
- Forced account registration.
- Background surveillance.
- Automatic status inference from messages, speaking frequency, keywords, or behavior.
- Server, webhook, QQ Bot, database, or client sync implementation in this documentation round.

## Recommended Model

Use a small room model with local credentials instead of formal accounts.

```ts
type SharedTownRoom = {
  roomId: string
  inviteCodeHash: string
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
}

type MemberCredential = {
  roomId: string
  memberId: string
  memberSecret: string
}

type SharedStatus = {
  roomId: string
  memberId: string
  statusKey: string
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
  source: 'desktop_manual' | 'web_manual' | 'qq_bot_command' | 'timer_rule'
}
```

`memberSecret` is an update capability for one member inside one room. It is not
an account password, should not be shown casually, and should not be sent
anywhere except when authorizing that member's own status updates.

## Status Source Priority

Status records should preserve how the current value was set:

| Source | Meaning |
| --- | --- |
| `desktop_manual` | The member actively set status in the desktop or tray UI. |
| `web_manual` | The member actively set status in the Web UI. |
| `qq_bot_command` | The member explicitly mentioned the QQ Bot and sent a supported command. |
| `timer_rule` | The app applied a local rule such as expiration fallback. |

`qq_bot_command` does not mean automatic detection. It does not imply ordinary
group message monitoring, chat analysis, chat log import, or status inference.

Conflict handling should stay simple:

- The newest valid status update for a member wins.
- Expiration fallback may be computed by clients from `expiresAt`.
- A future server can optionally normalize expired statuses, but that should be
  a later implementation decision.

## Sync Strategy Phases

### Phase 0: Current Local App

The current app stores local state in browser `localStorage` and does not sync.
This remains a valid standalone mode.

### Phase 1: Skip Manual File Sync

Manual export/import is intentionally not the preferred next step. It would add
edge cases around stale files, overwrite order, and accidental sharing without
solving the real product goal.

### Phase 2: Minimal Shared Room With Short Polling

The first shared-room implementation should use short polling:

- `GET` room state.
- `POST` member status updates.
- Keep payloads small.
- Poll slowly enough for a casual status toy.

Reasons to start here:

- Status changes are low-frequency.
- The implementation is easier to inspect and test.
- It avoids long-lived connection complexity.
- It is enough to validate the product behavior.

Phase 2 implementation cannot start until:

- Privacy review is completed.
- Minimal backend hosting choice is documented.
- Token and secret storage strategy is documented.
- Abuse and rate-limit baseline is documented.
- API draft is reviewed.
- Local-only mode remains available.

Phase 2 should include only:

- Create a room.
- Join a room with an invite code.
- Generate a local `memberId` and `memberSecret`.
- Store the member credential locally.
- Post manual desktop or Web status updates.
- Short-poll room state.
- Leave a room.
- Keep local-only mode available.

Phase 2 must not include:

- QQ Bot integration.
- SSE or WebSocket.
- Admin UI.
- Account login.
- Import or export.
- End-to-end encryption.
- Storage migration.
- Tauri tray shortcut status.

### Phase 3: Server-Sent Events

If polling feels laggy after real use, add SSE for room state changes. SSE is a
better next step than WebSocket if updates mostly flow from server to clients.

### Phase 4: WebSocket, Optional

WebSocket should stay optional and late. It only becomes worthwhile if the town
needs true bidirectional low-latency interaction beyond status updates.

## Minimal API Sketch

API names are draft only. No backend implementation is part of this round.

```http
POST /rooms
POST /rooms/{roomId}/join
GET /rooms/{roomId}/state
POST /rooms/{roomId}/members/{memberId}/status
POST /rooms/{roomId}/members/{memberId}/leave
```

Potential invite-code variant:

```http
POST /rooms/{inviteCode}/join
```

Suggested response shape for room state:

```ts
type SharedTownState = {
  room: SharedTownRoom
  members: SharedTownMember[]
  statuses: SharedStatus[]
  serverTime: string
}
```

Status update requests should authenticate with the member's local credential
and should only update that member's own status.

## Privacy And Safety

The sync design should minimize collected data:

- Store display names chosen for the town, not real QQ IDs.
- Store parsed status fields, not raw chat messages.
- Avoid storing original Bot command content unless a future abuse/debug policy
  explicitly requires a short-lived record.
- Provide a way to leave a room.
- Provide a way to delete local identity data.
- Treat invite-code leakage as a real risk.
- Treat `memberSecret` leakage as a real risk.
- Add rate limits before any public deployment.
- Add abuse controls before any public room discovery or public invite listing.

Deletion policy should be explicit before implementation:

- Local delete removes the local credential and cached room data.
- Room leave should remove or tombstone the member in shared state.
- Status expiration should not preserve stale notes in public room state.
- Data retention defaults should be short and product-specific.

Admin features should be postponed unless product testing shows they are needed.
If added later, they should use a separate room admin token rather than reusing
ordinary member credentials.

### Data Minimization Table

| Data | Stored? | Reason | Retention | Notes |
| --- | --- | --- | --- | --- |
| `displayName` | Yes | Show a member in the town. | Until member leaves or room expires. | User-chosen town nickname, not a real QQ ID. |
| `avatarKey` | Yes | Render a stable marker. | Until member leaves or room expires. | Uses app-local avatar vocabulary. |
| `statusKey` | Yes | Show status and zone. | Until replaced, cleared, or expired. | Must be from supported status presets. |
| `note` | Optional | User-authored context for a status. | Until replaced, cleared, or expired. | Should stay short and explicit. |
| `expiresAt` | Optional | Enable fallback and stale-status cleanup. | Until replaced, cleared, or expired. | Clients may compute fallback locally. |
| `memberSecret` | Client-side credential. | Authorize a member's own updates. | Until local identity is deleted or rotated. | Server should store only a verifier or hash if implemented. |
| Real QQ ID | No | Not needed for shared town sync. | None. | QQ Bot openids are also scoped and should be minimized. |
| QQ chat content | No | Status sync does not need chat logs. | None. | Bot commands should be parsed, not archived. |
| Cookies, tokens, credentials | No | Not part of this product. | None. | Never collect QQ client credentials. |
| Raw Bot command text | No by default. | Parsed fields are enough for state. | None unless abuse review requires short-lived logs. | Any logging must be explicit and reviewed. |

### Privacy Risk Matrix

| Risk | Scenario | Impact | Mitigation in architecture | Required before implementation |
| --- | --- | --- | --- | --- |
| Invite code leak | A room invite is shared outside the intended group. | Unwanted members can join or view the town. | Treat invite codes as private, allow future rotation. | Decide rotation and room-member removal policy. |
| `memberSecret` leak | A local credential is copied from a device. | Attacker can update one member's status. | Scope secrets to one room/member and allow future revocation. | Define secret storage, rotation, and revocation. |
| Room enumeration | Attackers guess room or invite identifiers. | Private towns become discoverable. | Use high-entropy IDs and hashed invite codes. | Document ID entropy and rate limits. |
| Status spam | A client posts frequent updates. | Town becomes noisy or service load rises. | Rate-limit status updates by room/member. | Define baseline limits and error handling. |
| Impersonation | A user joins with someone else's display name. | Confusion or social friction. | Keep member identity tied to local credential, not display name. | Decide whether duplicate names are allowed. |
| Raw QQ Bot command retention | Bot stores original command text. | Notes or incidental content may be over-collected. | Store parsed status fields by default. | Define logging policy before Bot work. |
| Sensitive server logs | Requests log notes, tokens, or secrets. | Private status data leaks through infrastructure. | Avoid logging request bodies and redact credentials. | Add logging rules before backend implementation. |
| Delete or leave not propagating | A member leaves but old state remains visible. | User cannot escape stale shared data. | Include leave/delete semantics in the API design. | Define tombstone vs hard-delete behavior. |
| Offline edit conflict | A client updates status while stale. | Unexpected status overwrite. | Newest valid update wins for the first slice. | Document conflict timestamps and client clock assumptions. |

## QQ Bot Integration Boundary

The QQ Bot is only an optional command input for a shared town. It is not the
core sync system.

Acceptable future flow:

1. A user explicitly mentions the bot in a QQ group.
2. The command parser recognizes a supported status command.
3. The bot maps the QQ `group_openid` and `member_openid` to a shared town room
   and member record.
4. The bot writes a `SharedStatus` with `source: 'qq_bot_command'`.
5. The bot optionally sends a short passive confirmation.

Unacceptable flow:

- Reading ordinary group messages.
- Inferring status from chat context.
- Importing chat logs.
- Reading QQ client databases.
- Using QQ private APIs.
- Saving real QQ IDs.
- Treating the bot as a general group monitor.

The bot should parse and persist only the fields needed for the status update:

- room or group mapping.
- member mapping.
- status key.
- optional duration.
- optional note.
- timestamp.

## Open Questions

- Where would the minimal shared-town service be hosted?
- Does a room need an admin token in the first shared implementation?
- Can room invite codes be rotated?
- How should a member recover identity after losing `memberSecret`?
- How can a leaked `memberSecret` be revoked?
- Is end-to-end encryption necessary for notes, and if so, when?
- Should leave/delete remove historical status records or tombstone them?
- How long should inactive rooms be retained?
- How should clients handle offline edits made before reconnecting?
- Should QQ Bot group mapping create rooms automatically or require explicit room linking?

## First Implementation Candidate

When implementation eventually starts, the smallest useful slice should be:

1. Create a room.
2. Join a room with an invite code.
3. Store `MemberCredential` locally.
4. Fetch room state with short polling.
5. Post manual status changes for the local member.
6. Keep the local-only mode available when sync is disabled.

That implementation should be planned separately and must include a new privacy
review before any networked status data is transmitted.

## Implementation Review Checklist

Before any implementation starts, reviewers must confirm:

- No QQ monitoring.
- No ordinary group message ingestion.
- No raw chat retention.
- No real QQ IDs.
- No mandatory account registration.
- No background sync without a user joining a room.
- Local-only mode still works.
- The app has a safe failure mode if the backend is unavailable.
- Status updates are explicit user actions or documented timer rules.
- `qq_bot_command` still means explicit `@Bot` command only.
- Credentials have a documented storage, rotation, and revocation story.
- API drafts have privacy and abuse review before code is written.
