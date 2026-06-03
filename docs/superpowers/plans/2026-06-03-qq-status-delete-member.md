# QQ Status Delete Member Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users delete virtual members from the UI, with a simple confirmation step and localStorage cleanup.

**Architecture:** Reuse existing domain `removeMember` in the app hook. Keep confirmation UI local to `App.tsx`; do not add modal infrastructure for this small MVP step.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library.

---

## Files

- Modify `src/app/usePixelHomeApp.ts`: expose `removeVirtualMember(memberId)`.
- Modify `src/App.tsx`: add two-click delete control per member card.
- Modify `src/App.css`: style delete action.
- Modify `src/App.test.tsx`: cover deletion confirmation and persisted cleanup.

## Task 1: Delete Member UI

- [x] **Step 1: Write failing tests**

Add tests that first delete click only asks for confirmation, second click removes the member, and localStorage no longer contains the member or status.

- [x] **Step 2: Run App tests to verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because delete controls do not exist.

- [x] **Step 3: Implement hook and UI**

Expose `removeVirtualMember`, add pending delete state, render `删除` then `确认删除` flow, and save after removal.

- [x] **Step 4: Run App tests to verify pass**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

## Task 2: Full Verification And Review

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [x] **Step 2: Browser verification**

Add a member, set a status, click delete once, confirm member remains, click confirm, verify member disappears and remains gone after reload.

- [x] **Step 3: Self-review and ChatGPT web review**

Report changed files, verification output, browser findings, risks, and next direction.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "feat: add member deletion flow"
```
