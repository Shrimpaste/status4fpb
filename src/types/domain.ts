export type StatusKey =
  | 'exam_paper'
  | 'scope_shrinking'
  | 'fishing'
  | 'vocabulary'
  | 'sleeping'
  | 'deadline'
  | 'offline'
  | 'idle'
  | 'unknown'

export type ExpiredFallbackStatusKey = 'offline' | 'idle'
export type SelectableStatusKey = Exclude<StatusKey, 'unknown'>

export type Member = {
  id: string
  displayName: string
  avatarKey: string
  color?: string
  createdAt: string
  updatedAt: string
}

export type MemberStatus = {
  memberId: string
  statusKey: SelectableStatusKey
  note?: string
  startedAt: string
  expiresAt?: string
  updatedAt: string
}

export type StatusPreset = {
  statusKey: StatusKey
  label: string
  place: string
  description: string
  selectable: boolean
}

export type EffectiveStatus = StatusPreset & {
  memberId: string
  note?: string
  startedAt?: string
  expiresAt?: string
  updatedAt?: string
  source: 'current' | 'expired_fallback' | 'missing'
}

export type AppSettings = {
  theme: 'pixel_home' | 'study_room' | 'campus'
  expiredFallback: ExpiredFallbackStatusKey
}

export type AppState = {
  members: Member[]
  statuses: Record<string, MemberStatus>
  settings: AppSettings
}
