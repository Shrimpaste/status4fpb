import { describe, expect, it, vi } from 'vitest'
import { createSharedInviteLink, parseSharedInviteLink } from './inviteLink'

describe('shared invite link', () => {
  it('creates a relative join link with invite code', () => {
    expect(createSharedInviteLink({ inviteCode: 'TOWN-ABCD' })).toBe(
      '/join?code=TOWN-ABCD',
    )
  })

  it('parses a relative join link invite code', () => {
    expect(parseSharedInviteLink('/join?code=TOWN-ABCD')).toEqual({
      ok: true,
      inviteCode: 'TOWN-ABCD',
    })
  })

  it('parses a hash join link invite code', () => {
    expect(parseSharedInviteLink('#/join?code=TOWN-ABCD')).toEqual({
      ok: true,
      inviteCode: 'TOWN-ABCD',
    })
  })

  it('parses a status4fpb custom scheme invite code', () => {
    expect(parseSharedInviteLink('status4fpb://join?code=TOWN-ABCD')).toEqual({
      ok: true,
      inviteCode: 'TOWN-ABCD',
    })
  })

  it('rejects a missing invite code', () => {
    expect(parseSharedInviteLink('/join')).toEqual({
      ok: false,
      reason: 'missing_invite_code',
    })
    expect(parseSharedInviteLink('/join?room=TOWN')).toEqual({
      ok: false,
      reason: 'missing_invite_code',
    })
  })

  it('rejects invalid invite code characters', () => {
    expect(parseSharedInviteLink('/join?code=town_abcd')).toEqual({
      ok: false,
      reason: 'invalid_invite_code',
    })
    expect(parseSharedInviteLink('/join?code=ABC')).toEqual({
      ok: false,
      reason: 'invalid_invite_code',
    })
  })

  it('rejects memberSecret in query data', () => {
    expect(
      parseSharedInviteLink('/join?code=TOWN-ABCD&memberSecret=secret_1'),
    ).toEqual({
      ok: false,
      reason: 'forbidden_secret',
    })
  })

  it('rejects token, credential, and authorization in query data', () => {
    for (const field of ['token', 'credential', 'authorization']) {
      expect(
        parseSharedInviteLink(`/join?code=TOWN-ABCD&${field}=nope`),
      ).toEqual({
        ok: false,
        reason: 'forbidden_secret',
      })
    }
  })

  it('rejects secret fields in hash data', () => {
    expect(parseSharedInviteLink('#/join?code=TOWN-ABCD&secret=nope')).toEqual({
      ok: false,
      reason: 'forbidden_secret',
    })
  })

  it('does not include memberSecret when creating a link from extra fields', () => {
    const link = createSharedInviteLink({
      inviteCode: 'TOWN-ABCD',
      memberSecret: 'secret_1',
    } as unknown as Parameters<typeof createSharedInviteLink>[0])

    expect(link).toBe('/join?code=TOWN-ABCD')
    expect(link).not.toContain('memberSecret')
    expect(link).not.toContain('secret_1')
  })

  it('does not auto-join or call network APIs while parsing', () => {
    const fetchSpy = vi.fn()
    const webSocketSpy = vi.fn()
    const eventSourceSpy = vi.fn()
    const xhrSpy = vi.fn()

    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('WebSocket', webSocketSpy)
    vi.stubGlobal('EventSource', eventSourceSpy)
    vi.stubGlobal('XMLHttpRequest', xhrSpy)

    try {
      parseSharedInviteLink('/join?code=TOWN-ABCD')
      parseSharedInviteLink('status4fpb://join?code=TOWN-ABCD')
      parseSharedInviteLink('/join?code=TOWN-ABCD&token=nope')

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(webSocketSpy).not.toHaveBeenCalled()
      expect(eventSourceSpy).not.toHaveBeenCalled()
      expect(xhrSpy).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
