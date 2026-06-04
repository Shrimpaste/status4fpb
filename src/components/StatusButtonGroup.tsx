import type { SelectableStatusKey, StatusPreset } from '../types/domain'

type SelectableStatusPreset = StatusPreset & {
  statusKey: SelectableStatusKey
}

type StatusButtonGroupProps = {
  displayName: string
  statuses: StatusPreset[]
  onSelectStatus: (statusKey: SelectableStatusKey) => void
}

export function StatusButtonGroup({
  displayName,
  statuses,
  onSelectStatus,
}: StatusButtonGroupProps) {
  const selectableStatuses = statuses.filter(
    (status): status is SelectableStatusPreset => status.selectable,
  )

  return (
    <div className="status-actions">
      {selectableStatuses.map((preset) => (
        <button
          type="button"
          key={preset.statusKey}
          className="status-action"
          onClick={() => onSelectStatus(preset.statusKey)}
          aria-label={`设置${displayName}为${preset.label}`}
        >
          <span className="status-action-label">{preset.label}</span>
          <span className="status-action-place">{preset.placeLabel}</span>
        </button>
      ))}
    </div>
  )
}
