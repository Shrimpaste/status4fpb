import { useState } from 'react'
import { useLocalSharedTownDemo } from '../app/useLocalSharedTownDemo'
import {
  createSharedInviteLink,
  parseSharedInviteLink,
} from '../shared-sync/inviteLink'
import type { SelectableStatusKey } from '../types/domain'

const demoStatuses: Array<{ statusKey: SelectableStatusKey; label: string }> = [
  { statusKey: 'exam_paper', label: '套卷中' },
  { statusKey: 'scope_shrinking', label: '缩圈中' },
]

type InviteLinkErrorReason = Exclude<
  ReturnType<typeof parseSharedInviteLink>,
  { ok: true }
>['reason']

export function SharedTownDemoPanel() {
  const [displayName, setDisplayName] = useState('演示成员')
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(
    null,
  )
  const [inviteLinkInput, setInviteLinkInput] = useState('')
  const [parsedInviteCode, setParsedInviteCode] = useState<string | null>(null)
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null)
  const {
    isActive,
    inviteCode,
    displayState,
    members,
    statuses,
    errorMessage,
    createDemoRoom,
    joinDemoMember,
    setDemoMemberStatus,
    leaveDemoMember,
    resetDemo,
  } = useLocalSharedTownDemo()

  function handleJoinDemoMember() {
    joinDemoMember(displayName)
    setDisplayName('演示成员')
  }

  function handleGenerateInviteLink() {
    if (!inviteCode) {
      return
    }

    setGeneratedInviteLink(createSharedInviteLink({ inviteCode }))
  }

  function handleParseInviteLink() {
    const result = parseSharedInviteLink(inviteLinkInput)

    if (result.ok) {
      setParsedInviteCode(result.inviteCode)
      setInviteLinkError(null)
      return
    }

    setParsedInviteCode(null)
    setInviteLinkError(getInviteLinkErrorMessage(result.reason))
  }

  function handleResetDemo() {
    resetDemo()
    setGeneratedInviteLink(null)
    setInviteLinkInput('')
    setParsedInviteCode(null)
    setInviteLinkError(null)
  }

  return (
    <section className="shared-demo-panel" aria-labelledby="shared-demo-title">
      <div className="shared-demo-heading">
        <p className="eyebrow">Local shared town demo</p>
        <h2 id="shared-demo-title">共享小镇实验室</h2>
        <p className="shared-demo-warning">本地模拟，不联网，刷新后丢失</p>
      </div>

      <div className="shared-demo-actions">
        <button
          type="button"
          className="primary-action"
          onClick={createDemoRoom}
        >
          创建共享小镇
        </button>
        {isActive ? (
          <button type="button" className="reset-action" onClick={handleResetDemo}>
            重置实验
          </button>
        ) : null}
      </div>

      <div className="shared-invite-panel">
        <div className="shared-invite-heading">
          <p className="eyebrow">本地邀请链接实验</p>
          <h3>小镇传送门</h3>
          <div className="shared-invite-badges" aria-label="传送门安全边界">
            <span>只解析，不联网</span>
            <span>不会自动加入真实房间</span>
            <span>刷新后丢失</span>
            <span>不要在链接中放入密钥</span>
          </div>
        </div>

        <div className="shared-invite-actions">
          <button
            type="button"
            className="status-action"
            disabled={!inviteCode}
            onClick={handleGenerateInviteLink}
          >
            生成本地邀请链接
          </button>
          {generatedInviteLink ? (
            <p className="shared-invite-output">{generatedInviteLink}</p>
          ) : null}
        </div>

        <label className="status-field" htmlFor="shared-invite-link-input">
          传送门链接
          <input
            id="shared-invite-link-input"
            className="status-note-input"
            value={inviteLinkInput}
            onChange={(event) => setInviteLinkInput(event.target.value)}
            autoComplete="off"
          />
        </label>
        <button
          type="button"
          className="primary-action"
          onClick={handleParseInviteLink}
        >
          解析传送门链接
        </button>

        {parsedInviteCode ? (
          <div className="shared-invite-result" role="status">
            <p>解析到邀请码：{parsedInviteCode}</p>
            <p>本地解析完成，尚未自动加入。</p>
          </div>
        ) : null}
        {inviteLinkError ? (
          <p className="shared-demo-error" role="status">
            {inviteLinkError}
          </p>
        ) : null}
      </div>

      {displayState ? (
        <div className="shared-demo-room">
          <div className="shared-demo-room-meta">
            <p>房间：{displayState.roomName}</p>
            <p>服务器时间：{formatServerTime(displayState.serverTime)}</p>
          </div>

          <div className="shared-demo-join">
            <label className="status-field" htmlFor="shared-demo-member-name">
              演示成员名称
              <input
                id="shared-demo-member-name"
                className="status-note-input"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={24}
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="primary-action"
              onClick={handleJoinDemoMember}
            >
              加入演示成员
            </button>
          </div>

          {errorMessage ? (
            <p className="shared-demo-error" role="status">
              {errorMessage}
            </p>
          ) : null}

          <div className="shared-demo-members">
            {members.map((member) => {
              const status = statuses[member.memberId]
              const statusLabel = getStatusLabel(status?.statusKey)
              const isLeft = Boolean(member.leftAt)

              return (
                <article
                  className="shared-demo-member"
                  key={member.memberId}
                  aria-label={`共享成员 ${member.displayName}`}
                >
                  <div>
                    <p className="status-place">
                      {isLeft ? '已离开' : '本地演示成员'}
                    </p>
                    <h3>{member.displayName}</h3>
                    <p className="current-status">
                      当前：{statusLabel ?? '未设置'}
                    </p>
                    <p className="status-expiry">
                      状态：{status ? getValidityLabel(status.isExpired) : '未设置'}
                    </p>
                  </div>

                  <div className="status-actions">
                    {demoStatuses.map((demoStatus) => (
                      <button
                        type="button"
                        className="status-action"
                        key={demoStatus.statusKey}
                        disabled={isLeft}
                        aria-label={`设置${member.displayName}为${demoStatus.label}`}
                        onClick={() =>
                          setDemoMemberStatus(
                            member.memberId,
                            demoStatus.statusKey,
                          )
                        }
                      >
                        {demoStatus.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="delete-action"
                      disabled={isLeft}
                      aria-label={`离开${member.displayName}`}
                      onClick={() => leaveDemoMember(member.memberId)}
                    >
                      离开
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="shared-demo-empty">
          创建后会生成一个只存在于当前页面内存里的 mock room。
        </p>
      )}
    </section>
  )
}

function getStatusLabel(statusKey: SelectableStatusKey | undefined) {
  return demoStatuses.find((status) => status.statusKey === statusKey)?.label
}

function getInviteLinkErrorMessage(reason: InviteLinkErrorReason) {
  if (reason === 'forbidden_secret') {
    return '链接包含敏感密钥，已拒绝'
  }

  if (reason === 'missing_invite_code' || reason === 'empty') {
    return '缺少邀请码'
  }

  if (reason === 'invalid_invite_code') {
    return '邀请码格式无效'
  }

  return '链接格式无效'
}

function formatServerTime(serverTime: string) {
  return serverTime.slice(0, 16).replace('T', ' ')
}

function getValidityLabel(isExpired: boolean) {
  return isExpired ? '已过期' : '有效'
}
