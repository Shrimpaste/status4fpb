import { isSelectableStatusKey } from '../data/statusPresets'
import type {
  SharedMemberCredential,
  SharedStatus,
  SharedStatusInput,
  SharedTownMember,
  SharedTownRoom,
  SharedTownState,
} from './types'
import { SHARED_STATUS_SOURCES } from './types'

export type SharedSyncErrorCode =
  | 'invalid_invite_code'
  | 'room_not_found'
  | 'member_not_found'
  | 'invalid_member_secret'
  | 'invalid_status_key'
  | 'member_left'

export class SharedSyncError extends Error {
  readonly code: SharedSyncErrorCode

  constructor(code: SharedSyncErrorCode, message: string) {
    super(message)
    this.name = 'SharedSyncError'
    this.code = code
  }
}

type IdFactory = {
  roomId?: () => string
  inviteCode?: () => string
  memberId?: () => string
  memberSecret?: () => string
}

type LocalMockSyncClientOptions = {
  now?: () => string
  idFactory?: IdFactory
}

type MemberProfileInput = {
  displayName: string
  avatarKey: string
  color?: string
}

type CreateRoomInput = {
  roomName: string
  creator: MemberProfileInput
}

type CreateRoomResult = {
  room: SharedTownRoom
  inviteCode: string
  credential: SharedMemberCredential
  state: SharedTownState
}

type JoinRoomResult = {
  member: SharedTownMember
  credential: SharedMemberCredential
  state: SharedTownState
}

type SetMemberStatusResult = {
  status: SharedStatus
  state: SharedTownState
}

type LeaveRoomResult = {
  member: SharedTownMember
  state: SharedTownState
}

type RoomRecord = {
  room: SharedTownRoom
  inviteCode: string
  members: Record<string, SharedTownMember>
  credentials: Record<string, SharedMemberCredential>
  statuses: Record<string, SharedStatus>
}

