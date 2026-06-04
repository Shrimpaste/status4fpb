import type { EffectiveStatus, Member } from '../types/domain'
import { TownZone, type TownResident } from './TownZone'
import {
  TOWN_ZONES,
  getTownZoneForStatus,
  type TownZoneKey,
} from './townLayout'

type PixelHomeMapProps = {
  members: Member[]
  getMemberStatus: (memberId: string) => EffectiveStatus
}

function groupResidentsByZone(
  members: Member[],
  getMemberStatus: PixelHomeMapProps['getMemberStatus'],
) {
  const residentsByZone = new Map<TownZoneKey, TownResident[]>()

  for (const zone of TOWN_ZONES) {
    residentsByZone.set(zone.zoneKey, [])
  }

  for (const member of members) {
    const status = getMemberStatus(member.id)
    const zoneKey = getTownZoneForStatus(status.statusKey)
    const residents = residentsByZone.get(zoneKey) ?? []

    residents.push({ member, status })
    residentsByZone.set(zoneKey, residents)
  }

  return residentsByZone
}

export function PixelHomeMap({ members, getMemberStatus }: PixelHomeMapProps) {
  const residentsByZone = groupResidentsByZone(members, getMemberStatus)
  const activeZoneCount = Array.from(residentsByZone.values()).filter(
    (residents) => residents.length > 0,
  ).length

  return (
    <section className="pixel-home" aria-label="像素家园预览">
      <div className="town-map">
        <div className="town-summary" aria-label="小镇状态摘要">
          <span>{members.length} 位群友入住</span>
          <span>{activeZoneCount} 个区域亮起</span>
        </div>

        {members.length === 0 ? (
          <div className="empty-home" role="note">
            <p>还没有群友入住</p>
            <p>添加群友后，小人会根据状态进入不同区域</p>
          </div>
        ) : null}

        <div className="town-grid">
          {TOWN_ZONES.map((zone) => (
            <TownZone
              key={zone.zoneKey}
              zone={zone}
              residents={residentsByZone.get(zone.zoneKey) ?? []}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
