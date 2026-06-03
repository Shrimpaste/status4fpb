import { useMemo, useState } from 'react'
import { addMember, setMemberStatus } from '../domain/appState'
import { getEffectiveStatus } from '../domain/statusLogic'
import { createLocalStorageStore } from '../storage/localStorageStore'
import type {
  AppState,
  EffectiveStatus,
  Member,
  SelectableStatusKey,
} from '../types/domain'
import { createMemberId } from './createMemberId'

const avatarKeys = ['orange', 'cyan', 'green', 'rose']

export type PixelHomeApp = {
  state: AppState
  addVirtualMember: (displayName: string) => void
  setVirtualMemberStatus: (
    memberId: string,
    statusKey: SelectableStatusKey,
  ) => void
  getMemberStatus: (memberId: string) => EffectiveStatus
}

export function usePixelHomeApp(): PixelHomeApp {
  const store = useMemo(
    () => createLocalStorageStore(window.localStorage),
    [],
  )
  const [state, setState] = useState<AppState>(() => store.load())

  function commit(update: (current: AppState) => AppState) {
    setState((current) => {
      const next = update(current)
      store.save(next)
      return next
    })
  }

  function addVirtualMember(displayName: string) {
    const trimmedName = displayName.trim()

    if (!trimmedName) {
      return
    }

    const id = createMemberId()
    const now = new Date().toISOString()

    commit((current) =>
      addMember(
        current,
        {
          id,
          displayName: trimmedName,
          avatarKey: avatarKeys[current.members.length % avatarKeys.length],
        },
        now,
      ),
    )
  }

  function setVirtualMemberStatus(
    memberId: string,
    statusKey: SelectableStatusKey,
  ) {
    const now = new Date().toISOString()

    commit((current) => setMemberStatus(current, { memberId, statusKey }, now))
  }

  function getMemberStatus(memberId: Member['id']) {
    return getEffectiveStatus(memberId, state.statuses, new Date().toISOString(), {
      expiredFallback: state.settings.expiredFallback,
    })
  }

  return {
    state,
    addVirtualMember,
    setVirtualMemberStatus,
    getMemberStatus,
  }
}
