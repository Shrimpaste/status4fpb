export type ExpirationPresetKey =
  | 'none'
  | 'thirty_minutes'
  | 'one_hour'
  | 'two_hours'
  | 'end_of_day'

const durationByPreset: Partial<Record<ExpirationPresetKey, number>> = {
  thirty_minutes: 30 * 60 * 1000,
  one_hour: 60 * 60 * 1000,
  two_hours: 2 * 60 * 60 * 1000,
}

export function computeExpiresAt(
  preset: ExpirationPresetKey,
  now: string,
): string | undefined {
  if (preset === 'none') {
    return undefined
  }

  const nowDate = new Date(now)
  const nowMs = nowDate.getTime()

  if (Number.isNaN(nowMs)) {
    return undefined
  }

  if (preset === 'end_of_day') {
    const endOfDay = new Date(nowDate)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay.toISOString()
  }

  const duration = durationByPreset[preset]
  return duration ? new Date(nowMs + duration).toISOString() : undefined
}

export function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value))
}
