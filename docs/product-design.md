# Product Design

## Product Boundary

This app is a fun QQ group friend status display, not a QQ automation client. The MVP is manual and local-first. It avoids private QQ APIs, unauthorized monitoring, chat scraping, and real QQ identifiers unless a later user-approved design adds them safely.

## MVP

- Show a pixel-home scene for group friends.
- Include status presets "套卷中" and "缩圈中".
- Use virtual members with display names and simple avatar styles.
- Let users add members and set statuses in later MVP tasks.
- Persist local data in the browser.
- Keep status logic testable outside the UI.

## Visual Feel

The app should feel like a compact study-town dashboard: playful, pixel-like, and immediately usable. The first screen is the status home itself, with a map preview and status cards rather than a landing page.

## Open Product Questions

- Should the final packaging remain a web app, or become a Windows desktop utility later?
- Should expired statuses default to "失联中" or "空闲中"?
- Which extra status presets should ship beyond "套卷中" and "缩圈中"?
