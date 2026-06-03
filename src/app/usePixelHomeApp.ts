import { useMemo, useState } from 'react'
import { addMember, removeMember, setMemberStatus } from '../domain/appState'
import {
  computeExpiresAt,
  type ExpirationPresetKey,
} from '../domain/statusExpiration'
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

export type SetVirtualMemberStatusInput = {
  statusKey: SelectableStatusKey
  note?: string
  expirationPreset?: ExpirationPresetKey
}

export type PixelHomeApp = {
  state: AppState
  addVirtualMember: (displayName: string) => void
  setVirtualMemberStatus: (
    memberId: string,
    input: SetVirtualMemberStatusInput,
  ) => void
  removeVirtualMember: (memberId: string) => void
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
    input: SetVirtualMemberStatusInput,
  ) {
    const now = new Date().toISOString()
    const note = input.note?.trim()
    const expiresAt = computeExpiresAt(input.expirationPreset ?? 'none', now)

    commit((current) =>
      setMemberStatus(
        current,
        {
          memberId,
          statusKey: input.statusKey,
          ...(note ? { note } : {}),
          ...(expiresAt ? { expiresAt } : {}),
        },
        now,
      ),
    )
  }

  function removeVirtualMember(memberId: string) {
    commit((current) => removeMember(current, memberId))
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
    removeVirtualMember,
    getMemberStatus,
  }
}
