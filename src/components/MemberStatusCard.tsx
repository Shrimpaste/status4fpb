import { useState } from 'react'
import type { ExpirationPresetKey } from '../domain/statusExpiration'
import type {
  EffectiveStatus,
  Member,
  SelectableStatusKey,
  StatusPreset,
} from '../types/domain'
import { StatusButtonGroup } from './StatusButtonGroup'

type MemberStatusSelection = {
  statusKey: SelectableStatusKey
  note?: string
  expirationPreset?: ExpirationPresetKey
}

type MemberStatusCardProps = {
  member: Member
  status: EffectiveStatus
  statuses: StatusPreset[]
  isPendingDelete: boolean
  onSelectStatus: (memberId: string, input: MemberStatusSelection) => void
  onDeleteClick: (memberId: string) => void
}

const expirationOptions: Array<{ key: ExpirationPresetKey; label: string }> = [
  { key: 'none', label: '不过期' },
  { key: 'thirty_minutes', label: '30 分钟' },
  { key: 'one_hour', label: '1 小时' },
  { key: 'two_hours', label: '2 小时' },
  { key: 'end_of_day', label: '今天结束前' },
]

export function MemberStatusCard({
  member,
  status,
  statuses,
  isPendingDelete,
  onSelectStatus,
  onDeleteClick,
}: MemberStatusCardProps) {
  const [note, setNote] = useState(status.source === 'current' ? status.note ?? '' : '')
  const [expirationPreset, setExpirationPreset] =
    useState<ExpirationPresetKey>('none')
  const currentNote = status.source === 'current' ? status.note : undefined
  const currentExpiresAt =
    status.source === 'current' ? status.expiresAt : undefined

  function handleSelectStatus(statusKey: SelectableStatusKey) {
    const trimmedNote = note.trim()

    onSelectStatus(member.id, {
      statusKey,
      ...(trimmedNote ? { note: trimmedNote } : {}),
      ...(expirationPreset !== 'none' ? { expirationPreset } : {}),
    })
  }

  return (
    <article
      className="status-card member-card"
      aria-label={`成员 ${member.displayName}`}
    >
      <p className="status-place">{status.placeLabel}</p>
      <h2>{member.displayName}</h2>
      <p className="current-status">当前：{status.label}</p>
      {currentNote ? <p className="status-note">备注：{currentNote}</p> : null}
      {currentExpiresAt ? (
        <p className="status-expiry">
          有效期至：{formatExpiresAt(currentExpiresAt)}
        </p>
      ) : null}
      <div className="status-details">
        <label className="status-field" htmlFor={`status-note-${member.id}`}>
          状态备注
          <input
            id={`status-note-${member.id}`}
            className="status-note-input"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={40}
            autoComplete="off"
          />
        </label>
        <label
          className="status-field"
          htmlFor={`status-expiration-${member.id}`}
        >
          有效期
          <select
            id={`status-expiration-${member.id}`}
            className="status-expiration-select"
            value={expirationPreset}
            onChange={(event) =>
              setExpirationPreset(event.target.value as ExpirationPresetKey)
            }
          >
            {expirationOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <StatusButtonGroup
        displayName={member.displayName}
        statuses={statuses}
        onSelectStatus={handleSelectStatus}
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

function formatExpiresAt(expiresAt: string): string {
  return expiresAt.slice(0, 16).replace('T', ' ')
}
