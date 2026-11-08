import { CHARACTERS, GROUP_MEMBERS } from '@/lib/template-config'
import type { SuspicionStage } from './suspicion'

/* ═══════════════════════════════════════════════════════════════
 * 휴대폰 시뮬레이터 스크립트 템플릿
 *  - 대사만 채우면 바로 동작합니다. 엔진 로직(fromPhases, resolveNode 등)은 수정하지 마세요.
 *  - 캐릭터 이름·프로필은 lib/template-config.ts 에서 관리합니다.
 * ═══════════════════════════════════════════════════════════════ */

/** 모든 멤버의 '일정 시작 전' 대화가 끝나면 4초간 표시되는 전환 문구 (일차별) */
const WORK_TRANSITION_TEXTS: Record<number, string> = {
  1: '⏳ [1일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  2: '⏳ [2일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  3: '⏳ [3일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  4: '⏳ [4일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  5: '⏳ [5일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  6: '⏳ [6일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
  7: '⏳ [7일 차 메인 일정 진행 중...] (00:00 ~ 00:00) ⏳',
}

/** '일정 시작 전' 대화 없이 일차 시작과 동시에 전환 화면이 뜨는 날 (예: new Set([7])) */
export const WORK_FIRST_DAYS = new Set<number>()
/** 이 날의 카톡이 모두 끝나면 암전 후 최종 선택 + 엔딩으로 넘어갑니다. */
export const FINAL_DAY = 7

export function workTransitionText(day: number) {
  return WORK_TRANSITION_TEXTS[day] ?? WORK_TRANSITION_TEXTS[1]
}

const DIVIDER_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

/** 각 멤버의 그날 첫 카톡 위에 붙는 날짜 구분선 */
export function dayDivider(day: number) {
  const date = new Date(2026, 9, 25 + day)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DIVIDER_WEEKDAYS[date.getDay()]}`
}

export type Choice = {
  says: string[]
  delta: number
  reply?: string[]
  cold?: string[]
  next: string | null
  /** 지정하면 답장 후 이 시간(ms) 뒤에 다음 노드의 메시지가 새 카톡으로 도착 */
  nextDelayMs?: number
  /** 상대 반응(reply)이 도착하기까지 대기 시간(ms) */
  replyDelayMs?: number
  /** true 면 '출근 전' 대화의 마지막 선택지: 모든 멤버가 끝나고 근무 전환이 지난 뒤 다음 노드가 도착 */
  gate?: boolean
  /** 고르면 켜지는 전역 플래그 (다른 남자의 대화 분기에 영향) */
  setFlag?: string
  /** true 면 반응이 도착한 뒤 게임 오버 */
  gameOver?: boolean
  /** true 면 그날 다른 멤버들의 대화가 모두 끝난 뒤에 다음 노드가 도착 */
  waitOthers?: boolean
  /** 같은 sync 키를 가진 멤버들이 모두 답할 때까지 기다린 뒤 다음 노드(분기)를 결정 */
  sync?: string
  /** sync 대기 중 톡방에 표시되는 문구 */
  waitText?: string
  /** 게임 오버 팝업에 표시될 문구 */
  gameOverAlert?: string
}

/** 플래그 조합에 따른 분기. all 은 모두 켜져 있어야, none 은 모두 꺼져 있어야 일치 */
export type Branch = { all?: string[]; none?: string[]; to: string | null }

/** 그날 만난 멤버를 고르면 켜지는 플래그. 대사 속 MET_TOKEN 이 해당 이름으로 바뀜 */
export const FLAG_MET_RIKU = 'met-riku'
export const FLAG_MET_YUSHI = 'met-yushi'
export const MET_TOKEN = '{만난사람}'

export function fillMetName(text: string, flags: ReadonlySet<string>) {
  if (!text.includes(MET_TOKEN)) return text
  const name = flags.has(FLAG_MET_YUSHI) ? CHARACTERS.c.name : CHARACTERS.b.name
  return text.replaceAll(MET_TOKEN, name)
}

/** 이 노드에 들어갈 때 flag 가 켜져 있으면 to 노드로 바뀜 (null 이면 대화 종료) */
export type Redirect = { flag: string; to: string | null }

export type ScriptNode = { lines: string[]; choices: Choice[]; redirect?: Redirect; branch?: Branch[] }

/** 모든 선택지가 게임 오버로 이어지는 노드 (이별 통보 직전) */
export function isDoomNode(node: ScriptNode | undefined) {
  return Boolean(node?.choices.length) && node!.choices.every((choice) => choice.gameOver)
}

export type Script = {
  start: string
  nodes: Record<string, ScriptNode>
  /** 지정하면 게임 시작 후 이 시간(ms) 뒤에 시작 노드 메시지가 도착 */
  delayedStartMs?: number
  /** 근무 전환이 끝난 뒤 다음 노드가 도착하기까지 대기 시간(ms) */
  workEndDelayMs?: number
}

type PhaseChoice = {
  id: string
  text: string
  susp: number
  alert?: string
  reply?: string
  next: string
  setFlag?: string
  gameOver?: boolean
  setGlobal?: Record<string, boolean>
}
/**
 * preWork: true 인 페이즈가 '출근 전' 페이즈. 멤버마다 개수가 달라도 마지막 출근 전 답장 후 동기화됩니다.
 * delay: 이전 답장 후 이 페이즈가 오기까지 (초). 없으면 phaseDelay 사용
 */
type PhaseNode = {
  message: string
  choices: PhaseChoice[]
  preWork?: boolean
  delay?: number
  redirect?: Redirect
  waitOthers?: boolean
  /** 이 페이즈의 답장 후 다른 톡방의 답을 기다리는 동안 표시되는 문구 */
  transitionText?: string
  /** 지정하면 이 페이즈의 답장들이 같은 키를 가진 멤버들과 동기화됨 */
  nextCheckGlobal?: string
  branch?: Branch[]
  isGameOver?: boolean
  alert?: string
}

/** setGlobal 의 키 → 실제 플래그 */
const GLOBAL_FLAGS: Record<string, string> = { meetRiku: 'met-riku', meetYushi: 'met-yushi' }

function globalFlag(setGlobal: Record<string, boolean> | undefined) {
  if (!setGlobal) return undefined
  const on = Object.entries(setGlobal).find(([, value]) => value)
  return on ? GLOBAL_FLAGS[on[0]] : undefined
}

type PhaseTiming = {
  /** 게임 시작 후 첫 카톡까지 (초) */
  initialDelay: number
  /** 답장 후 다음 페이즈 카톡까지 (초) */
  phaseDelay: number
  /** 답장 후 상대 반응까지 (ms) */
  replyDelayMs: number
  /** 근무 종료 후 근무 후 첫 페이즈까지 (초) */
  workEndDelay: number
}

const splitLines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean)

/** 답장 안에서 플레이어(여주)가 보내는 말풍선 표시 */
export const ME_LINE_PREFIX = '\u0001me:'
const PLAYER_SPEAKER = '여주'

/** '리쿠: ...' / '여주: ...' 화자 표기를 해석하고, ' / ' 는 말풍선을 나눕니다. */
function splitReplyLines(text: string) {
  return splitLines(text).flatMap((line) => {
    const match = line.match(/^([가-힣]{1,4}):\s*(.*)$/)
    const fromMe = match?.[1] === PLAYER_SPEAKER
    const body = match ? match[2] : line
    return body
      .split(' / ')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => (fromMe ? ME_LINE_PREFIX + part : part))
  })
}

/** 모든 메시지 대기 시간(초)에 곱하는 배율. 순서는 그대로 유지하면서 전체 속도만 조절합니다. */
const TIME_SCALE = 0.5

function fromPhases(start: string, phases: Record<string, PhaseNode>, rawTiming: PhaseTiming): Script {
  const timing: PhaseTiming = {
    ...rawTiming,
    initialDelay: rawTiming.initialDelay * TIME_SCALE,
    phaseDelay: rawTiming.phaseDelay * TIME_SCALE,
    workEndDelay: rawTiming.workEndDelay * TIME_SCALE,
  }
  const nodes: Record<string, ScriptNode> = {}
  for (const [id, phase] of Object.entries(phases)) {
    nodes[id] = {
      lines: splitLines(phase.message),
      redirect: phase.redirect,
      branch: phase.branch,
      choices: phase.choices.map((choice) => {
        const reply = choice.reply ?? choice.alert
        const nextPhase = phases[choice.next]
        const nextIsPreWork = Boolean(nextPhase?.preWork)
        const endsGame = Boolean(choice.gameOver || nextPhase?.isGameOver)
        return {
          says: splitLines(choice.text),
          delta: choice.susp,
          reply: reply ? splitReplyLines(reply) : undefined,
          replyDelayMs: timing.replyDelayMs,
          next: nextPhase?.isGameOver ? 'end' : choice.next,
          nextDelayMs: (nextPhase?.delay !== undefined ? nextPhase.delay * TIME_SCALE : timing.phaseDelay) * 1000,
          gate: phase.preWork && !nextIsPreWork,
          setFlag: choice.setFlag ?? globalFlag(choice.setGlobal),
          gameOver: endsGame,
          gameOverAlert: nextPhase?.alert,
          waitOthers: nextPhase?.waitOthers,
          sync: phase.nextCheckGlobal,
          waitText: phase.transitionText,
        }
      }),
    }
  }
  return { start, nodes, delayedStartMs: timing.initialDelay * 1000, workEndDelayMs: timing.workEndDelay * 1000 }
}

/*
 * 선택지 트리 작성 방법
 *  - speakerText: 이 노드로 들어올 때 상대가 보내는 메시지들 (시작 노드는 비워도 됨: 기존 대화가 대신함)
 *  - options.text: 주인공이 고를 수 있는 답변
 *  - options.suspicionDelta: 이 답장을 골랐을 때 의심도 변화량 (음수 가능)
 *  - options.nextNodeId: 다음 노드 id, null 이면 대화 종료
 * 가장 긴 경로의 길이가 해당 인물의 '턴 수'가 되고, 모든 ��물의 턴을 끝내면 트루엔딩이 발동합니다.
 */
type TreeOption = { text: string; suspicionDelta: number; nextNodeId: string | null }
type TreeNode = { speakerText: string[]; options: TreeOption[] }

const A_TREE: Record<string, TreeNode> = {
  T1: {
    speakerText: [],
    options: [
      { text: '[선택지 1 - 안전한 답]', suspicionDelta: 0, nextNodeId: 'T2_Safe' },
      { text: '[선택지 2 - 의심받는 답]', suspicionDelta: 20, nextNodeId: 'T2_Risky' },
    ],
  },
  T2_Safe: {
    speakerText: ['[선택지 1에 대한 인물 A의 반응]'],
    options: [{ text: '[마무리 답장]', suspicionDelta: 0, nextNodeId: 'END' }],
  },
  T2_Risky: {
    speakerText: ['[선택지 2에 대한 인물 A의 반응]'],
    options: [{ text: '[마무리 답장]', suspicionDelta: 10, nextNodeId: 'END' }],
  },
  END: { speakerText: ['[인물 A의 마지막 인사]'], options: [] },
}

const B_TREE: Record<string, TreeNode> = {
  T1: {
    speakerText: [],
    options: [
      { text: '[선택지 1]', suspicionDelta: 0, nextNodeId: 'T2' },
      { text: '[선택지 2]', suspicionDelta: 15, nextNodeId: 'T2' },
    ],
  },
  T2: {
    speakerText: ['[인물 B의 반응]'],
    options: [{ text: '[마무리 답장]', suspicionDelta: 0, nextNodeId: 'END' }],
  },
  END: { speakerText: ['[인물 B의 마지막 인사]'], options: [] },
}

const C_TREE: Record<string, TreeNode> = {
  T1: {
    speakerText: [],
    options: [
      { text: '[선택지 1]', suspicionDelta: 0, nextNodeId: 'T2' },
      { text: '[선택지 2]', suspicionDelta: 15, nextNodeId: 'T2' },
    ],
  },
  T2: {
    speakerText: ['[인물 C의 반응]'],
    options: [{ text: '[마무리 답장]', suspicionDelta: 0, nextNodeId: 'END' }],
  },
  END: { speakerText: ['[인물 C의 마지막 인사]'], options: [] },
}

function fromTree(start: string, tree: Record<string, TreeNode>): Script {
  const nodes: Record<string, ScriptNode> = {}
  for (const [id, node] of Object.entries(tree)) {
    nodes[id] = {
      lines: node.speakerText,
      choices: node.options.map((option) => ({ says: [option.text], delta: option.suspicionDelta, next: option.nextNodeId })),
    }
  }
  return { start, nodes }
}

function longestPath(script: Script) {
  const memo = new Map<string, number>()
  const depth = (id: string | null): number => {
    const node = id ? script.nodes[id] : undefined
    if (!id || !node || node.choices.length === 0) return 0
    const cached = memo.get(id)
    if (cached !== undefined) return cached
    memo.set(id, 0)
    const value = 1 + Math.max(...node.choices.map((choice) => depth(choice.next)))
    memo.set(id, value)
    return value
  }
  return depth(script.start)
}

/* ───────────── 기본 샘플 구조 ─────────────
 * phase1 (preWork: true)  : 일정 시작 전 카톡 → 선택지 A(의심도 0) / B(의심도 +10) → phase2
 * phase2 (preWork: false) : 일정 종료 후 카톡 → 마무리 선택지 A → 'end'
 * 일차·멤버별로 대사를 바꾸려면 아래 DAY_SCRIPTS 에서 sampleNodes() 대신
 * 직접 작성한 Record<string, PhaseNode> 를 넘기세요.
 */
function sampleNodes(): Record<string, PhaseNode> {
  return {
    phase1: {
      preWork: true,
      message: '[일정 시작 전 카톡 대사를 입력하세요]',
      choices: [
        { id: 'A', text: '[선택지 A - 안전한 답변]', susp: 0, reply: '[선택지 A 반응 대사]', next: 'phase2' },
        { id: 'B', text: '[선택지 B - 의심받는 답변]', susp: 10, alert: '[선택지 B 의심 반응 대사]', next: 'phase2' },
      ],
    },
    phase2: {
      preWork: false,
      message: '[일정 종료 후 카톡 대사를 입력하세요]',
      choices: [{ id: 'A', text: '[마무리 선택지 A]', susp: 0, reply: '[마무리 반응 대사]', next: 'end' }],
    },
  }
}

/** 멤버별 기본 타이밍 (초 단위, TIME_SCALE 적용 전). 도착 순서가 겹치지 않도록 조금씩 어긋나 있습니다. */
const SAMPLE_TIMING: Record<'a' | 'b' | 'c', PhaseTiming> = {
  a: { initialDelay: 6, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 6 },
  b: { initialDelay: 20, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 16 },
  c: { initialDelay: 34, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 26 },
}

function sampleDay(): Record<string, Script> {
  return {
    a: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.a),
    b: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.b),
    c: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.c),
  }
}

export const SCRIPTS: Record<string, Script> = sampleDay()

/** 일차별 대화. 그날 스크립트가 없는 멤버는 그날 카톡이 오지 않습니다. */
export const DAY_SCRIPTS: Record<number, Record<string, Script>> = {
  1: SCRIPTS,
  2: sampleDay(),
  3: sampleDay(),
  4: sampleDay(),
  5: sampleDay(),
  6: sampleDay(),
  7: sampleDay(),
}

/* ───────────── 단톡방 이벤트 ───────────── */

export type GroupLine = { sender: string; text: string; delayMs: number }
export type GroupChoice = { id: string; text: string; reply: GroupLine[] }
export type GroupScript = {
  /** 일차 시작(또는 afterAllChats 달성) 후 첫 메시지까지 (ms) */
  startDelayMs: number
  /** true 면 그날 모든 남자와의 대화가 끝난 뒤에 단톡방 이벤트 시작 */
  afterAllChats?: boolean
  /** true 면 근무 종료 직후 시작하고, 남자들의 근무 후 카톡은 이 이벤트가 끝난 뒤에 도착 */
  afterWorkEnd?: boolean
  messages: GroupLine[]
  choices: GroupChoice[]
}

/** 이전 메시지 이후 2~9초 사이의 랜덤 간격 */
const randomGap = () => Math.floor(Math.random() * 7000) + 2000

const gl = (sender: string, text: string): GroupLine => ({ sender, text, delayMs: randomGap() })

/** 단톡방 발신자 (lib/template-config.ts 의 GROUP_MEMBERS 에서 이름 변경) */
const GROUP_SENDER = GROUP_MEMBERS.daeyoung.name

/** 일차별 단톡방 이벤트 (키는 채팅방 id — chat-data.ts 의 단톡방 id 와 일치해야 함) */
const DAY_GROUP_SCRIPTS: Record<number, Record<string, GroupScript>> = {
  1: { staff: { startDelayMs: 5000, messages: [gl(GROUP_SENDER, '[단톡방 대사를 입력하세요]')], choices: [] } },
  6: { staff: { startDelayMs: 5000, messages: [gl(GROUP_SENDER, '[단톡방 대사를 입력하세요]')], choices: [] } },
}

export function groupScriptsForDay(day: number): Record<string, GroupScript> {
  return DAY_GROUP_SCRIPTS[day] ?? {}
}

export function scriptsForDay(day: number): Record<string, Script> {
  return DAY_SCRIPTS[day] ?? {}
}

/** 출근 전 대화가 있는 멤버. 이 멤버들의 출근 전 답장이 모두 끝나야 근무 전환이 시작됩니다. */
export function preWorkIds(day: number) {
  return Object.entries(scriptsForDay(day))
    .filter(([, script]) => Object.values(script.nodes).some((node) => node.choices.some((choice) => choice.gate)))
    .map(([id]) => id)
}

/** 플래그에 따라 실제로 들어갈 노드 id (null 이면 대화 종료) */
export function resolveNode(script: Script, id: string | null, flags: ReadonlySet<string>): string | null {
  const node = id ? script.nodes[id] : undefined
  if (!id || !node) return null
  if (node.redirect && flags.has(node.redirect.flag)) return resolveNode(script, node.redirect.to, flags)
  if (node.branch) {
    const match = node.branch.find(
      (rule) => (rule.all ?? []).every((flag) => flags.has(flag)) && (rule.none ?? []).every((flag) => !flags.has(flag)),
    )
    if (match) return resolveNode(script, match.to, flags)
    // 내용이 있는 노드는 조건에 안 걸리면 그대로 진행, 빈 분기용 노드는 종료
    return node.lines.length > 0 ? id : null
  }
  return id
}

/** sync 키를 가진 선택지가 있는 멤버들 */
export function syncMembers(day: number, key: string) {
  return Object.entries(scriptsForDay(day))
    .filter(([, script]) => Object.values(script.nodes).some((node) => node.choices.some((choice) => choice.sync === key)))
    .map(([id]) => id)
}

export const SCRIPT_TURNS: Record<string, number> = Object.fromEntries(
  Object.entries(SCRIPTS).map(([id, script]) => [id, longestPath(script)]),
)

export function replyFor(choice: Choice, stage: SuspicionStage, script: Script) {
  if (stage === 'cold' && choice.cold) return choice.cold
  if (choice.reply) return choice.reply
  return (choice.next && script.nodes[choice.next]?.lines) || []
}

/* ───────────── 의심도 100 돌파 알림 폭격 ───────────── */
export interface SpamNotification {
  senderId: 'a' | 'b' | 'c' | 'group'
  senderName: string
  text: string
}

/** 알림이 하나씩 도착하는 간격 (ms) */
export const SPAM_INTERVAL_MS = 150
/** 폭격이 끝난 뒤 게임오버 화면까지의 대기 (ms) */
export const SPAM_END_DELAY_MS = 800
export const SUSPICION_100_GAME_OVER_TEXT =
  '의심도가 100%를 초과했습니다!\n거짓말이 모두 들통나 멤버들에게 연락이 폭주하며 양다리가 발각되었습니다.'

/** 의심도 100 돌파 시 쏟아지는 알림 폭격 목록 */
/** 의심도 100 돌파 시 쏟아지는 알림 폭격 목록 */
export const SUSPICION_100_SPAM_LIST: SpamNotification[] = [
  { senderId: 'a', senderName: CHARACTERS.a.name, text: '[캐릭터 A 폭격 메시지]' },
  { senderId: 'b', senderName: CHARACTERS.b.name, text: '[캐릭터 B 폭격 메시지]' },
  { senderId: 'c', senderName: CHARACTERS.c.name, text: '[캐릭터 C 폭격 메시지]' },
]
