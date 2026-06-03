# QQ Status UI Closed Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect domain logic and localStorage persistence to the UI so users can add virtual members, set statuses, save automatically, and reload persisted state.

**Architecture:** Add a small application hook that owns browser-local dependencies: storage, id generation, and current time. Keep domain functions pure and keep App focused on rendering and event wiring.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, localStorage.

---

## File Structure

- Create `src/app/usePixelHomeApp.ts`: hook for loading state, adding members, setting statuses, and saving through injected/local storage.
- Create `src/app/createMemberId.ts`: browser-local member id generator.
- Modify `src/App.tsx`: add member form, member cards, status buttons, and effective status display.
- Modify `src/App.css`: style the interactive roster and controls.
- Modify `src/App.test.tsx`: replace static shell test with UI closed-loop tests.

## Task 1: UI Closed Loop Tests

**Files:**
- Modify: `src/App.test.tsx`

- [x] **Step 1: Write failing tests**

Cover empty state, adding a member and saving, setting "套卷中" and saving, setting "缩圈中", and initial render from storage.

- [x] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because the UI still has a disabled placeholder button.

## Task 2: Hook And UI Implementation

**Files:**
- Create: `src/app/createMemberId.ts`
- Create: `src/app/usePixelHomeApp.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [x] **Step 1: Implement minimal hook**

Load from `createLocalStorageStore(window.localStorage)`, expose `addMember(displayName)` and `setStatus(memberId, statusKey)`, and save after each mutation.

- [x] **Step 2: Implement minimal UI**

Render an add-member form, status buttons per member, effective status text, and pixel-home member sprites/cards.

- [x] **Step 3: Run App tests**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

## Task 3: Full Verification, Browser Check, Review

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [x] **Step 2: Browser verification**

Open `http://127.0.0.1:5173`, add a member, set a status, reload, and confirm persistence.

- [x] **Step 3: Self-review and ChatGPT web review**

Report changed files, verification output, browser findings, risks, and next direction.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "feat: connect status UI to local storage"
```
