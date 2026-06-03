import { isSelectableStatusKey } from '../data/statusPresets'
import { createEmptyAppState } from '../domain/appState'
import type {
  AppSettings,
  AppState,
  ExpiredFallbackStatusKey,
  Member,
  MemberStatus,
} from '../types/domain'

export const STORAGE_KEY = 'qq-status-pixel-home:v1'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

type UnknownRecord = Record<string, unknown>

export function createLocalStorageStore(storage: StorageLike) {
  return {
    load(): AppState {
      const raw = storage.getItem(STORAGE_KEY)

      if (!raw) {
        return createEmptyAppState()
      }

      try {
        return normalizeAppState(JSON.parse(raw)) ?? createEmptyAppState()
      } catch {
        return createEmptyAppState()
      }
    },

    save(state: AppState): void {
      const normalized = normalizeAppState(state) ?? createEmptyAppState()
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    },

    clear(): void {
      storage.removeItem(STORAGE_KEY)
    },
  }
}

function normalizeAppState(value: unknown): AppState | null {
  if (!isRecord(value) || !Array.isArray(value.members)) {
    return null
  }

  if (!isRecord(value.statuses)) {
    return null
  }

  const members = normalizeMembers(value.members)

  if (!members) {
    return null
  }

  const memberIds = new Set(members.map((member) => member.id))

  return {
    members,
    statuses: normalizeStatuses(value.statuses, memberIds),
    settings: normalizeSettings(value.settings),
  }
}

function normalizeMembers(values: unknown[]): Member[] | null {
  const members: Member[] = []

  for (const value of values) {
    const member = normalizeMember(value)

    if (!member) {
      return null
    }

    members.push(member)
  }

  return members
}

function normalizeMember(value: unknown): Member | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isString(value.id) ||
    !isString(value.displayName) ||
    !isString(value.avatarKey) ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    return null
  }

  return {
    id: value.id,
    displayName: value.displayName,
    avatarKey: value.avatarKey,
    ...(isString(value.color) ? { color: value.color } : {}),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function normalizeStatuses(
  values: UnknownRecord,
  memberIds: Set<string>,
): Record<string, MemberStatus> {
  const statuses: Record<string, MemberStatus> = {}

  for (const [key, value] of Object.entries(values)) {
    const status = normalizeMemberStatus(value)

    if (!status || status.memberId !== key || !memberIds.has(status.memberId)) {
      continue
    }

    statuses[key] = status
  }

  return statuses
}

function normalizeMemberStatus(value: unknown): MemberStatus | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isString(value.memberId) ||
    !isString(value.statusKey) ||
    !isSelectableStatusKey(value.statusKey) ||
    !isString(value.startedAt) ||
    !isString(value.updatedAt)
  ) {
    return null
  }

  return {
    memberId: value.memberId,
    statusKey: value.statusKey,
    ...(isString(value.note) ? { note: value.note } : {}),
    startedAt: value.startedAt,
    ...(isString(value.expiresAt) ? { expiresAt: value.expiresAt } : {}),
    updatedAt: value.updatedAt,
  }
}

function normalizeSettings(value: unknown): AppSettings {
  const defaults = createEmptyAppState().settings

  if (!isRecord(value)) {
    return defaults
  }

  return {
    theme: isTheme(value.theme) ? value.theme : defaults.theme,
    expiredFallback: isExpiredFallback(value.expiredFallback)
      ? value.expiredFallback
      : defaults.expiredFallback,
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isTheme(value: unknown): value is AppSettings['theme'] {
  return value === 'pixel_home' || value === 'study_room' || value === 'campus'
}

function isExpiredFallback(value: unknown): value is ExpiredFallbackStatusKey {
  return value === 'offline' || value === 'idle'
}
