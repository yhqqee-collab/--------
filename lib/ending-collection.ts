/**
 * 엔딩 도감: 플레이어가 본 엔딩을 브라우저(localStorage)에 기록합니다.
 * 진행 저장과 따로 보관해서, "처음부터 다시하기"를 해도 도감은 남습니다.
 */
import {
  CATASTROPHE_ENDING,
  ENDING_CHOICES,
  ENDINGS,
  HAREM_ENDING,
  type EndingRoute,
  type EndingScene,
  type FinalChoice,
} from '@/components/kakao/endings'

const STORAGE_KEY = 'fishbowl_endings_v1'
const CHANGE_EVENT = 'fishbowl:endings-changed'

export type EndingId = `${EndingRoute}-${'happy' | 'obsessive' | 'breakup'}` | 'harem' | 'catastrophe'

export type EndingEntry = {
  id: EndingId
  /** 도감 묶음 제목 (캐릭터 이름 또는 '특별 엔딩') */
  group: string
  scene: EndingScene
  /** 아직 못 본 엔딩에 보여줄 힌트 */
  hint: string
}

const TYPE_HINT = {
  happy: '의심을 거의 사지 않고 마지막에 고른다면',
  obsessive: '조금 들켰지만 그래도 마지막에 고른다면',
  breakup: '너무 많이 들킨 채로 마지막에 고른다면',
} as const

/** 도감에 표시되는 순서 그대로의 엔딩 목록 */
export const ENDING_CATALOG: EndingEntry[] = [
  ...ENDING_CHOICES.flatMap(({ id, name }) =>
    (['happy', 'obsessive', 'breakup'] as const).flatMap((type) => {
      const scene = ENDINGS[id][type]
      return scene ? [{ id: `${id}-${type}` as EndingId, group: name, scene, hint: TYPE_HINT[type] }] : []
    }),
  ),
  { id: 'harem', group: '특별 엔딩', scene: HAREM_ENDING, hint: '세 사람 모두를 완벽하게 속였다면…' },
  { id: 'catastrophe', group: '특별 엔딩', scene: CATASTROPHE_ENDING, hint: '모두에게 들켜 버렸다면…' },
]

export function endingIdOf(choice: FinalChoice, scene: EndingScene): EndingId {
  if (scene.type === 'harem') return 'harem'
  if (scene.type === 'catastrophe') return 'catastrophe'
  return `${choice as EndingRoute}-${scene.type}`
}

/** 본 엔딩 → 처음 본 시각(ms) */
export type CollectedEndings = Partial<Record<EndingId, number>>

export function readCollectedEndings(): CollectedEndings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : {}
    return data && typeof data === 'object' ? (data as CollectedEndings) : {}
  } catch {
    return {}
  }
}

export function markEndingSeen(id: EndingId) {
  const collected = readCollectedEndings()
  if (collected[id]) return
  collected[id] = Date.now()
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collected))
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function onEndingsChanged(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}
