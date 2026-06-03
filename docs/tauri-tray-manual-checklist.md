# Tauri Tray Manual Checklist

Use this checklist when a human tester or a restored Windows Computer Use helper can validate the real system tray behavior. Do not mark tray interaction as fully verified until these steps pass on Windows.

## Preconditions

- Running on Windows.
- Rust and Tauri prerequisites are installed.
- The working tree is clean.
- No process is using port `5173`.
- No stale `status4fpb.exe` process is running.
- The tester can see the Windows notification area and overflow tray.

## Commands

Run from the repository root:

```bash
npm test
npm run lint
npm run build
```

Run from `src-tauri`:

```bash
cargo fmt --check
cargo check
```

Start the desktop app from the repository root:

```bash
npm run tauri:dev
```

## Manual Steps

1. Confirm the desktop window opens and displays status4fpb.
2. Confirm the Web MVP remains usable inside the Tauri window:
   - Add a virtual member.
   - Set a status.
   - Delete or reset back to an empty home.
3. Confirm a status4fpb tray icon is visible in the Windows system tray or overflow area.
4. Open the tray menu.
5. Click `打开家园`.
6. Confirm the main window is shown and focused.
7. Click `隐藏窗口`.
8. Confirm the main window hides.
9. Open the tray menu again and click `打开家园`.
10. Confirm the main window returns and is focused.
11. Click `退出`.
12. Confirm the app exits and no `status4fpb.exe` process remains.
13. Confirm browser dev mode still works independently:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Then open `http://127.0.0.1:5173/`.

## Expected Result

- All command checks pass.
- The Tauri window opens and hosts the existing Web MVP.
- The tray icon is visible.
- The tray menu opens.
- `打开家园` shows and focuses the main window.
- `隐藏窗口` hides the main window.
- `退出` exits the app and cleans up the process.
- Browser dev mode remains independent and usable.

## Current Status

- Automated command checks pass.
- Tauri dev smoke confirms `status4fpb.exe`, the desktop window, Vite strict port `5173`, and Edge WebView2 launch.
- Rust tray code compiles and is loaded during app startup.
- Manual tray icon visibility and menu click behavior are still blocked because the Windows Computer Use helper reports: `Computer Use native pipe path is unavailable`.
- Awaiting human validation or restored Computer Use access.
