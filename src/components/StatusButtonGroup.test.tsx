import { fireEvent, render, screen } from '@testing-library/react'
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
