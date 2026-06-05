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

function generateInviteLink() {
  fireEvent.click(screen.getByRole('button', { name: '生成本地邀请链接' }))
}

function parseInviteLink(value: string) {
  fireEvent.change(screen.getByLabelText('传送门链接'), {
    target: { value },
  })
  fireEvent.click(screen.getByRole('button', { name: '解析传送门链接' }))
}

function getSharedDemoMemberCount() {
  return document.querySelectorAll('.shared-demo-member').length
}

describe('SharedTownDemoPanel', () => {
  it('renders the experiment label and no-network warning', () => {
    render(<SharedTownDemoPanel />)

    expect(
      screen.getByRole('heading', { name: '共享小镇实验室' }),
    ).toBeInTheDocument()
    expect(screen.getByText('本地实验室，不联网，刷新后丢失')).toBeInTheDocument()
    expect(
      screen.getByText('只清空本次本地实验室状态，不会连接 QQ，也不会上传数据。'),
    ).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/云同步|在线房间|真实共享|邀请群友上线/)
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

    fireEvent.click(
      screen.getByRole('button', { name: '重置本次本地实验室状态' }),
    )

    expect(screen.queryByText('房间：共享小镇实验室')).toBeNull()
    expect(screen.getByRole('button', { name: '创建共享小镇' })).toBeEnabled()
  })

  it('does not render member secrets in DOM text', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    joinDemoMember()

    expect(document.body.textContent).not.toContain('secret')
  })

  it('renders invite portal copy with local parse and no-network warnings', () => {
    render(<SharedTownDemoPanel />)

    expect(
      screen.getByRole('heading', { name: '小镇传送门' }),
    ).toBeInTheDocument()
    expect(screen.getByText('本地邀请链接实验')).toBeInTheDocument()
    expect(screen.getByText('只解析，不联网')).toBeInTheDocument()
    expect(screen.getByText('不会自动加入真实房间')).toBeInTheDocument()
    expect(screen.getByText('不要在链接中放入密钥')).toBeInTheDocument()
  })

  it('generates an invite link after creating a demo room', () => {
    render(<SharedTownDemoPanel />)

    expect(
      screen.getByRole('button', { name: '生成本地邀请链接' }),
    ).toBeDisabled()

    createRoom()
    generateInviteLink()

    expect(screen.getByText('/join?code=TOWN-0001')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('memberSecret')
    expect(document.body.textContent).not.toContain('token')
    expect(document.body.textContent).not.toContain('credential')
    expect(document.body.textContent).not.toContain('authorization')
  })

  it('parses a valid invite link without automatically joining a member', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    const memberCountBeforeParse = getSharedDemoMemberCount()
    parseInviteLink('/join?code=TOWN-0001')

    expect(screen.getByText('解析到邀请码：TOWN-0001')).toBeInTheDocument()
    expect(screen.getByText('本地解析完成，尚未自动加入。')).toBeInTheDocument()
    expect(getSharedDemoMemberCount()).toBe(memberCountBeforeParse)
  })

  it('rejects invite links containing memberSecret without echoing the value', () => {
    render(<SharedTownDemoPanel />)

    parseInviteLink('/join?code=TOWN-0001&memberSecret=secret_1')

    expect(screen.getByText('链接包含敏感密钥，已拒绝')).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('secret_1')
  })

  it('rejects invite links containing secret, token, credential, or authorization', () => {
    render(<SharedTownDemoPanel />)

    for (const field of ['secret', 'token', 'credential', 'authorization']) {
      parseInviteLink(`/join?code=TOWN-0001&${field}=nope`)

      expect(screen.getByText('链接包含敏感密钥，已拒绝')).toBeInTheDocument()
      expect(document.body.textContent).not.toContain('nope')
    }
  })

  it('resets generated and parsed invite link state', () => {
    render(<SharedTownDemoPanel />)

    createRoom()
    generateInviteLink()
    parseInviteLink('/join?code=TOWN-0001')

    expect(screen.getByText('/join?code=TOWN-0001')).toBeInTheDocument()
    expect(screen.getByText('解析到邀请码：TOWN-0001')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: '重置本次本地实验室状态' }),
    )

    expect(screen.queryByText('/join?code=TOWN-0001')).toBeNull()
    expect(screen.queryByText('解析到邀请码：TOWN-0001')).toBeNull()
  })
})
