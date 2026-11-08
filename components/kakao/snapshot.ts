import type { ChatItem } from './chat-data'

/** 일차 시작 시점의 게임 상태. "n일차부터 다시하기"에서 이 시점으로 되돌립니다. */
export type DaySnapshot = {
  day: number
  suspicion: Record<string, number>
  flags: string[]
  turns: Record<string, number>
  previews: Record<string, string>
  /** 채팅방별로 기본 대화(CHATS) 이후에 추가된 메시지 */
  added: Record<string, ChatItem[]>
}

export function cloneSnapshot(snapshot: DaySnapshot): DaySnapshot {
  return structuredClone(snapshot)
}
