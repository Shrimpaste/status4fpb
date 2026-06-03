import { useState } from 'react'
import { AddMemberForm } from './components/AddMemberForm'
import { MemberStatusCard } from './components/MemberStatusCard'
import { PixelHomeMap } from './components/PixelHomeMap'
import { STATUS_PRESETS } from './data/statusPresets'
import {
  usePixelHomeApp,
  type SetVirtualMemberStatusInput,
} from './app/usePixelHomeApp'
import './App.css'

const featuredStatuses = [
  STATUS_PRESETS.exam_paper,
  STATUS_PRESETS.scope_shrinking,
]

const statuses = Object.values(STATUS_PRESETS)

function App() {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const {
    state,
    addVirtualMember,
    setVirtualMemberStatus,
    removeVirtualMember,
    getMemberStatus,
  } = usePixelHomeApp()

  function handleAddMember(displayName: string) {
    addVirtualMember(displayName)
    setPendingDeleteId(null)
  }

  function handleStatusClick(
    memberId: string,
    input: SetVirtualMemberStatusInput,
  ) {
    setPendingDeleteId(null)
    setVirtualMemberStatus(memberId, input)
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
        <AddMemberForm onAddMember={handleAddMember} />
        <span className="privacy-note">MVP 不接入 QQ 私有接口</span>
      </section>

      <PixelHomeMap
        members={state.members}
        getMemberStatus={getMemberStatus}
      />

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
                <MemberStatusCard
                  key={member.id}
                  member={member}
                  status={status}
                  statuses={statuses}
                  isPendingDelete={pendingDeleteId === member.id}
                  onSelectStatus={handleStatusClick}
                  onDeleteClick={handleDeleteClick}
                />
              )
            })}
      </section>
    </main>
  )
}

export default App
