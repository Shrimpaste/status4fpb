import type { SelectableStatusKey } from '../types/domain'
import type {
  SharedStatus,
  SharedStatusSource,
  SharedTownMember,
  SharedTownState,
} from './types'

export type SharedStateValidationIssueCode =
  | 'invalid_room'
  | 'invalid_member'
  | 'invalid_status'
  | 'invalid_date'
  | 'orphan_status'
  | 'left_member_status'

export type SharedStateValidationIssue = {
  path: string
  code: SharedStateValidationIssueCode
  message: string
}

export type SharedStateValidationResult =
  | { ok: true }
  | { ok: false; issues: SharedStateValidationIssue[] }

const DISPLAYABLE_STATUS_KEYS = new Set<SelectableStatusKey>([
  'exam_paper',
  'scope_shrinking',
  'fishing',
  'vocabulary',
  'sleeping',
  'deadline',
  'offline',
  'idle',
])

const DISPLAYABLE_STATUS_SOURCES = new Set<SharedStatusSource>([
  'desktop_manual',
  'web_manual',
  'qq_bot_command',
])

export function validateSharedTownState(
  state: SharedTownState,
): SharedStateValidationResult {
  const issues: SharedStateValidationIssue[] = []
  const memberById = buildMemberById(state.members)

  addInvalidDateIssue(issues, 'serverTime', state.serverTime)
  validateRoom(issues, state)
  validateMembers(issues, state.members)

  Object.entries(state.statuses).forEach(([statusKey, status]) => {
    issues.push(...getStatusValidationIssues(statusKey, status, memberById))
  })

  if (issues.length > 0) {
    return { ok: false, issues }
  }

  return { ok: true }
}

export function filterDisplayableSharedStatuses(
  state: SharedTownState,
): Record<string, SharedStatus> {
  if (!isValidIsoDateString(state.serverTime)) {
    return {}
  }

  const memberById = buildMemberById(state.members)

  return Object.fromEntries(
    Object.entries(state.statuses).filter(([statusKey, status]) =>
      isDisplayableSharedStatus(statusKey, status, memberById),
    ),
  )
}

export function isValidIsoDateString(value: string): boolean {
  const time = Date.parse(value)

  return Number.isFinite(time) && new Date(time).toISOString() === value
}

function validateRoom(
  issues: SharedStateValidationIssue[],
  state: SharedTownState,
) {
  if (!state.room.roomId) {
    issues.push({
      path: 'room.roomId',
      code: 'invalid_room',
      message: 'Shared room must include roomId.',
    })
  }

  if (!state.room.name) {
    issues.push({
      path: 'room.name',
      code: 'invalid_room',
      message: 'Shared room must include name.',
    })
  }

  addInvalidDateIssue(issues, 'room.createdAt', state.room.createdAt)
  addInvalidDateIssue(issues, 'room.updatedAt', state.room.updatedAt)
}

function validateMembers(
  issues: SharedStateValidationIssue[],
  members: SharedTownMember[],
) {
  members.forEach((member, index) => {
    const path = getMemberPath(member, index)

    if (!member.memberId) {
      issues.push({
        path: `${path}.memberId`,
        code: 'invalid_member',
        message: 'Shared member must include memberId.',
      })
    }

    if (!member.displayName) {
      issues.push({
        path: `${path}.displayName`,
        code: 'invalid_member',
        message: 'Shared member must include displayName.',
      })
    }

    if (!member.avatarKey) {
      issues.push({
        path: `${path}.avatarKey`,
        code: 'invalid_member',
        message: 'Shared member must include avatarKey.',
      })
    }

    addInvalidDateIssue(issues, `${path}.createdAt`, member.createdAt)
    addInvalidDateIssue(issues, `${path}.updatedAt`, member.updatedAt)

    if (member.leftAt) {
      addInvalidDateIssue(issues, `${path}.leftAt`, member.leftAt)
    }
  })
}

function getStatusValidationIssues(
  statusKey: string,
  status: SharedStatus,
  memberById: Map<string, SharedTownMember>,
): SharedStateValidationIssue[] {
  const issues: SharedStateValidationIssue[] = []
  const member = memberById.get(status.memberId)

  if (status.memberId !== statusKey) {
    issues.push({
      path: `statuses.${statusKey}.memberId`,
      code: 'invalid_status',
      message: 'Shared status memberId must match its record key.',
    })
  }

  if (!member) {
    issues.push({
      path: `statuses.${statusKey}`,
      code: 'orphan_status',
      message: 'Shared status must belong to a room member.',
    })
  } else if (member.leftAt) {
    issues.push({
      path: `statuses.${statusKey}`,
      code: 'left_member_status',
      message: 'Left member status is not displayable.',
    })
  }

  if (!DISPLAYABLE_STATUS_KEYS.has(status.statusKey)) {
    issues.push({
      path: `statuses.${statusKey}.statusKey`,
      code: 'invalid_status',
      message: 'Shared status key is not displayable.',
    })
  }

  if (!DISPLAYABLE_STATUS_SOURCES.has(status.source)) {
    issues.push({
      path: `statuses.${statusKey}.source`,
      code: 'invalid_status',
      message: 'Shared status source is not displayable.',
    })
  }

  addInvalidDateIssue(issues, `statuses.${statusKey}.startedAt`, status.startedAt)
  addInvalidDateIssue(issues, `statuses.${statusKey}.updatedAt`, status.updatedAt)

  if (status.expiresAt) {
    addInvalidDateIssue(issues, `statuses.${statusKey}.expiresAt`, status.expiresAt)
  }

  return issues
}

function isDisplayableSharedStatus(
  statusKey: string,
  status: SharedStatus,
  memberById: Map<string, SharedTownMember>,
): boolean {
  const member = memberById.get(status.memberId)

  return Boolean(
    member &&
      !member.leftAt &&
      areMemberDatesValid(member) &&
      status.memberId === statusKey &&
      DISPLAYABLE_STATUS_KEYS.has(status.statusKey) &&
      DISPLAYABLE_STATUS_SOURCES.has(status.source) &&
      isValidIsoDateString(status.startedAt) &&
      isValidIsoDateString(status.updatedAt) &&
      (!status.expiresAt || isValidIsoDateString(status.expiresAt)),
  )
}

function areMemberDatesValid(member: SharedTownMember): boolean {
  return (
    isValidIsoDateString(member.createdAt) &&
    isValidIsoDateString(member.updatedAt) &&
    (!member.leftAt || isValidIsoDateString(member.leftAt))
  )
}

function addInvalidDateIssue(
  issues: SharedStateValidationIssue[],
  path: string,
  value: string,
) {
  if (isValidIsoDateString(value)) {
    return
  }

  issues.push({
    path,
    code: 'invalid_date',
    message: 'Shared state date must be a valid ISO timestamp.',
  })
}

function buildMemberById(members: SharedTownMember[]): Map<string, SharedTownMember> {
  return new Map(members.map((member) => [member.memberId, member]))
}

function getMemberPath(member: SharedTownMember, index: number): string {
  if (member.memberId) {
    return `members.${member.memberId}`
  }

  return `members.${index}`
}
