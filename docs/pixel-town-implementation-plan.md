# Pixel Town Map Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first CSS-only pixel town map slice so members appear in status-specific town zones while existing cards keep precise status controls and details.

**Architecture:** Keep the current local-first React app and state model. Add a small town layout config, render status zones inside `PixelHomeMap`, and style the map with CSS placeholders only. Do not change domain logic, storage, Tauri config, QQ integration, or asset handling.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, plain CSS.

---

## Scope

This plan implements the next UI slice after [pixel-town-visual-direction.md](pixel-town-visual-direction.md).

Allowed:

- CSS-only/self-made placeholder town zones.
- Member markers grouped by effective status.
- Focused component and layout tests.
- App integration coverage for moving a member between zones.

Forbidden:

- External assets.
- Kenney/OpenGameArt/itch.io imports.
- Icon replacement.
- Tauri config changes.
- Domain/storage/app hook changes.
- Animation.
- Drag and drop.
- Map editor.
- QQ Bot.
- Sync service.

## File Structure

- Create: `src/components/townLayout.ts`
  - Owns static zone definitions and status-to-zone mapping.
  - Pure TypeScript, no React.
- Create: `src/components/townLayout.test.ts`
  - Verifies every `StatusKey` maps to a public town zone.
  - Guards against internal zone keys leaking as labels.
- Create: `src/components/TownZone.tsx`
  - Renders one status zone, its label, optional description, and member markers.
- Create: `src/components/MemberMarker.tsx`
  - Renders one member token with avatar class and accessible current-status label.
- Create: `src/components/PixelHomeMap.test.tsx`
  - Verifies zones, member placement, fallback placement, and no internal key leakage.
- Modify: `src/components/PixelHomeMap.tsx`
  - Compose zones and group members by `getMemberStatus(member.id)`.
- Modify: `src/App.css`
  - Replace old marker-grid styling with stable town zone styling.
- Modify: `src/App.test.tsx`
  - Add one integration check that a member moves to the expected town zone after status changes.

No other files should change.

## Town Zone Mapping

| Status key | Zone key | Public zone label |
| --- | --- | --- |
| `exam_paper` | `study_tower` | `自习塔` |
| `scope_shrinking` | `scope_lab` | `魔法研究所` |
| `fishing` | `fishing_pond` | `池塘` |
| `vocabulary` | `library` | `图书馆` |
| `sleeping` | `dorm_inn` | `旅馆` |
| `deadline` | `deadline_workshop` | `DDL 工坊` |
| `offline` | `mist_forest` | `雾林` |
| `idle` | `town_square` | `广场` |
| `unknown` | `unknown_sign` | `问号路牌` |

Internal keys must not appear in user-facing text.

## Task 1: Add Town Layout Model

**Files:**

- Create: `src/components/townLayout.test.ts`
- Create: `src/components/townLayout.ts`

- [ ] **Step 1: Write the failing town layout tests**

Create `src/components/townLayout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { StatusKey } from '../types/domain'
import {
  TOWN_ZONES,
  getTownZoneForStatus,
  townZoneByKey,
} from './townLayout'

const statusKeys: StatusKey[] = [
  'exam_paper',
  'scope_shrinking',
  'fishing',
  'vocabulary',
  'sleeping',
  'deadline',
  'offline',
  'idle',
  'unknown',
]

describe('townLayout', () => {
  it('maps every status key to a public town zone', () => {
    for (const statusKey of statusKeys) {
      const zoneKey = getTownZoneForStatus(statusKey)
      const zone = townZoneByKey[zoneKey]

      expect(zone).toBeDefined()
      expect(zone.label).not.toBe(zone.zoneKey)
      expect(zone.label).not.toContain('_')
    }
  })

  it('keeps the first implementation slice to one zone per status', () => {
    expect(TOWN_ZONES).toHaveLength(statusKeys.length)
  })
})
```

- [ ] **Step 2: Run the focused layout test and verify it fails**

Run:

```bash
npm test -- src/components/townLayout.test.ts
```

Expected: fail because `src/components/townLayout.ts` does not exist.

- [ ] **Step 3: Add the town layout model**

Create `src/components/townLayout.ts`:

