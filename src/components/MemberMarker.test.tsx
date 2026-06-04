import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EffectiveStatus, Member, StatusKey } from '../types/domain'
import { MemberMarker } from './MemberMarker'

const member: Member = {
  id: 'm1',
  displayName: '小北',
  avatarKey: 'orange',
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
}

function createStatus(statusKey: StatusKey, label: string): EffectiveStatus {
  return {
    statusKey,
    label,
    place: 'demo_place',
    placeLabel: '演示地点',
    description: '演示描述',
    selectable: statusKey !== 'unknown',
    memberId: member.id,
    source: statusKey === 'unknown' ? 'missing' : 'current',
  }
}

describe('MemberMarker', () => {
  it('renders a public action vignette for an exam-paper member', () => {
    render(
      <MemberMarker
        member={member}
        status={createStatus('exam_paper', '套卷中')}
        zoneLabel="自习塔"
      />,
    )

    expect(screen.getByText('刷卷堆塔')).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        '成员 小北 当前 套卷中，位于 自习塔，正在刷卷堆塔',
      ),
    ).toBeInTheDocument()
  })
})
