export const SHARED_CREDENTIAL_STORAGE_KEY =
  'status4fpb:shared-credentials:v1'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type SharedStoredCredential = {
  roomId: string
  memberId: string
  memberSecret: string
  displayName: string
  roomName?: string
  createdAt: string
  updatedAt: string
}

export type SharedCredentialStoreV1 = {
  version: 1
  credentials: SharedStoredCredential[]
}

const EMPTY_STORE: SharedCredentialStoreV1 = {
  version: 1,
  credentials: [],
}

export function createSharedCredentialStore(storage: StorageLike) {
  function load(): SharedCredentialStoreV1 {
    const rawValue = storage.getItem(SHARED_CREDENTIAL_STORAGE_KEY)

    if (!rawValue) {
      return createEmptyStore()
    }

    try {
      return normalizeStore(JSON.parse(rawValue))
    } catch {
      return createEmptyStore()
    }
  }

  function save(store: SharedCredentialStoreV1): void {
    storage.setItem(
      SHARED_CREDENTIAL_STORAGE_KEY,
      JSON.stringify(normalizeStore(store)),
    )
  }

  function upsertCredential(
    credential: SharedStoredCredential,
  ): SharedCredentialStoreV1 {
    const normalizedCredential = normalizeCredential(credential)

    if (!normalizedCredential) {
      return load()
    }

    const currentStore = load()
    const nextStore = {
      version: 1 as const,
      credentials: [
        ...currentStore.credentials.filter(
          (storedCredential) =>
            storedCredential.roomId !== normalizedCredential.roomId ||
            storedCredential.memberId !== normalizedCredential.memberId,
        ),
        normalizedCredential,
      ],
    }

    save(nextStore)

    return nextStore
  }

  function removeCredential(
    roomId: string,
    memberId: string,
  ): SharedCredentialStoreV1 {
    const currentStore = load()
    const nextStore = {
      version: 1 as const,
      credentials: currentStore.credentials.filter(
        (storedCredential) =>
          storedCredential.roomId !== roomId ||
          storedCredential.memberId !== memberId,
      ),
    }

    save(nextStore)

    return nextStore
  }

  function clear(): void {
    storage.removeItem(SHARED_CREDENTIAL_STORAGE_KEY)
  }

  return {
    load,
    save,
    upsertCredential,
    removeCredential,
    clear,
  }
}

function createEmptyStore(): SharedCredentialStoreV1 {
  return {
    ...EMPTY_STORE,
    credentials: [],
  }
}

function normalizeStore(value: unknown): SharedCredentialStoreV1 {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.credentials)) {
    return createEmptyStore()
  }

  return {
    version: 1,
    credentials: value.credentials.flatMap((credential) => {
      const normalizedCredential = normalizeCredential(credential)

      return normalizedCredential ? [normalizedCredential] : []
    }),
  }
}

function normalizeCredential(value: unknown): SharedStoredCredential | undefined {
  if (!isObject(value)) {
    return undefined
  }

  const {
    roomId,
    memberId,
    memberSecret,
    displayName,
    roomName,
    createdAt,
    updatedAt,
  } = value

  if (
    !isString(roomId) ||
    !isString(memberId) ||
    !isString(memberSecret) ||
    !isString(displayName) ||
    !isString(createdAt) ||
    !isString(updatedAt)
  ) {
    return undefined
  }

  return {
    roomId,
    memberId,
    memberSecret,
    displayName,
    ...(isString(roomName) ? { roomName } : {}),
    createdAt,
    updatedAt,
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
