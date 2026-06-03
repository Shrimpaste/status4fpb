import { describe, expect, it, vi } from 'vitest'
import { SharedSyncError } from './localMockSyncClient'
import { createLocalSharedTownSession } from './localSharedTownSession'

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

function createSession() {
  return createLocalSharedTownSession({
    now: () => NOW,
    idFactory: {
      roomId: createSequence(['room_1']),
      inviteCode: createSequence(['TOWN-ABCD']),
      memberId: createSequence(['member_1', 'member_2']),
      memberSecret: createSequence(['secret_1', 'secret_2']),
    },
  })
}

function createRoom(session: ReturnType<typeof createLocalSharedTownSession>) {
  return session.createRoom({
    roomName: 'Evening Study Town',
    creator: {
      displayName: 'Bei',
      avatarKey: 'orange',
      color: '#ff9f43',
    },
  })
}

function joinRoom(
  session: ReturnType<typeof createLocalSharedTownSession>,
  inviteCode: string,
) {
  return session.joinRoom({
    inviteCode,
    member: {
      displayName: 'Nan',
      avatarKey: 'green',
      color: '#2ecc71',
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

describe('local shared town session', () => {
  it('creates a room with credential and display state', () => {
    const session = createSession()
    const created = createRoom(session)

    expect(created.inviteCode).toBe('TOWN-ABCD')
    expect(created.credential).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_1',
      memberSecret: 'secret_1',
    })
    expect(created.displayState).toMatchObject({
      roomId: 'room_1',
      roomName: 'Evening Study Town',
      serverTime: NOW,
    })
    expect(created.displayState.members).toEqual([
      {
        memberId: 'member_1',
        displayName: 'Bei',
        avatarKey: 'orange',
        color: '#ff9f43',
      },
    ])
  })

  it('returns adapted display state with server time and statuses', () => {
    const session = createSession()
    createRoom(session)

    session.setStatus('member_1', {
      statusKey: 'exam_paper',
      note: 'second paper',
      source: 'desktop_manual',
    })

    expect(session.getDisplayState()).toMatchObject({
      serverTime: NOW,
      statuses: {
        member_1: {
          statusKey: 'exam_paper',
          note: 'second paper',
          isExpired: false,
        },
      },
    })
  })

  it('joins a second member to the same room', () => {
    const session = createSession()
    const created = createRoom(session)
    const joined = joinRoom(session, created.inviteCode)

    expect(joined.credential).toMatchObject({
      roomId: 'room_1',
      memberId: 'member_2',
      memberSecret: 'secret_2',
    })
    expect(session.getDisplayState().members.map((member) => member.memberId)).toEqual([
      'member_1',
      'member_2',
    ])
  })

  it('sets status for the selected member through stored credential', () => {
    const session = createSession()
    const created = createRoom(session)
    joinRoom(session, created.inviteCode)

    const display = session.setStatus('member_2', {
      statusKey: 'scope_shrinking',
      note: 'focus mode',
      source: 'desktop_manual',
    })

    expect(display.statuses.member_1).toBeUndefined()
    expect(display.statuses.member_2).toMatchObject({
      statusKey: 'scope_shrinking',
      note: 'focus mode',
    })
  })

  it('converges repeated status updates to one current display status', () => {
    const session = createSession()
    createRoom(session)

    session.setStatus('member_1', {
      statusKey: 'exam_paper',
      note: 'first',
      source: 'desktop_manual',
    })
    const display = session.setStatus('member_1', {
      statusKey: 'scope_shrinking',
      note: 'second',
      source: 'desktop_manual',
    })

    expect(Object.keys(display.statuses)).toEqual(['member_1'])
    expect(display.statuses.member_1).toMatchObject({
      statusKey: 'scope_shrinking',
      note: 'second',
    })
  })

  it('leaves a room and prevents later status updates for that member', () => {
    const session = createSession()
    createRoom(session)
    session.setStatus('member_1', {
      statusKey: 'exam_paper',
      source: 'desktop_manual',
    })

    const display = session.leaveRoom('member_1')

    expect(display.members[0]).toMatchObject({
      memberId: 'member_1',
      leftAt: NOW,
    })
    expect(display.statuses.member_1).toBeUndefined()
    expectSharedSyncError(
      () =>
        session.setStatus('member_1', {
          statusKey: 'scope_shrinking',
          source: 'desktop_manual',
        }),
      'member_not_found',
    )
  })

  it('does not expose member secrets in raw state', () => {
    const session = createSession()
    const created = createRoom(session)
    joinRoom(session, created.inviteCode)

    const serialized = JSON.stringify(session.getRawState())

    expect(serialized).not.toContain('secret_1')
    expect(serialized).not.toContain('secret_2')
  })

  it('does not expose member secrets in display state', () => {
    const session = createSession()
    const created = createRoom(session)
    joinRoom(session, created.inviteCode)

    const serialized = JSON.stringify(session.getDisplayState())

    expect(serialized).not.toContain('secret_1')
    expect(serialized).not.toContain('secret_2')
  })

  it('does not expose a raw invalid-state mutation seam', () => {
    const session = createSession()

    expect(Object.keys(session).sort()).toEqual([
      'createRoom',
      'getDisplayState',
      'getRawState',
      'joinRoom',
      'leaveRoom',
      'setStatus',
    ])
  })

  it('does not call network APIs during local session operations', () => {
    const fetchSpy = vi.fn()
    const webSocketSpy = vi.fn()
    const eventSourceSpy = vi.fn()
    const xhrSpy = vi.fn()

    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('WebSocket', webSocketSpy)
    vi.stubGlobal('EventSource', eventSourceSpy)
    vi.stubGlobal('XMLHttpRequest', xhrSpy)

    try {
      const session = createSession()
      const created = createRoom(session)

      joinRoom(session, created.inviteCode)
      session.setStatus('member_1', {
        statusKey: 'exam_paper',
        source: 'desktop_manual',
      })
      session.leaveRoom('member_1')

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(webSocketSpy).not.toHaveBeenCalled()
      expect(eventSourceSpy).not.toHaveBeenCalled()
      expect(xhrSpy).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
