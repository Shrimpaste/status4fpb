# ADR 0002: Desktop Storage Strategy

## Status

Proposed

## Context

The Web MVP stores status4fpb data in browser `localStorage` under:

```text
qq-status-pixel-home:v1
```

The Tauri spike showed that the desktop WebView uses a separate data directory under `com.status4fpb.app\EBWebView`. This means Chrome browser `localStorage` and Tauri WebView `localStorage` are separate stores.

status4fpb is local-first. It currently has no network sync, no import/export flow, no QQ data import, and no desktop packaging release. The existing storage layer already validates stored data and recovers safely from damaged or invalid JSON.

## Decision

- Keep using Tauri WebView `localStorage` for the first desktop productization slice.
- Keep the existing key: `qq-status-pixel-home:v1`.
- Do not migrate to a Tauri store plugin in this slice.
- Do not migrate to local JSON in this slice.
- Do not use SQLite in this slice.
- Do not import Chrome/browser `localStorage` into Tauri.
- `重置家园` clears only the active runtime's local status4fpb data.
- Reevaluate Tauri store or local JSON before a broader public desktop release.

## Consequences

Positive:

- Minimal implementation risk.
- Reuses the tested Web MVP storage code.
- Keeps Web and Tauri behavior aligned at the app-code level.
- Avoids premature storage migration before tray behavior is manually verified.
- Keeps the product local-first and offline-friendly.

Negative:

- Browser and desktop data are separate.
- Users may need to recreate virtual members in the desktop app.
- WebView storage is less visible than browser DevTools.
- Backup and export remain unavailable.
- Future migration may need a compatibility path from `qq-status-pixel-home:v1`.

## Release Gates

Any desktop productization slice that touches storage must pass:

```bash
npm test
npm run lint
npm run build
```

From `src-tauri`:

```bash
cargo fmt --check
cargo check
```

Storage-specific gates:

- Existing storage tests remain green.
- Damaged/invalid stored data still recovers to the empty state.
- `重置家园` continues to clear only status4fpb data for the active runtime.
- No real QQ IDs, cookies, tokens, scraped chat content, or credentials are stored.
- Tauri WebView storage isolation is documented in release notes or desktop docs before a public desktop release.

## Explicit Non-Goals

- No network sync.
- No QQ data import.
- No Chrome/browser `localStorage` import.
- No Tauri store implementation.
- No local JSON implementation.
- No SQLite.
- No import/export feature.
- No storage migration in this ADR round.

## Follow-Up

Before a public desktop release:

1. Decide whether WebView `localStorage` remains acceptable for the expected audience.
2. If backup or portability becomes required, compare Tauri store and local JSON.
3. If migration is needed, define a versioned schema and recovery path.
4. Keep the `qq-status-pixel-home:v1` validation behavior as the baseline for any future storage backend.
