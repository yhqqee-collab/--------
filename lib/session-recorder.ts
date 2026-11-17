/**
 * 자동 저장(기록) + 새로고침 후 복원(재생).
 *
 * 하루가 시작될 때의 상태(DaySnapshot: 날짜·호감도·플래그·대화 내역)를 저장하고,
 * 그 뒤로 플레이어가 한 모든 입력(선택지·앱 열기·채팅방 이동·이름 입력 …)을
 * "언제(가상 시각) 했는지"와 함께 입력이 생길 때마다 바로 localStorage 에 씁니다.
 *
 * 새로고침하면 그날 시작 상태에서 기록을 빨리 감기로 다시 재생해,
 * 대사 위치·호감도·플래그·열려 있던 화면까지 새로고침 직전 상태로 되돌립니다.
 */
import type { DaySnapshot } from '@/components/kakao/snapshot'
import * as clock from './session-clock'
import { tr } from './i18n'

/** 스크립트 내용이 바뀌면 이 값을 올려 주세요. 예전 기록은 "그날 처음부터"로 복원됩니다. */
export const SAVE_VERSION = 3

const META_KEY = 'fishbowl_session_meta_v2'
const LOG_KEY = 'fishbowl_session_log_v2'
const CLOCK_KEY = 'fishbowl_session_clock_v2'

export type SegmentMeta = {
  version: number
  /** 이 구간이 시작될 때의 하루 시작 상태 (null 이면 1일차 새 게임) */
  resume: DaySnapshot | null
  /** 구간 시작 시점의 이름 (null 이면 이름 입력 화면부터) */
  userName: string | null
  seed: number
  startAt: number
}

type RecordedEvent = {
  /** 구간 시작 후 경과 ms (가상 시각) */
  t: number
  /** 그때까지 실행된 타이머 수 (순서 맞추기용) */
  f: number
  /** c=click, i=input, k=keydown, s=submit */
  k: 'c' | 'i' | 'k' | 's'
  /** 세션 루트 기준 DOM 경로 */
  p: string
  /** 대상 태그 (검증용) */
  g: string
  /** 클릭한 버튼의 글자 (검증용: 재생 때 같은 버튼이 나타날 때까지 기다립니다) */
  x?: string
  v?: string
  key?: string
}

type ClockState = { t: number; f: number }

export type SavedSession = { meta: SegmentMeta; events: RecordedEvent[]; clock: ClockState }

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function loadSession(): SavedSession | null {
  const meta = read<SegmentMeta>(META_KEY)
  if (!meta || meta.version !== SAVE_VERSION || typeof meta.startAt !== 'number') return null
  const events = read<RecordedEvent[]>(LOG_KEY) ?? []
  const saved = read<ClockState>(CLOCK_KEY) ?? { t: 0, f: 0 }
  return { meta, events: Array.isArray(events) ? events : [], clock: saved }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(META_KEY)
    window.localStorage.removeItem(LOG_KEY)
    window.localStorage.removeItem(CLOCK_KEY)
  } catch {}
}

/* ---------------- 기록 ---------------- */

let current: { meta: SegmentMeta; events: RecordedEvent[] } | null = null
let root: HTMLElement | null = null

function pathOf(target: Element): string | null {
  if (!root || !root.contains(target)) return null
  const parts: number[] = []
  let node: Element | null = target
  while (node && node !== root) {
    const parent: Element | null = node.parentElement
    if (!parent) return null
    parts.unshift(Array.prototype.indexOf.call(parent.children, node))
    node = parent
  }
  return parts.join('.')
}

function resolvePath(path: string): Element | null {
  if (!root) return null
  let node: Element | null = root
  if (path === '') return node
  for (const part of path.split('.')) {
    node = node?.children[Number(part)] ?? null
    if (!node) return null
  }
  return node
}

function labelOf(el: Element) {
  const button = el.closest('button, a, [role=button]') ?? el
  return (button.getAttribute('aria-label') || button.textContent || '').trim().slice(0, 60)
}

/** 화면 번역(영어·중국어)이 적용되기 전·후 글자도 같은 버튼으로 봅니다 */
function sameLabel(a: string, b: string) {
  return a === b || tr(a) === b || a === tr(b) || tr(a) === tr(b)
}

function elapsed() {
  return current ? clock.now() - current.meta.startAt : 0
}

function saveClock() {
  if (!current || clock.isReplaying()) return
  write(CLOCK_KEY, { t: elapsed(), f: clock.firedCount() } satisfies ClockState)
}

function record(event: Event, kind: RecordedEvent['k']) {
  if (!current || clock.isReplaying() || !event.isTrusted) return
  const target = event.target
  if (!(target instanceof Element)) return
  // 언어 바꾸기처럼 새로고침을 일으키는 버튼은 기록하지 않습니다 (재생 때 다시 누르면 무한 새로고침)
  if (target.closest('[data-no-record]')) return
  const path = pathOf(target)
  if (path === null) return
  const entry: RecordedEvent = { t: elapsed(), f: clock.firedCount(), k: kind, p: path, g: target.tagName }
  if (kind === 'c') entry.x = labelOf(target)
  if (kind === 'i') entry.v = (target as HTMLInputElement).value
  if (kind === 'k') entry.key = (event as KeyboardEvent).key
  current.events.push(entry)
  write(LOG_KEY, current.events)
  saveClock()
}

