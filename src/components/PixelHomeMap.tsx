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

  return (
    <section className="pixel-home" aria-label="像素家园预览">
      <div className="town-map">
        {members.length === 0 ? (
          <p className="empty-home">还没有群友入住</p>
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
