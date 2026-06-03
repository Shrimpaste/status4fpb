import { useState, type FormEvent } from 'react'

type AddMemberFormProps = {
  onAddMember: (displayName: string) => void
}

export function AddMemberForm({ onAddMember }: AddMemberFormProps) {
  const [displayName, setDisplayName] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDisplayName = displayName.trim()
    if (trimmedDisplayName.length === 0) {
      setDisplayName('')
      return
    }

    onAddMember(trimmedDisplayName)
    setDisplayName('')
  }

  return (
    <form className="add-member-form" onSubmit={handleSubmit}>
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
  )
}
