# Pixel Town Placeholder Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the CSS-only pixel town map without expanding scope beyond the existing placeholder map.

**Architecture:** Keep the current local-first React state model unchanged. Polish the map at the presentation layer by adding empty-state guidance, enriching marker accessible names with zone context, verifying multiple residents in one zone, and documenting the placeholder-map boundary.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, CSS, Markdown.

---

## Scope

Allowed:
- `src/components/PixelHomeMap.test.tsx`
- `src/components/PixelHomeMap.tsx`
- `src/components/TownZone.tsx`
- `src/components/MemberMarker.tsx`
- `src/App.css`
- `docs/pixel-town-placeholder-map.md`

Forbidden:
- Do not modify domain logic, storage, `usePixelHomeApp`, or Tauri config.
- Do not import assets, fonts, icon packages, or animation libraries.
- Do not add animation, drag/drop, map editing, QQ Bot integration, sync, installer, or close-to-tray behavior.

## Task 1: Add Failing Map Polish Tests

**Files:**
- Modify: `src/components/PixelHomeMap.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add tests that expect the next polish behaviors:

```tsx
it('explains how the empty town will fill with members', () => {
  render(
    <PixelHomeMap
      members={[]}
      getMemberStatus={() => createStatus('missing', 'unknown')}
    />,
  )

  expect(
    screen.getByText('添加群友后，小人会根据状态进入不同区域'),
  ).toBeInTheDocument()
})

it('exposes member, status, and zone in marker accessible names', () => {
  renderMap('exam_paper')

  const zone = screen.getByRole('region', { name: '状态区域 自习塔' })
  expect(
    within(zone).getByLabelText('成员 北北 当前 套卷中，位于 自习塔'),
  ).toBeInTheDocument()
})

