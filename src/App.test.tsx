import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('presents the MVP pixel status home shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'QQ群友状态家园' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('套卷中').length).toBeGreaterThan(0)
    expect(screen.getAllByText('缩圈中').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: '添加群友' }),
    ).toBeDisabled()
    expect(screen.getByLabelText('像素家园预览')).toBeInTheDocument()
  })
})
