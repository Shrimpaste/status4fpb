# Pixel Town Placeholder Map

The current pixel town map is a CSS-only placeholder layer for status grouping.

## Implemented

- Fixed town zones with public Chinese labels.
- Members appear in the zone for their effective status.
- `unknown` members appear at `问号路牌`.
- `offline` and expired fallback members appear at `雾林`.
- Member cards remain the source of precise controls, notes, expiration, delete, and reset behavior.

## Boundaries

- No imported visual assets, fonts, tilesets, or icon packages.
- No QQ private API access.
- No sync service or shared room behavior.
- No animation, drag/drop, or map editing in this slice.
- Internal zone keys are implementation details and must not appear in the UI.

## Next Candidates

- Replace CSS placeholders with licensed or self-made pixel assets.
- Design a shared-room architecture separately before implementation.
- Revisit Tauri tray productization only after manual tray behavior can be verified.
