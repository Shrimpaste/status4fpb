import type { EffectiveStatus, Member, StatusKey } from '../types/domain'

const statusActionVignettes: Record<StatusKey, string> = {
  exam_paper: '刷卷堆塔',
  scope_shrinking: '缩圈画阵',
  fishing: '池边摸鱼',
  vocabulary: '背词翻页',
  sleeping: '旅馆充电',
  deadline: 'DDL 锻造',
  offline: '雾里失联',
  idle: '广场放空',
  unknown: '路牌待机',
}

type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
  zoneLabel: string
}

export function MemberMarker({ member, status, zoneLabel }: MemberMarkerProps) {
  const actionVignette = statusActionVignettes[status.statusKey]

  return (
    <span
      className="member-marker"
      aria-label={`成员 ${member.displayName} 当前 ${status.label}，位于 ${zoneLabel}，正在${actionVignette}`}
    >
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
      <span className="member-vignette">{actionVignette}</span>
    </span>
  )
}
