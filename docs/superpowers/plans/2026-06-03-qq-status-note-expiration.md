# QQ Status Note Expiration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users attach a short note and a preset expiration time when setting a member status.

**Architecture:** Reuse existing `MemberStatus.note` and `MemberStatus.expiresAt` fields. Add a small pure expiration helper, keep storage normalization defensive, and pass note/expiration through app-layer callbacks without moving domain or storage logic into presentational components.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library.

---

## Files

- Create `src/domain/statusExpiration.ts`: expiration preset keys and `computeExpiresAt`.
- Create `src/domain/statusExpiration.test.ts`: deterministic unit tests for preset math.
- Modify `src/storage/localStorageStore.ts`: reject persisted statuses with invalid `expiresAt`.
- Modify `src/storage/localStorageStore.test.ts`: cover valid note/expiresAt preservation and invalid expiration rejection.
- Modify `src/app/usePixelHomeApp.ts`: accept status input object with `statusKey`, `note`, and `expirationPreset`.
- Modify `src/components/MemberStatusCard.tsx`: render note input, expiration select, current note/expiry display, and pass detail object when status buttons are clicked.
- Modify `src/components/MemberStatusCard.test.tsx`: cover note/expiration callback and expired fallback not showing stale note.
- Modify `src/App.tsx`: adapt status callback type.
- Modify `src/App.test.tsx`: cover note/expiresAt save/restore and expired fallback UI.
- Modify `src/App.css`: style the compact note/expiration controls.

## Task 1: Expiration Helper And Storage Guard

- [x] **Step 1: Write failing tests**

Add `src/domain/statusExpiration.test.ts` and extend storage tests.

```tsx
import { describe, expect, it } from 'vitest'
import { computeExpiresAt } from './statusExpiration'

const NOW = '2026-06-03T12:00:00.000Z'

describe('status expiration presets', () => {
  it('returns no expiration for the none preset', () => {
    expect(computeExpiresAt('none', NOW)).toBeUndefined()
  })

  it('adds preset durations to the injected time', () => {
    expect(computeExpiresAt('thirty_minutes', NOW)).toBe(
      '2026-06-03T12:30:00.000Z',
    )
    expect(computeExpiresAt('one_hour', NOW)).toBe(
      '2026-06-03T13:00:00.000Z',
    )
    expect(computeExpiresAt('two_hours', NOW)).toBe(
      '2026-06-03T14:00:00.000Z',
    )
  })

  it('returns the end of the local day for end_of_day', () => {
    const expiresAt = computeExpiresAt('end_of_day', NOW)

    expect(expiresAt).toBeDefined()
    expect(Date.parse(expiresAt ?? '')).toBeGreaterThan(Date.parse(NOW))
  })
})
```

Add to `src/storage/localStorageStore.test.ts`:

```tsx
it('drops persisted statuses with invalid expiresAt values', () => {
  const storage = new MemoryStorage()
  const state = createPopulatedState()
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      statuses: {
        m1: {
          ...state.statuses.m1,
          expiresAt: 'not-a-date',
        },
      },
    }),
  )

  const loaded = createLocalStorageStore(storage).load()

  expect(loaded.members).toEqual(state.members)
  expect(loaded.statuses).toEqual({})
})
```

- [x] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/domain/statusExpiration.test.ts src/storage/localStorageStore.test.ts
```

Expected: FAIL because `statusExpiration` does not exist and invalid `expiresAt` is currently accepted.

- [x] **Step 3: Implement expiration helper and storage guard**

Create `src/domain/statusExpiration.ts`.

```ts
export type ExpirationPresetKey =
  | 'none'
  | 'thirty_minutes'
  | 'one_hour'
  | 'two_hours'
  | 'end_of_day'

const durationByPreset: Partial<Record<ExpirationPresetKey, number>> = {
  thirty_minutes: 30 * 60 * 1000,
  one_hour: 60 * 60 * 1000,
  two_hours: 2 * 60 * 60 * 1000,
}

export function computeExpiresAt(
  preset: ExpirationPresetKey,
  now: string,
): string | undefined {
  if (preset === 'none') {
    return undefined
  }

  const nowDate = new Date(now)
  const nowMs = nowDate.getTime()

  if (Number.isNaN(nowMs)) {
    return undefined
  }

  if (preset === 'end_of_day') {
    const endOfDay = new Date(nowDate)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay.toISOString()
  }

  const duration = durationByPreset[preset]
  return duration ? new Date(nowMs + duration).toISOString() : undefined
}

export function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}
```

Modify `normalizeMemberStatus` so an invalid `expiresAt` returns `null`.

- [x] **Step 4: Run tests to verify GREEN**

Run:

```bash
npm test -- src/domain/statusExpiration.test.ts src/storage/localStorageStore.test.ts
```

Expected: PASS.

## Task 2: UI And App Wiring

- [x] **Step 1: Write failing component and App tests**

Update component and App tests before production UI changes.

Required assertions:

- `MemberStatusCard` calls `onSelectStatus(memberId, { statusKey, note, expirationPreset })`.
- `MemberStatusCard` displays current note only when `status.source === 'current'` and `status.note` exists.
- App saves note and an `expiresAt` when status is set with the `1 小时` preset.
- App renders persisted current note after startup.
- App renders expired fallback and does not render the old note for expired statuses.

- [x] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/components/MemberStatusCard.test.tsx src/App.test.tsx
```

Expected: FAIL because UI controls and new callback shape do not exist.

- [x] **Step 3: Implement hook input and UI controls**

Update `src/app/usePixelHomeApp.ts`.

```ts
export type SetVirtualMemberStatusInput = {
  statusKey: SelectableStatusKey
  note?: string
  expirationPreset?: ExpirationPresetKey
}
```

Use `computeExpiresAt(input.expirationPreset ?? 'none', now)` and pass trimmed note/expiresAt into `setMemberStatus`.

Update `src/components/MemberStatusCard.tsx`:

- Add local `note` and `expirationPreset` state.
- Add note input labelled `状态备注`.
- Add select labelled `有效期`.
- Display `备注：...` for current statuses with a note.
- Display `有效期至：...` for current statuses with an `expiresAt`.
- Keep delete behavior unchanged.

Update `src/App.tsx` callback to accept `SetVirtualMemberStatusInput`.

- [x] **Step 4: Run tests to verify GREEN**

Run:

```bash
npm test -- src/components/MemberStatusCard.test.tsx src/App.test.tsx
```

Expected: PASS.

## Task 3: Full Verification And Review

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [x] **Step 2: Browser smoke test**

In the local app:

1. Start from empty state.
2. Add a member.
3. Type a note.
4. Select `1 小时`.
5. Set `套卷中`.
6. Confirm note and expiration text appear.
7. Reload and confirm note remains.
8. Delete the member and confirm empty state returns.

- [x] **Step 3: Self-review and ChatGPT web review**

Report changed files, verification output, browser findings, risks, and confirm no QQ private API or real monitoring was added.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "feat: add status notes and expirations"
```
