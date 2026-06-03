# Technical Plan

## Stack

- Vite for local development and build.
- React and TypeScript for UI and typed state.
- Vitest and React Testing Library for behavior and component tests.
- Plain CSS for the first pixel-home visual system.
- Browser `localStorage` for the MVP persistence layer.

## Current Architecture

- `src/types/domain.ts` defines the app state, members, statuses, and settings.
- `src/data/statusPresets.ts` owns status labels, descriptions, places, and selectability.
- `src/domain/appState.ts` owns add/remove/status state transitions.
- `src/domain/statusLogic.ts` owns effective status and expiration fallback logic.
- `src/domain/statusExpiration.ts` owns preset expiration calculations.
- `src/storage/localStorageStore.ts` owns storage normalization and corrupt-data recovery.
- `src/app/usePixelHomeApp.ts` is the app-state hook used by React.
- `src/components/*` contains focused UI components.

## Completed Milestones

1. Project baseline with Vite, React, TypeScript, tests, lint, and build.
2. Domain model for virtual members and status presets.
3. localStorage persistence with invalid/corrupt data recovery.
4. Pixel-home UI connected to app state.
5. Member deletion with two-click confirmation.
6. UI component split for maintainability.
7. Status notes and preset expirations.
8. Browser smoke checks and ChatGPT web review after implementation rounds.

## Privacy Rules

- Do not connect to QQ private APIs.
- Do not read QQ chat content.
- Do not infer status from private behavior.
- Do not store real QQ numbers by default.
- Keep all MVP data local to the browser.

## Test Strategy

- Unit tests for status expiration and fallback behavior.
- Unit tests for app-state helpers.
- Persistence tests for valid, invalid, and corrupt stored data.
- Component tests for forms, status buttons, and member cards.
- App integration tests for add, status set, note, expiration, persistence, and deletion.
- Browser smoke checks for the complete happy path.

## Known Technical Limits

- Expiration fallback is recalculated when React renders; there is no timer-driven countdown.
- `end_of_day` uses the runtime local timezone.
- localStorage is not a sync or backup mechanism.
- The app currently has no import/export format.
