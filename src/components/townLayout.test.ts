import { describe, expect, it } from 'vitest'
import type { StatusKey } from '../types/domain'
import {
  TOWN_ZONES,
  getTownZoneForStatus,
  townZoneByKey,
} from './townLayout'
import { STATUS_PRESET_GROUPS } from '../data/statusPresetGroups'

const statusKeys: StatusKey[] = [
  'exam_paper',
  'scope_shrinking',
  'fishing',
  'vocabulary',
  'sleeping',
  'deadline',
  'offline',
  'idle',
  'unknown',
]

describe('townLayout', () => {
  it('maps every status key to a public town zone', () => {
    for (const statusKey of statusKeys) {
      const zoneKey = getTownZoneForStatus(statusKey)
      const zone = townZoneByKey[zoneKey]

      expect(zone).toBeDefined()
      expect(zone.label).not.toBe(zone.zoneKey)
      expect(zone.label).not.toContain('_')
    }
  })

  it('keeps the first implementation slice to one zone per status', () => {
    expect(TOWN_ZONES).toHaveLength(statusKeys.length)
  })

  it('maps every grouped status to a town zone', () => {
    for (const group of STATUS_PRESET_GROUPS) {
      for (const statusKey of group.statusKeys) {
        const zoneKey = getTownZoneForStatus(statusKey)

        expect(townZoneByKey[zoneKey]).toBeDefined()
      }
    }
  })
})
