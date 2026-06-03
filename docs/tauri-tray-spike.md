# Tauri Tray Spike

## Goal

Validate whether the existing status4fpb Vite + React Web MVP can run inside a Tauri desktop shell with a minimal system tray menu, without adding new product behavior.

## Scope

This spike covers:

- Tauri v2 desktop shell setup.
- Reuse of the existing Vite dev server and `dist` production build.
- A main desktop window titled `status4fpb`.
- A system tray icon using the generated Tauri placeholder icon.
- Rust-side tray menu items:
  - `打开家园`
  - `隐藏窗口`
  - `退出`
- A config regression test for Tauri scripts, config, and tray entry points.

This spike does not cover:

- QQ Bot integration.
- Network sync.
- Import or export.
- Real-time countdown refresh.
- Pixel-town visual redesign.
- Startup at login.
- Auto-update.
- Installer packaging.
- Tray shortcuts for setting statuses.
- Data migration.

## Versions And References

- Node.js: `v24.13.0`
- npm: `11.14.0`
- Rust: `rustc 1.94.0`
- Cargo: `cargo 1.94.0`
- `@tauri-apps/cli`: `2.11.2`
- `@tauri-apps/api`: `2.11.0`
- Rust `tauri` crate: `2.11.2`

Official references checked during this spike:

- Tauri prerequisites: <https://v2.tauri.app/start/prerequisites/>
- Tauri configuration files: <https://v2.tauri.app/develop/configuration-files/>
- Tauri system tray: <https://v2.tauri.app/learn/system-tray/>

## Implementation Notes

- `src-tauri/tauri.conf.json` points `devUrl` at `http://localhost:5173` and `frontendDist` at `../dist`.
- `beforeDevCommand` uses `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` so Tauri dev cannot silently drift to another Vite port.
- `beforeBuildCommand` remains `npm run build`.
- `src-tauri/Cargo.toml` enables the Tauri `tray-icon` feature.
- Tray behavior lives in `src-tauri/src/lib.rs`, keeping React focused on the status4fpb UI.
- The tray icon uses Tauri's generated placeholder icon assets. Product-grade tray art is intentionally deferred.

## Verification

Automated checks run during the spike:

```bash
npm test
npm run lint
npm run build
cargo fmt --check
cargo check
```

Observed results:

- `npm test`: 9 test files / 45 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `cargo fmt --check`: passed after formatting generated Rust files.
- `cargo check`: passed.

Desktop smoke:

- Command: `npm run tauri:dev`.
- Existing stale Vite process on port `5173` was stopped before the final smoke.
- Tauri started Vite on strict port `5173`.
- Tauri launched `target/debug/status4fpb.exe`.
- A desktop window with title `status4fpb` appeared.
- Edge WebView2 processes started under the Tauri app.
- The smoke process tree was stopped after verification, and no spawned process from that run remained.

Browser dev smoke:

- Command: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
- `http://127.0.0.1:5173/` returned HTTP `200`.
- The smoke process tree was stopped after verification, and no spawned process from that run remained.

## Tray Validation

Rust tray construction compiled and the app launched with the tray code enabled. The code defines:

- `open_home`: calls `get_webview_window("main")`, then `unminimize`, `show`, and `set_focus`.
- `hide_home`: hides the main window.
- `quit`: exits the app.

Visual tray icon presence and menu click behavior were not fully hand-tested in this run because the Windows Computer Use helper was unavailable. This remains the main manual validation gap before treating the tray interaction as product-ready.

Manual tray verification is tracked in [tauri-tray-manual-checklist.md](tauri-tray-manual-checklist.md). Current status:

- Verified: Tauri app starts, the desktop window appears, WebView2 starts, and the Rust tray code compiles and loads during app startup.
- Not verified: a human or automation helper can see the tray icon, open the tray menu, click `打开家园`, click `隐藏窗口`, and click `退出`.
- Blocker: the Windows Computer Use helper currently reports `Computer Use native pipe path is unavailable`.

## Local Storage Observation

The Tauri WebView process launched with a user data directory under:

```text
C:\Users\Lenovo\AppData\Local\com.status4fpb.app\EBWebView
```

This is separate from the Chrome browser profile used by the Web MVP. The current desktop spike continues to use WebView `localStorage` with the same app key, `qq-status-pixel-home:v1`, but browser data should not be assumed to appear in the desktop app automatically.

No data migration was added. A future desktop product pass should decide whether to keep WebView `localStorage`, move to a Tauri store plugin, or use a local JSON file.

## Follow-Up Risks

- Tray menu click behavior needs direct hand validation on Windows.
- Tauri generated icon assets are placeholders.
- Desktop WebView storage is isolated from browser storage.
- The package identifier is now `com.status4fpb.app`; changing it later may change the WebView data path.
- Installer packaging, auto-update, and startup behavior are intentionally out of scope.
