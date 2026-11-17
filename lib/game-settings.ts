/**
 * 설정 앱에서 바꾸는 플레이 속도. 기기(브라우저)에 기억해 두고 다음 접속 때도 그대로 씁니다.
 */
import { getSpeed, setSpeed } from './session-clock'

const SPEED_KEY = 'fishbowl_speed_v1'

export const SPEED_OPTIONS = [1, 1.5, 2, 3] as const

export function loadSavedSpeed() {
  try {
    const value = Number(window.localStorage.getItem(SPEED_KEY))
    if ((SPEED_OPTIONS as readonly number[]).includes(value)) setSpeed(value)
  } catch {}
  return getSpeed()
}

export function changeSpeed(value: number) {
  setSpeed(value)
  try {
    window.localStorage.setItem(SPEED_KEY, String(value))
  } catch {}
}

export { getSpeed }
