import { describe, expect, it } from 'vitest'
import { adaptSharedTownStateForDisplay } from './sharedStateAdapter'
import type { SharedTownState } from './types'

const SERVER_TIME = '2026-06-03T12:00:00.000Z'

function createSharedState(overrides: Partial<SharedTownState> = {}): SharedTownState {
  return {
    room: {
      roomId: 'room_1',
      name: 'Evening Study Town',
      createdAt: '2026-06-03T11:00:00.000Z',
      updatedAt: '2026-06-03T11:30:00.000Z',
    },
    members: [
      {
        roomId: 'room_1',
        memberId: 'member_1',
        displayName: 'Bei',
        avatarKey: 'orange',
        color: '#ff9f43',
        createdAt: '2026-06-03T11:00:00.000Z',
        updatedAt: '2026-06-03T11:00:00.000Z',
      },
    ],
    statuses: {
      member_1: {
        roomId: 'room_1',
        memberId: 'member_1',
        statusKey: 'exam_paper',
        note: 'second paper',
        startedAt: '2026-06-03T11:30:00.000Z',
        expiresAt: '2026-06-03T13:00:00.000Z',
        updatedAt: '2026-06-03T11:30:00.000Z',
        source: 'desktop_manual',
      },
    },
    serverTime: SERVER_TIME,
    ...overrides,
  }
}

describe('shared state adapter', () => {
  it('adapts room and members into display state', () => {
    const display = adaptSharedTownStateForDisplay(createSharedState())

    expect(display).toMatchObject({
      roomId: 'room_1',
      roomName: 'Evening Study Town',
      serverTime: SERVER_TIME,
    })
    expect(display.members).toEqual([
      {
        memberId: 'member_1',
        displayName: 'Bei',
        avatarKey: 'orange',
        color: '#ff9f43',
      },
    ])
  })

  it('includes active member status without converting it to local fallback', () => {
    const display = adaptSharedTownStateForDisplay(createSharedState())

    expect(display.statuses.member_1).toMatchObject({
      memberId: 'member_1',
      statusKey: 'exam_paper',
      note: 'second paper',
      isExpired: false,
    })
    expect(display.statuses.member_1.statusKey).not.toBe('offline')
  })

  it('computes expired status from server time', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        statuses: {
          member_1: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'scope_shrinking',
            startedAt: '2026-06-03T10:00:00.000Z',
            expiresAt: SERVER_TIME,
            updatedAt: '2026-06-03T10:00:00.000Z',
            source: 'desktop_manual',
          },
        },
      }),
    )

    expect(display.statuses.member_1).toMatchObject({
      statusKey: 'scope_shrinking',
      isExpired: true,
    })
    expect(display.statuses.member_1.statusKey).not.toBe('offline')
  })

  it('filters status for an unknown member', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        statuses: {
          orphan: {
            roomId: 'room_1',
            memberId: 'orphan',
            statusKey: 'exam_paper',
            startedAt: '2026-06-03T11:30:00.000Z',
            updatedAt: '2026-06-03T11:30:00.000Z',
            source: 'desktop_manual',
          },
        },
      }),
    )

    expect(display.statuses.orphan).toBeUndefined()
  })

  it('keeps left members but filters their statuses', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        members: [
          {
            roomId: 'room_1',
            memberId: 'member_1',
            displayName: 'Bei',
            avatarKey: 'orange',
            createdAt: '2026-06-03T11:00:00.000Z',
            updatedAt: '2026-06-03T12:00:00.000Z',
            leftAt: '2026-06-03T12:00:00.000Z',
          },
        ],
      }),
    )

    expect(display.members).toEqual([
      {
        memberId: 'member_1',
        displayName: 'Bei',
        avatarKey: 'orange',
        leftAt: '2026-06-03T12:00:00.000Z',
      },
    ])
    expect(display.statuses.member_1).toBeUndefined()
  })

  it('does not mutate the input state', () => {
    const state = createSharedState()
    const before = JSON.stringify(state)

    adaptSharedTownStateForDisplay(state)

    expect(JSON.stringify(state)).toBe(before)
  })

  it('does not expose member secrets from extra input fields', () => {
    const state = {
      ...createSharedState(),
      memberSecret: 'secret_1',
    }

    const display = adaptSharedTownStateForDisplay(state)

    expect(JSON.stringify(display)).not.toContain('secret_1')
  })

  it('does not display statuses when server time is invalid', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({ serverTime: 'not-a-date' }),
    )

    expect(display.statuses).toEqual({})
  })

  it('filters status with invalid expiration time', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        statuses: {
          member_1: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'exam_paper',
            startedAt: '2026-06-03T11:30:00.000Z',
            expiresAt: 'bad-expires-at',
            updatedAt: '2026-06-03T11:30:00.000Z',
            source: 'desktop_manual',
          },
        },
      }),
    )

    expect(display.statuses.member_1).toBeUndefined()
  })

  it('filters unknown status key forced through runtime input', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        statuses: {
          member_1: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'unknown',
            startedAt: '2026-06-03T11:30:00.000Z',
            updatedAt: '2026-06-03T11:30:00.000Z',
            source: 'desktop_manual',
          } as never,
        },
      }),
    )

    expect(display.statuses.member_1).toBeUndefined()
  })

  it('filters status for a member with invalid dates', () => {
    const display = adaptSharedTownStateForDisplay(
      createSharedState({
        members: [
          {
            roomId: 'room_1',
            memberId: 'member_1',
            displayName: 'Bei',
            avatarKey: 'orange',
            createdAt: '2026-06-03T11:00:00.000Z',
            updatedAt: 'bad-updated-at',
          },
        ],
      }),
    )

    expect(display.statuses.member_1).toBeUndefined()
  })
})