export function createLocalMockSyncClient(
  options: LocalMockSyncClientOptions = {},
) {
  const now = options.now ?? (() => new Date().toISOString())
  const idFactory = createIdFactory(options.idFactory)
  const rooms = new Map<string, RoomRecord>()
  const roomIdByInviteCode = new Map<string, string>()

  function createRoom(input: CreateRoomInput): CreateRoomResult {
    const timestamp = now()
    const room: SharedTownRoom = {
      roomId: idFactory.roomId(),
      name: input.roomName,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const inviteCode = idFactory.inviteCode()
    const member = createMember(room.roomId, input.creator, timestamp, idFactory)
    const credential = createCredential(room.roomId, member.memberId, timestamp, idFactory)
    const record: RoomRecord = {
      room,
      inviteCode,
      members: { [member.memberId]: member },
      credentials: { [member.memberId]: credential },
      statuses: {},
    }

    rooms.set(room.roomId, record)
    roomIdByInviteCode.set(inviteCode, room.roomId)

    return {
      room: cloneRoom(room),
      inviteCode,
      credential: cloneCredential(credential),
      state: createState(record, timestamp),
    }
  }

  function joinRoom(
    inviteCode: string,
    memberProfile: MemberProfileInput,
  ): JoinRoomResult {
    const roomId = roomIdByInviteCode.get(inviteCode)

    if (!roomId) {
      throw new SharedSyncError(
        'invalid_invite_code',
        'Invite code is invalid.',
      )
    }

    const record = requireRoom(roomId, rooms)
    const timestamp = now()
    const member = createMember(record.room.roomId, memberProfile, timestamp, idFactory)
    const credential = createCredential(record.room.roomId, member.memberId, timestamp, idFactory)

    record.members[member.memberId] = member
    record.credentials[member.memberId] = credential
    record.room = { ...record.room, updatedAt: timestamp }

    return {
      member: cloneMember(member),
      credential: cloneCredential(credential),
      state: createState(record, timestamp),
    }
  }

  function getRoomState(roomId: string): SharedTownState {
    return createState(requireRoom(roomId, rooms), now())
  }

  function setMemberStatus(
    roomId: string,
    memberId: string,
    memberSecret: string,
    input: SharedStatusInput,
  ): SetMemberStatusResult {
    const record = requireRoom(roomId, rooms)
    requireActiveCredential(record, memberId, memberSecret)
    assertStatusInput(input)

    const timestamp = now()
    const status: SharedStatus = {
      roomId,
      memberId,
      statusKey: input.statusKey,
      startedAt: timestamp,
      updatedAt: timestamp,
      source: input.source,
      ...(input.note ? { note: input.note } : {}),
      ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    }

    record.statuses[memberId] = status
    record.room = { ...record.room, updatedAt: timestamp }

    return {
      status: cloneStatus(status),
      state: createState(record, timestamp),
    }
  }

  function leaveRoom(
    roomId: string,
    memberId: string,
    memberSecret: string,
  ): LeaveRoomResult {
    const record = requireRoom(roomId, rooms)
    const member = requireCredential(record, memberId, memberSecret)
    const timestamp = now()

    if (!member.leftAt) {
      record.members[memberId] = {
        ...member,
        leftAt: timestamp,
        updatedAt: timestamp,
      }
      delete record.statuses[memberId]
      record.room = { ...record.room, updatedAt: timestamp }
    }

    return {
      member: cloneMember(record.members[memberId]),
      state: createState(record, timestamp),
    }
  }

  return {
    createRoom,
    joinRoom,
    getRoomState,
    setMemberStatus,
    leaveRoom,
  }
}

function createIdFactory(idFactory: IdFactory = {}): Required<IdFactory> {
  return {
    roomId: idFactory.roomId ?? createCounterIdFactory('room'),
    inviteCode: idFactory.inviteCode ?? createCounterIdFactory('TOWN'),
    memberId: idFactory.memberId ?? createCounterIdFactory('member'),
    memberSecret: idFactory.memberSecret ?? createCounterIdFactory('secret'),
  }
}

function createCounterIdFactory(prefix: string): () => string {
  let index = 0

  return () => {
    index += 1
    return `${prefix}_${index}`
  }
}

function createMember(
  roomId: string,
  profile: MemberProfileInput,
  timestamp: string,
  idFactory: Required<IdFactory>,
): SharedTownMember {
  return {
    roomId,
    memberId: idFactory.memberId(),
    displayName: profile.displayName,
    avatarKey: profile.avatarKey,
    ...(profile.color ? { color: profile.color } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function createCredential(
  roomId: string,
  memberId: string,
  timestamp: string,
  idFactory: Required<IdFactory>,
): SharedMemberCredential {
  return {
    roomId,
    memberId,
    memberSecret: idFactory.memberSecret(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function requireRoom(
  roomId: string,
  rooms: Map<string, RoomRecord>,
): RoomRecord {
  const record = rooms.get(roomId)

  if (!record) {
    throw new SharedSyncError('room_not_found', 'Room was not found.')
  }

  return record
}

function requireCredential(
  record: RoomRecord,
  memberId: string,
  memberSecret: string,
): SharedTownMember {
  const member = record.members[memberId]

  if (!member) {
    throw new SharedSyncError('member_not_found', 'Member was not found.')
  }

  const credential = record.credentials[memberId]

  if (!credential || credential.memberSecret !== memberSecret) {
    throw new SharedSyncError(
      'invalid_member_secret',
      'Member secret is invalid.',
    )
  }

  return member
}

function requireActiveCredential(
  record: RoomRecord,
  memberId: string,
  memberSecret: string,
): SharedTownMember {
  const member = requireCredential(record, memberId, memberSecret)

  if (member.leftAt) {
    throw new SharedSyncError('member_left', 'Member has left the room.')
  }

  return member
}

function assertStatusInput(input: SharedStatusInput): void {
  const source = input.source as string

  if (!isSelectableStatusKey(input.statusKey)) {
    throw new SharedSyncError(
      'invalid_status_key',
      'Status key is not selectable.',
    )
  }

  if (
    !SHARED_STATUS_SOURCES.some((allowedSource) => allowedSource === source) ||
    source === 'timer_rule'
  ) {
    throw new SharedSyncError(
      'invalid_status_key',
      'Status source cannot be submitted by a client.',
    )
  }
}

function createState(record: RoomRecord, serverTime: string): SharedTownState {
  return {
    room: cloneRoom(record.room),
    members: Object.values(record.members).map(cloneMember),
    statuses: Object.fromEntries(
      Object.entries(record.statuses).map(([memberId, status]) => [
        memberId,
        cloneStatus(status),
      ]),
    ),
    serverTime,
  }
}

function cloneRoom(room: SharedTownRoom): SharedTownRoom {
  return { ...room }
}

function cloneMember(member: SharedTownMember): SharedTownMember {
  return { ...member }
}

function cloneStatus(status: SharedStatus): SharedStatus {
  return { ...status }
}

function cloneCredential(
  credential: SharedMemberCredential,
): SharedMemberCredential {
  return { ...credential }
}
