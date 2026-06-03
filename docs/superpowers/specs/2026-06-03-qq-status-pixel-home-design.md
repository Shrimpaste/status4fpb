# QQ Group Status Pixel Home Design

## Goal

Build a playful local-first status board for QQ group friends. The MVP shows virtual members in a pixel-home scene and supports manual status setting, with required statuses including "套卷中" and "缩圈中".

## Scope

The first release is a browser-based React app. It does not call QQ private APIs, scrape QQ clients, monitor group messages, infer status from chat content, or store real QQ identifiers by default.

The MVP includes:

- Virtual members identified by display name and avatar style.
- Manual status updates.
- Required statuses: "套卷中" and "缩圈中".
- A pixel-home visual surface where status maps to location and visual treatment.
- Local persistence in the browser.
- Tests for status logic, persistence, and critical UI rendering.
- A review loop after each implementation round.

Later releases can add semi-automatic imports or command-style updates only from user-authorized data sources.

## Recommended Approach

Use Vite, React, TypeScript, Vitest, React Testing Library, and plain CSS. Keep the app local-first and dependency-light. Start with a static pixel-home shell, then add tested state logic, persistence, and member editing.

## Data Model

```ts
type StatusKey =
  | 'exam_paper'
  | 'scope_shrinking'
  | 'fishing'
  | 'vocabulary'
  | 'sleeping'
  | 'deadline'
  | 'offline'
  | 'custom'

type Member = {
  id: string
  displayName: string
  avatarKey: string
  color?: string
  createdAt: string
  updatedAt: string
}

type MemberStatus = {
  memberId: string
  statusKey: StatusKey
  label: string
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
}

type AppState = {
  members: Member[]
  statuses: Record<string, MemberStatus>
  settings: {
    theme: 'pixel_home' | 'study_room' | 'campus'
    autoExpireTo: 'offline' | 'idle'
  }
}
```

## Status Logic

Each member has one active status. Statuses can expire. When a status expires, the UI falls back to either "失联中" or "空闲中" according to settings. Unknown or corrupt persisted data should recover to a safe empty state.

## UI Direction

The first visual direction is a dense pixel-home board, not a marketing page. Different statuses map to different rooms or locations:

- "套卷中": study desk, paper stack, stressed sprite.
- "缩圈中": magic-circle or blackboard zone, shrinking ring visual.
- "摸鱼中": pond or sofa.
- "背单词中": bookshelf or flash-card corner.
- "睡觉中": bed area.
- "赶 ddl 中": urgent desk zone.
- "失联中": fog or question-mark area.

The first implementation can use CSS pixel blocks and simple sprites. Later versions may replace those with dedicated bitmap or SVG assets.

## Review Loop

After every implementation round, Codex must review all changed code for:

- Logic correctness.
- Simplicity and unnecessary abstraction.
- Privacy and platform safety.
- UI accessibility and responsive behavior.
- Test coverage and build health.
- Version-control hygiene.

Codex then sends the self-review and next direction to the ChatGPT web review thread for a second review before continuing.