```ts
import type { StatusKey } from '../types/domain'

export type TownZoneKey =
  | 'study_tower'
  | 'scope_lab'
  | 'fishing_pond'
  | 'library'
  | 'dorm_inn'
  | 'deadline_workshop'
  | 'mist_forest'
  | 'town_square'
  | 'unknown_sign'

export type TownZone = {
  zoneKey: TownZoneKey
  statusKey: StatusKey
  label: string
  description: string
  icon: string
  className: string
}

export const TOWN_ZONES: TownZone[] = [
  {
    zoneKey: 'study_tower',
    statusKey: 'exam_paper',
    label: '自习塔',
    description: '套卷中的群友在这里堆卷子',
    icon: '卷',
    className: 'zone-study',
  },
  {
    zoneKey: 'scope_lab',
    statusKey: 'scope_shrinking',
    label: '魔法研究所',
    description: '缩圈中的群友在这里压缩范围',
    icon: '圈',
    className: 'zone-scope',
  },
  {
    zoneKey: 'fishing_pond',
    statusKey: 'fishing',
    label: '池塘',
    description: '摸鱼中的群友在这里假装沉思',
    icon: '鱼',
    className: 'zone-pond',
  },
  {
    zoneKey: 'library',
    statusKey: 'vocabulary',
    label: '图书馆',
    description: '背单词中的群友在这里和遗忘曲线对线',
    icon: '词',
    className: 'zone-library',
  },
  {
    zoneKey: 'dorm_inn',
    statusKey: 'sleeping',
    label: '旅馆',
    description: '睡觉中的群友在这里低功耗运行',
    icon: '眠',
    className: 'zone-dorm',
  },
  {
    zoneKey: 'deadline_workshop',
    statusKey: 'deadline',
    label: 'DDL 工坊',
    description: '赶 ddl 的群友在这里敲打时间',
    icon: '急',
    className: 'zone-deadline',
  },
  {
    zoneKey: 'mist_forest',
    statusKey: 'offline',
    label: '雾林',
    description: '失联中的群友在这里变成传说',
    icon: '雾',
    className: 'zone-mist',
  },
  {
    zoneKey: 'town_square',
    statusKey: 'idle',
    label: '广场',
    description: '空闲中的群友在这里晒太阳',
    icon: '闲',
    className: 'zone-square',
  },
  {
    zoneKey: 'unknown_sign',
    statusKey: 'unknown',
    label: '问号路牌',
    description: '还没有状态的群友先在这里集合',
    icon: '?',
    className: 'zone-unknown',
  },
]

export const townZoneByKey = Object.fromEntries(
  TOWN_ZONES.map((zone) => [zone.zoneKey, zone]),
) as Record<TownZoneKey, TownZone>

export const townZoneByStatus = Object.fromEntries(
  TOWN_ZONES.map((zone) => [zone.statusKey, zone.zoneKey]),
) as Record<StatusKey, TownZoneKey>

export function getTownZoneForStatus(statusKey: StatusKey): TownZoneKey {
  return townZoneByStatus[statusKey]
}
```

- [ ] **Step 4: Run the focused layout test and verify it passes**

Run:

```bash
npm test -- src/components/townLayout.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit the layout model**

Run:

```bash
git add src/components/townLayout.ts src/components/townLayout.test.ts
git commit -m "feat: add pixel town layout model"
```

## Task 2: Add Pixel Home Map Component Tests

**Files:**

- Create: `src/components/PixelHomeMap.test.tsx`
- Modify in Task 3: `src/components/PixelHomeMap.tsx`
- Create in Task 3: `src/components/TownZone.tsx`
- Create in Task 3: `src/components/MemberMarker.tsx`

- [ ] **Step 1: Write the failing map tests**

Create `src/components/PixelHomeMap.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import type { EffectiveStatus, Member, StatusKey } from '../types/domain'
import { PixelHomeMap } from './PixelHomeMap'

function createMember(id: string, displayName: string): Member {
  return {
    id,
    displayName,
    avatarKey: 'orange',
    createdAt: '2026-06-03T12:00:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
  }
}

function createStatus(memberId: string, statusKey: StatusKey): EffectiveStatus {
  return {
    ...STATUS_PRESETS[statusKey],
    memberId,
    source: statusKey === 'unknown' ? 'missing' : 'current',
  }
}

function renderMap(statusKey: StatusKey, source: EffectiveStatus['source'] = 'current') {
  const member = createMember('m1', '北北')
  const status = {
    ...createStatus(member.id, statusKey),
    source,
  }

  render(
    <PixelHomeMap
      members={[member]}
      getMemberStatus={() => status}
    />,
  )
}

