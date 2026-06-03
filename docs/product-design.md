# Product Design

## Product Boundary

This app is a fun QQ group friend status display, not a QQ automation client. The MVP is manual and local-first. It avoids private QQ APIs, unauthorized monitoring, chat scraping, and real QQ identifiers.

## MVP Behavior

- Show a pixel-home scene for virtual group friends.
- Include status presets `套卷中` and `缩圈中`.
- Let users add virtual members with display names.
- Let users set manual statuses.
- Let users add a short note to the status.
- Let users choose a preset expiration.
- Use `失联中` as the expired fallback by default.
- Persist local data in the browser.
- Let users delete members with a confirmation step.

## Visual Feel

The app should feel like a compact study-town dashboard: playful, pixel-like, and immediately usable. The first screen is the status home itself, with a map preview and status cards rather than a landing page.

## Current Non-Goals

- Automatic QQ status monitoring.
- QQ Bot integration.
- Real QQ IDs or account binding.
- Cloud sync.
- Custom date/time picker.
- Real-time countdown UI.

## Open Product Questions

- Should the final packaging remain a web app, or become a Windows desktop utility later?
- Should the expired fallback remain `失联中`, or should users be able to choose `空闲中`?
- Should import/export be added before any QQ-adjacent integration is considered?
