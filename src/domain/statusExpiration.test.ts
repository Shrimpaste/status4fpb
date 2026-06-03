import { describe, expect, it } from 'vitest'
import { computeExpiresAt } from './statusExpiration'

const NOW = '2026-06-03T12:00:00.000Z'

describe('status expiration presets', () => {
  it('returns no expiration for the none preset', () => {
    expect(computeExpiresAt('none', NOW)).toBeUndefined()
  })

  it('adds preset durations to the injected time', () => {
    expect(computeExpiresAt('thirty_minutes', NOW)).toBe(
      '2026-06-03T12:30:00.000Z',
    )
    expect(computeExpiresAt('one_hour', NOW)).toBe(
      '2026-06-03T13:00:00.000Z',
    )
    expect(computeExpiresAt('two_hours', NOW)).toBe(
      '2026-06-03T14:00:00.000Z',
    )
  })

  it('returns the end of the local day for end_of_day', () => {
    const expiresAt = computeExpiresAt('end_of_day', NOW)

    expect(expiresAt).toBeDefined()
    expect(Date.parse(expiresAt ?? '')).toBeGreaterThan(Date.parse(NOW))
  })
})
