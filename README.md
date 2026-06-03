# status4fpb

QQ群友状态家园：一个本地优先的趣味状态板，用像素小镇展示虚拟群友当前状态。

## Current MVP

- Add virtual group members with display names and simple pixel avatars.
- Set manual status presets, including `套卷中` and `缩圈中`.
- Attach a short status note.
- Pick a preset expiration: `不过期`, `30 分钟`, `1 小时`, `2 小时`, or `今天结束前`.
- Fall back to `失联中` after a status expires.
- Delete members with a two-click confirmation.
- Persist all MVP data in browser `localStorage`.
- Recover safely from corrupt or invalid stored data.

## Privacy And Scope

This is not a QQ automation client.

- No QQ private APIs.
- No QQ Bot integration.
- No chat scraping.
- No unauthorized monitoring.
- No real QQ IDs, cookies, or tokens stored by default.
- No network transfer for MVP status data.

The current app is a manual local web UI. All member names, notes, and statuses are user-entered virtual data.

## Known Limitations

- Data is stored only in the current browser's `localStorage`.
- No multi-device sync.
- No import/export flow yet.
- No automatic QQ status detection.
- No real-time countdown refresh. Expiration is reflected when the app renders again, such as after refresh or another state change.
- `今天结束前` uses the user's current browser local timezone.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Verify

```bash
npm test
npm run lint
npm run build
```

## Manual Acceptance

Use [docs/mvp-acceptance.md](docs/mvp-acceptance.md) for the full hand-check checklist.

Short version:

1. Add a member.
2. Set `套卷中`.
3. Add a note.
4. Select `1 小时`.
5. Refresh and confirm the member, status, note, and expiration are restored.
6. Delete the member and confirm the empty state returns.

## Project Docs

- Product boundary: [docs/product-design.md](docs/product-design.md)
- Technical plan: [docs/technical-plan.md](docs/technical-plan.md)
- Review checklist: [docs/review-checklist.md](docs/review-checklist.md)
- MVP acceptance: [docs/mvp-acceptance.md](docs/mvp-acceptance.md)
- Superpowers spec: [docs/superpowers/specs/2026-06-03-qq-status-pixel-home-design.md](docs/superpowers/specs/2026-06-03-qq-status-pixel-home-design.md)
