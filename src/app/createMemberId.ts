export function createMemberId(): string {
  if (globalThis.crypto?.randomUUID) {
    return `member_${globalThis.crypto.randomUUID()}`
  }

  return `member_${Math.random().toString(36).slice(2)}`
}
