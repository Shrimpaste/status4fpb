import { describe, expect, it } from 'vitest'
import { isSelectableStatusKey, STATUS_PRESETS } from '../data/statusPresets'
import { getEffectiveStatus, isStatusExpired } from './statusLogic'

const NOW = '2026-06-03T12:00:00.000Z'

describe('status logic', () => {
  it('includes the required status presets', () => {
    expect(STATUS_PRESETS.exam_paper.label).toBe('套卷中')
    expect(STATUS_PRESETS.scope_shrinking.label).toBe('缩圈中')
  })

  it('treats offline as manual-selectable while unknown remains fallback-only', () => {
    expect(isSelectableStatusKey('offline')).toBe(true)
    expect(isSelectableStatusKey('unknown')).toBe(false)
  })

  it('detects expired and active statuses using injected time', () => {
    expect(
      isStatusExpired(
        {
          memberId: 'm1',
          statusKey: 'exam_paper',
          startedAt: NOW,
          updatedAt: NOW,
          expiresAt: '2026-06-03T11:59:59.000Z',
        },
        NOW,
      ),
    ).toBe(true)

    expect(
      isStatusExpired(
        {
          memberId: 'm1',
          statusKey: 'exam_paper',
          startedAt: NOW,
          updatedAt: NOW,
          expiresAt: '2026-06-03T12:30:00.000Z',
        },
        NOW,
      ),
    ).toBe(false)
  })

  it('returns unknown when a member has no status', () => {
    expect(getEffectiveStatus('missing', {}, NOW).label).toBe('未知')
  })

  it('falls back to offline when a status is expired', () => {
    const effective = getEffectiveStatus(
      'm1',
      {
        m1: {
          memberId: 'm1',
          statusKey: 'scope_shrinking',
          startedAt: NOW,
          updatedAt: NOW,
          expiresAt: '2026-06-03T11:00:00.000Z',
        },
      },
      NOW,
      { expiredFallback: 'offline' },
    )

    expect(effective.statusKey).toBe('offline')
    expect(effective.label).toBe('失联中')
  })
})
