import { describe, expect, it } from 'vitest'
import {
  addMember,
  createEmptyAppState,
  removeMember,
  setMemberStatus,
} from './appState'

const NOW = '2026-06-03T12:00:00.000Z'

describe('app state transitions', () => {
  it('adds a virtual member without real QQ identifiers', () => {
    const next = addMember(
      createEmptyAppState(),
      { id: 'm1', displayName: '北北', avatarKey: 'orange' },
      NOW,
    )

    expect(next.members).toEqual([
      {
        id: 'm1',
        displayName: '北北',
        avatarKey: 'orange',
        createdAt: NOW,
        updatedAt: NOW,
      },
    ])
  })

  it('sets required statuses for a member', () => {
    const withMember = addMember(
      createEmptyAppState(),
      { id: 'm1', displayName: '北北', avatarKey: 'orange' },
      NOW,
    )
    const next = setMemberStatus(
      withMember,
      {
        memberId: 'm1',
        statusKey: 'exam_paper',
        note: '2022 真题',
        expiresAt: '2026-06-03T14:00:00.000Z',
      },
      NOW,
    )

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
    const withMember = addMember(
      createEmptyAppState(),
      { id: 'm1', displayName: '北北', avatarKey: 'orange' },
      NOW,
    )
    const withStatus = setMemberStatus(
      withMember,
      { memberId: 'm1', statusKey: 'scope_shrinking' },
      NOW,
    )
    const next = removeMember(withStatus, 'm1')

    expect(next.members).toEqual([])
    expect(next.statuses.m1).toBeUndefined()
  })

  it('rejects setting status for a missing member', () => {
    expect(() =>
      setMemberStatus(
        createEmptyAppState(),
        { memberId: 'missing', statusKey: 'exam_paper' },
        NOW,
      ),
    ).toThrow('Cannot set status for missing member: missing')
  })

  it('rejects manually setting non-selectable fallback statuses', () => {
    const withMember = addMember(
      createEmptyAppState(),
      { id: 'm1', displayName: '北北', avatarKey: 'orange' },
      NOW,
    )

    expect(() =>
      setMemberStatus(
        withMember,
        { memberId: 'm1', statusKey: 'unknown' as never },
        NOW,
      ),
    ).toThrow('Cannot manually set non-selectable status: unknown')
  })
})
