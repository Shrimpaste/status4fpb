import { describe, expect, it } from 'vitest'
import {
  SHARED_STATUS_SOURCES,
  type SharedMemberCredential,
  type SharedStatusInput,
  type SharedTownState,
} from './types'

describe('shared sync type boundary', () => {
  it('defines the contract status sources', () => {
    expect(SHARED_STATUS_SOURCES).toEqual([
      'desktop_manual',
      'web_manual',
      'qq_bot_command',
      'timer_rule',
    ])
  })

  it('accepts selectable manual status input', () => {
    const input: SharedStatusInput = {
      statusKey: 'exam_paper',
      note: 'second paper',
      expiresAt: '2026-06-03T14:00:00.000Z',
      source: 'desktop_manual',
    }

    expect(input).toMatchObject({
      statusKey: 'exam_paper',
      source: 'desktop_manual',
    })
  })

  it('keeps fallback and timer-rule values out of client submissions', () => {
    const invalidStatusInput: SharedStatusInput = {
      // @ts-expect-error unknown is fallback-only and cannot be submitted.
      statusKey: 'unknown',
      source: 'desktop_manual',
    }

    const invalidSourceInput: SharedStatusInput = {
      statusKey: 'exam_paper',
      // @ts-expect-error timer_rule is produced by trusted rules, not clients.
      source: 'timer_rule',
    }

    void invalidStatusInput
    void invalidSourceInput
  })

  it('models shared town state with server time', () => {
    const state: SharedTownState = {
      room: {
        roomId: 'room_1',
        name: 'Evening Study Town',
        createdAt: '2026-06-03T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
      },
      members: [
        {
          roomId: 'room_1',
          memberId: 'member_1',
          displayName: 'Bei',
          avatarKey: 'orange',
          createdAt: '2026-06-03T12:00:00.000Z',
          updatedAt: '2026-06-03T12:00:00.000Z',
        },
      ],
      statuses: {
        member_1: {
          roomId: 'room_1',
          memberId: 'member_1',
          statusKey: 'scope_shrinking',
          startedAt: '2026-06-03T12:30:00.000Z',
          updatedAt: '2026-06-03T12:30:00.000Z',
          source: 'desktop_manual',
        },
      },
      serverTime: '2026-06-03T12:31:00.000Z',
    }

    expect(state.serverTime).toBe('2026-06-03T12:31:00.000Z')
  })

  it('models member credentials without real QQ identifiers', () => {
    const credential: SharedMemberCredential = {
      roomId: 'room_1',
      memberId: 'member_1',
      memberSecret: 'test-secret',
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    }

    expect(Object.keys(credential)).not.toContain('qqId')
    expect(Object.keys(credential)).not.toContain('realQqId')
    expect(credential.memberSecret).toBe('test-secret')
  })
})
