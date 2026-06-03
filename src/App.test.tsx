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
    const studyZone = screen.getByRole('region', { name: '状态区域 自习塔' })
    expect(
      within(studyZone).getByLabelText('成员 北北 当前 套卷中，位于 自习塔'),
    ).toBeInTheDocument()

    let saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.statuses[saved.members[0].id].statusKey).toBe('exam_paper')

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(within(memberCard).getByText('当前：缩圈中')).toBeInTheDocument()
    const scopeZone = screen.getByRole('region', {
      name: '状态区域 魔法研究所',
    })
    expect(
      within(scopeZone).getByLabelText(
        '成员 北北 当前 缩圈中，位于 魔法研究所',
      ),
    ).toBeInTheDocument()
    expect(
      within(studyZone).queryByLabelText('成员 北北 当前 套卷中，位于 自习塔'),
    ).toBeNull()
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

  it('saves status notes and expiration presets locally', () => {
    render(<App />)

    addMemberThroughUi()
    fireEvent.change(screen.getByLabelText('状态备注'), {
      target: { value: '第二套卷' },
    })
    fireEvent.change(screen.getByLabelText('有效期'), {
      target: { value: 'one_hour' },
    })
    fireEvent.click(screen.getByRole('button', { name: '设置北北为套卷中' }))

    const memberCard = screen.getByLabelText('成员 北北')
    expect(within(memberCard).getByText('备注：第二套卷')).toBeInTheDocument()
    expect(within(memberCard).getByText(/^有效期至：/)).toBeInTheDocument()

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    const memberId = saved.members[0].id

    expect(saved.statuses[memberId].note).toBe('第二套卷')
    expect(Date.parse(saved.statuses[memberId].expiresAt)).toBeGreaterThan(
      Date.parse(saved.statuses[memberId].startedAt),
    )
  })

  it('renders persisted current notes on startup', () => {
    const state = setMemberStatus(
      addMember(
        createEmptyAppState(),
        { id: 'm1', displayName: '北北', avatarKey: 'orange' },
        NOW,
      ),
      {
        memberId: 'm1',
        statusKey: 'exam_paper',
        note: '第二套卷',
        expiresAt: '2999-06-03T13:00:00.000Z',
      },
      NOW,
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(<App />)

    const memberCard = screen.getByLabelText('成员 北北')
    expect(within(memberCard).getByText('备注：第二套卷')).toBeInTheDocument()
    expect(within(memberCard).getByText(/^有效期至：/)).toBeInTheDocument()
  })

  it('uses fallback status without showing stale notes after expiration', () => {
    const state = setMemberStatus(
      addMember(
        createEmptyAppState(),
        { id: 'm1', displayName: '北北', avatarKey: 'orange' },
        NOW,
      ),
      {
        memberId: 'm1',
        statusKey: 'exam_paper',
        note: '第二套卷',
        expiresAt: '2000-06-03T13:00:00.000Z',
      },
      NOW,
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

    render(<App />)

    const memberCard = screen.getByLabelText('成员 北北')
    expect(within(memberCard).getByText('当前：失联中')).toBeInTheDocument()
    expect(within(memberCard).queryByText('备注：第二套卷')).toBeNull()
    expect(within(memberCard).queryByText(/^有效期至：/)).toBeNull()
    const mistZone = screen.getByRole('region', { name: '状态区域 雾林' })
    expect(
      within(mistZone).getByLabelText('成员 北北 当前 失联中，位于 雾林'),
    ).toBeInTheDocument()
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

  it('resets all local data only after confirmation', () => {
    render(<App />)

    addMemberThroughUi()
    fireEvent.click(screen.getByRole('button', { name: '设置北北为套卷中' }))

    fireEvent.click(screen.getByRole('button', { name: '重置家园' }))

    expect(screen.getByLabelText('成员 北北')).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(
      screen.getByRole('button', { name: '确认重置家园' }),
    ).toHaveTextContent('确认重置家园')

    fireEvent.click(screen.getByRole('button', { name: '确认重置家园' }))

    expect(screen.queryByLabelText('成员 北北')).not.toBeInTheDocument()
    expect(screen.getByText('还没有群友入住')).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('renders the shared town demo section', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '共享小镇实验室' }),
    ).toBeInTheDocument()
  })

  it('keeps local-only home controls while using the demo', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '创建共享小镇' }))

    expect(
      screen.getByText('Local-first QQ group mood board'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('群友昵称')).toBeInTheDocument()
    expect(screen.getByText('房间：共享小镇实验室')).toBeInTheDocument()
  })

  it('describes the demo as local mock with no network and refresh loss', () => {
    render(<App />)

    expect(screen.getByText('本地模拟，不联网，刷新后丢失')).toBeInTheDocument()
  })
})
