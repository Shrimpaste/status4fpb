import {
  SharedSyncError,
  createLocalMockSyncClient,
} from './localMockSyncClient'
import { adaptSharedTownStateForDisplay } from './sharedStateAdapter'
import type { SharedTownDisplayState } from './sharedStateAdapter'
import type {
  SharedMemberCredential,
  SharedStatusInput,
  SharedTownState,
} from './types'

type IdFactory = {
  roomId?: () => string
  inviteCode?: () => string
  memberId?: () => string
  memberSecret?: () => string
}

type LocalSharedTownSessionOptions = {
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

type JoinRoomInput = {
  inviteCode: string
  member: MemberProfileInput
}

type CreateRoomSessionResult = {
  inviteCode: string
  credential: SharedMemberCredential
  displayState: SharedTownDisplayState
}

type JoinRoomSessionResult = {
  credential: SharedMemberCredential
  displayState: SharedTownDisplayState
}

export function createLocalSharedTownSession(
  options: LocalSharedTownSessionOptions = {},
) {
  const client = createLocalMockSyncClient(options)
  const credentialsByMemberId = new Map<string, SharedMemberCredential>()
  let currentRoomId: string | undefined

  function createRoom(input: CreateRoomInput): CreateRoomSessionResult {
    const created = client.createRoom(input)

    currentRoomId = created.room.roomId
    rememberCredential(created.credential)

    return {
      inviteCode: created.inviteCode,
      credential: cloneCredential(created.credential),
      displayState: adaptSharedTownStateForDisplay(created.state),
    }
  }

  function joinRoom(input: JoinRoomInput): JoinRoomSessionResult {
    const joined = client.joinRoom(input.inviteCode, input.member)

    currentRoomId = joined.credential.roomId
    rememberCredential(joined.credential)

    return {
      credential: cloneCredential(joined.credential),
      displayState: adaptSharedTownStateForDisplay(joined.state),
    }
  }

  function setStatus(
    memberId: string,
    input: SharedStatusInput,
  ): SharedTownDisplayState {
    const credential = requireSessionCredential(memberId)
    const updated = client.setMemberStatus(
      credential.roomId,
      memberId,
      credential.memberSecret,
      input,
    )

    return adaptSharedTownStateForDisplay(updated.state)
  }

  function leaveRoom(memberId: string): SharedTownDisplayState {
    const credential = requireSessionCredential(memberId)
    const left = client.leaveRoom(
      credential.roomId,
      memberId,
      credential.memberSecret,
    )

    credentialsByMemberId.delete(memberId)

    return adaptSharedTownStateForDisplay(left.state)
  }

  function getRawState(): SharedTownState {
    return client.getRoomState(requireCurrentRoomId())
  }

  function getDisplayState(): SharedTownDisplayState {
    return adaptSharedTownStateForDisplay(getRawState())
  }

  function requireCurrentRoomId(): string {
    if (!currentRoomId) {
      throw new SharedSyncError('room_not_found', 'No active shared room.')
    }

    return currentRoomId
  }

  function requireSessionCredential(memberId: string): SharedMemberCredential {
    const credential = credentialsByMemberId.get(memberId)

    if (!credential) {
      throw new SharedSyncError(
        'member_not_found',
        'Session credential was not found.',
      )
    }

    return credential
  }

  function rememberCredential(credential: SharedMemberCredential) {
    credentialsByMemberId.set(credential.memberId, cloneCredential(credential))
  }

  return {
    createRoom,
    joinRoom,
    setStatus,
    leaveRoom,
    getRawState,
    getDisplayState,
  }
}

function cloneCredential(
  credential: SharedMemberCredential,
): SharedMemberCredential {
  return { ...credential }
}
