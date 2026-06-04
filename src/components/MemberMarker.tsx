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

const statusVisualElements: Record<StatusKey, string[]> = {
  exam_paper: ['📋', '🪑', '💭'],
  scope_shrinking: ['🏠', '⭕', '🫣'],
  fishing: ['🐟', '🎣', '💭'],
  vocabulary: ['📚', '📖', '💭'],
  sleeping: ['💤', '😴', '🌙'],
  deadline: ['⏰', '🔥', '💨'],
  offline: ['🏠', '💤', '🌫️'],
  idle: ['☀️', '🌿', '💭'],
  unknown: ['❓', '💭', '❓'],
}

type MemberMarkerProps = {
  member: Member
  status: EffectiveStatus
  zoneLabel: string
}

export function MemberMarker({ member, status, zoneLabel }: MemberMarkerProps) {
  const actionVignette = statusActionVignettes[status.statusKey]
  const visualElements = statusVisualElements[status.statusKey]
  const isExpired = status.source === 'expired_fallback'

  return (
    <span
      className={`member-marker status-${status.statusKey} ${isExpired ? 'expired' : ''}`}
      aria-label={`成员 ${member.displayName} 当前 ${status.label}，位于 ${zoneLabel}，正在${actionVignette}`}
    >
      <span className="member-visual-elements" aria-hidden="true">
        {visualElements.map((element, index) => (
          <span key={index} className={`visual-element element-${index}`}>
            {element}
          </span>
        ))}
      </span>
      <span className={`mini-sprite ${member.avatarKey}`} aria-hidden="true" />
      <strong>{member.displayName}</strong>
      <span className="member-vignette">{actionVignette}</span>
    </span>
  )
}
