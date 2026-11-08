import { replaceUserName } from '@/lib/korean-name'
import type { SuspicionStage } from './suspicion'


/** 의심도 100% 도달 시 각 채팅방에 쏟아지는 메시지 (배드엔딩 직전) */
export const BUSTED_MESSAGES: Record<string, string[]> = {
  a: ['{이름아}', '[인물 A 배드엔딩 메시지]'],
  b: ['{이름아}', '[인물 B 배드엔딩 메시지]'],
  c: ['{이름아}', '[인물 C 배드엔딩 메시지]'],
}

/** 모든 인물의 대화를 끝까지 마쳤을 때 쏟아지는 메시지 (트루엔딩 직전) */
export const TRUE_END_MESSAGES: Record<string, string[]> = {
  a: ['{이름아}', '[인물 A 트루엔딩 메시지]'],
  b: ['{이름아}', '[인물 B 트루엔딩 메시지]'],
  c: ['{이름아}', '[인물 C 트루엔딩 메시지]'],
}

const NUDGES: Record<string, Record<SuspicionStage, [string[], string[]]>> = {}

export function composeNudge(chatId: string, stage: SuspicionStage, level: 1 | 2) {
  return NUDGES[chatId]?.[stage]?.[level - 1] ?? null
}

const normalizeLine = (line: string) => line.replace(/[\s.,!?~…ㅋㅎㅠㅜ]/g, '')

export function dropRepeats(lines: string[], previous: string[]) {
  const seen = new Set(previous.map(normalizeLine))
  return lines.filter((line) => {
    const key = normalizeLine(line)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function personalizeText(text: string, owner: string) {
  return replaceUserName(text, owner)
}
