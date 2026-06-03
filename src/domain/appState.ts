import { isKnownStatusKey, isSelectableStatusKey } from '../data/statusPresets'
import type {
  AppState,
  Member,
  MemberStatus,
  SelectableStatusKey,
} from '../types/domain'

type AddMemberInput = {
  id: string
  displayName: string
  avatarKey: string
  color?: string
}

type SetMemberStatusInput = {
  memberId: string
  statusKey: SelectableStatusKey
  note?: string
  expiresAt?: string
}

export function createEmptyAppState(): AppState {
  return {
    members: [],
    statuses: {},
    settings: {
      theme: 'pixel_home',
      expiredFallback: 'offline',
    },
  }
}

export function addMember(
  state: AppState,
  input: AddMemberInput,
  now: string,
): AppState {
  if (state.members.some((member) => member.id === input.id)) {
    throw new Error(`Cannot add duplicate member: ${input.id}`)
  }

  const member: Member = {
    id: input.id,
    displayName: input.displayName,
    avatarKey: input.avatarKey,
    color: input.color,
    createdAt: now,
    updatedAt: now,
  }

  return {
    ...state,
    members: [...state.members, member],
  }
}

export function removeMember(state: AppState, memberId: string): AppState {
  const remainingStatuses = Object.fromEntries(
    Object.entries(state.statuses).filter(([id]) => id !== memberId),
  )

  return {
    ...state,
    members: state.members.filter((member) => member.id !== memberId),
    statuses: remainingStatuses,
  }
}

export function setMemberStatus(
  state: AppState,
  input: SetMemberStatusInput,
  now: string,
): AppState {
  if (!state.members.some((member) => member.id === input.memberId)) {
    throw new Error(`Cannot set status for missing member: ${input.memberId}`)
  }

  if (!isKnownStatusKey(input.statusKey)) {
    throw new Error(`Unknown status key: ${input.statusKey}`)
  }

  if (!isSelectableStatusKey(input.statusKey)) {
    throw new Error(
      `Cannot manually set non-selectable status: ${input.statusKey}`,
    )
  }

  const status: MemberStatus = {
    memberId: input.memberId,
    statusKey: input.statusKey,
    note: input.note,
    startedAt: now,
    expiresAt: input.expiresAt,
    updatedAt: now,
  }

  return {
    ...state,
    statuses: {
      ...state.statuses,
      [input.memberId]: status,
    },
  }
}
