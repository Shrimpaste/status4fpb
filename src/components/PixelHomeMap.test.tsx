import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STATUS_PRESETS } from '../data/statusPresets'
import type { EffectiveStatus, Member, StatusKey } from '../types/domain'
import { PixelHomeMap } from './PixelHomeMap'

function createMember(id: string, displayName: string): Member {
  return {
    id,
    displayName,
    avatarKey: 'orange',
    createdAt: '2026-06-03T12:00:00.000Z',
    updatedAt: '2026-06-03T12:00:00.000Z',
  }
}

function createStatus(memberId: string, statusKey: StatusKey): EffectiveStatus {
  return {
    ...STATUS_PRESETS[statusKey],
    memberId,
    source: statusKey === 'unknown' ? 'missing' : 'current',
  }
}

function renderMap(
  statusKey: StatusKey,
  source: EffectiveStatus['source'] = 'current',
) {
  const member = createMember('m1', '北北')
  const status = {
    ...createStatus(member.id, statusKey),
    source,
  }

  render(
    <PixelHomeMap
      members={[member]}
      getMemberStatus={() => status}
    />,
  )
}

describe('PixelHomeMap', () => {
  it('renders the first-slice town zones with public labels', () => {
    render(
      <PixelHomeMap
        members={[]}
        getMemberStatus={() => createStatus('missing', 'unknown')}
      />,
    )

    expect(screen.getByText('还没有群友入住')).toBeInTheDocument()
    expect(
      screen.getByText('添加群友后，小人会根据状态进入不同区域'),
    ).toBeInTheDocument()

    for (const label of [
      '自习塔',
      '魔法研究所',
      '池塘',
      '图书馆',
      '旅馆',
      'DDL 工坊',
      '雾林',
      '广场',
      '问号路牌',
    ]) {
      expect(
        screen.getByRole('region', { name: `状态区域 ${label}` }),
      ).toBeInTheDocument()
    }

    expect(screen.queryByText('study_tower')).not.toBeInTheDocument()
    expect(screen.queryByText('scope_lab')).not.toBeInTheDocument()
  })

  it('summarizes resident count and active town zones', () => {
    const members = [createMember('m1', '北北'), createMember('m2', '南南')]

    render(
      <PixelHomeMap
        members={members}
        getMemberStatus={(memberId) =>
          createStatus(
            memberId,
            memberId === 'm1' ? 'exam_paper' : 'scope_shrinking',
          )
        }
      />,
    )

    expect(screen.getByText('2 位群友入住')).toBeInTheDocument()
    expect(screen.getByText('2 个区域亮起')).toBeInTheDocument()
  })

  it('places an exam-paper member in the Study Tower zone', () => {
    renderMap('exam_paper')

    const zone = screen.getByRole('region', { name: '状态区域 自习塔' })
    expect(
      within(zone).getByLabelText(
        '成员 北北 当前 套卷中，位于 自习塔，正在刷卷堆塔',
      ),
    ).toBeInTheDocument()
  })

  it('renders multiple members in the same town zone', () => {
    const members = [createMember('m1', '北北'), createMember('m2', '南南')]

    render(
      <PixelHomeMap
        members={members}
        getMemberStatus={(memberId) => createStatus(memberId, 'exam_paper')}
      />,
    )

    const zone = screen.getByRole('region', { name: '状态区域 自习塔' })

    expect(within(zone).getByText('2 人')).toBeInTheDocument()
    expect(
      within(zone).getByLabelText(
        '成员 北北 当前 套卷中，位于 自习塔，正在刷卷堆塔',
      ),
    ).toBeInTheDocument()
    expect(
      within(zone).getByLabelText(
        '成员 南南 当前 套卷中，位于 自习塔，正在刷卷堆塔',
      ),
    ).toBeInTheDocument()
    expect(within(zone).queryByText('空')).not.toBeInTheDocument()
  })

  it('places a scope-shrinking member in the Scope Lab zone', () => {
    renderMap('scope_shrinking')

    const zone = screen.getByRole('region', { name: '状态区域 魔法研究所' })
    expect(
      within(zone).getByLabelText(
        '成员 北北 当前 缩圈中，位于 魔法研究所，正在缩圈画阵',
      ),
    ).toBeInTheDocument()
  })

  it('places an expired fallback member in the Mist Forest zone', () => {
    renderMap('offline', 'expired_fallback')

    const zone = screen.getByRole('region', { name: '状态区域 雾林' })
    expect(
      within(zone).getByLabelText(
        '成员 北北 当前 失联中，位于 雾林，正在雾里失联',
      ),
    ).toBeInTheDocument()
  })

  it('places a missing-status member near the Unknown Sign zone', () => {
    renderMap('unknown', 'missing')

    const zone = screen.getByRole('region', { name: '状态区域 问号路牌' })
    expect(
      within(zone).getByLabelText(
        '成员 北北 当前 未知，位于 问号路牌，正在路牌待机',
      ),
    ).toBeInTheDocument()
  })
})
