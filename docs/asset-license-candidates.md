# Asset License Candidates

## Status

Draft / Research only

## Purpose

Record early visual asset candidates and license rules for status4fpb before any external art is downloaded or committed.

This document does not approve final asset adoption. Every asset must be rechecked at implementation time because asset pages, licenses, and package contents can change.

## Research Rules

- Checked date: 2026-06-03.
- No asset files were downloaded.
- No asset files were added to the repository.
- Source pages are treated as candidate evidence, not final legal review.
- Prefer primary source pages from the asset author, platform, or license provider.
- Recheck each license before importing any asset.

## License Baseline

Creative Commons CC0 is the safest external license class found in this research. The Creative Commons CC0 deed says the work can be copied, modified, distributed, and performed, even for commercial purposes, without asking permission:

- <https://creativecommons.org/publicdomain/zero/1.0/>

Important CC0 cautions:

- CC0 does not remove trademark, publicity, privacy, or endorsement risks.
- CC0 pages often disclaim warranties.
- A project should not imply endorsement by the asset author.
- Source, author, license, URL, checked date, and modifications should still be recorded for maintenance and credit hygiene.

## Adoption Policy

Allowed later, after recheck:

- Self-made assets.
- CC0 assets from a stable source page.
- Permissive assets that explicitly allow commercial use, modification, and redistribution.

Needs extra review:

- Attribution-required licenses.
- Share-alike/copyleft licenses.
- Packs with mixed licenses.
- Packs distributed as archives where the page license and included license file may differ.
- Packs visually inspired by recognizable copyrighted games or brands.

Forbidden:

- QQ/Tencent official logos.
- QQ/Tencent mascots.
- QQ/Tencent official icon shapes or visual trade dress.
- Screenshots from QQ, games, social apps, asset previews, or forums.
- Unlicensed itch.io/forum art.
- "Free" assets with no license.
- Assets that prohibit redistribution if the repo or package would redistribute the files.
- Assets generated from, traced from, or closely imitating a specific copyrighted game or official brand.

## Candidate Resources

| Name | Source URL | Author/source | License on source page | Attribution required? | Modification allowed? | Commercial use allowed? | Redistribution allowed? | Top-down town fit | Tray/icon fit | Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Kenney Tiny Town | <https://kenney.nl/assets/tiny-town> | Kenney | Creative Commons CC0 | No | Yes under CC0 | Yes under CC0 | Yes under CC0 | High | Medium | Preferred Phase 3 candidate | 16x16, 130 files, tags include town, overworld, map, pixel. Good fit if an external town pack is needed. |
| OpenGameArt Town Tiles | <https://opengameart.org/content/town-tiles> | surt / OpenGameArt | CC0 | No | Yes under CC0 | Yes under CC0 | Yes under CC0 | Medium | Low | Reference or fallback | 16x16 fantasy town tiles. Very small file and older user-submitted page. Recheck archive contents before use. |
| OpenGameArt RPG Town Pixel Art Assets | <https://opengameart.org/content/rpg-town-pixel-art-assets> | ansimuz / OpenGameArt | CC0 | No | Yes under CC0 | Yes under CC0 | Yes under CC0 | High | Low | Defer despite fit | Top-down 16x16 town pack, but the page describes it as heavily inspired by Final Fantasy 6. Avoid direct use until visual/legal review confirms it is safe enough for this product. |
| Ninja Adventure Asset Pack | <https://pixel-boy.itch.io/ninja-adventure-asset-pack> | Pixel-Boy and AAA | Creative Commons Zero 1.0 Universal | No, appreciated | Yes under CC0 | Yes under CC0 | Yes under CC0 | Medium | Low | Possible Phase 3 candidate | Large top-down pack with tilesets, characters, UI, effects, music, and sounds. Theme is ninja/adventure, so it may not match a study-town tray toy without selective use. Do not import the whole pack. |
| Ultimate UI Pixel Asset Pack | <https://myuxen.itch.io/ultimate-ui-pixel-asset-pack> | Myuxen | CC0 Licensed on page | No | Yes under CC0 | Yes under CC0 | Yes under CC0 | Low | Medium | UI-only candidate | Useful for pixel UI ideas, not for town landmarks. Archive format is `.rar`; recheck package contents and license before any adoption. |
| OpenGameArt Pixel UI kit | <https://opengameart.org/content/pixel-ui-kit> | barkino / OpenGameArt | CC0 | No | Yes under CC0 | Yes under CC0 | Yes under CC0 | Low | Low | Reference only | Small green/grey pixel UI kit. Could inspire UI framing but is not important for the town scene. |

## Candidate Summary

Best fit for a future external town pack:

1. Kenney Tiny Town.
2. OpenGameArt Town Tiles.

Best fit for UI reference only:

1. Ultimate UI Pixel Asset Pack.
2. OpenGameArt Pixel UI kit.

Use caution:

- Ninja Adventure is high-quality and CC0, but visually broader and larger than needed.
- RPG Town Pixel Art Assets is CC0, but the page's explicit inspiration note makes it a poor first adoption choice for a brand-sensitive app.

## Recommended Asset Strategy

For the next implementation slice, do not import external assets. Build a placeholder town with CSS and simple self-made shapes.

Before any external asset adoption:

1. Reopen the source page.
2. Save the source URL, author, license, checked date, and asset version.
3. Check whether the downloaded archive contains a different license file.
4. Confirm commercial use, modification, and redistribution.
5. Confirm no QQ/Tencent official visual elements are involved.
6. Confirm the pack does not closely imitate a recognizable copyrighted game style.
7. Add a credits or asset ledger entry before committing files.

Suggested future ledger fields:

| Field | Meaning |
| --- | --- |
| `assetName` | Human-readable asset name |
| `sourceUrl` | Original source page |
| `author` | Listed creator or publisher |
| `license` | Exact license name |
| `licenseUrl` | License URL |
| `checkedDate` | Date the source was checked |
| `localPath` | Repo path after import |
| `modifications` | Crop, recolor, resize, or derivative changes |
| `attributionText` | Required or voluntary credit text |
| `adoptionDecision` | Adopted, rejected, deferred, or reference only |

## Non-Goals For This Research Round

- No asset downloads.
- No asset imports.
- No icon replacement.
- No generated art.
- No package changes.
- No Tauri config changes.
- No React or CSS changes.
- No license legal conclusion beyond engineering research.

## Open Questions

- Should status4fpb keep a permanent `docs/asset-ledger.md` once assets are imported?
- Should future self-made assets be stored as editable SVG, pixel PNG, Aseprite files, or generated source code?
- Should external CC0 assets be allowed in source control, or should final art stay self-made unless there is a strong reason?
- Should voluntary attribution be shown in an About dialog even when CC0 does not require it?
