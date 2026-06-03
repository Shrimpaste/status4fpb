# QQ Status Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tested localStorage persistence layer for the QQ status app state.

**Architecture:** Keep persistence outside React and inject a Storage-like dependency for deterministic tests. Loading must tolerate missing, corrupt, or invalid data by returning `createEmptyAppState()`.

**Tech Stack:** TypeScript, Vitest, browser Storage-compatible interface.

---

## File Structure

- Create `src/storage/localStorageStore.ts`: storage key, injected store factory, load/save/clear, and light schema normalization.
- Create `src/storage/localStorageStore.test.ts`: persistence behavior tests.

## Task 1: localStorage Store

**Files:**
- Create: `src/storage/localStorageStore.ts`
- Test: `src/storage/localStorageStore.test.ts`

- [x] **Step 1: Write the failing test**

Create tests for empty load, save/load roundtrip, corrupt JSON fallback, invalid shape fallback, fixed key use, clear, and sensitive-field sanitization.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/storage/localStorageStore.test.ts`

Expected: FAIL because `localStorageStore` does not exist.

- [x] **Step 3: Write minimal implementation**

Create `STORAGE_KEY = 'qq-status-pixel-home:v1'` and `createLocalStorageStore(storage)` returning `{ load, save, clear }`. Implement lightweight runtime guards for known state shape and sanitize saved data to only known app-state fields.

- [x] **Step 4: Run storage test to verify it passes**

Run: `npm test -- src/storage/localStorageStore.test.ts`

Expected: PASS.

## Task 2: Full Verification And Review

**Files:**
- Review all changed files.

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [x] **Step 2: Self-review**

Confirm corrupt data cannot crash load, invalid stored status keys are dropped or recovered, `unknown` cannot be persisted as a member status, and no sensitive QQ fields are serialized.

- [x] **Step 3: Send review to ChatGPT web thread**

Report changed files, verification output, self-review findings, and ask whether to commit.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "feat: add local storage persistence"
```
