import { STATUS_PRESETS } from '../data/statusPresets'
import type {
  EffectiveStatus,
  ExpiredFallbackStatusKey,
  MemberStatus,
} from '../types/domain'

type EffectiveStatusOptions = {
  expiredFallback?: ExpiredFallbackStatusKey
}

export function isStatusExpired(status: MemberStatus, now: string): boolean {
  if (!status.expiresAt) {
    return false
  }

  const expiresAtMs = Date.parse(status.expiresAt)
  const nowMs = Date.parse(now)

  if (Number.isNaN(expiresAtMs) || Number.isNaN(nowMs)) {
    return false
  }

  return expiresAtMs <= nowMs
}

export function getEffectiveStatus(
  memberId: string,
  statuses: Record<string, MemberStatus>,
  now: string,
  options: EffectiveStatusOptions = {},
): EffectiveStatus {
  const status = statuses[memberId]

  if (!status) {
    return {
      ...STATUS_PRESETS.unknown,
      memberId,
      source: 'missing',
    }
  }

  if (isStatusExpired(status, now)) {
    const fallback = options.expiredFallback ?? 'offline'

    return {
      ...STATUS_PRESETS[fallback],
      memberId,
      source: 'expired_fallback',
      updatedAt: status.updatedAt,
    }
  }

  return {
    ...STATUS_PRESETS[status.statusKey],
    memberId,
    note: status.note,
    startedAt: status.startedAt,
    expiresAt: status.expiresAt,
    updatedAt: status.updatedAt,
    source: 'current',
  }
}
