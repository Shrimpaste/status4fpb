import type { EffectiveStatus, Member } from '../types/domain'
import { MemberMarker } from './MemberMarker'
import type { TownZone as TownZoneModel } from './townLayout'

export type TownResident = {
  member: Member
  status: EffectiveStatus
}

type TownZoneProps = {
  zone: TownZoneModel
  residents: TownResident[]
}

export function TownZone({ zone, residents }: TownZoneProps) {
  return (
    <section
      className={`town-zone ${zone.className}`}
      aria-label={`状态区域 ${zone.label}`}
    >
      <header className="town-zone-header">
        <span className="town-zone-icon" aria-hidden="true">
          {zone.icon}
        </span>
        <div className="town-zone-copy">
          <div className="town-zone-title">
            <h2>{zone.label}</h2>
            <span className="town-zone-count">{residents.length} 人</span>
          </div>
          <p>{zone.description}</p>
        </div>
      </header>

      <div className="town-residents">
        {residents.length === 0 ? (
          <span className="town-zone-empty">空</span>
        ) : (
          residents.map(({ member, status }) => (
            <MemberMarker
              key={member.id}
              member={member}
              status={status}
              zoneLabel={zone.label}
            />
          ))
        )}
      </div>
    </section>
  )
}
