import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SharedTownDemoPanel } from './SharedTownDemoPanel'

function createRoom() {
  fireEvent.click(screen.getByRole('button', { name: '创建共享小镇' }))
}

function joinDemoMember(displayName = '演示成员') {
  fireEvent.change(screen.getByLabelText('演示成员名称'), {
    target: { value: displayName },
  })
  fireEvent.click(screen.getByRole('button', { name: '加入演示成员' }))
}

describe('SharedTownDemoPanel', () => {
  it('renders the experiment label and no-network warning', () => {
    render(<SharedTownDemoPanel />)

    expect(
      screen.getByRole('heading', { name: '共享小镇实验室' }),
    ).toBeInTheDocument()
    expect(screen.getByText('本地模拟，不联网，刷新后丢失')).toBeInTheDocument()
  })

  it('creates a room and shows the first demo member', () => {
    render(<SharedTownDemoPanel />)

    createRoom()

    expect(screen.getByText('房间：共享小镇实验室')).toBeInTheDocument()
    expect(screen.getByText(/^服务器时间：/)).toBeInTheDocument()
    expect(screen.getByLabelText('共享成员 我')).toBeInTheDocument()
  })

  it('joins a visible demo member', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    joinDemoMember()

    expect(screen.getByLabelText('共享成员 演示成员')).toBeInTheDocument()
  })

  it('updates shared demo statuses from status buttons', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    joinDemoMember()
    fireEvent.click(screen.getByRole('button', { name: '设置演示成员为套卷中' }))

    const memberCard = screen.getByLabelText('共享成员 演示成员')
    expect(within(memberCard).getByText('当前：套卷中')).toBeInTheDocument()
    expect(within(memberCard).getByText('状态：有效')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '设置演示成员为缩圈中' }))

    expect(within(memberCard).getByText('当前：缩圈中')).toBeInTheDocument()
  })

  it('leaves and resets the demo UI', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    joinDemoMember()
    fireEvent.click(screen.getByRole('button', { name: '离开演示成员' }))

    const memberCard = screen.getByLabelText('共享成员 演示成员')
    expect(within(memberCard).getByText('已离开')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '重置实验' }))

    expect(screen.queryByText('房间：共享小镇实验室')).toBeNull()
    expect(screen.getByRole('button', { name: '创建共享小镇' })).toBeEnabled()
  })

  it('does not render member secrets in DOM text', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    joinDemoMember()

    expect(document.body.textContent).not.toContain('secret')
  })
})
