/**
 * 플레이 통계: 몇 명이 시작했고, 며칠차까지 갔고, 어떤 엔딩을 봤는지를
 * 익명으로 /api/track 에 보냅니다. (worker/index.js 가 받아서 저장)
 *
 * - 플레이어는 브라우저에 저장된 무작위 번호로만 구분합니다. 이름·입력한 글은 보내지 않습니다.
 * - 새로고침 후 기록 재생(빨리 감기) 중에는 보내지 않습니다.
 * - 통계 화면: 사이트주소/stats
 */
import { isReplaying } from './session-clock'
import { getLang } from './i18n'

const PLAYER_KEY = 'fishbowl_player_id_v1'

export type PlayEvent = 'unlock' | 'start' | 'day' | 'ending'

function playerId() {
  try {
    let id = window.localStorage.getItem(PLAYER_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
      window.localStorage.setItem(PLAYER_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

export function trackPlay(event: PlayEvent, value: string | number = '', label = '') {
  try {
    if (typeof window === 'undefined' || isReplaying()) return
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return
    const p = playerId()
    if (!p) return
    const body = JSON.stringify({ p, e: event, v: String(value), l: label, lang: getLang() })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(
        () => {},
      )
    }
  } catch {}
}
