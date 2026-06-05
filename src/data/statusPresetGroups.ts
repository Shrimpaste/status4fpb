import type { StatusKey } from '../types/domain'

export type StatusPresetGroupKey = 'study' | 'rest' | 'work' | 'fallback'

export type StatusPresetGroup = {
  groupKey: StatusPresetGroupKey
  label: string
  description: string
  statusKeys: StatusKey[]
}

export const STATUS_PRESET_GROUPS: StatusPresetGroup[] = [
  {
    groupKey: 'study',
    label: '学习 / 备考',
    description: '套卷、缩圈、背词这类需要专注推进的状态。',
    statusKeys: ['exam_paper', 'scope_shrinking', 'vocabulary'],
  },
  {
    groupKey: 'rest',
    label: '休息 / 摸鱼',
    description: '摸鱼、睡觉、空闲这类低压恢复状态。',
    statusKeys: ['fishing', 'sleeping', 'idle'],
  },
  {
    groupKey: 'work',
    label: '创作 / 工作',
    description: 'DDL 与赶工状态先收在这里，后续可扩展创作类。',
    statusKeys: ['deadline'],
  },
  {
    groupKey: 'fallback',
    label: '特殊 / 兜底',
    description: '失联可手动设置；未知只用于缺失或过期兜底。',
    statusKeys: ['offline', 'unknown'],
  },
]

const statusPresetGroupByStatus = new Map(
  STATUS_PRESET_GROUPS.flatMap((group) =>
    group.statusKeys.map((statusKey) => [statusKey, group] as const),
  ),
)

export function getStatusPresetGroupForStatus(statusKey: StatusKey) {
  return statusPresetGroupByStatus.get(statusKey)
}
