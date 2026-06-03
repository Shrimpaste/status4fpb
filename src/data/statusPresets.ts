import type { SelectableStatusKey, StatusKey, StatusPreset } from '../types/domain'

export const STATUS_PRESETS: Record<StatusKey, StatusPreset> = {
  exam_paper: {
    statusKey: 'exam_paper',
    label: '套卷中',
    place: 'study_desk',
    placeLabel: '自习桌',
    description: '正在和试卷搏斗',
    selectable: true,
  },
  scope_shrinking: {
    statusKey: 'scope_shrinking',
    label: '缩圈中',
    place: 'magic_circle',
    placeLabel: '缩圈法阵',
    description: '正在把复习范围压缩成玄学',
    selectable: true,
  },
  fishing: {
    statusKey: 'fishing',
    label: '摸鱼中',
    place: 'pond',
    placeLabel: '池塘',
    description: '疑似学习，实则摸鱼',
    selectable: true,
  },
  vocabulary: {
    statusKey: 'vocabulary',
    label: '背单词中',
    place: 'book_corner',
    placeLabel: '书架角',
    description: '正在和遗忘曲线对线',
    selectable: true,
  },
  sleeping: {
    statusKey: 'sleeping',
    label: '睡觉中',
    place: 'bed',
    placeLabel: '小床',
    description: '系统进入低功耗模式',
    selectable: true,
  },
  deadline: {
    statusKey: 'deadline',
    label: '赶 ddl 中',
    place: 'burning_desk',
    placeLabel: '燃烧桌',
    description: '生命体征稳定，精神状态未知',
    selectable: true,
  },
  offline: {
    statusKey: 'offline',
    label: '失联中',
    place: 'unknown',
    placeLabel: '雾区',
    description: '最后一次出现已成谜',
    selectable: true,
  },
  idle: {
    statusKey: 'idle',
    label: '空闲中',
    place: 'porch',
    placeLabel: '门廊',
    description: '暂时没有新的状态',
    selectable: true,
  },
  unknown: {
    statusKey: 'unknown',
    label: '未知',
    place: 'unknown',
    placeLabel: '未知区',
    description: '还没有设置状态',
    selectable: false,
  },
}

export function isKnownStatusKey(value: string): value is StatusKey {
  return value in STATUS_PRESETS
}

export function isSelectableStatusKey(
  value: string,
): value is SelectableStatusKey {
  return isKnownStatusKey(value) && STATUS_PRESETS[value].selectable
}