describe('PixelHomeMap', () => {
  it('renders the first-slice town zones with public labels', () => {
    render(
      <PixelHomeMap
        members={[]}
        getMemberStatus={() => createStatus('missing', 'unknown')}
      />,
    )

    expect(screen.getByText('还没有群友入住')).toBeInTheDocument()

    for (const label of [
      '自习塔',
      '魔法研究所',
      '池塘',
      '图书馆',
      '旅馆',
      'DDL 工坊',
      '雾林',
      '广场',
      '问号路牌',
    ]) {
      expect(
        screen.getByRole('region', { name: `状态区域 ${label}` }),
      ).toBeInTheDocument()
    }

    expect(screen.queryByText('study_tower')).not.toBeInTheDocument()
    expect(screen.queryByText('scope_lab')).not.toBeInTheDocument()
  })

  it('places an exam-paper member in the Study Tower zone', () => {
    renderMap('exam_paper')

    const zone = screen.getByRole('region', { name: '状态区域 自习塔' })
    expect(
      within(zone).getByLabelText('成员 北北 当前 套卷中'),
    ).toBeInTheDocument()
  })

  it('places a scope-shrinking member in the Scope Lab zone', () => {
    renderMap('scope_shrinking')

    const zone = screen.getByRole('region', { name: '状态区域 魔法研究所' })
    expect(
      within(zone).getByLabelText('成员 北北 当前 缩圈中'),
    ).toBeInTheDocument()
  })

  it('places an expired fallback member in the Mist Forest zone', () => {
    renderMap('offline', 'expired_fallback')

    const zone = screen.getByRole('region', { name: '状态区域 雾林' })
    expect(
      within(zone).getByLabelText('成员 北北 当前 失联中'),
    ).toBeInTheDocument()
  })

  it('places a missing-status member near the Unknown Sign zone', () => {
    renderMap('unknown', 'missing')

    const zone = screen.getByRole('region', { name: '状态区域 问号路牌' })
    expect(
      within(zone).getByLabelText('成员 北北 当前 未知'),
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the focused map tests and verify they fail**

Run:

```bash
npm test -- src/components/PixelHomeMap.test.tsx
```

Expected: fail because `PixelHomeMap` still renders a flat resident grid and does not expose town zones.

## Task 3: Implement Town Zones And Member Markers

**Files:**

- Create: `src/components/MemberMarker.tsx`
- Create: `src/components/TownZone.tsx`
- Modify: `src/components/PixelHomeMap.tsx`

- [ ] **Step 1: Add the member marker component**

Create `src/components/MemberMarker.tsx`:

```tsx
import type { EffectiveStatus, Member } from '../types/domain'

type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
}

export function MemberMarker({ member, status }: MemberMarkerProps) {
  return (
    <span
      className="member-marker"
      aria-label={`成员 ${member.displayName} 当前 ${status.label}`}
    >
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
    </span>
  )
}
```

- [ ] **Step 2: Add the town zone component**

Create `src/components/TownZone.tsx`:

```tsx
import type { EffectiveStatus, Member } from '../types/domain'
import type { TownZone as TownZoneModel } from './townLayout'
import { MemberMarker } from './MemberMarker'

export type TownResident = {
  member: Member
  status: EffectiveStatus
}

type TownZoneProps = {
  zone: TownZoneModel
  residents: TownResident[]
}

export function TownZone({ zone, residents }: TownZoneProps) {
  return (
    <section
      className={`town-zone ${zone.className}`}
      aria-label={`状态区域 ${zone.label}`}
    >
      <header className="town-zone-header">
        <span className="town-zone-icon" aria-hidden="true">
          {zone.icon}
        </span>
        <div>
          <h2>{zone.label}</h2>
          <p>{zone.description}</p>
        </div>
      </header>

      <div className="town-residents">
        {residents.length === 0 ? (
          <span className="town-zone-empty">空</span>
        ) : (
          residents.map(({ member, status }) => (
            <MemberMarker
              key={member.id}
              member={member}
              status={status}
            />
          ))
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Compose zones in PixelHomeMap**

Replace `src/components/PixelHomeMap.tsx` with:

```tsx
import type { EffectiveStatus, Member } from '../types/domain'
import { TownZone, type TownResident } from './TownZone'
import {
  TOWN_ZONES,
  getTownZoneForStatus,
  type TownZoneKey,
} from './townLayout'

type PixelHomeMapProps = {
  members: Member[]
  getMemberStatus: (memberId: string) => EffectiveStatus
}

function groupResidentsByZone(
  members: Member[],
  getMemberStatus: PixelHomeMapProps['getMemberStatus'],
) {
  const residentsByZone = new Map<TownZoneKey, TownResident[]>()

  for (const zone of TOWN_ZONES) {
    residentsByZone.set(zone.zoneKey, [])
  }

  for (const member of members) {
    const status = getMemberStatus(member.id)
    const zoneKey = getTownZoneForStatus(status.statusKey)
    const residents = residentsByZone.get(zoneKey) ?? []

    residents.push({ member, status })
    residentsByZone.set(zoneKey, residents)
  }

  return residentsByZone
}

export function PixelHomeMap({ members, getMemberStatus }: PixelHomeMapProps) {
  const residentsByZone = groupResidentsByZone(members, getMemberStatus)

  return (
    <section className="pixel-home" aria-label="像素家园预览">
      <div className="town-map">
        {members.length === 0 ? (
          <p className="empty-home">还没有群友入住</p>
        ) : null}

        <div className="town-grid">
          {TOWN_ZONES.map((zone) => (
            <TownZone
              key={zone.zoneKey}
              zone={zone}
              residents={residentsByZone.get(zone.zoneKey) ?? []}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run focused component tests and verify they pass**

Run:

```bash
npm test -- src/components/townLayout.test.ts src/components/PixelHomeMap.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit the component implementation**

Run:

```bash
git add src/components/MemberMarker.tsx src/components/TownZone.tsx src/components/PixelHomeMap.tsx src/components/PixelHomeMap.test.tsx
git commit -m "feat: render pixel town status zones"
```

## Task 4: Style The CSS-Only Placeholder Town

**Files:**

- Modify: `src/App.css`

- [ ] **Step 1: Replace old flat map styles with town styles**

In `src/App.css`, keep `.pixel-home`, `.empty-home`, and `.mini-sprite` recognizable, but replace `.map-grid` and `.resident-marker` usage with `.town-map`, `.town-grid`, `.town-zone`, and `.member-marker` styles:

```css
.town-map {
  min-height: 384px;
  position: relative;
  display: grid;
  gap: 14px;
  padding: 16px;
  background:
    linear-gradient(90deg, rgba(28, 33, 40, 0.14) 2px, transparent 2px),
    linear-gradient(rgba(28, 33, 40, 0.12) 2px, transparent 2px),
    linear-gradient(135deg, var(--grass), var(--sky));
  background-size:
    28px 28px,
    28px 28px,
    auto;
  border: 3px solid rgba(28, 33, 40, 0.9);
}

.town-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(126px, 1fr));
  gap: 12px;
}

.town-zone {
  min-height: 150px;
  padding: 10px;
  display: grid;
  align-content: space-between;
  gap: 10px;
  background: rgba(255, 250, 240, 0.82);
  border: 3px solid var(--ink);
  box-shadow: 4px 4px 0 rgba(28, 33, 40, 0.18);
}

.town-zone-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.town-zone-header h2 {
  margin: 0;
  font-size: 1rem;
}

.town-zone-header p {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: var(--muted);
  font-weight: 800;
}

.town-zone-icon {
  min-width: 34px;
  min-height: 34px;
  display: grid;
  place-items: center;
  background: var(--paper);
  border: 3px solid var(--ink);
  font-weight: 900;
}

.town-residents {
  min-height: 42px;
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 8px;
}

.town-zone-empty {
  padding: 4px 8px;
  background: rgba(255, 250, 240, 0.7);
  border: 2px dashed rgba(28, 33, 40, 0.5);
  color: var(--muted);
  font-weight: 900;
}

.member-marker {
  max-width: 100%;
  display: inline-grid;
  place-items: center;
  gap: 5px;
  padding: 6px;
  background: var(--paper);
  border: 3px solid var(--ink);
  box-shadow: 3px 3px 0 rgba(28, 33, 40, 0.2);
  font-size: 0.82rem;
  font-weight: 900;
}

.member-marker strong {
  max-width: 6rem;
  overflow-wrap: anywhere;
}

.zone-study {
  background: #fff0b8;
}

.zone-scope {
  background: #d9c8ff;
}

.zone-pond {
  background: #b8e6dd;
}

.zone-library {
  background: #d8eec2;
}

.zone-dorm {
  background: #c8d4f0;
}

.zone-deadline {
  background: #ffd0bf;
}

.zone-mist {
  background: #d9d9df;
}

.zone-square {
  background: #ffe4a3;
}

.zone-unknown {
  background: #f4f0e6;
}
```

Update the mobile media query:

```css
@media (max-width: 820px) {
  .town-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Remove unused old selectors**

Remove `.map-grid`, `.resident-marker`, `.resident-marker strong`, and `.bubble` styles if no JSX still uses them. Keep `.mini-sprite` styles because `MemberMarker` still uses them.

- [ ] **Step 3: Run app tests and build**

Run:

```bash
npm test -- src/components/PixelHomeMap.test.tsx src/App.test.tsx
npm run build
```

Expected: both commands pass.

- [ ] **Step 4: Commit CSS changes**

Run:

```bash
git add src/App.css
git commit -m "style: add css pixel town placeholders"
```

## Task 5: Add App-Level Zone Movement Coverage

**Files:**

- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add integration expectations to status update coverage**

In `src/App.test.tsx`, extend the existing `sets required statuses and persists the latest status` test with zone assertions after each click:

```tsx
const studyZone = screen.getByRole('region', { name: '状态区域 自习塔' })
expect(
  within(studyZone).getByLabelText('成员 北北 当前 套卷中'),
).toBeInTheDocument()

fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

const scopeZone = screen.getByRole('region', { name: '状态区域 魔法研究所' })
expect(
  within(scopeZone).getByLabelText('成员 北北 当前 缩圈中'),
).toBeInTheDocument()
expect(
  within(studyZone).queryByLabelText('成员 北北 当前 套卷中'),
).toBeNull()
```

Keep the existing persistence assertions in the same test.

- [ ] **Step 2: Add expired fallback map coverage**

In the existing `uses fallback status without showing stale notes after expiration` test, add:

```tsx
const mistZone = screen.getByRole('region', { name: '状态区域 雾林' })
expect(
  within(mistZone).getByLabelText('成员 北北 当前 失联中'),
).toBeInTheDocument()
```

- [ ] **Step 3: Run App tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: pass.

- [ ] **Step 4: Commit App coverage**

Run:

```bash
git add src/App.test.tsx
git commit -m "test: cover pixel town member placement"
```

## Task 6: Browser Smoke And Final Verification

**Files:**

- No planned file changes.

- [ ] **Step 1: Run the complete automated gate**

Run:

```bash
npm test
npm run lint
npm run build
```

From `src-tauri`:

```bash
cargo fmt --check
cargo check
```

From repo root:

```bash
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Run a local browser smoke check**

Start the dev server:

```bash
npm run dev
```

Open the local Vite URL and check:

1. Empty state still says `还没有群友入住`.
2. The map shows public zones, including `自习塔`, `魔法研究所`, `雾林`, and `问号路牌`.
3. Add `北北`.
4. Before setting a status, `北北` appears in `问号路牌`.
5. Set `套卷中`; `北北` appears in `自习塔`.
6. Set `缩圈中`; `北北` appears in `魔法研究所`.
7. Delete `北北`; the map returns to empty markers without layout breakage.
8. Narrow viewport below 820px; zones stack in one column and text does not overlap.

Stop the dev server after the smoke check.

- [ ] **Step 3: Confirm scope**

Run:

```bash
git diff --name-only HEAD~4..HEAD
```

Expected changed files for the implementation branch:

```text
src/App.css
src/App.test.tsx
src/components/MemberMarker.tsx
src/components/PixelHomeMap.test.tsx
src/components/PixelHomeMap.tsx
src/components/TownZone.tsx
src/components/townLayout.test.ts
src/components/townLayout.ts
```

Confirm no files under `public/`, `src-tauri/tauri.conf.json`, or asset directories changed.

- [ ] **Step 4: Report for review**

Report:

- Test, lint, build, cargo, and diff-check results.
- Browser smoke result and viewport checked.
- Confirmation that no external assets were imported.
- Confirmation that no domain/storage/Tauri/QQ/sync behavior changed.
- Screenshots only if the review loop asks for them.

## Execution Notes

- Keep commits small at each task boundary.
- Do not add dependencies.
- Do not add new status presets in this slice.
- Do not rename existing status keys or storage fields.
- If layout tests require changing public labels, update this plan and get review before implementation.
- If CSS becomes too large, stop and ask for review instead of introducing a design system.

## Success Criteria

- All current behavior remains available.
- The map renders fixed town zones with user-facing labels.
- Members appear in the zone for their effective status.
- Expired fallback status appears in `雾林`.
- Unknown/missing status appears in `问号路牌`.
- Internal zone keys do not appear in rendered text.
- No external visual assets are present in the repo.
- No QQ/Tencent official visual elements are introduced.
- Full automated verification passes.
