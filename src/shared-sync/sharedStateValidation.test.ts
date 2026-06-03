import { describe, expect, it } from 'vitest'
import { validateSharedTownState } from './sharedStateValidation'
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

function expectIssue(
  result: ReturnType<typeof validateSharedTownState>,
  expected: { path: string; code: string },
) {
  expect(result.ok).toBe(false)

  if (result.ok) {
    throw new Error('expected validation issues')
  }

  expect(result.issues).toContainEqual(expect.objectContaining(expected))
}

describe('shared state validation', () => {
  it('accepts a valid shared town state', () => {
    expect(validateSharedTownState(createSharedState())).toEqual({ ok: true })
  })

  it('reports invalid server time', () => {
    const result = validateSharedTownState(
      createSharedState({ serverTime: 'not-a-date' }),
    )

    expectIssue(result, {
      path: 'serverTime',
      code: 'invalid_date',
    })
  })

  it('reports invalid member dates', () => {
    const result = validateSharedTownState(
      createSharedState({
        members: [
          {
            roomId: 'room_1',
            memberId: 'member_1',
            displayName: 'Bei',
            avatarKey: 'orange',
            createdAt: 'bad-created-at',
            updatedAt: 'bad-updated-at',
          },
        ],
      }),
    )

    expectIssue(result, {
      path: 'members.member_1.createdAt',
      code: 'invalid_date',
    })
    expectIssue(result, {
      path: 'members.member_1.updatedAt',
      code: 'invalid_date',
    })
  })

  it('reports invalid status dates', () => {
    const result = validateSharedTownState(
      createSharedState({
        statuses: {
          member_1: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'exam_paper',
            startedAt: 'bad-started-at',
            expiresAt: 'bad-expires-at',
            updatedAt: 'bad-updated-at',
            source: 'desktop_manual',
          },
        },
      }),
    )

    expectIssue(result, {
      path: 'statuses.member_1.startedAt',
      code: 'invalid_date',
    })
    expectIssue(result, {
      path: 'statuses.member_1.expiresAt',
      code: 'invalid_date',
    })
    expectIssue(result, {
      path: 'statuses.member_1.updatedAt',
      code: 'invalid_date',
    })
  })

  it('reports orphan status', () => {
    const result = validateSharedTownState(
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

    expectIssue(result, {
      path: 'statuses.orphan',
      code: 'orphan_status',
    })
  })

  it('reports status for a left member', () => {
    const result = validateSharedTownState(
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

    expectIssue(result, {
      path: 'statuses.member_1',
      code: 'left_member_status',
    })
  })

  it('reports unknown status key forced through runtime input', () => {
    const result = validateSharedTownState(
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

    expectIssue(result, {
      path: 'statuses.member_1.statusKey',
      code: 'invalid_status',
    })
  })

  it('reports timer-rule source forced through runtime input', () => {
    const result = validateSharedTownState(
      createSharedState({
        statuses: {
          member_1: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'exam_paper',
            startedAt: '2026-06-03T11:30:00.000Z',
            updatedAt: '2026-06-03T11:30:00.000Z',
            source: 'timer_rule',
          },
        },
      }),
    )

    expectIssue(result, {
      path: 'statuses.member_1.source',
      code: 'invalid_status',
    })
  })

  it('reports mismatched status record key and member id', () => {
    const result = validateSharedTownState(
      createSharedState({
        statuses: {
          member_2: {
            roomId: 'room_1',
            memberId: 'member_1',
            statusKey: 'exam_paper',
            startedAt: '2026-06-03T11:30:00.000Z',
            updatedAt: '2026-06-03T11:30:00.000Z',
            source: 'desktop_manual',
          },
        },
      }),
    )

    expectIssue(result, {
      path: 'statuses.member_2.memberId',
      code: 'invalid_status',
    })
  })
})
