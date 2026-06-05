# status4fpb Continuity Notes

## Persistent Task Reminder

Continue iterating until the user explicitly interrupts or redirects the work. Do not stop after an ordinary implementation round. Every round must follow this loop:

1. Make a small scoped change.
2. Review all changed code and docs.
3. Run `npm test`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Run a browser smoke or acceptance check when UI or behavior changes.
7. Report the result to the ChatGPT web review thread.
8. Continue according to the web review result.

The web ChatGPT reviewer should also include this reminder at the start of each response:

> 持久任务提醒：继续迭代，不要在未被用户中断前自行停止；每轮实现后必须自审、验证、向网页端 GPT 复审，再按复审意见继续。

## Product Direction

status4fpb is a local-first QQ group friend status toy. The current Web MVP uses a pixel-home metaphor for virtual group members and manual statuses. The longer-term direction is a daily-use tray-style companion, but the product must keep explicit privacy boundaries before any desktop or integration work.

Future major UI redesigns should explore a broad cozy pixel-town and life-sim mood direction: readable top-down landmarks, a lived-in village atmosphere, varied seasonal color, and compact tool-like usability. Treat this as mood and interaction inspiration only; do not copy Stardew Valley or any specific assets, layouts, characters, UI chrome, map structure, palette-identifying details, or franchise style. Before a large visual pass, gather current reference components/design tools and discuss the direction with the ChatGPT web review thread.

## Current MVP

- Add virtual members.
- Set manual statuses, including `套卷中` and `缩圈中`.
- Group status presets by town-like meanings.
- Add short status notes.
- Choose preset expiration times.
- Fall back to `失联中` after expiration.
- Persist data in browser `localStorage`.
- Delete members with two-click confirmation.
- Reset the whole local home with two-click confirmation.
- Clarify empty, delete, and reset copy as local-only.
- Expose status button selected state and visible keyboard focus.
- Respect reduced motion.
- Offer a local shared town lab and invite link checker that do not network or auto-join.
- Recover from corrupt or invalid stored data.
- Verify with automated tests, lint, build, browser smoke checks, and web GPT review.

## Release Polish State

- `codex/status-preset-groups-v1` grouped status controls by town semantics.
- `codex/release-polish-accessibility-v1` added status control selected semantics, visible focus, and reduced-motion hardening.
- `codex/release-polish-empty-reset-v1` clarified local-only empty state, delete, reset, and shared-lab copy.
- The next agent should run [release-checklist.md](release-checklist.md) before proposing a release-ready slice.
- Untracked `CLAUDE.md`, `chatgpt*.png`, and `screenshot*.png` files are local artifacts unless the user explicitly asks to add them.
- Any shared-town real implementation, Tauri tray work, network behavior, external dependency, or visual component/tool adoption needs ChatGPT web review before implementation.

## Collaboration Loop

Codex is the implementer and local verifier. The ChatGPT web thread is the external architecture and code-review partner. For each round:

- Codex implements in small branches and commits only after review.
- Codex reports changed files, test results, browser results, risks, and proposed next steps.
- Web GPT checks scope, architecture, privacy, tests, and next direction.
- Codex follows web GPT's explicit next-step instruction unless the user interrupts.

## Review Checklist

Each round should answer:

- Is the change narrowly scoped?
- Did tests fail first when behavior changed?
- Do `npm test`, `npm run lint`, and `npm run build` pass?
- Did UI changes get a browser check?
- Are destructive actions confirmed?
- Does storage reject or drop invalid data conservatively?
- Does documentation avoid promising unimplemented features?
- Does the change avoid QQ private APIs, chat scraping, unauthorized monitoring, real QQ IDs, cookies, and tokens?

## Hard Boundaries

Do not add any of these without a new explicit design and user approval:

- QQ private APIs.
- QQ client scraping.
- Chat monitoring.
- Automatic status inference from private behavior.
- Real QQ ID storage by default.
- Cookies, tokens, or credential storage.
- Network transfer of MVP status data.

## Current Local Data

The MVP stores data in browser `localStorage` under:

```text
qq-status-pixel-home:v1
```

Use the in-app `重置本地家园` action to clear this key. It only clears this browser's local status4fpb data and does not affect any QQ data.

## Next Strategic Stages

1. `v0.1.0-mvp`: stable Web MVP, docs, acceptance, and release polish.
2. `v0.2`: Tauri tray spike, still local-first and manual.
3. `v0.3`: richer pixel-town visual system.
4. `v0.4`: optional invite-code shared town research with explicit user-provided data only.
5. `v0.5`: QQ official Bot explicit command research, avoiding private APIs and passive monitoring.

## Resume Procedure

After context compaction, interruption, or a new agent session:

1. Read this file.
2. Run `git status --short`.
3. Inspect recent commits with `git log --oneline --decorate --max-count=8`.
4. Run `npm test`, `npm run lint`, and `npm run build`.
5. Review [release-checklist.md](release-checklist.md) for the current release gate.
6. Open the local app and ChatGPT web review thread if continuing development.
7. Report current state to the web reviewer before choosing the next implementation step.
