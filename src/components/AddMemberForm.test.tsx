import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddMemberForm } from './AddMemberForm'

describe('AddMemberForm', () => {
  it('does not submit blank display names', () => {
    const onAddMember = vi.fn()
    render(<AddMemberForm onAddMember={onAddMember} />)

    const input = screen.getByLabelText('群友昵称')
    fireEvent.change(screen.getByLabelText('群友昵称'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '添加群友' }))

    expect(onAddMember).not.toHaveBeenCalled()
    expect(input).toHaveValue('')
  })

  it('submits trimmed display names and clears the input', () => {
    const onAddMember = vi.fn()
    render(<AddMemberForm onAddMember={onAddMember} />)

    const input = screen.getByLabelText('群友昵称')
    fireEvent.change(input, { target: { value: '  北北  ' } })
    fireEvent.click(screen.getByRole('button', { name: '添加群友' }))

    expect(onAddMember).toHaveBeenCalledWith('北北')
    expect(input).toHaveValue('')
  })
})
