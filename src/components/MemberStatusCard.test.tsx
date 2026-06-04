import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import type { EffectiveStatus, Member } from '../types/domain'
import { MemberStatusCard } from './MemberStatusCard'

const member: Member = {
  id: 'm1',
  displayName: '北北',
  avatarKey: 'orange',
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
}

const status: EffectiveStatus = {
  ...STATUS_PRESETS.exam_paper,
  memberId: 'm1',
  source: 'current',
}

describe('MemberStatusCard', () => {
  it('shows the current status and delegates status selection', () => {
    const onSelectStatus = vi.fn()
    render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={onSelectStatus}
        onDeleteClick={vi.fn()}
      />,
    )

    const card = screen.getByLabelText('成员 北北')
    expect(within(card).getByText('当前：套卷中')).toBeInTheDocument()
    expect(within(card).getByText('正在和试卷搏斗')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(onSelectStatus).toHaveBeenCalledWith('m1', {
      statusKey: 'scope_shrinking',
    })
  })

  it('passes note and expiration details when selecting a status', () => {
    const onSelectStatus = vi.fn()
    render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={onSelectStatus}
        onDeleteClick={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByLabelText('状态备注'), {
      target: { value: '第二套卷' },
    })
    fireEvent.change(screen.getByLabelText('有效期'), {
      target: { value: 'one_hour' },
    })
    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(onSelectStatus).toHaveBeenCalledWith('m1', {
      statusKey: 'scope_shrinking',
      note: '第二套卷',
      expirationPreset: 'one_hour',
    })
  })

  it('shows current note and expiration details', () => {
    render(
      <MemberStatusCard
        member={member}
        status={{
          ...status,
          note: '第二套卷',
          expiresAt: '2026-06-03T13:00:00.000Z',
        }}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )

    const card = screen.getByLabelText('成员 北北')

    expect(within(card).getByText('备注：第二套卷')).toBeInTheDocument()
    expect(within(card).getByText(/^有效期至：/)).toBeInTheDocument()
  })

  it('shows a readable status source badge', () => {
    const { rerender } = render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )

    const card = screen.getByLabelText('成员 北北')

    expect(within(card).getByText('手动状态')).toBeInTheDocument()

    rerender(
      <MemberStatusCard
        member={member}
        status={{
          ...STATUS_PRESETS.offline,
          memberId: member.id,
          source: 'expired_fallback',
        }}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )

    expect(within(card).getByText('过期兜底')).toBeInTheDocument()

    rerender(
      <MemberStatusCard
        member={member}
        status={{
          ...STATUS_PRESETS.unknown,
          memberId: member.id,
          source: 'missing',
        }}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={vi.fn()}
      />,
    )

    expect(within(card).getByText('未设置')).toBeInTheDocument()
  })

  it('renders delete and confirm delete states through props', () => {
    const onDeleteClick = vi.fn()
    const { rerender } = render(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={false}
        onSelectStatus={vi.fn()}
        onDeleteClick={onDeleteClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '删除北北' }))
    expect(onDeleteClick).toHaveBeenCalledWith('m1')

    rerender(
      <MemberStatusCard
        member={member}
        status={status}
        statuses={Object.values(STATUS_PRESETS)}
        isPendingDelete={true}
        onSelectStatus={vi.fn()}
        onDeleteClick={onDeleteClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '确认删除北北' }))
    expect(onDeleteClick).toHaveBeenCalledWith('m1')
  })
})
