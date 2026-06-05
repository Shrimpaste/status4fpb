import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import { StatusButtonGroup } from './StatusButtonGroup'

describe('StatusButtonGroup', () => {
  it('renders selectable status labels without the unknown fallback', () => {
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: '设置北北为套卷中' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '设置北北为缩圈中' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '设置北北为未知' })).toBeNull()
  })

  it('shows each selectable status place inside the button', () => {
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={vi.fn()}
      />,
    )

    const examButton = screen.getByRole('button', { name: '设置北北为套卷中' })
    const scopeButton = screen.getByRole('button', { name: '设置北北为缩圈中' })

    expect(within(examButton).getByText('自习桌')).toBeInTheDocument()
    expect(within(scopeButton).getByText('缩圈法阵')).toBeInTheDocument()
    expect(screen.queryByText('未知区')).toBeNull()
  })

  it('renders selectable statuses under semantic group headings', () => {
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={vi.fn()}
      />,
    )

    const studyGroup = screen.getByRole('group', { name: '学习 / 备考' })
    const restGroup = screen.getByRole('group', { name: '休息 / 摸鱼' })
    const workGroup = screen.getByRole('group', { name: '创作 / 工作' })
    const fallbackGroup = screen.getByRole('group', { name: '特殊 / 兜底' })

    expect(
      within(studyGroup).getByRole('button', { name: '设置北北为套卷中' }),
    ).toBeInTheDocument()
    expect(
      within(studyGroup).getByRole('button', { name: '设置北北为缩圈中' }),
    ).toBeInTheDocument()
    expect(
      within(restGroup).getByRole('button', { name: '设置北北为摸鱼中' }),
    ).toBeInTheDocument()
    expect(
      within(workGroup).getByRole('button', { name: '设置北北为赶 ddl 中' }),
    ).toBeInTheDocument()
    expect(
      within(fallbackGroup).getByRole('button', { name: '设置北北为失联中' }),
    ).toBeInTheDocument()
    expect(within(fallbackGroup).queryByText('未知')).toBeNull()
  })

  it('passes the selected status key to the callback', () => {
    const onSelectStatus = vi.fn()
    render(
      <StatusButtonGroup
        displayName="北北"
        statuses={Object.values(STATUS_PRESETS)}
        onSelectStatus={onSelectStatus}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '设置北北为缩圈中' }))

    expect(onSelectStatus).toHaveBeenCalledWith('scope_shrinking')
  })
})
