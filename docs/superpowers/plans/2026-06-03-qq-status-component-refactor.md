# QQ Status Component Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the MVP UI into focused React components without changing user-visible behavior.

**Architecture:** Keep `usePixelHomeApp` as the app-state boundary and keep domain/storage logic untouched. Extract presentational and form components under `src/components`, passing effective statuses and callbacks through props so the components do not read or write localStorage.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library.

---

## Files

- Create `src/components/AddMemberForm.tsx`: controlled nickname form with local input state, trimming, blank-name suppression, and `onAddMember(displayName)`.
- Create `src/components/AddMemberForm.test.tsx`: form-level tests for blank suppression and trimmed submission.
- Create `src/components/StatusButtonGroup.tsx`: renders selectable status buttons and never exposes `unknown`.
- Create `src/components/StatusButtonGroup.test.tsx`: verifies selectable labels and missing unknown button.
- Create `src/components/MemberStatusCard.tsx`: renders one member card, status buttons, and delete confirmation button.
- Create `src/components/MemberStatusCard.test.tsx`: verifies two-click delete flow.
- Create `src/components/PixelHomeMap.tsx`: renders the pixel home preview and empty state.
- Modify `src/App.tsx`: compose extracted components and keep only app-level state/callback wiring.
- Modify `src/App.test.tsx`: keep existing integration coverage unchanged unless import paths require updates.

## Task 1: Component Tests

- [x] **Step 1: Write failing component tests**

Create tests for the component APIs before production components exist.

```tsx
// src/components/AddMemberForm.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddMemberForm } from './AddMemberForm'

describe('AddMemberForm', () => {
  it('does not submit blank display names', () => {
    const onAddMember = vi.fn()
    render(<AddMemberForm onAddMember={onAddMember} />)

    fireEvent.change(screen.getByLabelText('群友昵称'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加群友' }))

    expect(onAddMember).not.toHaveBeenCalled()
  })

  it('submits trimmed display names and clears the input', () => {
    const onAddMember = vi.fn()
    render(<AddMemberForm onAddMember={onAddMember} />)

    const input = screen.getByLabelText('群友昵称')
    fireEvent.change(input, { target: { value: '  北北  ' } })
    fireEvent.click(screen.getByRole('button', { name: '添加群友' }))

    expect(onAddMember).toHaveBeenCalledWith('北北')
    expect(input).toHaveValue('')
  })
})
```

```tsx
// src/components/StatusButtonGroup.test.tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import { StatusButtonGroup } from './StatusButtonGroup'

describe('StatusButtonGroup', () => {
  it('renders selectable status labels without the unknown fallback', () => {
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '设置北北为套卷中' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '设置北北为缩圈中' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '设置北北为未知' })).toBeNull()
  })

  it('passes the selected status key to the callback', () => {
    const onSelectStatus = vi.fn()
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={onSelectStatus}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(onSelectStatus).toHaveBeenCalledWith('scope_shrinking')
  })
})
```

```tsx
// src/components/MemberStatusCard.test.tsx
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import type { EffectiveStatus, Member } from '../types/domain'
import { MemberStatusCard } from './MemberStatusCard'

const member: Member = {
  id: 'm1',
  displayName: '北北',
  avatarKey: 'orange',
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
}

const status: EffectiveStatus = {
  ...STATUS_PRESETS.exam_paper,
  memberId: 'm1',
  source: 'current',
}

describe('MemberStatusCard', () => {
  it('shows the current status and delegates status selection', () => {
    const onSelectStatus = vi.fn()
    render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={onSelectStatus}
        onDeleteClick={vi.fn()}
      />,
    )

    const card = screen.getByLabelText('成员 北北')
    expect(within(card).getByText('当前：套卷中')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))
    expect(onSelectStatus).toHaveBeenCalledWith('m1', 'scope_shrinking')
  })

  it('renders delete and confirm delete states through props', () => {
    const onDeleteClick = vi.fn()
    const { rerender } = render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={onDeleteClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '删除北北' }))
    expect(onDeleteClick).toHaveBeenCalledWith('m1')

    rerender(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={true}
        onSelectStatus={vi.fn()}
        onDeleteClick={onDeleteClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '确认删除北北' }))
    expect(onDeleteClick).toHaveBeenCalledWith('m1')
  })
})
```

- [x] **Step 2: Run component tests to verify RED**

Run:

```bash
npm test -- src/components/AddMemberForm.test.tsx src/components/StatusButtonGroup.test.tsx src/components/MemberStatusCard.test.tsx
```

Expected: FAIL because the component modules do not exist.

## Task 2: Extract Components

- [x] **Step 1: Implement AddMemberForm**

Create `src/components/AddMemberForm.tsx`.

```tsx
import { useState } from 'react'

type AddMemberFormProps = {
  onAddMember: (displayName: string) => void
}

export function AddMemberForm({ onAddMember }: AddMemberFormProps) {
  const [displayName, setDisplayName] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDisplayName = displayName.trim()
    if (trimmedDisplayName.length === 0) {
      return
    }

    onAddMember(trimmedDisplayName)
    setDisplayName('')
  }

  return (
    <form className="add-member-form" onSubmit={handleSubmit}>
      <label htmlFor="member-name">群友昵称</label>
      <div className="action-row">
        <input
          id="member-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={16}
          autoComplete="off"
        />
        <button type="submit" className="primary-action">
          添加群友
        </button>
      </div>
    </form>
  )
}
```

