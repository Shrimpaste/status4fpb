# Pixel Town Visual Direction

## Status

Draft / Research only

## Purpose

Define the product-level visual direction for the status4fpb pixel town before any new art, UI implementation, icon replacement, animation, or game-like system is added.

This document does not implement visual changes, add assets, replace icons, change Tauri configuration, add animation, add a game engine, add a map editor, add sync, or add QQ Bot behavior.

## Inputs

- Current MVP positioning in [product-design.md](product-design.md): playful manual QQ group friend status display, not a QQ automation client.
- Current implementation notes in [technical-plan.md](technical-plan.md): plain CSS, React, localStorage, and focused components.
- Current desktop direction in [tauri-productization-plan.md](tauri-productization-plan.md): Windows-first tray toy, local-first, no QQ monitoring.
- Current icon constraints in [icon-branding-plan.md](icon-branding-plan.md): pixel town, tiny home, status bubble, no QQ/Tencent visual affiliation.
- Asset policy and candidates in [asset-license-candidates.md](asset-license-candidates.md).

## Visual Positioning

status4fpb should feel like a small Windows tray companion for playful group presence:

- Windows-first tray toy.
- Pixel town.
- Local-first.
- Manual and consentful.
- Warm study-town atmosphere.
- Cozy farming/life-sim town mood as inspiration, while remaining original.
- Friendly group presence, not surveillance.
- Independent product, not official QQ/Tencent branding.

The visual metaphor is "a tiny status town where virtual group friends show up at places that match their current mode." It should not feel like a monitoring console, productivity tracker, QQ client replacement, or social analytics dashboard.

## Design Principles

- Status first: the user's main question is "what is everyone doing right now?"
- Places over charts: statuses should map to cozy landmarks instead of graphs or monitoring widgets.
- Small-screen durable: the design should still make sense inside a modest desktop window and as a future tray-adjacent toy.
- Low motion by default: animation can be discussed later, but the first visual direction should work as a static scene.
- Asset-light first: the first implementation slice should use CSS, emoji, simple generated shapes, or self-made SVG/pixel placeholders before importing external art.
- No official QQ signal: do not use QQ/Tencent logos, mascots, icon silhouettes, official colors as the main signal, or visual language that implies affiliation.
- No surveillance language: avoid visual patterns that imply automatic tracking, heatmaps, message scraping, or online presence monitoring.

## Approaches Considered

### A. Placeholder-First Self-Made Town

Use current data and lightweight CSS/SVG/emoji-style placeholders to make a small town layout without external assets.

Pros:

- Lowest license risk.
- Fastest to iterate.
- Keeps the product identity original.
- Works well before final art exists.

Cons:

- Less polished than a finished tileset.
- Requires later art pass for icon and production visuals.

Recommendation: use this as Phase 1.

### B. Curated CC0 Tileset Town

Choose a clearly licensed CC0 or permissive tileset after recording source, author, license, and compatibility.

Pros:

- Faster path to richer visuals.
- Several 16x16 top-down town candidates exist.
- Can help validate the scene metaphor.

Cons:

- Requires license record discipline.
- Mixing packs can create style mismatch.
- Some assets may carry brand, theme, or "inspired by" concerns even when listed as CC0.

Recommendation: reserve for Phase 3 after the placeholder town proves the layout.

### C. Game-Like Map Engine

Introduce a tilemap renderer, large tileset, map editor, animation system, and game-style scene logic.

Pros:

- Most expressive long-term.
- Could support animated characters and richer scenes.

Cons:

- Too heavy for the current tray toy.
- Adds product and technical complexity before the basic desktop behavior is finalized.
- Risks turning a status utility into an unfinished game engine.

Recommendation: do not use this for the next implementation slice.

## Recommended Direction

Start with a handcrafted top-down pixel town made from simple static landmarks. Treat each status as a place assignment and each member as a small avatar/token placed at that landmark.

The first production direction should be:

1. A compact town map panel with stable landmark zones.
2. Existing member cards remain available for precise status, note, and expiration details.
3. The map communicates mood and grouping; the cards keep the UI operable.
4. Visual polish improves through self-made sprites before any external asset pack is imported.

## Status To Place Mapping

The current app already stores `place` and `placeLabel` values in `src/data/statusPresets.ts`. The visual direction can keep those stable internal concepts while giving each place a stronger town landmark name.

