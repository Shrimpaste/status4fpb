# Pixel Town Placeholder Map

The current pixel town map is a CSS-only placeholder layer for status grouping.
It is the first visual core for turning `status4fpb` from a status-card MVP
into a playful pixel-town status home.

## Feature Summary

- CSS-only and self-made placeholder town map.
- Nine fixed status zones with public Chinese labels.
- Members appear in the zone for their effective status.
- Member markers expose the member, status, and zone in accessible names.
- Member cards remain the source of precise controls, notes, expiration, delete, and reset behavior.

## Status Zone Mapping

| Effective status | Public zone |
| --- | --- |
| `exam_paper` | 自习塔 |
| `scope_shrinking` | 魔法研究所 |
| `fishing` | 池塘 |
| `vocabulary` | 图书馆 |
| `sleeping` | 旅馆 |
| `deadline` | DDL 工坊 |
| `offline` / expired fallback | 雾林 |
| `idle` | 广场 |
| `unknown` / missing status | 问号路牌 |

## Boundaries

- No imported visual assets, fonts, tilesets, or icon packages.
- No QQ or Tencent visuals.
- No QQ private API access.
- No sync service or shared room behavior.
- No animation, drag/drop, or map editing in this slice.
- No Tauri changes.
- Internal zone keys are implementation details and must not appear in the UI.

## Verification

Latest readiness verification for the stacked pixel-town slice:

- `npm test`: 11 test files, 53 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `cargo fmt --check`: passed in `src-tauri`.
- `cargo check`: passed in `src-tauri`.
- `git diff --check`: passed.
- Browser DOM/layout smoke: 9 zones rendered, empty-state guidance rendered, no internal zone key leaked, and 390px mobile viewport had no horizontal overflow.

## Known Limitations

- The map is still a CSS placeholder, not final pixel art.
- Browser screenshot capture was unavailable in the current tool environment.
- Browser real text input was blocked by the environment's virtual clipboard issue, so add/status/delete interaction coverage currently comes from React Testing Library integration tests.
- Tauri tray manual verification remains a separate unresolved gate.

## Next Candidates

- Design shared-town sync architecture before implementation.
- Verify Tauri tray behavior manually when the environment supports it.
- Generate future app icon assets.
- Replace CSS placeholders with licensed or self-made pixel assets.
- Recheck asset licenses before adopting any third-party pixel art.
