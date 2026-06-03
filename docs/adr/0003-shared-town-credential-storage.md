# ADR 0003: Shared Town Credential Storage

## Status

Proposed

## Context

Phase 2 shared-town sync will require a local credential for each joined room.
The credential contains `roomId`, `memberId`, and `memberSecret`. The
`memberSecret` is a capability credential scoped to one room/member pair; it is
not an account password, QQ token, QQ cookie, or admin credential.

The current app stores local-only home state in browser `localStorage` under:

```text
qq-status-pixel-home:v1
```

[ADR 0002](0002-desktop-storage-strategy.md) keeps Tauri WebView
`localStorage` as the first desktop storage strategy. That means browser
`localStorage` and Tauri WebView `localStorage` are separate runtime stores.

Shared credentials need a different lifecycle from local `AppState`:

- Reset Home is local-only and should not silently disconnect shared rooms.
- Leave Room is a shared-room action and should clear the matching credential.
- Clear Shared Credentials is a separate destructive local action.
- Future Delete Remote Data is a separate operation that needs its own design.

This ADR is a decision document only. It does not implement credential storage,
network sync, server verifier storage, Tauri storage migration, or UI changes.

## Decision

- Store Phase 2 shared-town credentials in a separate localStorage key:

```text
status4fpb:shared-credentials:v1
```

- Do not store shared credentials inside `qq-status-pixel-home:v1`.
- Keep shared credentials local to the active runtime.
- Browser and Tauri WebView credentials are separate.
- Use current browser/Tauri WebView `localStorage` for the first Phase 2 slice.
- Do not migrate to Tauri store, local JSON, SQLite, or account sync in Phase 2.
- Server-side storage must keep only a verifier or hash for `memberSecret`.
- Server-side storage must never persist plaintext `memberSecret`.
- Reset Home does not clear shared credentials by default.
- Leave Room clears the credential for that room/member after the leave action
  succeeds or reaches a reviewed failure path.
- Clear Shared Credentials is a separate explicit destructive action.
- Secret rotation and revocation are future capabilities unless the privacy
  review makes them blocking before Phase 2 implementation.

## Data Shape Draft

Draft only. No code is implemented by this ADR.

```ts
type SharedCredentialStoreV1 = {
  version: 1
  credentials: Array<{
    roomId: string
    memberId: string
    memberSecret: string
    displayName: string
    roomName?: string
    createdAt: string
    updatedAt: string
  }>
}
```

The store should not include:

- `inviteCode`
- `inviteCodeHash`
- real QQ IDs
- QQ chat content
- raw QQ Bot command text
- QQ cookies, tokens, passwords, or client credentials
- cached room state
- local `AppState`

If a future implementation needs cached room state, it should use a separate
reviewed cache key and must not mix public room data with `memberSecret`.

## Lifecycle Semantics

| Action | Credential effect | Remote effect |
| --- | --- | --- |
| Reset Home | Does not clear shared credentials by default. | No remote effect. |
| Leave Room | Clears the matching room/member credential after the leave flow reaches a reviewed terminal state. | Calls the future leave endpoint or records a reviewed failure state. |
| Clear Shared Credentials | Clears local shared credentials selected by the user. | No remote effect by itself. |
| Delete Local Member | No effect on shared credentials unless the user explicitly chooses a shared action. | No remote effect. |
| Delete Remote Data | Not part of Phase 2. | Requires a future explicit design and confirmation flow. |

The UI must not present Reset Home as remote deletion. The UI must not present
Clear Shared Credentials as leaving or deleting a remote room. These are
different privacy actions with different consequences.

## Security Considerations

- `memberSecret` is sensitive.
- Do not log `memberSecret`.
- Do not log `Authorization`.
- Do not include `memberSecret` in local `AppState`.
- Do not include `memberSecret` in future exports.
- Do not include `memberSecret` in screenshots, diagnostics, or debug dumps.
- Do not send `memberSecret` anywhere except as authorization to the reviewed
  shared sync API.
