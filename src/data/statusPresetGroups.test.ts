import { describe, expect, it } from 'vitest'
import { STATUS_PRESETS } from './statusPresets'
import {
  STATUS_PRESET_GROUPS,
  getStatusPresetGroupForStatus,
} from './statusPresetGroups'

describe('statusPresetGroups', () => {
  it('groups every known status exactly once', () => {
    const groupedStatusKeys = STATUS_PRESET_GROUPS.flatMap(
      (group) => group.statusKeys,
    )
    const knownStatusKeys = Object.keys(STATUS_PRESETS).sort()

    expect([...groupedStatusKeys].sort()).toEqual(knownStatusKeys)
    expect(new Set(groupedStatusKeys).size).toBe(groupedStatusKeys.length)
  })

  it('keeps public group labels distinct from implementation keys', () => {
    for (const group of STATUS_PRESET_GROUPS) {
      expect(group.label).not.toBe(group.groupKey)
      expect(group.label).not.toContain('_')
      expect(group.description.length).toBeGreaterThan(0)
    }
  })

  it('finds the semantic group for a status', () => {
    expect(getStatusPresetGroupForStatus('exam_paper')).toMatchObject({
      groupKey: 'study',
      label: '学习 / 备考',
    })
    expect(getStatusPresetGroupForStatus('idle')).toMatchObject({
      groupKey: 'rest',
      label: '休息 / 摸鱼',
    })
    expect(getStatusPresetGroupForStatus('unknown')).toMatchObject({
      groupKey: 'fallback',
      label: '特殊 / 兜底',
    })
  })
})
