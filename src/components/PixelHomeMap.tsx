import type { EffectiveStatus, Member } from '../types/domain'

type PixelHomeMapProps = {
  members: Member[]
  getMemberStatus: (memberId: string) => EffectiveStatus
}

export function PixelHomeMap({ members, getMemberStatus }: PixelHomeMapProps) {
  return (
    <section className="pixel-home" aria-label="像素家园预览">
      <div className="map-grid">
        {members.length === 0 ? (
          <p className="empty-home">还没有群友入住</p>
        ) : (
          members.map((member, index) => {
            const status = getMemberStatus(member.id)

            return (
              <article
                className={`resident-marker marker-${index % 4}`}
                key={member.id}
                aria-label={`像素居民 ${member.displayName}`}
              >
                <span className={`mini-sprite ${member.avatarKey}`}></span>
                <span className="bubble">{status.label}</span>
                <strong>{member.displayName}</strong>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
