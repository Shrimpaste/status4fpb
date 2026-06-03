# Icon And Branding Plan

## Status

Draft

## Product Name

- Internal name: `status4fpb`
- Display name: `QQ群友状态家园`
- Short description: Windows-first tray toy app for playful group status presence.

## Product Positioning

status4fpb is a local-first pixel-home toy for virtual QQ group friend statuses. It should feel playful and personal, but it must not imply official Tencent or QQ affiliation. The brand should communicate "tiny status home" rather than monitoring, automation, or surveillance.

## Visual Keywords

- Pixel town.
- Tiny home.
- Status bubble.
- Local-first.
- Friendly tray companion.
- Study mode.
- Scope shrinking.
- Playful presence.

## Icon Requirements

- Works at `16x16`, `24x24`, `32x32`, `128x128`, and `256x256`.
- Has a simple silhouette that survives Windows tray scaling.
- Uses transparent background where appropriate.
- Avoids text inside the icon.
- Avoids fine details that disappear in the system tray.
- Uses high contrast between foreground and background.
- Has a documented source file and license.
- Can be regenerated into `.ico`, `.icns`, and PNG sizes later.

## Tray Icon Requirements

- Recognizable in the Windows notification area and overflow tray.
- Simple enough for `16x16`.
- No letters, Chinese characters, or long status labels.
- No QQ/Tencent brand shapes, colors, mascots, or official logo references.
- Distinct from common chat app icons.
- Should remain understandable in light and dark taskbar themes.

## Candidate Concepts

1. Pixel house with a small status bubble.
2. Pixel character head with a small status bubble.
3. Tiny town tile with a status flag.
4. Pixel map pin with a status dot.
5. Mini desk tile with a speech bubble.

Recommended first concept: pixel house with a small status bubble. It fits the current "状态家园" metaphor and avoids implying an official QQ client.

## Color Direction

- Prefer bright but grounded colors that work on light and dark Windows trays.
- Avoid a one-note palette dominated by a single hue.
- Avoid copying QQ/Tencent official brand colors as the main signal.
- Keep enough contrast for tray visibility.
- Product UI colors can stay playful, but the icon should remain simpler than the app screen.

## Asset Policy

- Do not use QQ official logos.
- Do not use Tencent official logos.
- Do not use QQ mascots or official app icon shapes.
- Do not imply Tencent/QQ official affiliation.
- Do not use unlicensed pixel art.
- Prefer self-made assets.
- CC0 assets are acceptable if the source and license are recorded.
- Any external asset must include source URL, license name, and license compatibility notes before use.

## Implementation Later

Do not implement icon replacement in this document round. A later implementation slice should:

1. Create or select an original source icon.
2. Store the source asset in the repo.
3. Generate PNG sizes for Tauri.
4. Generate `.ico` and `.icns` assets.
5. Update `src-tauri/tauri.conf.json`.
6. Run `npm test`, `npm run lint`, `npm run build`, `cargo fmt --check`, and `cargo check`.
7. Run `npm run tauri:dev`.
8. Manually verify tray icon visibility with [tauri-tray-manual-checklist.md](tauri-tray-manual-checklist.md).

## Non-Goals

- No final icon generation in this round.
- No replacement of Tauri generated placeholder icons in this round.
- No `tauri.conf.json` changes in this round.
- No package or installer changes in this round.
- No QQ Bot work.
- No network sync.
- No import/export.
- No close-to-tray implementation.
- No storage migration.
- No pixel-town visual overhaul.

## Open Questions

- Should the final source icon be pixel-art SVG, layered PNG, or another editable source format?
- Should the icon use a house, avatar, or map tile as its primary silhouette?
- Should the tray icon and window icon be identical, or should the tray icon be a simplified variant?
- Should the product keep `status4fpb` as the visible desktop app name, or use `QQ群友状态家园` in the window and installer metadata later?
