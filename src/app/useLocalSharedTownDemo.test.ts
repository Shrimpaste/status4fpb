import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  createSharedInviteLink,
  parseSharedInviteLink,
} from '../shared-sync/inviteLink'
import { useLocalSharedTownDemo } from './useLocalSharedTownDemo'

describe('useLocalSharedTownDemo', () => {
  it('starts inactive with empty local demo state', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    expect(result.current.isActive).toBe(false)
    expect(result.current.displayState).toBeNull()
    expect(result.current.members).toEqual([])
    expect(result.current.statuses).toEqual({})
  })

  it('creates a local shared town display state', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
    })

    expect(result.current.isActive).toBe(true)
    expect(result.current.displayState).toMatchObject({
      roomName: '共享小镇实验室',
    })
    expect(result.current.members).toEqual([
      expect.objectContaining({
        displayName: '我',
        avatarKey: 'orange',
      }),
    ])
  })

  it('joins a second demo member', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.joinDemoMember('演示成员')
    })

    expect(result.current.members.map((member) => member.displayName)).toEqual([
      '我',
      '演示成员',
    ])
  })

  it('sets a demo member status in the shared display projection', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.joinDemoMember('演示成员')
    })

    const memberId = result.current.members[1].memberId

    act(() => {
      result.current.setDemoMemberStatus(memberId, 'exam_paper')
    })

    expect(result.current.statuses[memberId]).toMatchObject({
      statusKey: 'exam_paper',
      source: 'desktop_manual',
      isExpired: false,
    })
  })

  it('leaves a demo member and prevents later status updates for that member', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.joinDemoMember('演示成员')
    })

    const memberId = result.current.members[1].memberId

    act(() => {
      result.current.setDemoMemberStatus(memberId, 'exam_paper')
      result.current.leaveDemoMember(memberId)
      result.current.setDemoMemberStatus(memberId, 'scope_shrinking')
    })

    const leftMember = result.current.members.find(
      (member) => member.memberId === memberId,
    )

    expect(leftMember?.leftAt).toBeDefined()
    expect(result.current.statuses[memberId]).toBeUndefined()
  })

  it('resets only the in-memory demo state', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.joinDemoMember('演示成员')
      result.current.resetDemo()
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.displayState).toBeNull()
    expect(result.current.members).toEqual([])
    expect(result.current.statuses).toEqual({})
  })

  it('does not call localStorage while operating the demo', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
    const { result } = renderHook(() => useLocalSharedTownDemo())

    try {
      act(() => {
        result.current.createDemoRoom()
        result.current.joinDemoMember('演示成员')
      })

      const memberId = result.current.members[1].memberId

      act(() => {
        result.current.setDemoMemberStatus(memberId, 'exam_paper')
        result.current.resetDemo()
      })

      expect(getItemSpy).not.toHaveBeenCalled()
      expect(setItemSpy).not.toHaveBeenCalled()
      expect(removeItemSpy).not.toHaveBeenCalled()
    } finally {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
      removeItemSpy.mockRestore()
    }
  })

  it('does not expose member secrets in returned state', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.joinDemoMember('演示成员')
    })

    expect(
      JSON.stringify({
        displayState: result.current.displayState,
        members: result.current.members,
        statuses: result.current.statuses,
      }),
    ).not.toContain('secret')
  })

  it('exposes a parser-valid invite code for local demo links', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
    })

    expect(result.current.inviteCode).toBe('TOWN-0001')

    const inviteCode = result.current.inviteCode

    if (inviteCode === null) {
      throw new Error('Expected the local demo room to expose an invite code.')
    }

    const inviteLink = createSharedInviteLink({
      inviteCode,
    })

    expect(inviteLink).toBe('/join?code=TOWN-0001')
    expect(parseSharedInviteLink(inviteLink)).toEqual({
      ok: true,
      inviteCode: 'TOWN-0001',
    })
    expect(inviteLink).not.toContain('memberSecret')
    expect(inviteLink).not.toContain('secret')
    expect(inviteLink).not.toContain('token')
    expect(inviteLink).not.toContain('credential')
    expect(inviteLink).not.toContain('authorization')
  })

  it('clears the local demo invite code on reset', () => {
    const { result } = renderHook(() => useLocalSharedTownDemo())

    act(() => {
      result.current.createDemoRoom()
      result.current.resetDemo()
    })

    expect(result.current.inviteCode).toBeNull()
  })
})
