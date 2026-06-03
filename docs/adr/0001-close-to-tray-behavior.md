# ADR 0001: Close-To-Tray Behavior

## Status

Proposed

## Context

status4fpb is moving from a local Web MVP toward a Windows-first tray toy app. The Tauri spike proves the desktop shell can launch and the Rust tray code can compile and load, but real tray icon visibility and menu click behavior are still pending manual verification.

For a tray companion app, users may expect the app to remain quickly available even when the main window is not visible. At the same time, early desktop behavior should avoid surprising Windows users or adding complex background behavior before the tray checklist passes.

This ADR is a product decision document only. It must not be implemented until [../tauri-tray-manual-checklist.md](../tauri-tray-manual-checklist.md) is completed by a human tester or a restored Computer Use environment.

## Decision

- Closing the main window should hide it to the system tray.
- Minimizing the main window should keep normal Windows taskbar minimize behavior for now.
- Tray `打开家园` should show, unminimize, and focus the main window.
- Tray `隐藏窗口` should hide the main window.
- Tray `退出` should be the explicit way to exit the desktop app.
- Startup at login is out of scope for this phase.
- Background network sync is out of scope for this phase.

## Consequences

Positive:

- The app behaves like a tray companion rather than a one-shot window.
- Accidental window close does not exit the app.
- The exit action remains explicit and easy to explain.
- Minimize keeps familiar Windows behavior while the product is still early.

Negative:

- Users may need lightweight UI copy or release notes to understand that close hides to tray.
- Tauri implementation will need close-event interception later.
- Tray interaction must be manually verified before this behavior is implemented.
- If tray behavior fails, close-to-tray would make the app harder to recover.

## Implementation Notes

- Do not implement close-to-tray in this ADR round.
- Do not change Rust window event handling in this ADR round.
- Do not change the existing tray menu in this ADR round.
- Later implementation should keep the Web MVP UI unchanged.
- Later implementation must run the full command gate:

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

- Later implementation must also pass [../tauri-tray-manual-checklist.md](../tauri-tray-manual-checklist.md).

## Non-Goals

- QQ Bot integration.
- Network sync.
- Import or export.
- Real-time countdown refresh.
- Pixel-town visual redesign.
- Startup at login.
- Auto-update.
- Installer publishing.
- Storage migration.

## Follow-Up

After the tray manual checklist passes:

1. Implement close-event interception in Tauri.
2. Verify close hides the window without exiting `status4fpb.exe`.
3. Verify tray `打开家园` restores the hidden window.
4. Verify tray `退出` terminates the process.
5. Update [../tauri-productization-plan.md](../tauri-productization-plan.md) with confirmed behavior.
