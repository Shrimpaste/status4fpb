import type { StatusKey } from '../types/domain'

export type TownZoneKey =
  | 'study_tower'
  | 'scope_lab'
  | 'fishing_pond'
  | 'library'
  | 'dorm_inn'
  | 'deadline_workshop'
  | 'mist_forest'
  | 'town_square'
  | 'unknown_sign'

export type TownZone = {
  zoneKey: TownZoneKey
  statusKey: StatusKey
  label: string
  description: string
  icon: string
  className: string
}

export const TOWN_ZONES: TownZone[] = [
  {
    zoneKey: 'study_tower',
    statusKey: 'exam_paper',
    label: '自习塔',
    description: '套卷中的群友在这里堆卷子',
    icon: '卷',
    className: 'zone-study',
  },
  {
    zoneKey: 'scope_lab',
    statusKey: 'scope_shrinking',
    label: '魔法研究所',
    description: '缩圈中的群友在这里压缩范围',
    icon: '圈',
    className: 'zone-scope',
  },
  {
    zoneKey: 'fishing_pond',
    statusKey: 'fishing',
    label: '池塘',
    description: '摸鱼中的群友在这里假装沉思',
    icon: '鱼',
    className: 'zone-pond',
  },
  {
    zoneKey: 'library',
    statusKey: 'vocabulary',
    label: '图书馆',
    description: '背单词中的群友在这里和遗忘曲线对线',
    icon: '词',
    className: 'zone-library',
  },
  {
    zoneKey: 'dorm_inn',
    statusKey: 'sleeping',
    label: '旅馆',
    description: '睡觉中的群友在这里低功耗运行',
    icon: '眠',
    className: 'zone-dorm',
  },
  {
    zoneKey: 'deadline_workshop',
    statusKey: 'deadline',
    label: 'DDL 工坊',
    description: '赶 ddl 的群友在这里敲打时间',
    icon: '急',
    className: 'zone-deadline',
  },
  {
    zoneKey: 'mist_forest',
    statusKey: 'offline',
    label: '雾林',
    description: '失联中的群友在这里变成传说',
    icon: '雾',
    className: 'zone-mist',
  },
  {
    zoneKey: 'town_square',
    statusKey: 'idle',
    label: '广场',
    description: '空闲中的群友在这里晒太阳',
    icon: '闲',
    className: 'zone-square',
  },
  {
    zoneKey: 'unknown_sign',
    statusKey: 'unknown',
    label: '问号路牌',
    description: '还没有状态的群友先在这里集合',
    icon: '?',
    className: 'zone-unknown',
  },
]

export const townZoneByKey = Object.fromEntries(
  TOWN_ZONES.map((zone) => [zone.zoneKey, zone]),
) as Record<TownZoneKey, TownZone>

export const townZoneByStatus = Object.fromEntries(
  TOWN_ZONES.map((zone) => [zone.statusKey, zone.zoneKey]),
) as Record<StatusKey, TownZoneKey>

export function getTownZoneForStatus(statusKey: StatusKey): TownZoneKey {
  return townZoneByStatus[statusKey]
}
