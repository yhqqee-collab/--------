import { scriptsForDay } from './scripts'

export type SuspicionStage = 'calm' | 'uneasy' | 'cold'

/** 해당 일차 대화방의 총 페이즈(선택지가 있는 노드) 수 */
export function turnLimit(chatId: string, day: number) {
  const script = scriptsForDay(day)[chatId]
  if (!script) return 0
  return Object.values(script.nodes).filter((node) => node.choices.length > 0).length
}

/** 의심도 게이지를 사용할 채팅방과 시작 값. 여기에 없는 채팅방은 게이지가 표시되지 않습니다. */
export const INITIAL_SUSPICION: Record<string, number> = {
  a: 0,
  b: 0,
  c: 0,
}

export const STAGE_LABEL: Record<SuspicionStage, string> = {
  calm: '[안정 단계]',
  uneasy: '[불안 단계]',
  cold: '[위험 단계]',
}

export function getStage(value: number): SuspicionStage {
  if (value >= 60) return 'cold'
  if (value >= 30) return 'uneasy'
  return 'calm'
}

export function delayPenalty(seconds: number) {
  if (seconds >= 60) return { label: '60초 지연', delta: 9 }
  if (seconds >= 30) return { label: '30초 지연', delta: 6 }
  return { label: '', delta: 0 }
}
