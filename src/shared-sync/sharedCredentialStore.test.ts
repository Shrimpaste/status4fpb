import { describe, expect, it, vi } from 'vitest'
import {
  SHARED_CREDENTIAL_STORAGE_KEY,
  createSharedCredentialStore,
  type SharedCredentialStoreV1,
} from './sharedCredentialStore'

const HOME_STORAGE_KEY = 'qq-status-pixel-home:v1'

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
    removeItem(key: string) {
      values.delete(key)
    },
    dump() {
      return Object.fromEntries(values)
    },
  }
}

function createValidCredential(
  overrides: Partial<SharedCredentialStoreV1['credentials'][number]> = {},
) {
  return {
    roomId: 'room_1',
    memberId: 'member_1',
    memberSecret: 'secret_1',
    displayName: 'Bei',
    roomName: 'Evening Study Town',
    createdAt: '2026-06-03T12:00:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
    ...overrides,
  }
}

function createValidStore(): SharedCredentialStoreV1 {
  return {
    version: 1,
    credentials: [createValidCredential()],
  }
}

describe('shared credential store', () => {
  it('loads an empty credential store from empty storage', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)

    expect(store.load()).toEqual({ version: 1, credentials: [] })
  })

  it('saves and loads a valid shared credential', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)

    store.save(createValidStore())

    expect(store.load()).toEqual(createValidStore())
  })

  it('clears only the shared credential key', () => {
    const storage = createMemoryStorage({
      [SHARED_CREDENTIAL_STORAGE_KEY]: JSON.stringify(createValidStore()),
      [HOME_STORAGE_KEY]: '{"members":[]}',
    })
    const store = createSharedCredentialStore(storage)

    store.clear()

    expect(storage.dump()).toEqual({
      [HOME_STORAGE_KEY]: '{"members":[]}',
    })
  })

  it('returns an empty store for corrupted JSON', () => {
    const storage = createMemoryStorage({
      [SHARED_CREDENTIAL_STORAGE_KEY]: '{bad json',
    })
    const store = createSharedCredentialStore(storage)

    expect(store.load()).toEqual({ version: 1, credentials: [] })
  })

  it('returns an empty store for invalid store shape', () => {
    const storage = createMemoryStorage({
      [SHARED_CREDENTIAL_STORAGE_KEY]: JSON.stringify({
        version: 2,
        credentials: 'nope',
      }),
    })
    const store = createSharedCredentialStore(storage)

    expect(store.load()).toEqual({ version: 1, credentials: [] })
  })

  it('drops credentials missing required fields', () => {
    const storage = createMemoryStorage({
      [SHARED_CREDENTIAL_STORAGE_KEY]: JSON.stringify({
        version: 1,
        credentials: [
          {
            roomId: 'room_1',
            memberId: 'member_1',
            displayName: 'Bei',
            createdAt: '2026-06-03T12:00:00.000Z',
            updatedAt: '2026-06-03T12:00:00.000Z',
          },
        ],
      }),
    })
    const store = createSharedCredentialStore(storage)

    expect(store.load()).toEqual({ version: 1, credentials: [] })
  })

  it('strips extra fields when saving', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)
    const credentialWithExtraField = {
      ...createValidCredential(),
      extraField: 'do-not-save',
    } as unknown as SharedCredentialStoreV1['credentials'][number]

    store.save({ version: 1, credentials: [credentialWithExtraField] })

    expect(
      JSON.parse(storage.getItem(SHARED_CREDENTIAL_STORAGE_KEY) ?? '{}'),
    ).toEqual(createValidStore())
  })

  it('does not serialize QQ identifiers, tokens, cookies, or chat content', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)
    const credentialWithSensitiveExtras = {
      ...createValidCredential(),
      qqId: '123456',
      uin: '654321',
      cookie: 'qq-cookie',
      token: 'qq-token',
      chatContent: 'private chat',
    } as unknown as SharedCredentialStoreV1['credentials'][number]

    store.save({ version: 1, credentials: [credentialWithSensitiveExtras] })

    const serialized = storage.getItem(SHARED_CREDENTIAL_STORAGE_KEY) ?? ''

    expect(serialized).not.toContain('qqId')
    expect(serialized).not.toContain('uin')
    expect(serialized).not.toContain('cookie')
    expect(serialized).not.toContain('token')
    expect(serialized).not.toContain('chatContent')
    expect(serialized).not.toContain('123456')
    expect(serialized).not.toContain('654321')
    expect(serialized).not.toContain('private chat')
  })

  it('upserts credentials by roomId and memberId', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)

    store.upsertCredential(createValidCredential())
    store.upsertCredential(
      createValidCredential({
        memberSecret: 'secret_2',
        displayName: 'Bei Updated',
        updatedAt: '2026-06-03T13:00:00.000Z',
      }),
    )

    expect(store.load().credentials).toEqual([
      createValidCredential({
        memberSecret: 'secret_2',
        displayName: 'Bei Updated',
        updatedAt: '2026-06-03T13:00:00.000Z',
      }),
    ])
  })

  it('removes only the matching credential', () => {
    const storage = createMemoryStorage()
    const store = createSharedCredentialStore(storage)
    const firstCredential = createValidCredential()
    const secondCredential = createValidCredential({
      roomId: 'room_2',
      memberId: 'member_2',
      memberSecret: 'secret_2',
      displayName: 'Nan',
    })

    store.save({
      version: 1,
      credentials: [firstCredential, secondCredential],
    })
    store.removeCredential('room_1', 'member_1')

    expect(store.load().credentials).toEqual([secondCredential])
  })

  it('uses a shared credential key separate from local home storage', () => {
    expect(SHARED_CREDENTIAL_STORAGE_KEY).toBe(
      'status4fpb:shared-credentials:v1',
    )
    expect(SHARED_CREDENTIAL_STORAGE_KEY).not.toBe(HOME_STORAGE_KEY)
  })

  it('does not call network APIs', () => {
    const fetchSpy = vi.fn()
    const webSocketSpy = vi.fn()
    const eventSourceSpy = vi.fn()
    const xhrSpy = vi.fn()

    vi.stubGlobal('fetch', fetchSpy)
    vi.stubGlobal('WebSocket', webSocketSpy)
    vi.stubGlobal('EventSource', eventSourceSpy)
    vi.stubGlobal('XMLHttpRequest', xhrSpy)

    try {
      const storage = createMemoryStorage()
      const store = createSharedCredentialStore(storage)

      store.load()
      store.save(createValidStore())
      store.upsertCredential(createValidCredential({ memberSecret: 'secret_2' }))
      store.removeCredential('room_1', 'member_1')
      store.clear()

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(webSocketSpy).not.toHaveBeenCalled()
      expect(eventSourceSpy).not.toHaveBeenCalled()
      expect(xhrSpy).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
