import type { SelectableStatusKey } from '../types/domain'

export const SHARED_STATUS_SOURCES = [
  'desktop_manual',
  'web_manual',
  'qq_bot_command',
  'timer_rule',
] as const

export type SharedStatusSource = (typeof SHARED_STATUS_SOURCES)[number]

export type SharedTownRoom = {
  roomId: string
  name: string
  createdAt: string
  updatedAt: string
}

export type SharedTownMember = {
  roomId: string
  memberId: string
  displayName: string
  avatarKey: string
  color?: string
  createdAt: string
  updatedAt: string
  leftAt?: string
}

export type SharedStatus = {
  roomId: string
  memberId: string
  statusKey: SelectableStatusKey
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
  source: SharedStatusSource
}

export type SharedTownState = {
  room: SharedTownRoom
  members: SharedTownMember[]
  statuses: Record<string, SharedStatus>
  serverTime: string
}

export type SharedMemberCredential = {
  roomId: string
  memberId: string
  memberSecret: string
  createdAt: string
  updatedAt: string
}

export type SharedStatusInput = {
  statusKey: SelectableStatusKey
  note?: string
  expiresAt?: string
  source: Exclude<SharedStatusSource, 'timer_rule'>
}
