import type { EffectiveStatus, Member } from '../types/domain'

type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
}

export function MemberMarker({ member, status }: MemberMarkerProps) {
  return (
    <span
      className="member-marker"
      aria-label={`成员 ${member.displayName} 当前 ${status.label}`}
    >
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
    </span>
  )
}
