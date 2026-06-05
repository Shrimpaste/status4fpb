import type { SelectableStatusKey, StatusKey, StatusPreset } from '../types/domain'
import { STATUS_PRESET_GROUPS } from '../data/statusPresetGroups'

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
  const selectableStatusByKey = new Map<StatusKey, SelectableStatusPreset>(
    selectableStatuses.map((status) => [status.statusKey, status]),
  )

  return (
    <div className="status-actions">
      {STATUS_PRESET_GROUPS.map((group) => {
        const groupStatuses = group.statusKeys.flatMap((statusKey) => {
          const status = selectableStatusByKey.get(statusKey)

          return status ? [status] : []
        })

        if (groupStatuses.length === 0) {
          return null
        }

        return (
          <section
            className="status-action-group"
            key={group.groupKey}
            role="group"
            aria-label={group.label}
          >
            <div className="status-action-group-heading">
              <h3>{group.label}</h3>
              <p>{group.description}</p>
            </div>
            <div className="status-action-group-buttons">
              {groupStatuses.map((preset) => (
                <button
                  type="button"
                  key={preset.statusKey}
                  className="status-action"
                  onClick={() => onSelectStatus(preset.statusKey)}
                  aria-label={`设置${displayName}为${preset.label}`}
                >
                  <span className="status-action-label">{preset.label}</span>
                  <span className="status-action-place">
                    {preset.placeLabel}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
