import { useCallback, useMemo, useRef, useState } from 'react'
import { createLocalSharedTownSession } from '../shared-sync/localSharedTownSession'
import type { SharedTownDisplayState } from '../shared-sync/sharedStateAdapter'
import type { SelectableStatusKey } from '../types/domain'

const DEMO_ROOM_NAME = '共享小镇实验室'
const DEMO_CREATOR = {
  displayName: '我',
  avatarKey: 'orange',
  color: '#f68084',
}
const DEMO_JOINED_MEMBER = {
  avatarKey: 'green',
  color: '#66d4d8',
}

type LocalSharedTownSession = ReturnType<typeof createLocalSharedTownSession>

export function useLocalSharedTownDemo() {
  const sessionRef = useRef<LocalSharedTownSession | null>(null)
  const inviteCodeRef = useRef<string | null>(null)
  const [displayState, setDisplayState] =
    useState<SharedTownDisplayState | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const members = useMemo(() => displayState?.members ?? [], [displayState])
  const statuses = useMemo(() => displayState?.statuses ?? {}, [displayState])

  const createDemoRoom = useCallback(() => {
    const session = createLocalSharedTownSession()
    const created = session.createRoom({
      roomName: DEMO_ROOM_NAME,
      creator: DEMO_CREATOR,
    })

    sessionRef.current = session
    inviteCodeRef.current = created.inviteCode
    setErrorMessage(null)
    setDisplayState(created.displayState)
  }, [])

  const joinDemoMember = useCallback((displayName: string) => {
    const session = sessionRef.current
    const inviteCode = inviteCodeRef.current
    const trimmedName = displayName.trim()

    if (!session || !inviteCode || !trimmedName) {
      return
    }

    const joined = session.joinRoom({
      inviteCode,
      member: {
        displayName: trimmedName,
        ...DEMO_JOINED_MEMBER,
      },
    })

    setErrorMessage(null)
    setDisplayState(joined.displayState)
  }, [])

  const setDemoMemberStatus = useCallback(
    (memberId: string, statusKey: SelectableStatusKey) => {
      const session = sessionRef.current

      if (!session) {
        return
      }

      try {
        const display = session.setStatus(memberId, {
          statusKey,
          source: 'desktop_manual',
        })

        setErrorMessage(null)
        setDisplayState(display)
      } catch {
        setErrorMessage('Demo member is no longer active.')
        setDisplayState((currentDisplayState) => currentDisplayState)
      }
    },
    [],
  )

  const leaveDemoMember = useCallback((memberId: string) => {
    const session = sessionRef.current

    if (!session) {
      return
    }

    try {
      const display = session.leaveRoom(memberId)

      setErrorMessage(null)
      setDisplayState(display)
    } catch {
      setErrorMessage('Demo member is no longer active.')
    }
  }, [])

  const resetDemo = useCallback(() => {
    sessionRef.current = null
    inviteCodeRef.current = null
    setErrorMessage(null)
    setDisplayState(null)
  }, [])

  return {
    isActive: displayState !== null,
    displayState,
    members,
    statuses,
    errorMessage,
    createDemoRoom,
    joinDemoMember,
    setDemoMemberStatus,
    leaveDemoMember,
    resetDemo,
  }
}