const listeners: [string, (e: Event) => void][] = [
  ['click', (e) => record(e, 'c')],
  ['input', (e) => record(e, 'i')],
  [
    'keydown',
    (e) => {
      const key = (e as KeyboardEvent).key
      // 글자 입력은 input 이벤트로 기록되므로 Enter·Escape 같은 특수 키만
      if (key && key.length > 1 && !(e as KeyboardEvent).isComposing) record(e, 'k')
    },
  ],
  ['submit', (e) => record(e, 's')],
]

let installed = false
function install() {
  if (installed) return
  installed = true
  for (const [type, fn] of listeners) document.addEventListener(type, fn, true)
  // 재생 중에는 클릭으로 생긴 진짜 submit 을 막고, 기록된 submit 만 따로 재생합니다.
  document.addEventListener(
    'submit',
    (e) => {
      if (clock.isReplaying() && !dispatchingSubmit) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    },
    true,
  )
  clock.nativeTimers.setInterval(saveClock, 1000)
  document.addEventListener('visibilitychange', saveClock)
  window.addEventListener('pagehide', saveClock)
}

export function setSessionRoot(element: HTMLElement | null) {
  root = element
}

/** 새 구간(하루 시작·다시하기·새 게임)을 시작하고 즉시 저장합니다. */
export function startSegment(resume: DaySnapshot | null, userName: string | null) {
  install()
  const seed = clock.newSeed()
  clock.beginSegment(seed)
  const meta: SegmentMeta = { version: SAVE_VERSION, resume, userName, seed, startAt: clock.now() }
  current = { meta, events: [] }
  write(META_KEY, meta)
  write(LOG_KEY, [])
  write(CLOCK_KEY, { t: 0, f: 0 })
}

/* ---------------- 재생 ---------------- */

let dispatchingSubmit = false

const channel = new MessageChannel()
const waiting: (() => void)[] = []
channel.port1.onmessage = () => waiting.shift()?.()
function yieldTask() {
  return new Promise<void>((resolve) => {
    waiting.push(resolve)
    channel.port2.postMessage(0)
  })
}
async function settle() {
  // React 가 렌더·effect 를 마칠 시간을 줍니다
  for (let i = 0; i < 3; i += 1) await yieldTask()
}
function nextFrame() {
  return new Promise<void>((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }
    requestAnimationFrame(() => finish())
    clock.nativeTimers.setTimeout(finish, 50)
  })
}

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
const textareaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set

function matches(event: RecordedEvent) {
  const el = resolvePath(event.p)
  if (!el || el.tagName !== event.g) return false
  if (event.x !== undefined && !sameLabel(labelOf(el), event.x)) return false
  if (el.closest('fieldset:disabled, button:disabled')) return false
  return true
}

function dispatch(event: RecordedEvent) {
  const el = resolvePath(event.p)
  if (!el || el.tagName !== event.g) return false
  if (event.k === 'c') {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  } else if (event.k === 'i') {
    const setter = el instanceof HTMLTextAreaElement ? textareaValueSetter : inputValueSetter
    setter?.call(el, event.v ?? '')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  } else if (event.k === 'k') {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: event.key, bubbles: true, cancelable: true }))
  } else if (event.k === 's') {
    dispatchingSubmit = true
    try {
      el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    } finally {
      dispatchingSubmit = false
    }
  }
  return true
}

/**
 * 기록 당시와 똑같이, 입력 직전까지 실행됐던 타이머 수(fired)만큼 타이머를 실행합니다.
 * final=true 면 남은 시간(target)까지 예정된 타이머도 모두 실행합니다.
 */
async function advanceTo(target: number, fired: number, final = false) {
  let steps = 0
  for (;;) {
    const due = clock.peekDue()
    if (due === undefined) break
    const needed = clock.firedCount() < fired && due <= target + 60_000
    if (!needed && !(final && due <= target)) break
    clock.fireNext()
    await settle()
    steps += 1
    if (steps % 40 === 0) await nextFrame()
  }
  if (final) clock.setVirtualNow(target)
}

/**
 * 저장된 구간을 빨리 감기로 재생합니다. 세션 화면이 처음 그려진 직후 호출하세요.
 * onProgress 로 0~1 진행률을 알려줍니다.
 */
export async function replaySession(saved: SavedSession, onProgress?: (ratio: number) => void) {
  const { meta, events, clock: end } = saved
  current = { meta, events: [...events] }
  const total = events.length + 1
  let skipped = 0
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    const at = meta.startAt + event.t
    await advanceTo(at, event.f)
    // 기록 당시 눌렀던 버튼(선택지 등)이 아직 안 나타났으면, 나타날 때까지 시간을 조금 더 흘려 봅니다
    for (let guard = 0; guard < 400 && !matches(event); guard += 1) {
      const due = clock.peekDue()
      if (due === undefined || due > at + 30_000) break
      clock.fireNext()
      await settle()
    }
    clock.setVirtualNow(at)
    if (!clock.runAt(at, () => dispatch(event))) {
      skipped += 1
      console.warn('[save] 재생 중 대상을 찾지 못한 입력', i, event)
    }
    await settle()
    await nextFrame()
    onProgress?.((i + 1) / total)
  }
  await advanceTo(meta.startAt + Math.max(end.t, events.at(-1)?.t ?? 0), end.f, true)
  await settle()
  onProgress?.(1)
  return { skipped }
}

/** 재생을 시작하기 전에 호출 (컴포넌트가 마운트되며 만드는 타이머부터 가상 시간으로) */
export function prepareReplay(saved: SavedSession) {
  install()
  current = { meta: saved.meta, events: [...saved.events] }
  clock.startReplay(saved.meta.startAt, saved.meta.seed)
}

export function finishReplay() {
  clock.endReplay()
  saveClock()
}

export function failReplay() {
  clock.abortReplay()
}