- [x] **Step 2: Implement StatusButtonGroup**

Create `src/components/StatusButtonGroup.tsx`.

```tsx
import type { SelectableStatusKey, StatusPreset } from '../types/domain'

type SelectableStatusPreset = StatusPreset & {
  statusKey: SelectableStatusKey
}

type StatusButtonGroupProps = {
  displayName: string
  statuses: StatusPreset[]
  onSelectStatus: (statusKey: SelectableStatusKey) => void
}

export function StatusButtonGroup({
  displayName,
  statuses,
  onSelectStatus,
}: StatusButtonGroupProps) {
  const selectableStatuses = statuses.filter(
    (status): status is SelectableStatusPreset => status.selectable,
  )

  return (
    <div className="status-actions">
      {selectableStatuses.map((preset) => (
        <button
          type="button"
          key={preset.statusKey}
          className="status-action"
          onClick={() => onSelectStatus(preset.statusKey)}
          aria-label={`设置${displayName}为${preset.label}`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
```

- [x] **Step 3: Implement MemberStatusCard**

Create `src/components/MemberStatusCard.tsx`.

```tsx
import type {
  EffectiveStatus,
  Member,
  SelectableStatusKey,
  StatusPreset,
} from '../types/domain'
import { StatusButtonGroup } from './StatusButtonGroup'

type MemberStatusCardProps = {
  member: Member
  status: EffectiveStatus
  statuses: StatusPreset[]
  isPendingDelete: boolean
  onSelectStatus: (memberId: string, statusKey: SelectableStatusKey) => void
  onDeleteClick: (memberId: string) => void
}

export function MemberStatusCard({
  member,
  status,
  statuses,
  isPendingDelete,
  onSelectStatus,
  onDeleteClick,
}: MemberStatusCardProps) {
  return (
    <article
      className="status-card member-card"
      key={member.id}
      aria-label={`成员 ${member.displayName}`}
    >
      <p className="status-place">{status.placeLabel}</p>
      <h2>{member.displayName}</h2>
      <p className="current-status">当前：{status.label}</p>
      <StatusButtonGroup
        displayName={member.displayName}
        statuses={statuses}
        onSelectStatus={(statusKey) => onSelectStatus(member.id, statusKey)}
      />
      <button
        type="button"
        className="delete-action"
        onClick={() => onDeleteClick(member.id)}
        aria-label={
          isPendingDelete
            ? `确认删除${member.displayName}`
            : `删除${member.displayName}`
        }
      >
        {isPendingDelete ? '确认删除' : '删除'}
      </button>
    </article>
  )
}
```

- [x] **Step 4: Implement PixelHomeMap**

Create `src/components/PixelHomeMap.tsx`.

```tsx
import type { EffectiveStatus, Member } from '../types/domain'

type PixelHomeMapProps = {
  members: Member[]
  getMemberStatus: (memberId: string) => EffectiveStatus
}

export function PixelHomeMap({ members, getMemberStatus }: PixelHomeMapProps) {
  return (
    <section className="pixel-home" aria-label="像素家园预览">
      <div className="map-grid">
        {members.length === 0 ? (
          <p className="empty-home">还没有群友入住</p>
        ) : (
          members.map((member, index) => {
            const status = getMemberStatus(member.id)

            return (
              <article
                className={`resident-marker marker-${index % 4}`}
                key={member.id}
                aria-label={`像素居民 ${member.displayName}`}
              >
                <span className={`mini-sprite ${member.avatarKey}`}></span>
                <span className="bubble">{status.label}</span>
                <strong>{member.displayName}</strong>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
```

- [x] **Step 5: Update App composition**

Modify `src/App.tsx` so it imports the components and keeps only callbacks.

```tsx
import { useState } from 'react'
import { AddMemberForm } from './components/AddMemberForm'
import { MemberStatusCard } from './components/MemberStatusCard'
import { PixelHomeMap } from './components/PixelHomeMap'
import { STATUS_PRESETS } from './data/statusPresets'
import { usePixelHomeApp } from './app/usePixelHomeApp'
import type { SelectableStatusKey } from './types/domain'
import './App.css'
```

Use:

```tsx
function handleAddMember(displayName: string) {
  addVirtualMember(displayName)
  setPendingDeleteId(null)
}
```

Render:

```tsx
<AddMemberForm onAddMember={handleAddMember} />
<PixelHomeMap members={state.members} getMemberStatus={getMemberStatus} />
```

Inside member cards:

```tsx
<MemberStatusCard
  key={member.id}
  member={member}
  status={status}
  statuses={Object.values(STATUS_PRESETS)}
  isPendingDelete={pendingDeleteId === member.id}
  onSelectStatus={handleStatusClick}
  onDeleteClick={handleDeleteClick}
/>
```

- [x] **Step 6: Run component tests to verify GREEN**

Run:

```bash
npm test -- src/components/AddMemberForm.test.tsx src/components/StatusButtonGroup.test.tsx src/components/MemberStatusCard.test.tsx
```

Expected: PASS.

- [x] **Step 7: Run App integration tests**

Run:

```bash
npm test -- src/App.test.tsx
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

Use the existing local app page to verify: empty state renders, adding a member works, setting `套卷中` works, delete confirmation works.

- [x] **Step 3: Self-review and ChatGPT web review**

Report changed files, verification output, browser findings, risks, and confirm no user-visible behavior changed.

- [x] **Step 4: Commit if approved**

```bash
git add .
git commit -m "refactor: split pixel home UI components"
```
