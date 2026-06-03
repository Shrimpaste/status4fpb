import { describe, expect, it } from 'vitest'
import {
  SharedSyncError,
  createLocalMockSyncClient,
} from './localMockSyncClient'
import type { SharedStatusInput } from './types'

const NOW = '2026-06-03T12:00:00.000Z'

function createSequence(values: string[]): () => string {
  let index = 0

  return () => {
    const value = values[index]
    index += 1

    if (!value) {
      throw new Error('Test id sequence exhausted')
    }

    return value
  }
}

function createClient() {
  return createLocalMockSyncClient({
    now: () => NOW,
    idFactory: {
      roomId: createSequence(['room_1']),
      inviteCode: createSequence(['TOWN-ABCD']),
      memberId: createSequence(['member_1', 'member_2']),
      memberSecret: createSequence(['secret_1', 'secret_2']),
    },
  })
}

function createRoom(client: ReturnType<typeof createLocalMockSyncClient>) {
  return client.createRoom({
    roomName: 'Evening Study Town',
    creator: {
      displayName: 'Bei',
      avatarKey: 'orange',
      color: '#ff9f43',
    },
  })
}

function expectSharedSyncError(action: () => unknown, code: string) {
  let error: unknown

  try {
    action()
  } catch (caught) {
    error = caught
  }

  expect(error).toBeInstanceOf(SharedSyncError)
  expect((error as SharedSyncError).code).toBe(code)
}

describe('local mock sync client', () => {
  it('creates a room with invite code, creator credential, and state', () => {
    const client = createClient()
    const created = createRoom(client)

    expect(created.room).toMatchObject({
      roomId: 'room_1',
      name: 'Evening Study Town',
      createdAt: NOW,
      updatedAt: NOW,
    })
    expect(created.inviteCode).toBe('TOWN-ABCD')
    expect(created.credential).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_1',
      memberSecret: 'secret_1',
    })
    expect(created.state.room).toEqual(created.room)
    expect(created.state.members).toHaveLength(1)
    expect(created.state.serverTime).toBe(NOW)
  })

  it('joins a room with an invite code', () => {
    const client = createClient()
    const created = createRoom(client)
    const joined = client.joinRoom(created.inviteCode, {
      displayName: 'Nan',
      avatarKey: 'green',
    })

    expect(joined.member).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_2',
      displayName: 'Nan',
    })
    expect(joined.credential).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_2',
      memberSecret: 'secret_2',
    })
    expect(joined.state.members.map((member) => member.memberId)).toEqual([
      'member_1',
      'member_2',
    ])
  })

  it('returns room state without member secrets', () => {
    const client = createClient()
    const created = createRoom(client)
    client.joinRoom(created.inviteCode, {
      displayName: 'Nan',
      avatarKey: 'green',
    })

    const state = client.getRoomState(created.room.roomId)
    const serializedState = JSON.stringify(state)

    expect(state.serverTime).toBe(NOW)
    expect(serializedState).not.toContain('secret_1')
    expect(serializedState).not.toContain('secret_2')
    expect(serializedState).not.toContain(created.inviteCode)
  })

  it('sets status for the authenticated member only', () => {
    const client = createClient()
    const created = createRoom(client)
    const updated = client.setMemberStatus(
      created.room.roomId,
      created.credential.memberId,
      created.credential.memberSecret,
      {
        statusKey: 'exam_paper',
        note: 'second paper',
        source: 'desktop_manual',
      },
    )

    expect(updated.status).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_1',
      statusKey: 'exam_paper',
      note: 'second paper',
      startedAt: NOW,
      updatedAt: NOW,
      source: 'desktop_manual',
    })
    expect(updated.state.statuses.member_1).toEqual(updated.status)
  })

  it('rejects an invalid member secret', () => {
    const client = createClient()
    const created = createRoom(client)

    expectSharedSyncError(
      () =>
        client.setMemberStatus(
          created.room.roomId,
          created.credential.memberId,
          'wrong-secret',
          { statusKey: 'exam_paper', source: 'desktop_manual' },
        ),
      'invalid_member_secret',
    )
    expect(client.getRoomState(created.room.roomId).statuses.member_1).toBeUndefined()
  })

  it('rejects cross-member updates', () => {
    const client = createClient()
    const created = createRoom(client)
    const joined = client.joinRoom(created.inviteCode, {
      displayName: 'Nan',
      avatarKey: 'green',
    })

    expectSharedSyncError(
      () =>
        client.setMemberStatus(
          created.room.roomId,
          joined.credential.memberId,
          created.credential.memberSecret,
          { statusKey: 'exam_paper', source: 'desktop_manual' },
        ),
      'invalid_member_secret',
    )
  })

  it('rejects unknown status at runtime if forced through', () => {
    const client = createClient()
    const created = createRoom(client)
    const invalidStatus = {
      statusKey: 'unknown',
      source: 'desktop_manual',
    } as unknown as SharedStatusInput

    expectSharedSyncError(
      () =>
        client.setMemberStatus(
          created.room.roomId,
          created.credential.memberId,
          created.credential.memberSecret,
          invalidStatus,
        ),
      'invalid_status_key',
    )
  })

  it('rejects timer_rule as a client-submitted source at runtime', () => {
    const client = createClient()
    const created = createRoom(client)
    const invalidSource = {
      statusKey: 'exam_paper',
      source: 'timer_rule',
    } as unknown as SharedStatusInput

    expectSharedSyncError(
      () =>
        client.setMemberStatus(
          created.room.roomId,
          created.credential.memberId,
          created.credential.memberSecret,
          invalidSource,
        ),
      'invalid_status_key',
    )
  })

  it('marks a member left and prevents later status updates', () => {
    const client = createClient()
    const created = createRoom(client)
    client.setMemberStatus(
      created.room.roomId,
      created.credential.memberId,
      created.credential.memberSecret,
      { statusKey: 'exam_paper', source: 'desktop_manual' },
    )

    const left = client.leaveRoom(
      created.room.roomId,
      created.credential.memberId,
      created.credential.memberSecret,
    )

    expect(left.member.leftAt).toBe(NOW)
    expect(left.state.statuses.member_1).toBeUndefined()
    expectSharedSyncError(
      () =>
        client.setMemberStatus(
          created.room.roomId,
          created.credential.memberId,
          created.credential.memberSecret,
          { statusKey: 'scope_shrinking', source: 'desktop_manual' },
        ),
      'member_left',
    )
  })

  it('converges repeated status updates to one current status', () => {
    const client = createClient()
    const created = createRoom(client)

    client.setMemberStatus(
      created.room.roomId,
      created.credential.memberId,
      created.credential.memberSecret,
      { statusKey: 'exam_paper', note: 'first', source: 'desktop_manual' },
    )
    client.setMemberStatus(
      created.room.roomId,
      created.credential.memberId,
      created.credential.memberSecret,
      {
        statusKey: 'scope_shrinking',
        note: 'second',
        source: 'desktop_manual',
      },
    )

    const state = client.getRoomState(created.room.roomId)

    expect(Object.keys(state.statuses)).toEqual(['member_1'])
    expect(state.statuses.member_1).toMatchObject({
      statusKey: 'scope_shrinking',
      note: 'second',
    })
  })
})
