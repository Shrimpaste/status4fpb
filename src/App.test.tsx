import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { addMember, createEmptyAppState, setMemberStatus } from './domain/appState'
import { STORAGE_KEY } from './storage/localStorageStore'

const NOW = '2026-06-03T12:00:00.000Z'

function addMemberThroughUi(displayName = '北北') {
  fireEvent.change(screen.getByLabelText('群友昵称'), {
    target: { value: displayName },
  })
  fireEvent.click(screen.getByRole('button', { name: '添加群友' }))
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty status home with an active add form', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'QQ群友状态家园' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('群友昵称')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加群友' })).toBeEnabled()
    expect(screen.getByText('还没有群友入住')).toBeInTheDocument()
    expect(screen.getByText('自习桌')).toBeInTheDocument()
    expect(screen.queryByText('study_desk')).not.toBeInTheDocument()
  })

  it('adds a member and persists it locally', () => {
    render(<App />)

    addMemberThroughUi()

    expect(screen.getByLabelText('成员 北北')).toBeInTheDocument()
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.members[0].displayName).toBe('北北')
  })

  it('ignores blank names and trims saved display names', () => {
    render(<App />)

    addMemberThroughUi('   ')

    expect(screen.queryByLabelText('成员')).not.toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()

    addMemberThroughUi('  北北  ')

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.members[0].displayName).toBe('北北')
  })

  it('sets required statuses and persists the latest status', () => {
    render(<App />)

    addMemberThroughUi()
    fireEvent.click(screen.getByRole('button', { name: '设置北北为套卷中' }))

    const memberCard = screen.getByLabelText('成员 北北')
    expect(within(memberCard).getByText('当前：套卷中')).toBeInTheDocument()

    let saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.statuses[saved.members[0].id].statusKey).toBe('exam_paper')

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(within(memberCard).getByText('当前：缩圈中')).toBeInTheDocument()
    saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.statuses[saved.members[0].id].statusKey).toBe(
      'scope_shrinking',
    )
  })

  it('renders persisted members and statuses on startup', () => {
    const state = setMemberStatus(
      addMember(
        createEmptyAppState(),
        { id: 'm1', displayName: '北北', avatarKey: 'orange' },
        NOW,
      ),
      { memberId: 'm1', statusKey: 'scope_shrinking' },
      NOW,
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(<App />)

    const memberCard = screen.getByLabelText('成员 北北')
    expect(within(memberCard).getByText('当前：缩圈中')).toBeInTheDocument()
  })

  it('deletes a member only after confirmation and cleans persisted status', () => {
    render(<App />)

    addMemberThroughUi()
    fireEvent.click(screen.getByRole('button', { name: '设置北北为套卷中' }))

    fireEvent.click(screen.getByRole('button', { name: '删除北北' }))

    expect(screen.getByLabelText('成员 北北')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '确认删除北北' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '确认删除北北' }))

    expect(screen.queryByLabelText('成员 北北')).not.toBeInTheDocument()
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.members).toEqual([])
    expect(saved.statuses).toEqual({})
  })

  it('clears pending delete confirmation when adding a member', () => {
    render(<App />)

    addMemberThroughUi()
    fireEvent.click(screen.getByRole('button', { name: '删除北北' }))

    expect(
      screen.getByRole('button', { name: '确认删除北北' }),
    ).toBeInTheDocument()

    addMemberThroughUi('南南')

    expect(screen.queryByRole('button', { name: '确认删除北北' })).toBeNull()
    expect(screen.getByLabelText('成员 北北')).toBeInTheDocument()
    expect(screen.getByLabelText('成员 南南')).toBeInTheDocument()
  })
})
