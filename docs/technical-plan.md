# Technical Plan

## Stack

- Vite for local development and build.
- React and TypeScript for UI and typed state.
- Vitest and React Testing Library for behavior and component tests.
- Plain CSS for the first pixel-home visual system.

## Milestones

1. Project baseline: initialize git, scaffold Vite, add test runner, replace the default page with a project shell.
2. Domain model: add status presets, member types, expiration helpers, and tests.
3. Persistence: add localStorage load/save with corrupt-data recovery and tests.
4. Member/status editing: add forms for member creation and status updates with component tests.
5. Visual polish: map members to rooms, improve responsive layout, and verify in browser screenshots.
6. Review hardening: run lint, tests, build, manual UI checks, and ChatGPT web review after each implementation round.

## Privacy Rules

- Do not connect to QQ private APIs.
- Do not read QQ chat content.
- Do not infer status from private behavior.
- Do not store real QQ numbers by default.
- Keep all MVP data local to the browser.

## Test Strategy

- Unit tests for status expiration and fallback behavior.
- Unit tests for app-state reducers or helpers.
- Persistence tests for valid and corrupt stored data.
- Component tests for the home shell, member list, and status editor.
- Browser checks for layout, non-overlap, and responsive presentation.