- Do not store plaintext `memberSecret` on the server.
- If localStorage is compromised, an attacker may impersonate that member in
  that room.
- The first Phase 2 slice must treat localStorage as convenience storage, not
  high-security storage.
- If the expected threat model becomes stronger, revisit OS-protected storage,
  Tauri store, or another credential backend before public release.

## Alternatives Considered

### Store Credentials In `qq-status-pixel-home:v1`

Rejected.

Mixing shared credentials with local home state would make Reset Home,
local-only backup, debug inspection, and future import/export riskier. It would
also blur the boundary between local virtual members and remote shared-room
identity.

### Migrate Immediately To Tauri Store Or Local JSON

Deferred.

It may be a better desktop storage backend later, but adding a storage migration
before the first shared-sync slice would increase implementation risk. ADR 0002
already keeps WebView `localStorage` for the early desktop strategy.

### Require Formal Account Login

Rejected for Phase 2.

Accounts add product and privacy weight that the shared-town toy does not need.
Room-scoped member credentials are enough for the initial explicit sharing
model.

### Store Plaintext `memberSecret` On The Server

Rejected.

The server should store only verifier or hash material. Plaintext
`memberSecret` must remain client-held and transient in requests.

### Store Credentials Only In Memory

Rejected for Phase 2.

Memory-only credentials would be safer against local disk inspection, but users
would lose room membership on refresh or app restart. That would make the first
shared-room experience too fragile.

## Consequences

Positive:

- Keeps shared credentials separate from local home state.
- Reuses the current storage strategy for the first small shared-sync slice.
- Avoids early Tauri storage migration.
- Keeps browser and Tauri runtime behavior easy to explain.
- Makes Reset Home, Leave Room, and Clear Shared Credentials distinct.
- Keeps server plaintext secret storage out of bounds.

Negative:

- localStorage is not high-security credential storage.
- Browser and Tauri credentials are separate.
- Users may need to rejoin or recover identity in another runtime.
- Clear/reset/leave UI copy must be precise.
- Future migration may need a compatibility path from
  `status4fpb:shared-credentials:v1`.
- Secret rotation and revocation remain future design work unless made blocking
  by review.

## Implementation Gates

Before implementation, reviewers must confirm:

- `docs/shared-town-sync-privacy-review.md` remains accepted as the privacy
  baseline.
- Shared credentials are not stored in `qq-status-pixel-home:v1`.
- The exact storage key is reviewed.
- The local stored shape is reviewed.
- Damaged credential JSON recovery behavior is specified.
- Redaction rules for `memberSecret` and `Authorization` are specified.
- Clear Shared Credentials UX copy is specified.
- Leave Room failure behavior is specified.
- Server verifier/hash strategy is specified.
- Server plaintext `memberSecret` storage remains forbidden.
- Tests are planned for Reset Home, Leave Room, Clear Shared Credentials, and
  damaged credential storage.

## Non-Goals

- No implementation in this ADR.
- No React, CSS, domain, storage, or Tauri code changes.
- No tests.
- No Tauri store migration.
- No local JSON implementation.
- No SQLite.
- No account system.
- No end-to-end encryption design.
- No credential sync across devices.
- No QQ Bot.
- No server code.
- No webhook.
- No network requests.
- No import/export sync.
- No changes to the architecture, API contract, implementation plan, or privacy
  review documents.

## Validation For This Documentation Round

This docs-only ADR should be validated with:

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

The review report should confirm:

- Only `docs/adr/0003-shared-town-credential-storage.md` was added.
- No functional code changed.
- No Tauri files changed.
- No dependencies changed.
- No network, backend, database, account, QQ Bot, import/export, or sync code
  was added.
- Credentials remain separate from `AppState`.
- Reset Home, Leave Room, and Clear Shared Credentials have distinct semantics.
- Server plaintext `memberSecret` storage is forbidden.
