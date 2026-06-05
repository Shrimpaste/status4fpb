# status4fpb

QQ群友状态家园：一个本地优先的趣味状态板，用像素小镇展示虚拟群友当前状态。

## Current MVP

status4fpb currently supports local, manually entered status paths:

- Add local virtual group members with display names and simple pixel avatars.
- Set manual status presets, including `套卷中` and `缩圈中`.
- See status presets grouped by town-like meanings.
- Attach a short status note.
- Pick a preset expiration: `不过期`, `30 分钟`, `1 小时`, `2 小时`, or `今天结束前`.
- Fall back to `失联中` after a status expires.
- Delete members with a two-click local confirmation.
- Reset the whole local pixel home with a two-click local confirmation.
- Persist MVP data in this browser's `localStorage`.
- Recover safely from corrupt or invalid stored data.
- Try a local shared town lab for demo-only room state.
- Use a local invite link checker that only parses links, does not auto-join, and does not network.

## MVP Safety Boundaries

status4fpb is a local-first, manual-only prototype.

It does not:

- connect to QQ.
- use QQ private APIs.
- run a QQ bot.
- read or scrape chat messages.
- monitor private behavior.
- upload member or status data.
- store real QQ IDs, cookies, tokens, chat content, member secrets, credentials, or authorization data.
- provide real cloud sync or real shared rooms.
- treat invite links as real join links.

Current member names, notes, and statuses are user-entered virtual data kept on the local device. The shared town lab and invite link checker are local demos only.

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
- No cloud or multi-device sync.
- No import/export flow yet.
- No automatic QQ status detection.
- No real QQ group member sync.
- No real shared rooms.
- No invite link auto-join flow.
- No storage of cookie, token, memberSecret, credential, authorization, chat content, QQ ID, or uin values.
- No real-time countdown refresh. Expiration is reflected when the app renders again, such as after refresh or another state change.
- `今天结束前` uses the user's current browser local timezone.

## Local Data

MVP data is stored in this browser `localStorage` key:

```text
qq-status-pixel-home:v1
```

Use `重置本地家园` inside the app to clear it. This only clears status4fpb data in the current browser and does not affect any QQ data. You can also remove the key from browser DevTools under Application/Storage -> Local Storage.

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

Use [docs/mvp-acceptance.md](docs/mvp-acceptance.md) for the full hand-check checklist and [docs/release-checklist.md](docs/release-checklist.md) for the release gate.

Short version:

1. Add a member.
2. Set `套卷中`.
3. Add a note.
4. Select `1 小时`.
5. Refresh and confirm the member, status, note, and expiration are restored.
6. Delete the member or reset the home and confirm the empty state returns.

## Development Continuity

This project uses a long-running Codex implementation + ChatGPT web review loop. If context is compacted or the thread is resumed later, start from [docs/continuity.md](docs/continuity.md) to recover the persistent task rules, product boundaries, review loop, and roadmap.

## Project Docs

- Product boundary: [docs/product-design.md](docs/product-design.md)
- Technical plan: [docs/technical-plan.md](docs/technical-plan.md)
- Review checklist: [docs/review-checklist.md](docs/review-checklist.md)
- Release checklist: [docs/release-checklist.md](docs/release-checklist.md)
- Continuity notes: [docs/continuity.md](docs/continuity.md)
- MVP acceptance: [docs/mvp-acceptance.md](docs/mvp-acceptance.md)
- Pixel town visual direction: [docs/pixel-town-visual-direction.md](docs/pixel-town-visual-direction.md)
- Superpowers spec: [docs/superpowers/specs/2026-06-03-qq-status-pixel-home-design.md](docs/superpowers/specs/2026-06-03-qq-status-pixel-home-design.md)