it('renders multiple members in the same town zone', () => {
  const members = [createMember('m1', '北北'), createMember('m2', '南南')]

  render(
    <PixelHomeMap
      members={members}
      getMemberStatus={(memberId) => createStatus(memberId, 'exam_paper')}
    />,
  )

  const zone = screen.getByRole('region', { name: '状态区域 自习塔' })

  expect(
    within(zone).getByLabelText('成员 北北 当前 套卷中，位于 自习塔'),
  ).toBeInTheDocument()
  expect(
    within(zone).getByLabelText('成员 南南 当前 套卷中，位于 自习塔'),
  ).toBeInTheDocument()
  expect(within(zone).queryByText('空')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/PixelHomeMap.test.tsx
```

Expected: fail because the empty map lacks the guidance text and marker names do not include the zone label.

## Task 2: Implement Marker Zone Context

**Files:**
- Modify: `src/components/MemberMarker.tsx`
- Modify: `src/components/TownZone.tsx`

- [ ] **Step 1: Update `MemberMarker` props and label**

```tsx
type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
  zoneLabel: string
}

export function MemberMarker({ member, status, zoneLabel }: MemberMarkerProps) {
  return (
    <span
      className="member-marker"
      aria-label={`成员 ${member.displayName} 当前 ${status.label}，位于 ${zoneLabel}`}
    >
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
    </span>
  )
}
```

- [ ] **Step 2: Pass zone label from `TownZone`**

```tsx
residents.map(({ member, status }) => (
  <MemberMarker
    key={member.id}
    member={member}
    status={status}
    zoneLabel={zone.label}
  />
))
```

- [ ] **Step 3: Verify marker tests progress**

Run:

```bash
npm test -- src/components/PixelHomeMap.test.tsx
```

Expected: marker accessibility failures are resolved; the empty guidance test may still fail until Task 3.

## Task 3: Add Empty Town Guidance and CSS Hardening

**Files:**
- Modify: `src/components/PixelHomeMap.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add guidance text next to the empty message**

```tsx
{members.length === 0 ? (
  <div className="empty-home" role="note">
    <p>还没有群友入住</p>
    <p>添加群友后，小人会根据状态进入不同区域</p>
  </div>
) : null}
```

- [ ] **Step 2: Keep the empty guidance compact and non-overlapping**

Update `.empty-home` so it can contain two lines cleanly:

```css
.empty-home {
  place-self: center;
  grid-column: 1 / -1;
  max-width: min(100%, 28rem);
  padding: 12px 16px;
  display: grid;
  gap: 4px;
  background: var(--paper);
  border: 3px solid var(--ink);
  font-weight: 900;
  text-align: center;
}

.empty-home p {
  margin: 0;
}

.empty-home p + p {
  color: var(--muted);
  font-size: 0.82rem;
}
```

- [ ] **Step 3: Verify GREEN**

Run:

```bash
npm test -- src/components/PixelHomeMap.test.tsx
```

Expected: all `PixelHomeMap` tests pass.

## Task 4: Update App Integration Expectations

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Update marker accessible-name assertions**

Change existing marker label expectations from:

```tsx
'成员 北北 当前 套卷中'
```

to:

```tsx
'成员 北北 当前 套卷中，位于 自习塔'
```

Apply the same pattern for `缩圈中，位于 魔法研究所` and `失联中，位于 雾林`.

- [ ] **Step 2: Verify app tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: all app tests pass.

## Task 5: Document Placeholder Map Boundary

**Files:**
- Create: `docs/pixel-town-placeholder-map.md`

- [ ] **Step 1: Add a short product/engineering note**

```markdown
# Pixel Town Placeholder Map

The current pixel town map is a CSS-only placeholder layer for status grouping.

## Implemented

- Fixed town zones with public Chinese labels.
- Members appear in the zone for their effective status.
- `unknown` members appear at `问号路牌`.
- `offline` and expired fallback members appear at `雾林`.
- Member cards remain the source of precise controls, notes, expiration, delete, and reset behavior.

## Boundaries

- No imported visual assets, fonts, tilesets, or icon packages.
- No QQ private API access.
- No sync service or shared room behavior.
- No animation, drag/drop, or map editing in this slice.
- Internal zone keys are implementation details and must not appear in the UI.

## Next Candidates

- Replace CSS placeholders with licensed or self-made pixel assets.
- Design a shared-room architecture separately before implementation.
- Revisit Tauri tray productization only after manual tray behavior can be verified.
```

- [ ] **Step 2: Verify docs diff**

Run:

```bash
git diff -- docs/pixel-town-placeholder-map.md
```

Expected: new document matches the implemented boundary and does not claim unbuilt features.

## Task 6: Final Verification and Review

**Files:**
- All touched files

- [ ] **Step 1: Run full automated gate**

```bash
npm test
npm run lint
npm run build
cd src-tauri && cargo fmt --check
cd src-tauri && cargo check
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 2: Browser smoke**

Open `http://127.0.0.1:5173/` and verify:
- 9 zones render.
- Empty guidance appears.
- No internal zone keys appear in body text.
- 390px viewport has no horizontal overflow.

If browser text input is still blocked by the virtual clipboard issue, document that the add/status/delete interaction remains covered by RTL tests.

- [ ] **Step 3: Self-review**

Check:
- No domain/storage/Tauri changes.
- No assets or animation.
- Marker accessible names include member, status, and zone.
- Multiple same-zone members render.
- Docs do not overclaim.

- [ ] **Step 4: Commit**

```bash
git add src/components/PixelHomeMap.test.tsx src/components/MemberMarker.tsx src/components/TownZone.tsx src/components/PixelHomeMap.tsx src/App.css src/App.test.tsx docs/pixel-town-placeholder-map.md
git commit -m "polish: harden pixel town placeholder map"
```

## Self-Review

- Spec coverage: each webpage GPT requirement maps to a task above.
- Placeholder scan: no TBD/TODO/fill-in steps.
- Type consistency: `zoneLabel` is introduced in `MemberMarkerProps` and passed from `TownZone`.
