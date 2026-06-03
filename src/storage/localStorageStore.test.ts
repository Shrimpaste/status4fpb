import { describe, expect, it } from 'vitest'
import { addMember, createEmptyAppState, setMemberStatus } from '../domain/appState'
import {
  createLocalStorageStore,
  STORAGE_KEY,
  type StorageLike,
} from './localStorageStore'

const NOW = '2026-06-03T12:00:00.000Z'

class MemoryStorage implements StorageLike {
  private readonly items = new Map<string, string>()

  getItem(key: string): string | null {
    return this.items.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value)
  }

  removeItem(key: string): void {
    this.items.delete(key)
  }
}

function createPopulatedState() {
  const withMember = addMember(
    createEmptyAppState(),
    { id: 'm1', displayName: '北北', avatarKey: 'orange' },
    NOW,
  )

  return setMemberStatus(
    withMember,
    {
      memberId: 'm1',
      statusKey: 'exam_paper',
      note: '2022 真题',
      expiresAt: '2026-06-03T14:00:00.000Z',
    },
    NOW,
  )
}

describe('localStorage store', () => {
  it('loads an empty app state when storage is empty', () => {
    const store = createLocalStorageStore(new MemoryStorage())

    expect(store.load()).toEqual(createEmptyAppState())
  })

  it('saves and loads app state using the fixed storage key', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageStore(storage)
    const state = createPopulatedState()

    store.save(state)

    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(store.load()).toEqual(state)
  })

  it('clears the fixed storage key', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageStore(storage)

    store.save(createPopulatedState())
    store.clear()

    expect(storage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('falls back to an empty state when JSON is corrupt', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{bad json')

    expect(createLocalStorageStore(storage).load()).toEqual(createEmptyAppState())
  })

  it('falls back to an empty state when the shape is invalid', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ members: 'not-array' }))

    expect(createLocalStorageStore(storage).load()).toEqual(createEmptyAppState())
  })

  it('drops persisted fallback-only statuses while keeping valid members', () => {
    const storage = new MemoryStorage()
    const state = createPopulatedState()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        statuses: {
          m1: {
            ...state.statuses.m1,
            statusKey: 'unknown',
          },
        },
      }),
    )

    const loaded = createLocalStorageStore(storage).load()

    expect(loaded.members).toEqual(state.members)
    expect(loaded.statuses).toEqual({})
  })

  it('drops orphan statuses that reference missing members', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        members: [],
        statuses: {
          ghost: {
            memberId: 'ghost',
            statusKey: 'exam_paper',
            startedAt: NOW,
            updatedAt: NOW,
          },
        },
        settings: createEmptyAppState().settings,
      }),
    )

    expect(createLocalStorageStore(storage).load()).toEqual(createEmptyAppState())
  })

  it('keeps valid stored settings while falling back invalid settings fields', () => {
    const storage = new MemoryStorage()
    const state = createPopulatedState()
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        settings: {
          theme: 'campus',
          expiredFallback: 'bad-fallback',
        },
      }),
    )

    expect(createLocalStorageStore(storage).load().settings).toEqual({
      theme: 'campus',
      expiredFallback: 'offline',
    })
  })

  it('does not persist sensitive or unknown fields', () => {
    const storage = new MemoryStorage()
    const store = createLocalStorageStore(storage)
    const stateWithExtras = {
      ...createPopulatedState(),
      members: [
        {
          ...createPopulatedState().members[0],
          qqId: '123456',
          cookie: 'secret',
        },
      ],
      token: 'secret',
    }

    store.save(stateWithExtras)

    const raw = storage.getItem(STORAGE_KEY)
    expect(raw).not.toContain('qqId')
    expect(raw).not.toContain('cookie')
    expect(raw).not.toContain('token')
  })
})
