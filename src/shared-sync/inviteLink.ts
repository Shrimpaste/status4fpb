export const STATUS4FPB_JOIN_PATH = '/join'

export type SharedInviteLinkData = {
  inviteCode: string
}

export type SharedInviteLinkParseResult =
  | { ok: true; inviteCode: string }
  | {
      ok: false
      reason:
        | 'empty'
        | 'invalid_url'
        | 'missing_invite_code'
        | 'invalid_invite_code'
        | 'forbidden_secret'
    }

const INVITE_CODE_PATTERN = /^[A-Z0-9-]{4,32}$/
const FORBIDDEN_SECRET_FIELDS = new Set([
  'membersecret',
  'secret',
  'token',
  'credential',
  'authorization',
])

type ParsedInviteLinkParts = {
  path: string
  query: string
  hash: string
}

export function createSharedInviteLink(input: SharedInviteLinkData): string {
  return `${STATUS4FPB_JOIN_PATH}?code=${encodeURIComponent(input.inviteCode)}`
}

export function parseSharedInviteLink(
  value: string,
): SharedInviteLinkParseResult {
  const candidate = value.trim()

  if (!candidate) {
    return { ok: false, reason: 'empty' }
  }

  const parts = parseInviteLinkParts(candidate)

  if (!parts || parts.path !== STATUS4FPB_JOIN_PATH) {
    return { ok: false, reason: 'invalid_url' }
  }

  if (
    containsForbiddenSecret(parts.query) ||
    containsForbiddenSecret(parts.hash)
  ) {
    return { ok: false, reason: 'forbidden_secret' }
  }

  const inviteCode = new URLSearchParams(parts.query).get('code')

  if (!inviteCode) {
    return { ok: false, reason: 'missing_invite_code' }
  }

  if (!INVITE_CODE_PATTERN.test(inviteCode)) {
    return { ok: false, reason: 'invalid_invite_code' }
  }

  return { ok: true, inviteCode }
}

function parseInviteLinkParts(value: string): ParsedInviteLinkParts | null {
  if (value.startsWith('status4fpb://')) {
    return parseCustomSchemeInviteLink(value)
  }

  const pathValue = value.startsWith('#') ? value.slice(1) : value

  if (!pathValue.startsWith('/')) {
    return null
  }

  return parsePathInviteLink(pathValue)
}

function parseCustomSchemeInviteLink(
  value: string,
): ParsedInviteLinkParts | null {
  try {
    const url = new URL(value)

    return {
      path: `/${url.host}${url.pathname}`,
      query: url.search.slice(1),
      hash: url.hash.slice(1),
    }
  } catch {
    return null
  }
}

function parsePathInviteLink(value: string): ParsedInviteLinkParts {
  const hashStart = value.indexOf('#')
  const pathAndQuery = hashStart === -1 ? value : value.slice(0, hashStart)
  const hash = hashStart === -1 ? '' : value.slice(hashStart + 1)
  const queryStart = pathAndQuery.indexOf('?')

  if (queryStart === -1) {
    return {
      path: pathAndQuery,
      query: '',
      hash,
    }
  }

  return {
    path: pathAndQuery.slice(0, queryStart),
    query: pathAndQuery.slice(queryStart + 1),
    hash,
  }
}

function containsForbiddenSecret(value: string): boolean {
  if (!value) {
    return false
  }

  const query = value.includes('?')
    ? value.slice(value.indexOf('?') + 1)
    : value

  for (const field of new URLSearchParams(query).keys()) {
    if (FORBIDDEN_SECRET_FIELDS.has(field.toLowerCase())) {
      return true
    }
  }

  return false
}
