import { useState } from 'react'
import { STATUS_PRESETS } from './data/statusPresets'
import { usePixelHomeApp } from './app/usePixelHomeApp'
import type { SelectableStatusKey, StatusPreset } from './types/domain'
import './App.css'

const featuredStatuses = [
  STATUS_PRESETS.exam_paper,
  STATUS_PRESETS.scope_shrinking,
]

const selectableStatuses = Object.values(STATUS_PRESETS).filter(
  (status): status is StatusPreset & { statusKey: SelectableStatusKey } =>
    status.selectable,
)

function App() {
  const [displayName, setDisplayName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const {
    state,
    addVirtualMember,
    setVirtualMemberStatus,
    removeVirtualMember,
    getMemberStatus,
  } = usePixelHomeApp()

  function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    addVirtualMember(displayName)
    setPendingDeleteId(null)
    setDisplayName('')
  }

  function handleStatusClick(memberId: string, statusKey: SelectableStatusKey) {
    setPendingDeleteId(null)
    setVirtualMemberStatus(memberId, statusKey)
  }

  function handleDeleteClick(memberId: string) {
    if (pendingDeleteId === memberId) {
      removeVirtualMember(memberId)
      setPendingDeleteId(null)
      return
    }

    setPendingDeleteId(memberId)
  }

  return (
    <main className="app-shell">
      <section className="intro-panel">
        <p className="eyebrow">Local-first QQ group mood board</p>
        <h1>QQ群友状态家园</h1>
        <p className="lede">
          先用手动状态和虚拟头像搭起一个安全的像素小镇，再逐步扩展状态逻辑和授权数据源。
        </p>
        <form className="add-member-form" onSubmit={handleAddMember}>
          <label htmlFor="member-name">群友昵称</label>
          <div className="action-row">
            <input
              id="member-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={16}
              autoComplete="off"
            />
            <button type="submit" className="primary-action">
              添加群友
            </button>
          </div>
        </form>
        <span className="privacy-note">MVP 不接入 QQ 私有接口</span>
      </section>

      <section className="pixel-home" aria-label="像素家园预览">
        <div className="map-grid">
          {state.members.length === 0 ? (
            <p className="empty-home">还没有群友入住</p>
          ) : (
            state.members.map((member, index) => {
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

      <section className="status-dock" aria-label="群友状态">
        {state.members.length === 0
          ? featuredStatuses.map((status) => (
              <article className="status-card" key={status.statusKey}>
                <p className="status-place">{status.placeLabel}</p>
                <h2>{status.label}</h2>
                <p>{status.description}</p>
              </article>
            ))
          : state.members.map((member) => {
              const status = getMemberStatus(member.id)

              return (
                <article
                  className="status-card member-card"
                  key={member.id}
                  aria-label={`成员 ${member.displayName}`}
                >
                  <p className="status-place">{status.placeLabel}</p>
                  <h2>{member.displayName}</h2>
                  <p className="current-status">当前：{status.label}</p>
                  <div className="status-actions">
                    {selectableStatuses.map((preset) => (
                      <button
                        type="button"
                        key={preset.statusKey}
                        className="status-action"
                        onClick={() => handleStatusClick(member.id, preset.statusKey)}
                        aria-label={`设置${member.displayName}为${preset.label}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="delete-action"
                    onClick={() => handleDeleteClick(member.id)}
                    aria-label={
                      pendingDeleteId === member.id
                        ? `确认删除${member.displayName}`
                        : `删除${member.displayName}`
                    }
                  >
                    {pendingDeleteId === member.id ? '确认删除' : '删除'}
                  </button>
                </article>
              )
            })}
      </section>
    </main>
  )
}

export default App
