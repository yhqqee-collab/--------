/**
 * 게임 시간 관리자.
 *
 * 게임의 모든 연출(카톡 도착, 타이핑, 팝업 …)은 setTimeout 과 Date.now 로 돌아갑니다.
 * 새로고침 후 "하던 대사 위치" 그대로 복원하려면 그날 있었던 일을 똑같이 다시 재생해야 하므로,
 * 타이머·현재 시각·난수를 이 모듈이 대신 관리합니다.
 *
 * - live   : 평소 플레이. 실제 시간대로 흘러갑니다.
 * - replay : 저장된 기록을 빨리 감기로 재생. 시간이 가상으로만 흐르고, 타이머는 순서대로 즉시 실행됩니다.
 *
 * phone-simulator.tsx 의 첫 import 로 불러옵니다 (게임 모듈보다 먼저).
 * 브라우저 전용 모듈이라 서버 렌더링(SSR)되는 파일에서는 import 하지 마세요.
 */

type Timer = {
  id: number
  due: number
  seq: number
  fn: (...args: unknown[]) => void
  args: unknown[]
  interval?: number
  nativeId?: number
  segment: number
}

const native = {
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
  setInterval: window.setInterval.bind(window),
  clearInterval: window.clearInterval.bind(window),
  now: Date.now.bind(Date),
  random: Math.random.bind(Math),
  Date: window.Date,
}

declare const __TEST_SPEED__: number
/** 테스트 빌드에서만 1보다 큼 (시간 빨리 흐르게) */
const SPEED = typeof __TEST_SPEED__ === 'number' ? __TEST_SPEED__ : 1
const BASE = native.now()
function realNow() {
  return SPEED === 1 ? native.now() : BASE + (native.now() - BASE) * SPEED
}

let mode: 'live' | 'replay' = 'live'
let offset = 0
let virtualNow = 0
let nextId = 1
let seq = 0
let segment = 0
let firedInSegment = 0
const timers = new Map<number, Timer>()

/* ---------- 난수: 시드 고정 (재생 때 같은 값이 나오도록) ---------- */
let rngState = 0x9e3779b9
function random() {
  rngState = (rngState + 0x6d2b79f5) | 0
  let t = rngState
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** 타이머 콜백이 실행되는 동안에는 "예정 시각"을 현재 시각으로 보여줍니다.
 *  (실제 타이머의 몇 ms 지연이 누적되지 않아, 재생할 때와 시간이 똑같이 흐릅니다) */
let pinned: number | undefined

export function now() {
  if (pinned !== undefined) return pinned
  return mode === 'replay' ? virtualNow : realNow() + offset
}

export function runAt<T>(at: number, fn: () => T): T {
  const previous = pinned
  pinned = at
  try {
    return fn()
  } finally {
    pinned = previous
  }
}

function toDelay(ms: unknown) {
  const n = Number(ms)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

function armNative(timer: Timer) {
  timer.nativeId = native.setTimeout(() => fire(timer), Math.max(0, timer.due - now()) / SPEED)
}

function fire(timer: Timer) {
  if (!timers.has(timer.id)) return
  if (timer.segment === segment) firedInSegment += 1
  if (timer.interval !== undefined) {
    timer.due += Math.max(1, timer.interval)
    timer.seq = seq++
    if (mode === 'live') armNative(timer)
  } else {
    timers.delete(timer.id)
  }
  const due = timer.interval !== undefined ? timer.due - Math.max(1, timer.interval) : timer.due
  runAt(due, () => timer.fn(...timer.args))
}

function add(fn: unknown, ms: unknown, args: unknown[], repeat: boolean) {
  const delay = toDelay(ms)
  const timer: Timer = {
    id: nextId++,
    due: now() + delay,
    seq: seq++,
    fn: typeof fn === 'function' ? (fn as Timer['fn']) : () => {},
    args,
    interval: repeat ? delay : undefined,
    segment,
  }
  timers.set(timer.id, timer)
  if (mode === 'live') armNative(timer)
  return timer.id
}

function remove(id: unknown) {
  const timer = timers.get(Number(id))
  if (!timer) return
  timers.delete(timer.id)
  if (timer.nativeId !== undefined) native.clearTimeout(timer.nativeId)
}

/* ---------- 전역 교체 ---------- */
const w = window as unknown as Record<string, unknown>
w.setTimeout = (fn: unknown, ms?: unknown, ...args: unknown[]) => add(fn, ms, args, false)
w.setInterval = (fn: unknown, ms?: unknown, ...args: unknown[]) => add(fn, ms, args, true)
w.clearTimeout = remove
w.clearInterval = remove
Math.random = random

const NativeDate = native.Date
class VirtualDate extends NativeDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) super(now())
    else super(...(args as [string]))
  }
  static now() {
    return now()
  }
}
w.Date = VirtualDate

/* ---------- 세션(구간) 관리 ---------- */

/** 새 기록 구간을 시작합니다. 난수 시드를 고정해 재생 때 똑같이 흘러가게 합니다. */
export function beginSegment(seed: number) {
  segment += 1
  firedInSegment = 0
  rngState = seed | 0
}

export function newSeed() {
  return Math.floor(native.random() * 0x7fffffff)
}

export function firedCount() {
  return firedInSegment
}

export function isReplaying() {
  return mode === 'replay'
}

/** 빨리 감기 재생 시작: 시간을 기록 당시의 시작 시각으로 되돌립니다. */
export function startReplay(startAt: number, seed: number) {
  for (const timer of timers.values()) if (timer.nativeId !== undefined) native.clearTimeout(timer.nativeId)
  timers.clear()
  mode = 'replay'
  virtualNow = startAt
  beginSegment(seed)
}

function nextTimer() {
  let best: Timer | undefined
  for (const timer of timers.values()) {
    if (!best || timer.due < best.due || (timer.due === best.due && timer.seq < best.seq)) best = timer
  }
  return best
}

export function peekDue() {
  return nextTimer()?.due
}

export function fireNext() {
  const timer = nextTimer()
  if (!timer) return false
  const due = timer.due
  fire(timer)
  if (due > virtualNow) virtualNow = due
  return true
}

export function setVirtualNow(at: number) {
  if (at > virtualNow) virtualNow = at
}

/** 재생 끝: 남은 타이머를 실제 타이머로 옮기고, 이어서 실시간으로 흐르게 합니다. */
export function endReplay() {
  if (mode !== 'replay') return
  offset = virtualNow - realNow()
  mode = 'live'
  for (const timer of timers.values()) armNative(timer)
}

/** 재생 중 실패 시: 남은 가상 타이머를 모두 버리고 실시간으로 돌아갑니다. */
export function abortReplay() {
  timers.clear()
  if (mode === 'replay') offset = virtualNow - realNow()
  mode = 'live'
}

export const nativeTimers = native
