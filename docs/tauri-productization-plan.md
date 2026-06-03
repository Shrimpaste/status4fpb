# Tauri Productization Plan

## Status

- `v0.1.0-mvp` is tagged as the stable Web MVP baseline.
- The Tauri shell spike is complete.
- The desktop app launches as `status4fpb.exe`.
- The Tauri WebView opens the existing Vite + React UI.
- Rust tray code compiles and loads during app startup.
- Manual tray interaction is still pending.

Tauri tray productization cannot be considered validated until [tauri-tray-manual-checklist.md](tauri-tray-manual-checklist.md) is completed by a human tester or a restored Computer Use environment.

## Product Goal

status4fpb should become a lightweight Windows-first tray toy app for a local QQ group friend status pixel home. The desktop app should feel like a small companion: easy to open, easy to hide, safe by default, and still local-first.

## Non-Goals For This Phase

- No QQ Bot integration.
- No QQ private APIs.
- No QQ client scraping.
- No chat monitoring.
- No automatic status inference.
- No network sync.
- No import or export.
- No real-time countdown refresh.
- No startup at login.
- No auto-update.
- No installer publishing.
- No data migration implementation.
- No pixel-town visual overhaul.

## Desktop Behavior Decisions

### Launch

- Launch opens the main status4fpb window.
- The initial window title remains `status4fpb`.
- The app keeps using the current Web MVP route and UI.

### Main Window

- Keep the window resizable.
- Keep the initial window size modest until the pixel-town layout is redesigned for desktop.
- Do not persist window position or size in the first productization slice.

### Close And Minimize

Decision still required before implementation:

- Option A: closing the window exits the app.
- Option B: closing the window hides it to tray.

Recommended first product slice: keep default close behavior until tray menu behavior is manually verified. Add close-to-tray only after the manual checklist passes.

### Tray Behavior

Minimum tray menu for V1:

- `打开家园`: show and focus the main window.
- `隐藏窗口`: hide the main window.
- `退出`: exit the app and clean up processes.

Do not add tray shortcuts for setting statuses until the basic tray menu is manually verified.

## Storage Strategy

Current Web MVP storage:

```text
localStorage key: qq-status-pixel-home:v1
```

Current Tauri spike observation:

- Tauri WebView uses a separate data directory under `com.status4fpb.app\EBWebView`.
- Chrome browser `localStorage` and Tauri WebView `localStorage` should be treated as separate stores.

Near-term decision:

- Keep WebView `localStorage` for the first desktop productization slice.
- Do not migrate existing browser data automatically.
- Document that the desktop app starts with its own local data store.

Future storage options:

- Tauri store plugin for simple structured local state.
- Local JSON file for transparent backup and migration.
- SQLite only if the data model becomes meaningfully relational.

No storage migration should be implemented until the tray interaction checklist has passed and the storage UX is designed.

## Release Gates

Every desktop productization slice must pass:

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

Manual gates before productizing tray behavior:

- `npm run tauri:dev` starts the desktop app.
- The Tauri window shows the Web MVP.
- The tray icon is visible.
- The tray menu opens.
- `打开家园` shows and focuses the window.
- `隐藏窗口` hides the window.
- `退出` exits the app.
- No stale `status4fpb.exe` process remains.
- Browser dev mode still works independently.

## Risks

- Tray icon visibility and menu click behavior are not manually verified yet.
- Generated Tauri icon assets are placeholders.
- Tauri WebView storage is isolated from Chrome browser storage.
- The package identifier `com.status4fpb.app` affects the WebView data path.
- Tauri build and installer packaging have not been validated.
- Product behavior for close-to-tray is not decided.
- Windows-first assumptions may not translate to other platforms.

## Next Implementation Slice

Only after [tauri-tray-manual-checklist.md](tauri-tray-manual-checklist.md) passes:

1. Normalize tray behavior based on actual manual findings.
2. Decide close-to-tray versus close-to-exit.
3. Keep storage on WebView `localStorage`.
4. Replace placeholder tray icon only if product art is ready.
5. Update docs with the confirmed tray behavior.

Do not implement startup at login, auto-update, installer publishing, network sync, import/export, or QQ integrations in the first productization slice.
