# status4fpb

QQ 群友状态家园：一个本地优先的趣味状态板，用像素小镇展示群友的虚拟状态。

## Implemented

- Web MVP built with Vite, React, and TypeScript.
- Pixel-home shell page with the required status labels `套卷中` and `缩圈中`.
- Test, lint, and build scripts.
- Product, technical, and review documentation.

## Planned

- Manual member creation and status setting.
- Status expiration and fallback behavior.
- Browser localStorage persistence.
- More pixel-home status rooms and member sprites.

## Boundaries

- No QQ private APIs.
- No unauthorized monitoring or chat scraping.
- No real QQ IDs stored by default.
- Local-first data direction.

## Scripts

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Docs

- Product boundary: `docs/product-design.md`
- Technical plan: `docs/technical-plan.md`
- Review checklist: `docs/review-checklist.md`
- Superpowers spec: `docs/superpowers/specs/2026-06-03-qq-status-pixel-home-design.md`
