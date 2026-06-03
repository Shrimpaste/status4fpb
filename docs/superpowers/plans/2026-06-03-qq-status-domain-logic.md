# QQ Status Domain Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tested, UI-independent member and status domain logic for the QQ group status home.

**Architecture:** Keep domain types, preset data, and state transitions outside React. UI code will consume these modules later, but this plan only creates pure functions with injected time and deterministic tests.

**Tech Stack:** TypeScript, Vitest.

---

## File Structure

- Create `src/types/domain.ts`: shared domain types for members, statuses, app state, and options.
- Create `src/data/statusPresets.ts`: status preset metadata and type guard helpers.
- Create `src/domain/statusLogic.ts`: status expiration and effective-status helpers.
- Create `src/domain/appState.ts`: immutable app-state transitions for members and statuses.
- Create `src/domain/statusLogic.test.ts`: TDD tests for presets, expiration, and fallback.
- Create `src/domain/appState.test.ts`: TDD tests for member and status state transitions.

## Task 1: Status Presets And Effective Status Logic

**Files:**
- Create: `src/types/domain.ts`
- Create: `src/data/statusPresets.ts`
- Create: `src/domain/statusLogic.ts`
- Test: `src/domain/statusLogic.test.ts`

- [x] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import { getEffectiveStatus, isStatusExpired } from './statusLogic'

const NOW = '2026-06-03T12:00:00.000Z'

describe('status logic', () => {
  it('includes the required status presets', () => {
    expect(STATUS_PRESETS.exam_paper.label).toBe('套卷中')
    expect(STATUS_PRESETS.scope_shrinking.label).toBe('缩圈中')
  })

  it('detects expired and active statuses using injected time', () => {
    expect(
      isStatusExpired(
        { memberId: 'm1', statusKey: 'exam_paper', startedAt: NOW, updatedAt: NOW, expiresAt: '2026-06-03T11:59:59.000Z' },
        NOW,
      ),
    ).toBe(true)

    expect(
      isStatusExpired(
        { memberId: 'm1', statusKey: 'exam_paper', startedAt: NOW, updatedAt: NOW, expiresAt: '2026-06-03T12:30:00.000Z' },
        NOW,
      ),
    ).toBe(false)
  })

  it('returns unknown when a member has no status', () => {
    expect(getEffectiveStatus('missing', {}, NOW).label).toBe('未知')
  })

  it('falls back to offline when a status is expired', () => {
    const effective = getEffectiveStatus(
      'm1',
      {
        m1: { memberId: 'm1', statusKey: 'scope_shrinking', startedAt: NOW, updatedAt: NOW, expiresAt: '2026-06-03T11:00:00.000Z' },
      },
      NOW,
      { expiredFallback: 'offline' },
    )

    expect(effective.statusKey).toBe('offline')
    expect(effective.label).toBe('失联中')
  })
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/statusLogic.test.ts`

Expected: FAIL because the imported modules do not exist yet.

- [x] **Step 3: Write minimal implementation**

Create `src/types/domain.ts`, `src/data/statusPresets.ts`, and `src/domain/statusLogic.ts` with the types, presets, `isStatusExpired`, and `getEffectiveStatus` needed by the tests.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/statusLogic.test.ts`

Expected: PASS.

## Task 2: App State Transitions

**Files:**
- Modify: `src/types/domain.ts`
- Modify: `src/domain/appState.ts`
- Test: `src/domain/appState.test.ts`

- [x] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { addMember, createEmptyAppState, removeMember, setMemberStatus } from './appState'

const NOW = '2026-06-03T12:00:00.000Z'

describe('app state transitions', () => {
  it('adds a virtual member without real QQ identifiers', () => {
    const next = addMember(createEmptyAppState(), { id: 'm1', displayName: '北北', avatarKey: 'orange' }, NOW)

    expect(next.members).toEqual([
      { id: 'm1', displayName: '北北', avatarKey: 'orange', createdAt: NOW, updatedAt: NOW },
    ])
  })

  it('sets required statuses for a member', () => {
    const withMember = addMember(createEmptyAppState(), { id: 'm1', displayName: '北北', avatarKey: 'orange' }, NOW)
    const next = setMemberStatus(withMember, { memberId: 'm1', statusKey: 'exam_paper', note: '2022 真题', expiresAt: '2026-06-03T14:00:00.000Z' }, NOW)

    expect(next.statuses.m1).toMatchObject({
      memberId: 'm1',
      statusKey: 'exam_paper',
      note: '2022 真题',
      startedAt: NOW,
      updatedAt: NOW,
      expiresAt: '2026-06-03T14:00:00.000Z',
    })
  })

  it('removes member status when removing a member', () => {
    const withMember = addMember(createEmptyAppState(), { id: 'm1', displayName: '北北', avatarKey: 'orange' }, NOW)
    const withStatus = setMemberStatus(withMember, { memberId: 'm1', statusKey: 'scope_shrinking' }, NOW)
    const next = removeMember(withStatus, 'm1')

    expect(next.members).toEqual([])
    expect(next.statuses.m1).toBeUndefined()
  })

  it('rejects setting status for a missing member', () => {
    expect(() =>
      setMemberStatus(createEmptyAppState(), { memberId: 'missing', statusKey: 'exam_paper' }, NOW),
    ).toThrow('Cannot set status for missing member: missing')
  })
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/appState.test.ts`

Expected: FAIL because `appState` does not exist.

- [x] **Step 3: Write minimal implementation**

Create `src/domain/appState.ts` with immutable helpers: `createEmptyAppState`, `addMember`, `removeMember`, and `setMemberStatus`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/domain/appState.test.ts`

Expected: PASS.

## Task 3: Full Verification And Commit

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

Check that no domain type stores real QQ IDs, all time-dependent behavior accepts `now` as a parameter, and React UI imports no domain logic yet.

- [x] **Step 3: Send review to ChatGPT web thread**

Report changed files, verification output, self-review findings, and ask whether to commit.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "feat: add qq status domain logic"
```