| Status | Current place label | Proposed landmark | Visual cue |
| --- | --- | --- | --- |
| `套卷中` | `自习桌` | Study Tower / Exam Hall | Desk, paper stack, pencil flag |
| `缩圈中` | `缩圈法阵` | Scope Lab / Magic Study | Circle tile, chalk marks, tiny books |
| `摸鱼中` | `池塘` | Fishing Pond | Pond, reeds, idle fishing marker |
| `背单词中` | `书架角` | Library | Bookshelf, flashcard sign |
| `睡觉中` | `小床` | Dorm Inn | Bed, moon sign, quiet window |
| `赶 ddl 中` | `燃烧桌` | Deadline Workshop | Workbench, sparks, warning lamp |
| `失联中` | `雾区` | Mist Forest | Fog, dim path, missing sign |
| `空闲中` | `门廊` | Town Square / Porch | Bench, plaza tile, open flag |
| `未知` | `未知区` | Unknown Sign | Question signpost |

The status names stay human and funny. The landmarks make the scene scannable without making the product look like it is tracking real QQ activity.

## Town Scene Shape

The first town scene should be a compact top-down board, not a hero page and not a decorative card wall.

Suggested layout:

- A central path or plaza connects landmarks.
- Each landmark has a fixed zone, so members do not cause layout jumps.
- A member token appears at the status landmark.
- Multiple members in one status can stack as small tokens with a count badge or short row.
- Status note and expiration remain in cards/details, not crowded into the map.

## Visual Language

- Pixel-like but readable at normal desktop size.
- Bright, varied palette with grounded contrast.
- A future visual overhaul may study cozy pixel town references such as Stardew Valley for atmosphere, scale, and "lived-in village" pacing, but only as broad inspiration.
- Do not copy specific game assets, map layouts, characters, UI frames, typography, palette recipes, or franchise-identifying details.
- Prefer original landmarks that match this product's study/status metaphor rather than generic RPG or farming mechanics.
- Avoid a single dominant hue family.
- Avoid official QQ/Tencent color cues as the main brand signal.
- Rounded UI can stay modest; landmark tiles should feel crisp and grid-aligned.
- Text should remain secondary on the map; icons, tokens, and place shapes should carry the visual scan.

## Implementation Phases

### Phase 1: Placeholder Town

- Use CSS, emoji-like text symbols, simple inline SVG, or self-made minimal shapes.
- Do not import external assets.
- Do not add a game engine.
- Do not add map editing.
- Do not add animation.
- Keep the existing manual status workflow.

Goal: prove that status-to-place grouping improves the existing MVP.

### Phase 2: Self-Made Pixel Sprites

- Create original small sprites for landmarks and member tokens.
- Keep source files in the repo with clear authorship.
- Generate sizes only after icon and asset workflow is decided.
- Keep art simple enough for Windows tray-adjacent reading.

Goal: make the app visually distinctive without external license risk.

### Phase 3: Licensed Asset Integration

- Consider CC0 or clearly permissive assets only after license records are complete.
- Record source URL, author, license, checked date, local path, and modification notes before adoption.
- Prefer one cohesive pack over mixing unrelated packs.
- Do not import assets whose license is unclear or whose style implies another franchise.
- Before a major UI art pass, collect current reference components, pixel-art tooling options, and design-system candidates, then ask the ChatGPT web review thread to critique the direction and copyright/license boundaries.

Goal: enrich the town if self-made art is not enough.

## Asset Rules

See [asset-license-candidates.md](asset-license-candidates.md) for candidate resources and license notes.

Rules for this product:

- Prefer self-made assets.
- CC0 is acceptable after source and license are recorded.
- Permissive assets are acceptable only if commercial use, modification, and redistribution are explicitly allowed.
- Attribution-required assets need a visible or bundled credits plan before use.
- Do not use QQ/Tencent official logos, mascots, icon shapes, official color cues, screenshots, or derivative brand elements.
- Do not use unlicensed itch.io assets, forum attachments, screenshots, or "free" art without a license.
- Do not download or commit any asset in this research round.

## Non-Goals For This Research Round

- No CSS or React changes.
- No icon replacement.
- No Tauri configuration changes.
- No imported art files.
- No generated sprites.
- No animation.
- No game engine.
- No map editor.
- No import/export.
- No QQ Bot implementation.
- No sync service.

## Open Questions

- Should Phase 1 keep the existing cards as primary and make the town a summary, or should the town become the primary interaction surface?
- Should member tokens use initials, generated pixel faces, or abstract colored markers?
- Should `失联中` remain a selectable status, or should it eventually become only an expiration fallback?
- Should the final map be top-down, isometric, or a hybrid "dollhouse" layout?
- Should the future tray icon use the same house/town visual language as the map, or a simplified status-bubble variant?
