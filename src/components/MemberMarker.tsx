import type { EffectiveStatus, Member } from '../types/domain'

type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
  zoneLabel: string
}

export function MemberMarker({ member, status, zoneLabel }: MemberMarkerProps) {
  return (
    <span
      className="member-marker"
      aria-label={`成员 ${member.displayName} 当前 ${status.label}，位于 ${zoneLabel}`}
    >
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
    </span>
  )
}
