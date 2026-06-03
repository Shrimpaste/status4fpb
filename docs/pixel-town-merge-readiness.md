# Pixel Town Merge Readiness

This document summarizes the stacked pixel-town feature work and the remaining
merge considerations before moving to the next independent architecture track.

## Feature Stack

Core pixel-town commits in this stack:

| Commit | Summary |
| --- | --- |
| `0d2d90e` | `docs: research pixel town visual direction` |
| `1fb70d7` | `docs: plan pixel town implementation slice` |
| `537077d` | `feat: add pixel town layout model` |
| `5061c8a` | `feat: render pixel town status zones` |
| `09e0520` | `style: add css pixel town placeholders` |
| `a188ca4` | `test: cover pixel town member placement` |
| `891e1e6` | `polish: harden pixel town placeholder map` |
| `8c4c775` | `docs: summarize pixel town placeholder feature` |

Related context that should stay separate from this merge:

- QQ bot command research remains documentation only.
- Tauri tray behavior and productization remain separate tracks.
- Shared-town sync architecture has not started in this stack.

## Scope Summary

- CSS-only and self-made placeholder pixel town.
- Nine fixed public status zones.
- Members appear in town zones based on their effective status.
- `unknown` and missing-status members appear at `问号路牌`.
- `offline` and expired fallback members appear at `雾林`.
- Member markers expose member, status, and zone in accessible names.
- Member cards continue to own notes, expiration, delete, reset, and status action controls.

## Verification Summary

Latest branch-level validation:

- `npm test`: 11 test files, 53 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `cargo fmt --check`: passed in `src-tauri`.
- `cargo check`: passed in `src-tauri`.
- `git diff --check`: passed.
- Browser DOM/layout smoke passed for the placeholder map.
- 390px mobile viewport had no horizontal overflow.

## Non-Goals Preserved

- No external visual assets, fonts, tilesets, or icon packages.
- No QQ or Tencent visual elements.
- No animation, drag/drop, or map editor.
- No QQ Bot implementation.
- No sync service, shared room, or network behavior.
- No Tauri config or Rust behavior changes.
- No domain, storage, or `usePixelHomeApp` changes.

## Known Limitations

- The map is still a CSS placeholder, not final pixel art.
- Browser screenshot capture was unavailable in the current tool environment.
- Browser real text input was blocked by the environment's virtual clipboard issue.
- Add/status/delete interactions are covered by React Testing Library integration tests rather than browser text-input smoke.
- Tauri tray manual verification remains a separate unresolved gate.
- No external pixel art has been adopted yet; future assets still need license review.

## Merge Recommendation

Recommend merging the pixel-town feature stack after one final branch-level
validation pass.

Preferred strategy:

- Preserve the logical commits if the target branch accepts stacked history.
- Squash is acceptable if the target branch policy requires one commit.
- Do not mix shared-town sync architecture into this merge.
- Do not add more UI polish before merging unless a blocker appears in review.

## Post-Merge Next Direction

After the pixel-town stack is merged, start the next independent architecture
track in:

```text
docs/shared-town-sync-architecture.md
```

That document should cover invite-code towns, local identity tokens, explicit
status broadcasting, minimal server data, privacy/deletion policy, and phased
transport choices such as polling, SSE, and WebSocket. It should remain separate
from the pixel-town visual merge.
