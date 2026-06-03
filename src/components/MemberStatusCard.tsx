import type {
  EffectiveStatus,
  Member,
  SelectableStatusKey,
  StatusPreset,
} from '../types/domain'
import { StatusButtonGroup } from './StatusButtonGroup'

type MemberStatusCardProps = {
  member: Member
  status: EffectiveStatus
  statuses: StatusPreset[]
  isPendingDelete: boolean
  onSelectStatus: (memberId: string, statusKey: SelectableStatusKey) => void
  onDeleteClick: (memberId: string) => void
}

export function MemberStatusCard({
  member,
  status,
  statuses,
  isPendingDelete,
  onSelectStatus,
  onDeleteClick,
}: MemberStatusCardProps) {
  return (
    <article
      className="status-card member-card"
      aria-label={`成员 ${member.displayName}`}
    >
      <p className="status-place">{status.placeLabel}</p>
      <h2>{member.displayName}</h2>
      <p className="current-status">当前：{status.label}</p>
      <StatusButtonGroup
        displayName={member.displayName}
        statuses={statuses}
        onSelectStatus={(statusKey) => onSelectStatus(member.id, statusKey)}
      />
      <button
        type="button"
        className="delete-action"
        onClick={() => onDeleteClick(member.id)}
        aria-label={
          isPendingDelete
            ? `确认删除${member.displayName}`
            : `删除${member.displayName}`
        }
      >
        {isPendingDelete ? '确认删除' : '删除'}
      </button>
    </article>
  )
}
