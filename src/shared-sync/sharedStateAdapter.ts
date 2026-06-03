import type { SelectableStatusKey } from '../types/domain'
import type {
  SharedStatusSource,
  SharedTownState,
} from './types'

export type SharedTownDisplayMember = {
  memberId: string
  displayName: string
  avatarKey: string
  color?: string
  leftAt?: string
}

export type SharedTownDisplayStatus = {
  memberId: string
  statusKey: SelectableStatusKey
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
  source: SharedStatusSource
  isExpired: boolean
}

export type SharedTownDisplayState = {
  roomId: string
  roomName: string
  serverTime: string
  members: SharedTownDisplayMember[]
  statuses: Record<string, SharedTownDisplayStatus>
}

export function adaptSharedTownStateForDisplay(
  state: SharedTownState,
): SharedTownDisplayState {
  const memberById = new Map(
    state.members.map((member) => [member.memberId, member]),
  )
  const activeMemberIds = new Set(
    state.members
      .filter((member) => !member.leftAt)
      .map((member) => member.memberId),
  )

  return {
    roomId: state.room.roomId,
    roomName: state.room.name,
    serverTime: state.serverTime,
    members: state.members.map((member) => ({
      memberId: member.memberId,
      displayName: member.displayName,
      avatarKey: member.avatarKey,
      ...(member.color ? { color: member.color } : {}),
      ...(member.leftAt ? { leftAt: member.leftAt } : {}),
    })),
    statuses: Object.fromEntries(
      Object.entries(state.statuses)
        .filter(([memberId, status]) => {
          const member = memberById.get(memberId)

          return Boolean(
            member &&
              activeMemberIds.has(memberId) &&
              status.memberId === memberId,
          )
        })
        .map(([memberId, status]) => [
          memberId,
          {
            memberId,
            statusKey: status.statusKey,
            ...(status.note ? { note: status.note } : {}),
            startedAt: status.startedAt,
            ...(status.expiresAt ? { expiresAt: status.expiresAt } : {}),
            updatedAt: status.updatedAt,
            source: status.source,
            isExpired: isStatusExpired(status.expiresAt, state.serverTime),
          },
        ]),
    ),
  }
}

function isStatusExpired(expiresAt: string | undefined, serverTime: string): boolean {
  if (!expiresAt) {
    return false
  }

  return Date.parse(expiresAt) <= Date.parse(serverTime)
}
