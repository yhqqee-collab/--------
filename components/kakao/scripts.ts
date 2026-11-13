import { CHARACTERS, GROUP_MEMBERS } from '@/lib/template-config'
import type { SuspicionStage } from './suspicion'

/* ═══════════════════════════════════════════════════════════════
 * 휴대폰 시뮬레이터 스크립트 템플릿
 *  - 대사만 채우면 바로 동작합니다. 엔진 로직(fromPhases, resolveNode 등)은 수정하지 마세요.
 *  - 캐릭터 이름·프로필은 lib/template-config.ts 에서 관리합니다.
 * ═══════════════════════════════════════════════════════════════ */

/** 모든 멤버의 '일정 시작 전' 대화가 끝나면 4초간 표시되는 전환 문구 (일차별) */
const WORK_TRANSITION_TEXTS: Record<number, string> = {
  1: '⏳ [오전 수업 끝나고 점심식사 후...] (~ 12:40) ⏳',
  2: '⏳ [장본 물품을 들고 동아리방에서 다 같이 짐 정리 중...] (16:00 ~ 21:30) ⏳',
  3: '⏳ [시온과 용산공원에서 피크닉 데이트 중...] (13:00 ~ 17:00) ⏳',
  4: '⏳ [월요일 수업 듣는 중...] (13:00 ~ 16:40) ⏳',
  5: '⏳ [동기 대영·료와 국밥으로 점심을 먹고 주점 부스 세팅 중...] (12:30 ~ 15:10) ⏳',
  6: '⏳ [빼빼로를 챙겨 동아리방과 주점 부스 준비 중...] (14:00 ~ 15:30) ⏳',
  7: '🍻 [부스 철거 후 동아리 전체 뒤풀이 진행 중...] (18:00 ~ 22:00) 🍻',
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
  const date = new Date(2026, 10, 5 + day)
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
  /** 고르면 다른 톡방에 카톡이 도착 (예: 시온 톡에서 고른 선택에 유우시가 반응) */
  crossMessage?: CrossMessage
}

/** 다른 톡방으로 보내는 카톡. delta 는 받는 사람의 의심도 변화량 */
/** sync: 지정하면 메시지가 도착한 뒤 해당 sync 키의 외부 조건(INSTA_SYNC_SOURCE)을 충족시킵니다 */
/** setFlag: 지정하면 도착 시점에 전역 플래그를 켭니다 (texts 가 비어 있으면 카톡은 오지 않음) */
export type CrossMessage = { chat: string; texts: string[]; delayMs: number; delta: number; sync?: string; setFlag?: string }

/** 인스타 댓글 → 카톡 메시지가 도착해야 풀리는 sync 의 발신원 id */
export const INSTA_SYNC_SOURCE = 'insta'

/** Day 3: 시온 게시물에 인스타 댓글을 달면 유우시의 오후 카톡이 도착 */
export const SYNC_DAY3_INSTA = 'day3-insta'
/** Day 3: 유우시 오후 카톡에 답하면 시온의 저녁 카톡이 도착 */
export const SYNC_DAY3_EVENING = 'day3-evening'

/** Day 3 시온 게시물에서 고른 댓글 */
export const FLAG_DAY3_INSTA_A = 'day3-insta-a'
export const FLAG_DAY3_INSTA_B = 'day3-insta-b'
export const FLAG_DAY3_INSTA_C = 'day3-insta-c'

/** 카톡 답장 외에 추가로 충족돼야 하는 sync 조건 */
export const SYNC_EXTERNAL_SOURCES: Record<string, string[]> = {
  [SYNC_DAY3_INSTA]: [INSTA_SYNC_SOURCE],
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

export type ScriptNode = {
  lines: string[]
  choices: Choice[]
  redirect?: Redirect
  branch?: Branch[]
  /** true 면 이 노드의 메시지가 모두 도착한 뒤 선택지 없이 게임 오버 */
  gameOver?: boolean
  gameOverAlert?: string
  /** 지정하면 이 노드에 들어갈 때 카톡 대신 화면 전체 안내 팝업을 띄웁니다 (isSystem 페이즈) */
  interlude?: string
  /** true 면 팝업을 닫은 뒤 선택지 버튼 없이 첫 선택지로 자동 진행 */
  autoAdvance?: boolean
}

/** '(1층 로비로 내려갔다)' 처럼 괄호로 감싼 선택지는 말풍선으로 보내지 않는 행동 선택지 */
export function isActionText(text: string) {
  return /^\([\s\S]*\)$/.test(text.trim())
}

/** 모든 선택지가 게임 오버로 이어지는 노드 (이별 통보 직전) */
export function isDoomNode(node: ScriptNode | undefined) {
  if (node?.gameOver) return true
  return Boolean(node?.choices.length) && node!.choices.every((choice) => choice.gameOver)
}

/** 메시지 중간에 '[[대기:10]]' 줄을 넣으면 그 자리에서 10초 동안 아무 말도 오지 않습니다. */
export const PAUSE_PREFIX = '\u0002pause:'
const SYSTEM_NODE_PAUSE = `${PAUSE_PREFIX}400`
const PAUSE_PATTERN = /^\[\[대기:(\d+(?:\.\d+)?)\]\]$/

export function pauseDuration(text: string) {
  return text.startsWith(PAUSE_PREFIX) ? Number(text.slice(PAUSE_PREFIX.length)) : null
}

function toPauseToken(line: string) {
  const match = line.match(PAUSE_PATTERN)
  return match ? `${PAUSE_PREFIX}${Number(match[1]) * 1000}` : line
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
  /** 시스템 팝업 노드에서는 생략 (팝업을 닫으면 자동 진행) */
  text?: string
  susp: number
  alert?: string
  reply?: string
  next: string
  setFlag?: string
  gameOver?: boolean
  setGlobal?: Record<string, boolean>
  /** 고르면 chat 톡방에 message 가 delay 초 뒤 도착 (TIME_SCALE 미적용). susp 는 받는 사람의 의심도 */
  sendTo?: { chat: string; message: string; delay: number; susp?: number }
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
  /** true 면 메시지가 모두 도착한 뒤 바로 게임 오버 (alert 가 팝업 문구) */
  gameOver?: boolean
  /** true 면 카톡 대신 alert 문구를 화면 전체 팝업으로 띄운 뒤 선택지가 나옵니다 */
  isSystem?: boolean
}

/** Day 2 밤 데이트 수락 플래그 */
export const FLAG_SION_NIGHT_MEET = 'sion-night-meet'
export const FLAG_DAY2_SION_MEET = FLAG_SION_NIGHT_MEET
export const FLAG_DAY2_YUSHI_MEET = 'yushi-night-meet'

/** setGlobal 의 키 → 실제 플래그 */
const GLOBAL_FLAGS: Record<string, string> = {
  meetRiku: 'met-riku',
  meetYushi: 'met-yushi',
  FLAG_DAY2_SION_MEET,
  FLAG_DAY2_YUSHI_MEET,
}

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
const TIME_SCALE = 1

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
      // 메시지 없이 행동 선택지만 띄우는 노드도 재생 큐가 빈 배열을 읽지 않도록 짧은 대기 줄을 넣음
      lines:
        phase.isSystem || (!phase.branch && !splitLines(phase.message).length)
          ? [SYSTEM_NODE_PAUSE]
          : splitLines(phase.message).map(toPauseToken),
      interlude: phase.isSystem ? (phase.alert ?? phase.message.replace(/^\[\[시스템:\s*|\]\]$/g, '')) : undefined,
      autoAdvance: phase.choices.length === 1 && !phase.choices[0].text?.trim() ? true : undefined,
      redirect: phase.redirect,
      branch: phase.branch,
      gameOver: phase.gameOver,
      gameOverAlert: phase.gameOver ? phase.alert : undefined,
      choices: phase.choices.map((choice) => {
        const reply = choice.reply ?? choice.alert
        const nextPhase = phases[choice.next]
        const nextIsPreWork = Boolean(nextPhase?.preWork)
        const endsGame = Boolean(choice.gameOver || nextPhase?.isGameOver)
        return {
          says: splitLines(choice.text ?? ''),
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
          crossMessage: choice.sendTo && {
            chat: choice.sendTo.chat,
            texts: splitLines(choice.sendTo.message).map(toPauseToken),
            delayMs: choice.sendTo.delay * 1000,
            delta: choice.sendTo.susp ?? 0,
          },
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
 * 가장 긴 경로의 길이가 해당 인물의 '턴 수'가 되고, 모든 인물의 턴을 끝내면 엔딩이 발동합니다.
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
  a: { initialDelay: 4, phaseDelay: 25, replyDelayMs: 2500, workEndDelay: 5 },
  b: { initialDelay: 22, phaseDelay: 25, replyDelayMs: 2000, workEndDelay: 22 },
  c: { initialDelay: 40, phaseDelay: 25, replyDelayMs: 2000, workEndDelay: 40 },
}

function sampleDay(): Record<string, Script> {
  return {
    a: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.a),
    b: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.b),
    c: fromPhases('phase1', sampleNodes(), SAMPLE_TIMING.c),
  }
}

/** 유우시 카톡에서 점심 장소를 고르면 켜지는 플래그 (켜져 있으면 리쿠의 12:00 분기가 자동으로 결정됨) */
export const FLAG_YUSHI_LUNCH_SEOGA = 'yushi-lunch-seoga'
export const FLAG_YUSHI_LUNCH_RAMEN = 'yushi-lunch-ramen'

/** 리쿠 카톡에서 정문 라멘야를 고르면 켜지는 플래그 (유우시 쪽 12:40 카톡이 료의 목격담 엔딩으로 바뀜) */
export const FLAG_RIKU_LUNCH_RAMEN = 'riku-lunch-ramen'

/** 점심을 거절할 때 '혼자 발표 준비'를 핑계로 댔는지 (라멘야 추궁 대사에 사용) */
export const FLAG_RIKU_EXCUSE_SOLO = 'riku-excuse-solo'
export const FLAG_YUSHI_EXCUSE_SOLO = 'yushi-excuse-solo'

/** Day 1 오전에 리쿠·유우시의 점심 제안을 수락하면 켜지는 플래그 (둘 다 켜지면 점심 양다리 게임 오버) */
export const FLAG_DAY1_RIKU_LUNCH = 'day1-riku-lunch'
export const FLAG_DAY1_YUSHI_LUNCH = 'day1-yushi-lunch'

/** 리쿠 Day 1: 수업 전 점심 제안 → 점심 동선 → 동방 시식회 후 밤 카톡 */
const RIKU_DAY1: Record<string, PhaseNode> = {
  P1_Start: {
    preWork: true,
    message: '잘 잣어??\n학교 일찍 갈까 고민 중인데...\n수업 끝나구 나랑 점심 먹자 ❤️',
    choices: [
      {
        id: 'A',
        text: '좋아!! 수업 끝나고 보자 ㅎㅎ',
        susp: 0,
        reply: '앗싸 ㅎㅎ 그럼 나 지금 준비하구 나갈게!',
        next: 'P2_RikuFlow',
        setFlag: FLAG_DAY1_RIKU_LUNCH,
      },
      {
        id: 'B',
        text: '1시 수업 발표 준비 때문에 ㅠㅠ 점심 거르고 혼자 대본 보려구...',
        susp: 5,
        reply: '엥 밥도 안 먹구...? ㅠㅠ / 요즘 보기 힘들다... / 알겟어 화이팅해!',
        next: 'P2_Safe2_B',
        setFlag: FLAG_RIKU_EXCUSE_SOLO,
      },
      {
        id: 'C',
        text: '미안 ㅠㅠ 오늘 점심에 동기랑 있어 ㅠㅠ',
        susp: 20,
        reply: '아... / 나랑 먹지 아쉽다... / 이따 동방에서 봐',
        next: 'P2_Safe2_C',
      },
    ],
  },
  P2_RikuFlow: {
    preWork: true,
    delay: 12,
    message: '여주야 수업 들어가기 전이지??\n이따 우리 뭐 먹을까?',
    choices: [
      { id: 'A', text: '서가앤쿡 가자!', susp: 0, reply: '오 서가앤쿡 조아 ㅎㅎ / 수업 끝나구 후문 쪽으로 와!', next: 'Branch_Lunch_Riku' },
      {
        id: 'B',
        text: '라멘야 어때?',
        susp: 0,
        reply: '라멘!! / 완전 조아 ㅎㅎ / 12시에 정문 앞에서 보자!',
        next: 'Branch_Lunch_Riku',
        setFlag: FLAG_RIKU_LUNCH_RAMEN,
      },
    ],
  },
  Branch_Lunch_Riku: {
    delay: 4,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY1_RIKU_LUNCH, FLAG_DAY1_YUSHI_LUNCH], to: 'P2_Lunch_Dead' },
      // 라멘야는 료에게 목격되는 함정 — 근무 종료 후 ramen-exposure.ts 시퀀스로 진행
      { none: [FLAG_RIKU_LUNCH_RAMEN], to: 'P2_Safe1' },
    ],
  },
  P2_Lunch_Dead: {
    gameOver: true,
    alert: '인문관 1층 로비에서 마중 나온 리쿠와\n먼저 내려간 유우시가 정면으로 마주쳤습니다.\n\n(점심 양다리 발각 - GAME OVER)',
    message:
      '여주야 수업 끝낫지?? ㅎㅎ\n빨리 보고 시퍼서 인문관 1층까지 마중 나왓어!\n얼른 내려와 ❤️\n[[대기:8]]\n여주야...?\n방금 유우시 내려오길래 인사햇는데\n유우시가 지금 너랑 점심 먹기로 햇다는데...?\n뭐야??\n[[대기:8]]\n아...\n점심 약속을 두 개나 잡아?\n우리 둘 다 가지고 노니까 재밋어...?',
    choices: [],
  },
  P2_Safe1: {
    message: '여주랑 점심 먹으니까 넘 행복하당 ㅎㅎ\n일요일에 내 후드집업 빌려간 거\n다음에 입고 왕 ㅎㅎ',
    choices: [{ id: 'A', text: '웅 담에 입고 갈게 ㅎㅎ', susp: 0, next: 'P4_Start' }],
  },
  P2_Safe2_B: {
    redirect: { flag: FLAG_YUSHI_LUNCH_RAMEN, to: null },
    delay: 20,
    message: '여주야 수업 끝낫지??\n대본 보기 전에 뭐라도 먹어 ㅠㅠ 어디서 먹을 거야?\n...\n답장이 없네 ㅠㅠ 1시 수업 잘 들어!',
    choices: [{ id: 'A', text: '웅 고마워 ㅎㅎ 폰을 못 봤네 ㅠㅠ 이따 동방에서 봐!', susp: 10, next: 'P4_Start' }],
  },
  P2_Safe2_C: {
    redirect: { flag: FLAG_YUSHI_LUNCH_RAMEN, to: null },
    delay: 20,
    message: '여주야 수업 끝낫지??\n동기랑 어디서 먹어?\n...\n답장이 없네 ㅠㅠ 1시 수업 잘 들어!',
    choices: [{ id: 'A', text: '웅 고마워 ㅎㅎ 폰을 못 봤네 ㅠㅠ 이따 동방에서 봐!', susp: 10, next: 'P4_Start' }],
  },
  P4_Start: {
    delay: 24,
    message: '여주야 오늘 내가 만든 거 맛잇엇어?? ㅎㅎ\n사람들 만아서\n여주 옆에 못 앉아서 넘 아쉬웟다구 ㅠㅠ\n우리집 들럿다 갈랭??',
    choices: [
      {
        id: 'A',
        text: '오늘은 늦었으니까 ㅠㅠ 주말에 집데이트하자 ❤️',
        susp: 0,
        reply: ' / 주말에 꼭 우리 집 오기다?? / 약속!! / 조심히 들어가구 잘 자 / 여주야 사랑해 ❤️',
        next: 'end',
      },
      {
        id: 'B',
        text: '응 맛있더라! ㅎㅎ 나 오늘은 집 바로 들어가려구 ㅠㅠ',
        susp: 5,
        reply: '웅... 알겟엉 / 조심히 들어가',
        next: 'end',
      },
    ],
  },
}

/** 유우시 Day 1: 수업 전 점심 제안 → 점심 동선 → 시식회 중 알리바이 추궁 → 밤 카톡 */
const YUSHI_DAY1: Record<string, PhaseNode> = {
  P1_Start: {
    preWork: true,
    message: '여주야\n잘 잤어 ?\n오늘 영현사 수업 끝나고 점심 먹을래 ?\n수요일에 두고 간 머리끈도 챙겼어 ^_^',
    choices: [
      {
        id: 'A',
        text: '좋아!! 얼른 인문관으로 갈게!',
        susp: 0,
        reply: '응 자리 맡아둘게 / 수업 끝나고 뭐 먹을지 생각하고 있어 ^_^',
        next: 'P2_YushiFlow',
        setFlag: FLAG_DAY1_YUSHI_LUNCH,
      },
      {
        id: 'B',
        text: '1시 수업 발표 준비 때문에... 점심에 대본 봐야 할 것 같아... ㅠㅠ',
        susp: 15,
        reply: '아 그래 ? / 알 / 옆자리 비워놨어',
        next: 'P2_RikuFlow_B',
        setFlag: FLAG_YUSHI_EXCUSE_SOLO,
      },
      {
        id: 'C',
        text: '미안 ㅠㅠ 오늘 점심은 수진이랑 선약 있어',
        susp: 30,
        reply: '이상하네... / 수진이 수요일에 본가 내려갔다던데 ? / 급하게 올라왔나 보네',
        next: 'P2_RikuFlow_C',
      },
    ],
  },
  P2_YushiFlow: {
    preWork: true,
    // TIME_SCALE(0.5) 적용 후 실제 10초
    delay: 20,
    message: '오고 있어 ?\n이따가 뭐 먹지\n먹고 싶은 거 있어 ?',
    choices: [
      {
        id: 'A',
        text: '서가앤쿡 가자!',
        susp: 0,
        reply: '응 이따 수업 끝나고 같이 가자 ^_^',
        next: 'Branch_Lunch_Yushi',
        setFlag: FLAG_YUSHI_LUNCH_SEOGA,
      },
      {
        id: 'B',
        text: '라멘야 어때?',
        susp: 0,
        reply: '알겠어 / 이따 사물함만 들렀다가 그쪽으로 갈게 ^_^',
        next: 'Branch_Lunch_Yushi',
        setFlag: FLAG_YUSHI_LUNCH_RAMEN,
      },
    ],
  },
  Branch_Lunch_Yushi: {
    delay: 10,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY1_RIKU_LUNCH, FLAG_DAY1_YUSHI_LUNCH], to: 'P2_Lunch_Dead' },
      { none: [FLAG_YUSHI_LUNCH_RAMEN], to: 'P2_Safe1' },
    ],
  },
  P2_Lunch_Dead: {
    gameOver: true,
    alert: '인문관 1층 로비에서 마중 나온 리쿠와\n먼저 내려간 유우시가 정면으로 마주쳤습니다.\n\n(점심 양다리 발각 - GAME OVER)',
    message:
      '여주야 사물함 들렀다가 1층 먼저 내려왔는데\n인문관 앞에 리쿠가 서 있던데 ?\n너랑 점심 먹으러 왔다는데 무슨 소리야?\n[[대기:8]]\n실망이다\n리쿠랑 방금 카톡 맞춰 봤어\n수업 시간 내내 옆에 앉아서\n리쿠랑 점심 약속 잡고 있었네 ㅋㅋ\n사람 바보 만드는 거 쉽다',
    choices: [],
  },
  P2_Safe1: {
    message: '서가앤쿡 맛있네 ㅎㅎ\n머리끈 잘 챙겨 ^_^',
    choices: [{ id: 'A', text: '고마워 ㅎㅎ 1시 수업 잘 들어!', susp: 0, next: 'P4_Start' }],
  },
  P2_RikuFlow_B: {
    redirect: { flag: FLAG_RIKU_LUNCH_RAMEN, to: null },
    message: '발표 연습 화이팅 !\n이따 연락해',
    choices: [{ id: 'A', text: '웅 고마워!', susp: 0, next: 'P4_Start' }],
  },
  P2_RikuFlow_C: {
    redirect: { flag: FLAG_RIKU_LUNCH_RAMEN, to: null },
    message: '수진이랑 맛있게 먹어\n이따 연락해',
    choices: [{ id: 'A', text: '웅 고마워!', susp: 0, next: 'P4_Start' }],
  },
  P4_Start: {
    delay: 40,
    message:
      '근데 혹시\n일요일에 집에만 있었어?\n나한테는 본가 다녀왔다고 했잖아',
    choices: [
      {
        id: 'A',
        text: '시온이가 다른 날이랑 착각한 거 아니야? 난 본가 간 거 맞아!',
        susp: 10,
        reply: '그래 ? 시온이 형은 엄청 확신하던데...',
        next: 'P5_Start',
      },
      {
        id: 'B',
        text: '아아 일요일 아침 일찍 자취방 와서 쉬었어!',
        susp: 5,
        reply: '아 일요일 아침에 미리 올라왔구나 ㅎㅎ / 난 또 ^_^',
        next: 'P5_Start',
      },
      {
        id: 'C',
        text: '아 지금 시끄러워서 정신없어 ㅠㅠ 이따 끝나고 얘기하자 ㅎㅎ',
        susp: 30,
        reply: '지금 카톡으로 물어보는 건데 왜 말을 피해 ?',
        next: 'P5_Start',
      },
    ],
  },
  P5_Start: {
    delay: 30,
    message:
      '오늘 사람들 많아서 얼굴만 보고 얘기도 제대로 못 했네\n아까 동방 앞에서 몰래 손잡은 거 설렜어 ㅎㅎ\n집 들어가기 전에 우리 집 잠깐 들렀다 갈래 ?',
    choices: [
      {
        id: 'A',
        text: '오늘은 너무 늦었으니까 ㅠㅠ 주말에 둘이서만 오래 보자!',
        susp: 0,
        reply: '응 약속한 거다 ? / 집 들어가면 연락해 잘 자 여주야 ^_^',
        next: 'end',
      },
      { id: 'B', text: '나 넘 피곤해서 ㅠㅠ 바로 집 가려구...', susp: 5, reply: '... 알겠어 들어가', next: 'end' },
    ],
  },
}

/** 시온 Day 1: 모닝 카톡 → 점심 목격담 연동 체크 → 시식회 직전 카톡 → 밤 산책 제안 */
const SION_DAY1: Record<string, PhaseNode> = {
  P1_Start: {
    preWork: true,
    message: '여주야 일어났어? ㅋㅋ\n어제 늦게까지 같이 있어서 피곤할 텐데 ㅠㅠ\n난 공강이라 뒹굴거리면서 여주 생각 중\n아 맞다\n어제 립밤 두고간 거 저녁에 줄게 ㅎㅎ',
    choices: [
      {
        id: 'A',
        text: '부럽다 금공강 ㅠㅠ 나도 어제 너무 좋았어',
        susp: 0,
        reply: 'ㅋㅋ 귀여워 / 수업 잘 듣고 이따 저녁에 봐',
        next: 'Branch_Sion_Day1',
      },
      {
        id: 'B',
        text: '앗 립밤 너한테 있었구나 ㅋㅋ 고마워 이따 저녁에 봐!',
        susp: 0,
        reply: '응 ㅋㅋ / 점심 잘 챙겨 먹고 이따 보자~',
        next: 'Branch_Sion_Day1',
      },
    ],
  },
  // 점심에 라멘야를 골랐으면(료 폭로 루트) 시온의 일반 오후 카톡을 막음
  Branch_Sion_Day1: {
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_RIKU_LUNCH_RAMEN], to: null },
      { all: [FLAG_YUSHI_LUNCH_RAMEN], to: null },
      { none: [FLAG_RIKU_LUNCH_RAMEN, FLAG_YUSHI_LUNCH_RAMEN], to: 'P2_Start' },
    ],
  },
  P2_Start: {
    delay: 45,
    message: '여주야 나 셋팅하러 동방 먼저 와 있어 ㅋㅋ\n아직 애들 아무도 안 왔는데\n일찍 올 수 있으면 카페 가자\n어제 그 립밤도 줄 겸 ㅎㅎ',
    choices: [
      {
        id: 'A',
        text: '오 진짜? 지금 학생회관 앞인데 바로 올라갈게 ㅎㅎ',
        susp: 0,
        reply: '애들 오기 전에 잠깐이라도 단둘이 보자 / 얼른 와',
        next: 'P2_Meet_Popup',
      },
      {
        id: 'C',
        text: '애들 오면 오해하니까 ㅠㅠ 이따가 보자...',
        susp: 15,
        reply: '잉 그거 갖고 무슨 ㅎㅎ... / 알겠어 이따 봐',
        next: 'P3_Start',
      },
    ],
  },
  P2_Meet_Popup: {
    delay: 6,
    isSystem: true,
    alert: '동아리방에 일찍 도착해 시온과 단둘이 커피를 마시며\n어제 차에 두고 내린 립밤을 돌려받았습니다.',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P3_Start' }],
  },
  P3_Start: {
    delay: 8,
    message: '오늘 동방에 애들 너무 많았다\n그치 ㅠㅠ\n잠깐 나와서 산책할래?',
    choices: [
      {
        id: 'A',
        text: '어제도 늦게까지 같이 있었잖아 ㅋㅋ',
        susp: 0,
        reply: '아쉽네 ㅋㅋ 얼굴 잠깐이라도 더 보고 싶었는데 / 잘 자',
        next: 'end',
      },
      {
        id: 'B',
        text: '나 이미 씻고 누웠어 ㅠㅠ',
        susp: 5,
        reply: '벌써 누웠다고? / 집 바로 옆인데 ㅠㅠ / 알겠어 잘 자',
        next: 'end',
      },
    ],
  },
}

/** Day 2 단톡방 장보기 팀 선택 플래그 */
export const FLAG_SHOP_RIKU = 'shop-riku'
export const FLAG_SHOP_SION = 'shop-sion'

/** 시온·유우시의 밤 데이트 답장을 모두 받은 뒤 삼자대면 여부를 판정 */
const SYNC_DAY2_NIGHT = 'day2-night'

/** 시온 Day 2: 아침 인사 → 단톡방 장보기 분기 → 밤 호출 → 마무리 인사 */
const SION_DAY2: Record<string, PhaseNode> = {
  P0_Morning: {
    preWork: true,
    message: '여주야 일어났어? ㅋㅋ\n밥 잘 챙겨 먹고 나와',
    choices: [
      { id: 'A', text: '웅 방금 일어났어\n보고 싶다 ㅎㅎ', susp: 0, reply: 'ㅋㅋ 응 이따 봐', next: 'Branch_Group' },
      { id: 'B', text: '지금 씻고 나갈 준비 중!', susp: 0, reply: 'ㅋㅋ 응 이따 봐', next: 'Branch_Group' },
    ],
  },
  // 단톡방 장보기 선택이 끝날 때까지 대기하는 분기 전용 노드
  Branch_Group: {
    preWork: true,
    delay: 10,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_SHOP_RIKU], to: 'P1_Sion_Rejected' },
      { all: [FLAG_SHOP_SION], to: 'P2_Sion_Alibi' },
    ],
  },
  P1_Sion_Rejected: {
    preWork: true,
    message: 'ㅠㅠ 나랑 같이 가지...\n왜 리쿠랑 같이 가 ㅡㅡ\n걸어가면 다리도 아플 텐데',
    choices: [
      { id: 'A', text: '나두 다이소에 살 게 있어서 ㅠㅠ\n미안해...', susp: 10, reply: '그래 그럼 ㅋㅋㅋ / 이따 봐', next: 'P3_Night_Start' },
      { id: 'B', text: '리쿠가 같이 가자고 해서... ㅠㅠ 이따 봐', susp: 15, reply: '아 그래 ㅋㅋ 알겠어', next: 'P3_Night_Start' },
    ],
  },
  P2_Sion_Alibi: {
    preWork: true,
    message:
      '여주야 나 주차 좀 하고 갈 테니까 먼저 마트 들어가 있어 ㅋㅋ\n근데 방금 주차장 쪽에서 수진이 봤는데\n며칠 푹 쉬고 방금 본가에서 올라왔다던데?\n너 수요일 밤에 수진이 자취방에서 과제하며 밤샜다고 하지 않았어?',
    choices: [
      { id: 'A', text: '수요일 늦게 내려갔을 걸?\n그전까지 같이 한 거야!', susp: -15, reply: '아 그래? / 알겠어 얼른 들어갈게', next: 'P3_Night_Start' },
      {
        id: 'B',
        text: '아 수진이 아니고 민지였어\n내가 헷갈렸다 ㅎㅎ',
        susp: 15,
        reply: '그래? / 동기를 헷갈릴 수도 있나 ㅎㅎ / 일단 알겠어',
        next: 'P3_Night_Start',
      },
    ],
  },
  P3_Night_Start: {
    delay: 5,
    nextCheckGlobal: SYNC_DAY2_NIGHT,
    message: '짐 정리하느라 고생했어 ㅋㅋ\n왜 봐도봐도 보고 싶지\n잠깐 나올래?',
    choices: [
      {
        id: 'A',
        text: '오! 나갈게 어디야? ㅋㅋ',
        susp: -10,
        reply: 'ㅋㅋ 집 앞 편의점 파라솔 쪽이야 천천히 나와',
        next: 'Branch_DoubleBooking',
        setFlag: FLAG_SION_NIGHT_MEET,
      },
      {
        id: 'B',
        text: '앗 나 방금 씻고 누웠는데 ㅠㅠ 너무 피곤해...',
        susp: 5,
        reply: '벌써 누웠어? / 알겠어 푹 쉬어',
        next: 'P4_Goodnight_Reject',
      },
    ],
  },
  // 유우시 데이트도 수락했으면 삼자대면 즉사, 아니면 정상 마무리
  Branch_DoubleBooking: {
    delay: 8,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY2_SION_MEET, FLAG_DAY2_YUSHI_MEET], to: 'P_Death' },
      { all: [FLAG_DAY2_SION_MEET], to: 'P3_Meet_Popup' },
    ],
  },
  P3_Meet_Popup: {
    isSystem: true,
    alert: '집 앞 편의점 파라솔에서 시온을 만나\n달빛 아래에서 도란도란 이야기를 나눴습니다.',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Goodnight_Meet' }],
  },
  P_Death: {
    gameOver: true,
    alert: '양다리 현장이 발각되었습니다.',
    message:
      '여주야\n집 앞에서 유우시 만났어 ㅎㅎ\n안 들키게 잘 둘러댈게 ㅎㅎ\n[[대기:15]]\nㅎㅎ 여주야\n유우시랑 다 얘기했어\n사람 갖고 노는 게 재밌나보네\nㅋㅋ...\n당장 나와',
    choices: [],
  },
  P4_Goodnight_Meet: {
    delay: 40,
    message: '오늘 잠깐이라도 봐서 좋았어 ㅋㅋ 달 예쁘더라 잘 자',
    choices: [{ id: 'A', text: '나두 잠깐 얼굴 보니까 좋더라 ㅋㅋ 잘 자!', susp: 0, reply: '응 내일 봐 ㅎㅎ', next: 'end' }],
  },
  P4_Goodnight_Reject: {
    delay: 40,
    message: '오늘 고생했어\n피곤할 텐데 푹 자',
    choices: [{ id: 'A', text: '웅 오늘 하루 고생했어!\n잘 자 ㅋㅋ', susp: 0, reply: '응 내일 보자 ㅎㅎ❤️', next: 'end' }],
  },
}

/** 리쿠 Day 2: 아침 인사 → 단톡방 장보기 분기 → 마무리 인사 */
const RIKU_DAY2: Record<string, PhaseNode> = {
  P0_Morning: {
    preWork: true,
    message: '여주야 잘 잣어?? ㅠㅠ 나 아직 졸려 죽겟어',
    choices: [
      { id: 'A', text: '얼른 일어나!!\n이따가 얼굴 보겠넹 ㅎㅎ', susp: -5, reply: '웅 ㅎㅎ 이따 봐!', next: 'Branch_Group' },
      { id: 'B', text: '나도 아직 침대야 ㅠㅠ\n이제 일어나야지...', susp: 0, reply: '지각하면 안 댕 ㅎㅎ 이따 봐!', next: 'Branch_Group' },
    ],
  },
  // 단톡방 장보기 선택이 끝날 때까지 대기하는 분기 전용 노드
  Branch_Group: {
    preWork: true,
    delay: 10,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_SHOP_SION], to: 'P1_Riku_Jealous' },
      { all: [FLAG_SHOP_RIKU], to: 'P2_Riku_Daiso' },
    ],
  },
  P1_Riku_Jealous: {
    preWork: true,
    message: '나랑 같이 다이소 가지 ㅠㅠ\n시온이 형 차 타는 게 더 조앗어?\n흥',
    choices: [
      { id: 'A', text: '미아내 ㅠㅠ\n마트에 살 거 있어서... ㅠㅠ', susp: 15, reply: '알겟어 ㅠㅠ 이따 동방에서 봥', next: 'P3_Night' },
      { id: 'B', text: '다이소 걸어가야 하니까... ㅜㅜ\n쏘리 ...', susp: 20, reply: '치사해 진짜 ㅠㅠ', next: 'P3_Night' },
    ],
  },
  P2_Riku_Daiso: {
    preWork: true,
    message:
      '여주야 나 1층에서 종이컵 좀 찾고 올라갈게!!\n근데 아까 동방에서 료가 그러는데\n그저께 밤에 시온이 형네 자취방 골목 쪽에서 너 봣다던데...?\n너 그때 어머니 만나고 일찍 뻗엇다구 하지 안앗어...?',
    choices: [
      {
        id: 'A',
        text: '아! 엄마랑 밥 먹고 배불러서 산책 겸 그쪽으로 걸어갔다가 료랑 잠깐 스친 거야!',
        susp: -5,
        reply: '아아 산책한 거엿구낭! 알겟어 얼른 올라갈겡 ㅎㅎ',
        next: 'P3_Night',
      },
      {
        id: 'B',
        text: '어? 료가 사람 잘못 본 거 아니야? 나 진짜 집에 있었는데!',
        susp: 5,
        reply: '엥 구랭? 료가 사람 잘못 봣나 보네... / 일단 알겟엉',
        next: 'P3_Night',
      },
    ],
  },
  P3_Night: {
    delay: 20,
    message: '오늘 짐 나르느라 넘 힘들었어 ㅠㅠ\n여주도 피곤하지? ㅠㅠ',
    choices: [
      {
        id: 'A',
        text: '웅 완전 기절 직전이야 ㅋㅋㅋㅋ 오늘 고생 많았어 리쿠!',
        susp: -5,
        reply: '웅웅 여주도 푹 자구 낼 봥 ㅎㅎ ❤️',
        next: 'end',
      },
      { id: 'B', text: '나 씻고 이제 누웠어 ㅎㅎ 낼 보자', susp: 0, reply: '잘 자 여주야 ㅎㅎ', next: 'end' },
    ],
  },
}

/** 유우시 Day 2: 늦참 인사 → (장보기 생략) → 밤 기습 데이트 → 삼자대면 분기 → 마무리 인사 */
const YUSHI_DAY2: Record<string, PhaseNode> = {
  P0_Morning: {
    preWork: true,
    message: '여주야 잘 잤어 ?\n오늘 일정 때문에 늦을 것 같네\n형한테는 말해뒀어',
    choices: [
      { id: 'A', text: '헉 그렇구나 ㅠㅠ\n보고 싶어서 어떡해...', susp: -5, reply: '응 이따가 갈 때 연락할게 ^_^', next: 'P3_Night' },
      { id: 'B', text: '알겠어! 이따 짐 정리할 때 봐', susp: 0, reply: '그래 이따 봐', next: 'P3_Night' },
    ],
  },
  P3_Night: {
    delay: 35,
    nextCheckGlobal: SYNC_DAY2_NIGHT,
    message: '오늘 짧게 봐서 아쉬웠다\n그치\n지금 잠깐 여주 집 앞으로 가도 돼 ? ^_^\n얼굴 보고 싶어서 ㅎㅎ',
    choices: [
      {
        id: 'A',
        text: '헐 진짜?? ㅋㅋㅋㅋ\n알겠어\n지금 바로 나갈게!',
        susp: -10,
        reply: '응 금방 갈게\n천천히 나와 ^_^',
        next: 'Branch_DoubleBooking',
        setGlobal: { FLAG_DAY2_YUSHI_MEET: true },
      },
      {
        id: 'B',
        text: '앗 나 방금 씻고 누워서...\n오늘은 좀 힘들 것 같아 ㅠㅠ',
        susp: 15,
        reply: '아쉬워라...\n알겠어 푹 쉬어 ^_^',
        next: 'P4_Reject',
      },
    ],
  },
  // 시온과 유우시를 둘 다 수락했으면 삼자대면, 아니면 정상 마무리
  Branch_DoubleBooking: {
    delay: 16,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY2_SION_MEET, FLAG_DAY2_YUSHI_MEET], to: 'P35_Caught' },
      { all: [FLAG_DAY2_YUSHI_MEET], to: 'P3_Meet_Popup' },
    ],
  },
  P3_Meet_Popup: {
    isSystem: true,
    alert: '집 앞 가로등 아래로 찾아온 유우시를 만나\n손을 꼭 잡고 다정한 시간을 보냈습니다.',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Meet' }],
  },
  P35_Caught: {
    gameOver: true,
    alert: '양다리 현장이 발각되었습니다.',
    message:
      '여주야\n시온이 형도 여기 있는데?\n뭐야?\n[[대기:10]]\n야\n형이랑 다 얘기했어\n너 최악이다 진짜 ㅋㅋ...\n나와 봐\n뭐라고 변명할지 궁금하네',
    choices: [],
  },
  P4_Meet: {
    delay: 40,
    message: '오늘 잠깐이라도 얼굴 보니까 너무 좋네\n잘 자',
    choices: [
      { id: 'A', text: '나도 잠깐 봐서 좋았어 ㅋㅋㅋㅋ\n조심히 가!', susp: -5, reply: '말을 예쁘게 하네 ㅎㅎ', next: 'end' },
      { id: 'B', text: '웅 얼른 들어가!', susp: 0, reply: '잘 자 ~', next: 'end' },
    ],
  },
  P4_Reject: {
    delay: 40,
    message: '많이 피곤했나 보네\n어쩔 수 없지 ㅠㅠ 푹 쉬어',
    choices: [
      { id: 'A', text: '웅 ㅠㅠ 너도 오늘 고생했어! 잘 자', susp: 0, reply: '응 내일 보자 ^_^\n사랑해', next: 'end' },
      { id: 'B', text: '알겠어 내일 봐', susp: 0, reply: '응\n잘 자 ~', next: 'end' },
    ],
  },
}

/** 시온 Day 3: 아침 → 피크닉 약속 → (데이트 전환) → 인스타 댓글 선택 (유우시 반응) → 귀가 인사 */
const SION_DAY3: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '어제 늦게 잤지 ㅎㅎ\n피곤한 거 아니야?',
    choices: [
      { id: 'A', text: '웅 방금 일어났으 ...', susp: 0, next: 'P1_A' },
      { id: 'B', text: '아직 이불 속이야 ㅠㅠ', susp: 0, next: 'P1_B' },
    ],
  },
  P1_A: {
    preWork: true,
    delay: 6,
    message: '다행이네 밥은 먹었고?',
    choices: [{ id: 'A', text: '이제 먹으려고! ㅎㅎ', susp: 0, next: 'P1_Common' }],
  },
  P1_B: {
    preWork: true,
    delay: 6,
    message: '얼른 일어나 ㅋㅋ',
    choices: [{ id: 'A', text: '웅 일어날게 ㅠㅠ', susp: 0, next: 'P1_Common' }],
  },
  P1_Common: {
    preWork: true,
    message: '오늘 날씨 좋은데 공원 갈까?\n시험 기간 때 피크닉 가고 싶어 했잖아\n더 추워지기 전에 갈래?',
    choices: [
      { id: 'A', text: '헐 좋아!! 당장 준비할게 ㅋㅋ', susp: -5, next: 'P1_Accept' },
      { id: 'B', text: '오 나 거기 안 가봤어\n가자가자!!', susp: -5, next: 'P1_Accept' },
    ],
  },
  P1_Accept: {
    preWork: true,
    delay: 6,
    message: 'ㅋㅋㅋㅋ 알았어\n천천히 준비해❤️\n1시에 소원대역 앞에서 보자',
    // 이 답장 후 데이트 전환 팝업 (WORK_TRANSITION_TEXTS[3])
    choices: [{ id: 'A', text: '웅 이따 봐!', susp: 0, next: 'P2_Insta' }],
  },
  // 데이트를 마치고 카페에 앉은 뒤. 실제 댓글 선택지는 인스타 시온 게시물 댓글창에서 뜸
  // (components/instagram/insta-comment-choices.ts → SION_DAY3_POST_ID)
  P2_Insta: {
    nextCheckGlobal: SYNC_DAY3_EVENING,
    message: '나 방금 인스타 올렸어 ㅎㅎ\n아까 용산공원에서 논 거랑\n역에서 찍은 거 ㅎㅎ\n댓글 달아주면 안 돼?\n이정도는 티 안 날 거야 ㅎㅎ',
    choices: [{ id: 'A', text: '오키ㅣㅣ', susp: 0, next: 'P3_Evening' }],
  },
  // 인스타 댓글 → 유우시 카톡이 도착한 뒤 약 15초 뒤 도착 (delay 는 TIME_SCALE 0.5 적용)
  P3_Evening: {
    delay: 30,
    message: '오늘 진짜 재밌었어 ㅋㅋ 피곤할 텐데 얼른 들어가서 쉬어!\n도착하면 톡 하고❤️',
    choices: [
      { id: 'A', text: '나 방금 집 도착했어 ㅋㅋ', susp: 0, next: 'end' },
      { id: 'B', text: '오늘 진짜 힐링 ㅠㅠ 나 지금 씻으려고!', susp: 0, next: 'end' },
    ],
  },
}

/** 유우시 Day 3: 아침 (감기 핑계) → 시온 인스타 댓글 10초 뒤 추궁 → 답장 시 시온 저녁 카톡 */
const YUSHI_DAY3: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '일어났어 ??\n나 아침에 계란말이랑 우동 먹었어 ㅎㅎ\n여주는 ?',
    choices: [
      { id: 'A', text: '헐 맛있겠다! 나도 해줘 ㅋㅋㅋ', susp: 0, next: 'P1_Reply_A' },
      { id: 'B', text: '오 아침부터 부지런하네~', susp: 0, next: 'P1_Reply_B' },
    ],
  },
  P1_Reply_A: {
    preWork: true,
    delay: 6,
    message: '응 담에 해줄게 ㅎㅎ\n아침부터 여주 보고싶다\n오늘 뭐해 ?',
    choices: [{ id: 'A', text: '나 감기 기운 있어서 오늘은 집에서 푹 쉬려고 ㅠㅠ\n약 먹고 자게...', susp: 0, next: 'P1_Morning_End' }],
  },
  P1_Reply_B: {
    preWork: true,
    delay: 6,
    message: '배고파서 일찍 일어났어 ㅎㅎ\n오늘 뭐해 ?',
    choices: [{ id: 'A', text: '나 감기 기운 있어서 오늘은 집에서 푹 쉬려고 ㅠㅠ\n약 먹고 자게...', susp: 0, next: 'P1_Morning_End' }],
  },
  P1_Morning_End: {
    preWork: true,
    delay: 6,
    // 이 답장 후 시온 게시물에 인스타 댓글을 달 때까지 대기
    nextCheckGlobal: SYNC_DAY3_INSTA,
    message: '아 진짜 ?\n많이 아파 ? ㅜㅜ\n푹 자고 일어나서 연락해\n혹시 필요한 거 있으면 바로 연락하고',
    choices: [{ id: 'A', text: '웅 고마워 유우시 ㅠㅠ 이따 연락할게!', susp: 0, next: 'Branch_Insta' }],
  },
  // 인스타 댓글 10초 뒤 도착 (delay 는 TIME_SCALE 0.5 적용). 도착 시에는 의심도 변화 없음
  Branch_Insta: {
    delay: 20,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY3_INSTA_A], to: 'P2_Insta_A' },
      { all: [FLAG_DAY3_INSTA_B], to: 'P2_Insta_B' },
      { all: [FLAG_DAY3_INSTA_C], to: 'P2_Insta_C' },
    ],
  },
  P2_Insta_A: {
    nextCheckGlobal: SYNC_DAY3_EVENING,
    message: '집에 있는다며\n형 사진 찍어주고 있었네 ㅋㅋㅋ',
    choices: [{ id: 'A', text: '아 그거 예전에 찍어준 사진 올린 거야! ㅠㅠ', susp: 30, reply: '그래?\n알겠어 쉬어', next: 'end' }],
  },
  P2_Insta_B: {
    nextCheckGlobal: SYNC_DAY3_EVENING,
    message: '시온이 형 인스타에 댓글 달았네\n솔직히 질투나 ㅋㅋㅋ ㅠㅠ\n다른 남자 인스타에 댓글 달지 마...',
    choices: [{ id: 'A', text: '잠깐 깼는데 피드에 떠서 ㅠㅠ 미안해 유우시!', susp: 10, reply: '응 ㅎㅎ\n푹 쉬어', next: 'end' }],
  },
  P2_Insta_C: {
    nextCheckGlobal: SYNC_DAY3_EVENING,
    message: '저번에 형 옷도 골라줬어?',
    choices: [
      { id: 'A', text: '아니 예전에 카톡으로 쇼핑몰 링크 보내준 거야 ㅠㅠ', susp: 30, reply: '아 카톡으로...?\n일단 알겠어\n쉬어', next: 'end' },
    ],
  },
}

/** 리쿠 Day 3: 아침 (저녁 초대) → 시온·유우시 대화 종료 10초 뒤 주소 확인 → 자취방 데이트 팝업 → 밤 인사 */
const RIKU_DAY3: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '여주야 일어낫어??\n오늘 뭐해 ㅎㅎ',
    choices: [
      { id: 'A', text: '오늘 뭐하징 ㅎㅎ', susp: 0, next: 'P1_Prop' },
      { id: 'B', text: '아직 침대야 ㅠㅠ 리쿠는 뭐해?', susp: 0, next: 'P1_Prop' },
    ],
  },
  P1_Prop: {
    preWork: true,
    delay: 6,
    message: '오 그롬 저녁에 우리 집 놀러 올래??\n맛잇는 거 시켜 먹자 ㅎㅎ\n보고 시퍼',
    choices: [{ id: 'A', text: '헐 조아!! 이따 저녁에 갈게 ㅎㅎ', susp: 0, next: 'P1_End' }],
  },
  P1_End: {
    preWork: true,
    delay: 6,
    message: '웅웅!! 이따 저녁에 출발할 때 카톡 해 ㅎㅎ\n기다리구 잇을게 ❤️',
    choices: [{ id: 'A', text: '웅 이따 봐!! 😆', susp: 0, next: 'P2_Evening_Start' }],
  },
  // 시온·유우시 대화가 모두 끝나고 10초 뒤 도착 (delay 는 TIME_SCALE 0.5 적용)
  P2_Evening_Start: {
    waitOthers: true,
    delay: 20,
    message: '여주야 어디쯤이야??\n배고파 죽겟어 얼른 와 ㅠㅠ',
    choices: [
      { id: 'A', text: 'SL 오피스텔 맞지? 1층이야!!', susp: 30, next: 'P2_Wrong_A' },
      { id: 'B', text: '다온빌라 맞지? 1층 앞임!', susp: -10, next: 'P2_Correct_B' },
      { id: 'C', text: '청솔원룸 맞지? 거의 다 와따', susp: 40, next: 'P2_Wrong_C' },
    ],
  },
  P2_Correct_B: {
    delay: 6,
    message: '웅 맞아!! 거의 다 왓네 ㅎㅎ\n현관 비번 누르고 얼른 올라와\n보고 시퍼 ❤️',
    choices: [{ id: 'A', text: '웅 지금 올라간다!! ㅎㅎ', susp: 0, next: 'P2_Date_Popup' }],
  },
  P2_Wrong_A: {
    delay: 6,
    message: '에?\n거기 시온이 형 집이잖아...\n뭐야?',
    choices: [
      {
        id: 'A',
        text: '아\n배민에 찍힌 친구 집 주소랑 헷갈렸나 봐 ㅠㅠ\n다온빌라로 지금 바로 뛰어갈게!!',
        susp: 0,
        reply: '친구 집...?\n웅 일단 조심히 와...',
        next: 'P2_Date_Popup',
      },
    ],
  },
  P2_Wrong_C: {
    delay: 6,
    message: '에?\n거기 유우시 집인데\n유우시랑 나랑 헷갈린 거야?',
    choices: [
      {
        id: 'A',
        text: '아\n배민에 찍힌 친구 집 주소랑 헷갈렸나 봐 ㅠㅠ\n다온빌라로 지금 바로 뛰어갈게!!',
        susp: 0,
        reply: '친구 집...?\n웅 일단 조심히 와...',
        next: 'P2_Date_Popup',
      },
    ],
  },
  P2_Date_Popup: {
    delay: 4,
    isSystem: true,
    alert: '리쿠의 자취방(다온빌라)에서 배달 음식을 시켜 먹으며\n오붓하고 달콤한 저녁 시간을 보냈습니다.\n\n밤이 깊어 집으로 돌아왔습니다.',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P3_Night_Sweet' }],
  },
  // 자취방 데이트 팝업(P2_Date_Popup)이 닫히고 10초 뒤 도착
  P3_Night_Sweet: {
    delay: 20,
    message: '여주야 집 잘 들어갓어??\n여주 왜 이렇게 자꾸 좋아지지 ㅠㅠ ❤️\n미치겟당 ㅎㅎ',
    choices: [
      { id: 'A', text: '나도 오늘 너무 좋았어 ㅎㅎ\n내일 봐 리쿠야 ❤️', susp: 0, reply: '웅 내일 꿈에서 봐 ㅎㅎ 잘 자!!', next: 'end' },
      { id: 'B', text: '내가 더 좋아하거든!! ㅋㅋ\n얼른 자 굿나잇~', susp: 0, reply: '웅 내일 꿈에서 봐 ㅎㅎ 잘 자!!', next: 'end' },
    ],
  },
}

/** Day 4: 시온이 소행론 수업 후 같이 나가자는 제안을 승낙하면 켜짐 (시온 Day 4 스크립트에서 setFlag) */
export const FLAG_DAY4_SION_ACCEPT = 'day4-sion-accept'
/** Day 4: 리쿠·시온의 16:40 카톡 답장을 모두 받은 뒤 분기 판정 */
export const SYNC_DAY4_CLASS = 'day4-class'
/** Day 4: 리쿠 16:40 카톡에서 고른 답 (A: 1층 로비, B: 3층 문 앞, C: 동방 핑계 → 플래그 없음) */
export const FLAG_DAY4_RIKU_A = 'day4-riku-a'
export const FLAG_DAY4_RIKU_B = 'day4-riku-b'
/** Day 4: 유우시 인스타 스토리 태그를 허락하면 켜짐 (유우시 Day 4 / 인스타에서 setFlag 예정) */
export const FLAG_DAY4_YUSHI_STORY_TAG = 'day4-yushi-story-tag'

/** 시온 Day 4 (월): 아침 안부 → (유우시 스토리 태그 시 점심 추궁) → 16:40 동방 같이 가자 → 리쿠 선택과 조합해 분기 → 종료 */
const SION_DAY4: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '여주야 잘 잤어? ㅎㅎ\n오늘 월요일이라 피곤하겠다 ㅠㅠ\n이따 수업 때 보겠네 ㅎㅎ',
    choices: [
      { id: 'A', text: '웅!! 옆자리 맡아놔 ㅋㅋ', susp: 0, next: 'P1_Morning_End' },
      { id: 'B', text: '월요병 살려줘 ㅠㅠ', susp: 0, next: 'P1_Morning_End' },
    ],
  },
  P1_Morning_End: {
    preWork: true,
    delay: 6,
    message: 'ㅋㅋㅋㅋㅋㅋ\n천천히 와 ❤️',
    // 이 답장 후 수업 전환 팝업 (WORK_TRANSITION_TEXTS[4])
    choices: [{ id: 'A', text: '이따 보자 ㅎㅎ', susp: 0, next: 'CHECK_YUSHI_STORY' }],
  },
  CHECK_YUSHI_STORY: {
    delay: 5,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY4_YUSHI_STORY_TAG], to: 'P2_Lunch_Story' },
      { none: [FLAG_DAY4_YUSHI_STORY_TAG], to: 'P3_Class_Start' },
    ],
  },
  // 13:10 유우시 인스타 스토리 태그를 허락했을 때만
  P2_Lunch_Story: {
    delay: 10,
    message: '여주야\n방금 유우시 스토리 봤는데\n오전에 유우시랑 카페 갔었어?',
    choices: [{ id: 'A', text: '아 전공책 빌린다고 잠깐 본 거야 ㅠㅠ', susp: 10, next: 'P2_Lunch_Res' }],
  },
  P2_Lunch_Res: {
    delay: 6,
    message: '아 그래?\n유우시는 친구 없대? ㅎㅎ\n왜 너한테 빌리지',
    choices: [{ id: 'A', susp: 0, next: 'P3_Class_Start' }],
  },
  // 16:40 소행론 수업 마치기 10분 전 (리쿠 카톡과 동시에 도착)
  P3_Class_Start: {
    delay: 5,
    nextCheckGlobal: SYNC_DAY4_CLASS,
    message: '오늘따라 수업 너무 지루하네 ㅠㅠ\n수업 끝나고 동방 바로 갈 거지?\n커피 사서 같이 가자 ㅎㅎ',
    choices: [
      { id: 'A', text: '웅 좋아~~', susp: 0, setFlag: FLAG_DAY4_SION_ACCEPT, next: 'P3_Accept_Sion' },
      { id: 'B', text: '헉\n친구가 잠깐 로비에서 보자고 해서...', susp: 0, next: 'P3_Reject_Sion' },
    ],
  },
  P3_Accept_Sion: {
    delay: 6,
    message: '오키 ㅎㅎ 끝나고 같이 나가자!',
    choices: [{ id: 'A', susp: 0, next: 'RESOLVE_AFTER_ACCEPT_SION' }],
  },
  P3_Reject_Sion: {
    delay: 6,
    message: '아 그래?\n알겠어~\n이따 동방에서 봐!',
    choices: [{ id: 'A', susp: 0, next: 'RESOLVE_AFTER_REJECT_SION' }],
  },
  // 충돌 팝업·시온 의심도(A-2 +15 / B-1 -10 / B-2 +30)는 리쿠 Day 4 스크립트에서 처리 → 여기선 중복 팝업 없이 마무리
  RESOLVE_AFTER_ACCEPT_SION: {
    delay: 6,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY4_RIKU_A], to: 'P3_Accept_Clash_A' },
      { all: [FLAG_DAY4_RIKU_B], to: 'P3_Safe_B' },
      { none: [FLAG_DAY4_RIKU_A, FLAG_DAY4_RIKU_B], to: null },
    ],
  },
  RESOLVE_AFTER_REJECT_SION: {
    delay: 6,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY4_RIKU_A], to: 'P3_Susp_A' },
      { all: [FLAG_DAY4_RIKU_B], to: 'P3_Reject_Odd_B' },
      { none: [FLAG_DAY4_RIKU_A, FLAG_DAY4_RIKU_B], to: null },
    ],
  },
  // 승낙 + 리쿠 B (복도 마주침)
  P3_Safe_B: {
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
  // 승낙 + 리쿠 A (1층 로비 정면충돌)
  P3_Accept_Clash_A: {
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
  // 거절 + 리쿠 B (3층 문 앞 목격)
  P3_Reject_Odd_B: {
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
  // 거절 + 리쿠 A (17:05 로비 목격 추궁)
  P3_Susp_A: {
    delay: 20,
    message: '친구 만난다더니\n친구가 리쿠였어?\n말을 하지',
    choices: [{ id: 'A', text: '아 내려가다가 우연히 마주쳐서 인사만 한 거야 ㅠㅠ', susp: 20, next: 'P3_Res_A' }],
  },
  P3_Res_A: {
    delay: 6,
    message: '우연히 마주쳤는데\n커피는 어디서 났을까 ㅎㅎ\n이따 동아리방에서 봐',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
}

/** 리쿠 Day 4 (월): 아침 인사 → (수업) → 16:40 경영관 방문 → 시온 선택에 따라 분기 → 동방 작업 후 밤 카톡 */
const RIKU_DAY4: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '여주야 잘 잣어?? ㅎㅎ\n어제 같이 잇어서 넘 조앗다\n아침부터 또 보고 시퍼 ❤️',
    choices: [
      { id: 'A', text: '나도 어제 너무 좋았어 ㅎㅎ 오늘 수업 파이팅!', susp: 0, next: 'P1_Morning_End' },
      { id: 'B', text: '아침부터 애교 뭐야 ㅋㅋㅋ 귀여워 죽겠네 ❤️', susp: 0, next: 'P1_Morning_End' },
    ],
  },
  P1_Morning_End: {
    preWork: true,
    delay: 6,
    message: '웅웅!! 여주 생각하면서 버텨야징 ㅎㅎ\n이따 동방 갈 때 보자 ❤️',
    // 이 답장 후 수업 전환 팝업 (WORK_TRANSITION_TEXTS[4])
    choices: [{ id: 'A', text: '웅 이따 봐!! ㅎㅎ', susp: 0, next: 'P3_Class_Visit' }],
  },
  // 16:40 소행론 수업 마치기 10분 전 (시온 카톡과 동시에 도착)
  P3_Class_Visit: {
    delay: 18,
    nextCheckGlobal: SYNC_DAY4_CLASS,
    message: '여주야 나 오늘 수업 일찍 마쳣어 ㅎㅎ\n여주 보고 시퍼서 바닐라라떼 사 들고 경영관 3층 올라가는 중!!\n소행론 강의실 앞이징?? ❤️',
    choices: [
      { id: 'A', text: '헐 3층 오지 마!!\n사람 너무 많아 ㅠㅠ\n1층 로비에 있으면 내가 내려갈게', susp: 0, setFlag: FLAG_DAY4_RIKU_A, next: 'CHECK_SION_FOR_RIKU_A' },
      { id: 'B', text: '헉 지금 올라오는 중이야?!\n알겠어 문 앞에서 보장', susp: 0, setFlag: FLAG_DAY4_RIKU_B, next: 'CHECK_SION_FOR_RIKU_B' },
      { id: 'C', text: '나 동방 바로 가야할 것 같은데...ㅠ', susp: -5, next: 'P3_Route_C_Clear' },
    ],
  },
  CHECK_SION_FOR_RIKU_A: {
    delay: 6,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY4_SION_ACCEPT], to: 'P3_Route_A_Clash' },
      { none: [FLAG_DAY4_SION_ACCEPT], to: 'P3_Route_A_Safe' },
    ],
  },
  CHECK_SION_FOR_RIKU_B: {
    delay: 6,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY4_SION_ACCEPT], to: 'P3_Route_B_Popup' },
      { none: [FLAG_DAY4_SION_ACCEPT], to: 'P3_Route_B_Odd' },
    ],
  },
  // [A-1] 1층 대기 + 시온 거절 (내려가던 시온에게 목격됨)
  P3_Route_A_Safe: {
    message: '오키오키!! 그롬 1층 로비에 잇을게 ㅎㅎ\n조심히 내려와 ❤️',
    choices: [{ id: 'A', susp: -10, next: 'P3_Route_A_Safe_Popup' }],
  },
  P3_Route_A_Safe_Popup: {
    isSystem: true,
    alert: '1층 로비로 내려가 리쿠에게 바닐라라떼를 받았습니다!\n\n그 순간, 뒤늦게 계단으로 내려오던 시온과\n멀리서 눈이 마주친 것 같은 기분이 듭니다...',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Club_Work' }],
  },
  // [A-2] 1층 대기 + 시온 승낙 (로비 정면충돌)
  P3_Route_A_Clash: {
    isSystem: true,
    alert: '시온과 함께 1층 로비로 내려오다\n바닐라라떼를 들고 기다리던 리쿠와\n정면으로 마주쳤습니다!',
    message: '',
    choices: [
      {
        id: 'A',
        susp: 0,
        sendTo: { chat: 'a', message: '', delay: 0, susp: 15 },
        next: 'P3_Route_B_Susp',
      },
    ],
  },
  // [B-1] 3층 문 앞 + 시온 승낙 (복도 정면충돌, 시온 의심도 -10)
  P3_Route_B_Popup: {
    isSystem: true,
    alert: '시온과 나란히 강의실을 나서다\n복도의 리쿠와 마주쳤습니다!\n\n여주와 함께 나와 기분이 좋아 보이는 시온과 달리,\n리쿠는 당황하며 표정이 굳어집니다...',
    message: '',
    choices: [
      {
        id: 'A',
        susp: 0,
        sendTo: { chat: 'a', message: '', delay: 0, susp: -10 },
        next: 'P3_Route_B_Susp',
      },
    ],
  },
  // [B-2] 3층 문 앞 + 시온 거절 (먼저 나온 시온과 리쿠가 마주침, 리쿠 -10 / 시온 +30)
  P3_Route_B_Odd: {
    isSystem: true,
    alert: '혼자 먼저 나온 시온과\n문 앞의 리쿠가 마주쳤습니다!\n\n로비에 간다던 여주를 기다리는 리쿠를 보며\n시온의 눈빛이 싸늘해집니다...',
    message: '',
    choices: [
      {
        id: 'A',
        susp: -10,
        sendTo: { chat: 'a', message: '', delay: 0, susp: 30 },
        next: 'P4_Club_Work',
      },
    ],
  },
  // 마주친 경우 (A-2 / B-1) 10초 뒤 추궁
  P3_Route_B_Susp: {
    delay: 20,
    message: '여주야\n아까 시온이 형 눈빛이 이상하던데\n형이 너 좋아하는 거 아니야?? ㅋㅋ...\n좀 싫다 ㅠ\n내가 모르는 거\n있는 거 아니지??',
    choices: [{ id: 'A', text: '에이 무슨...!\n그런 사이 아닌 거 알잖아', susp: 10, next: 'P3_Route_B_End' }],
  },
  P3_Route_B_End: {
    delay: 6,
    message: 'ㅎㅎ...\n신경쓰이네\n일단 알겟어',
    choices: [{ id: 'A', susp: 0, next: 'P4_Club_Work' }],
  },
  // [C] 동방 핑계로 학생회관 유인 (완벽 회피)
  P3_Route_C_Clear: {
    delay: 6,
    message: '아 맞다 오늘 동방 모임이징!!\n그롬 학생회관 앞 벤치로 갈게 거기서 보자 ❤️',
    choices: [{ id: 'A', susp: 0, next: 'P3_Route_C_Popup' }],
  },
  P3_Route_C_Popup: {
    isSystem: true,
    alert: '학생회관 앞 벤치에서 리쿠가 사 온 바닐라라떼를 마시며\n잠깐 오붓한 시간을 보낸 뒤 동아리방으로 향했습니다.',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Club_Work' }],
  },
  // 18:00 동방 주점 준비 → 22:05 귀가
  P4_Club_Work: {
    delay: 6,
    isSystem: true,
    alert: '18:00 ~ 22:00\n동아리방에서 주점 준비를 끝내고\n집에 도착했습니다',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Night_Msg' }],
  },
  P4_Night_Msg: {
    delay: 8,
    message: '여주야 집 도착햇어??\n아까 작업할 때 시온이 형이 너 엄청 챙기더라\n가위도 계속 건네주고 ㅎㅎ\n내 착각이지?',
    choices: [
      { id: 'A', text: '시온이 원래 잘 챙겨주잖아\n오늘 내 눈엔 리쿠밖에 안 보였어 ❤️', susp: -10, next: 'P4_Night_Good' },
      { id: 'B', text: '어차피 다같이 있는데 뭐 ~\n신경쓰지 마 ㅎㅎ', susp: 5, next: 'P4_Night_Bad' },
    ],
  },
  P4_Night_Good: {
    delay: 6,
    message: 'ㅎㅎ\n휴 다행이당 ㅠㅠ\n내일 벌써 축제네\n고생하겟당 ㅠㅠ\n잘 자 ❤️',
    choices: [{ id: 'A', text: '리쿠도 잘자❤️', susp: 0, next: 'end' }],
  },
  P4_Night_Bad: {
    delay: 6,
    message: '어떻게 신경을 안 써...\n나 진짜 질투 난단 말이야...ㅠ',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
}

/**
 * 유우시 Day 4 (월): 아침 서운함 달래기 → 공강 카페 데이트 → 스토리 태그 허락 여부(시온 점심 추궁 분기)
 * → (수업) → 리쿠·시온 대화가 모두 끝난 뒤 밤 리쿠 견제 카톡
 * 스토리 태그 플래그가 수업 전환 전에 정해져야 시온의 CHECK_YUSHI_STORY 가 읽을 수 있으므로 오전 파트는 preWork
 */
const YUSHI_DAY4: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '일어났어 ?\n몸은 좀 괜찮아 ?',
    choices: [
      { id: 'A', text: '웅 유우시가 걱정해 준 덕분에 다 나았지 ㅎㅎ ❤️', susp: 0, next: 'P1_Sulk1' },
      { id: 'B', text: '응 어제 약 먹고 기절했더니 이제 살 것 같아 ㅠㅠ', susp: 0, next: 'P1_Sulk1' },
    ],
  },
  P1_Sulk1: {
    preWork: true,
    delay: 6,
    message: '다행이네 ...\n요즘 얼굴 보기 힘들다\n나만 보고 싶어 하는 거 같고',
    choices: [
      { id: 'A', text: '무슨 소리야\n나도 엄청 보고 싶어 ㅠㅠ\n오전 공강 때 잠깐 볼래?', susp: -5, next: 'P1_Sulk_Good' },
      { id: 'B', text: '미안해\n요즘 축제 준비랑 과제 때문에 정신없었어 ㅠㅠ', susp: 5, next: 'P1_Sulk_Bad' },
    ],
  },
  P1_Sulk_Good: {
    preWork: true,
    delay: 6,
    message: '무리 안 해도 되는데 ...\n괜찮으면 잠깐 보자 ㅎㅎ',
    choices: [{ id: 'A', text: '무리 아니야!!\n얼른 준비해서 나갈게 ❤️', susp: 0, next: 'P1_Date_Popup' }],
  },
  P1_Sulk_Bad: {
    preWork: true,
    delay: 6,
    message: '바쁜 거 알지 ...\n그냥 그렇다고\n오전에 잠깐만 만나자',
    choices: [{ id: 'A', text: '웅 미안해 ㅠㅠ\n11시까지 바로 나갈게!!', susp: 0, next: 'P1_Date_Popup' }],
  },
  // 11:00 공강 카페 데이트
  P1_Date_Popup: {
    preWork: true,
    delay: 6,
    isSystem: true,
    alert: '카페에서 유우시를 만나 애교를 부리며 달래줬습니다.\n유우시도 금방 기분이 풀려\n사진을 찍으며 오붓한 시간을 보냈습니다.',
    message: '',
    choices: [{ id: 'A', susp: -5, next: 'P2_Story_Ask' }],
  },
  // 헤어진 직후 스토리 태그 딜레마 → 허락 시 시온 P2_Lunch_Story 발동
  P2_Story_Ask: {
    preWork: true,
    delay: 10,
    message: '수업 잘 들어가고 있어 ?\n아까 카페에서 밀크티 찍었는데\n인스타 스토리 올려도 돼 ?\n너 태그해서 ㅎㅎ',
    choices: [
      { id: 'A', text: '웅 당연하지!!', susp: -15, setFlag: FLAG_DAY4_YUSHI_STORY_TAG, next: 'P2_Allow_Story' },
      { id: 'B', text: '헉 태그하면 애들이 다 보는데 ㅠㅠ', susp: 25, next: 'P2_Deny_Story' },
    ],
  },
  P2_Allow_Story: {
    preWork: true,
    delay: 6,
    message: '응 ㅎㅎ\n수업 잘 듣고\n이따 동방에서 봐',
    choices: [{ id: 'A', susp: 0, next: 'P4_Night_Msg' }],
  },
  P2_Deny_Story: {
    preWork: true,
    delay: 6,
    message: '애들이 보면 왜 안 되는데 ?\n어제 시온이 형 인스타엔 댓글도 달았잖아\n알았어\n안 올릴게',
    choices: [{ id: 'A', text: '미안...', susp: 0, next: 'P4_Night_Msg' }],
  },
  // 22:00 귀가 후 (동방 작업 팝업은 리쿠 Day 4 P4_Club_Work 가 띄움 → 리쿠·시온 대화가 끝난 뒤 도착)
  P4_Night_Msg: {
    waitOthers: true,
    delay: 24,
    message: '집 잘 들어갔어 ?\n오늘 고생했네 ~~\n근데 아까 동방에서 리쿠랑 무슨 얘기 했어?\n둘이 계속 웃던데',
    choices: [
      { id: 'A', text: '에이 그냥 동방 얘기지 ㅋㅋ\n난 작업 내내 유우시 얼굴만 봤구만 ❤️', susp: -10, next: 'P4_Night_Good' },
      { id: 'B', text: '다른 애들도 다 같이 있었는데 뭘 ㅠㅠ\n그냥 장난친 거야!', susp: 10, next: 'P4_Night_Bad' },
    ],
  },
  P4_Night_Good: {
    delay: 6,
    message: '거짓말\n그래도 기분은 좋네ㅎㅎ\n내일 축제 때 보자\n잘 자 ❤️',
    choices: [{ id: 'A', text: '웅 유우시도 잘 자 ❤️', susp: 0, next: 'end' }],
  },
  P4_Night_Bad: {
    delay: 6,
    message: '그냥 장난친 거 치고는 너무 좋아하던데\n알겠어\n피곤할 텐데 쉬어',
    choices: [{ id: 'A', susp: 0, next: 'end' }],
  },
}

/** Day 5: 리쿠 Day 5 오전에 후드집업을 '입고 가기' / '쇼핑백에 들고 가기' 고르면 켜짐 (리쿠 Day 5 스크립트에서 setFlag) */
export const FLAG_DAY5_RIKU_HOODIE_WEAR = 'day5-riku-hoodie-wear'
export const FLAG_DAY5_RIKU_HOODIE_BAG = 'day5-riku-hoodie-bag'
/** Day 5: 리쿠 오전 후드집업 선택이 끝난 뒤 유우시 15:15 분기 판정 (리쿠 Day 5 의 해당 페이즈에도 같은 키를 달아주세요) */
export const SYNC_DAY5_HOODIE = 'day5-hoodie'
/** Day 5: 주점 종료 팝업(유우시 P3_Pub_Skip) 뒤에 리쿠 밤 카톡이 오도록 동기화 */
export const SYNC_DAY5_PUB = 'day5-pub'

/**
 * 유우시 Day 5 (축제 첫날): 모닝톡 → (부스 세팅) → 리쿠 후드집업 선택에 따라 15:15 추궁 / 즉사 지뢰
 * → 주점 종료 → (단톡방 번따 폭로) → 23:35 질투 카톡
 */
const DAEYOUNG_DAY5_TIMING: PhaseTiming = {
  initialDelay: 2,
  phaseDelay: 10,
  replyDelayMs: 1500,
  workEndDelay: 0,
}

const DAEYOUNG_DAY5: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '누나 오늘 12시에 교양 끝나죠\n저랑 료도 12시에 수업 끝나는데\n국밥 한 그릇 드실래요',
    choices: [
      {
        id: 'A',
        text: '오 국밥 완전 좋지 ㅋㅋㅋ 12시에 정문 앞에서 보자!',
        susp: 0,
        reply: '넵',
        next: 'end',
      },
      {
        id: 'B',
        text: '날 추운데 뜨끈하게 좋네 ㅎㅎㅎ',
        susp: 0,
        reply: '이따봐여',
        next: 'end',
      },
    ],
  },
}

const YUSHI_DAY5: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '일어났어 ?\n오늘 주점 첫날이네\n벌써 기빨리네',
    choices: [
      { id: 'A', text: 'ㅋㅋㅋ 오늘 사람 많을 텐데 파이팅하자 ❤️', susp: 0, next: 'P1_Morning_End' },
      { id: 'B', text: '아침 잘 챙겨 먹고 와 ㅋㅋㅋ 이따 봐', susp: 0, next: 'P1_Morning_End' },
    ],
  },
  P1_Morning_End: {
    preWork: true,
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_HOODIE,
    message: '응 ㅎㅎ\n밤에 추우니까 겉옷 따뜻하게 챙겨 와',
    // 이 답장 후 부스 세팅 전환 팝업 (WORK_TRANSITION_TEXTS[5])
    choices: [{ id: 'A', susp: 0, next: 'CHECK_RIKU_HOODIE' }],
  },
  // 쇼핑 플래그가 없으면(입고 감 / 리쿠 스크립트 미작성) 입고 온 루트
  CHECK_RIKU_HOODIE: {
    delay: 5,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY5_RIKU_HOODIE_BAG], to: 'P2_Bag_Bomb' },
      { none: [FLAG_DAY5_RIKU_HOODIE_BAG], to: 'P2_Wear_Msg' },
    ],
  },
  // 15:15 [입고 온 경우] 후드집업 눈치
  P2_Wear_Msg: {
    delay: 32,
    message: '여주야\n후드집업 못보던 건데\n그거 리쿠 거 아냐?',
    choices: [{ id: 'A', text: '아\n흔한 거라 겹쳤나 봐 ㅋㅋ 내 거야!', susp: 10, next: 'P2_Wear_Safe' }],
  },
  P2_Wear_Safe: {
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: '그래 ?\n사이즈가 좀 커 보여서\n이따 주점 시작하면 옆으로 와',
    choices: [{ id: 'A', text: '오키', susp: 0, next: 'P3_Pub_Skip' }],
  },
  // 15:15 [쇼핑백에 들고 온 경우] 즉사 지뢰
  P2_Bag_Bomb: {
    delay: 32,
    message: '아까 테이블 밑에 치우다가 봤는데\n네 쇼핑백 안에 든 후드집업 리쿠 거 아니야 ?\n리쿠 옷이 왜 네 가방에 있어',
    choices: [
      {
        id: 'A',
        text: '아 저번 시험기간에 도서관 추워서 빌렸던 거야!\n깜빡하고 있다가 오늘 돌려주려고 챙겼어 ㅠㅠ',
        susp: 15,
        next: 'P2_Bag_Survive',
      },
      { id: 'B', text: '어제 집 갈 때 추워서 잠깐 빌렸어 ㅎㅎ\n오늘 주려고 가져왔어', susp: 0, next: 'P2_Bag_Dead' },
    ],
  },
  P2_Bag_Survive: {
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: '시험기간 때 ?\n나한테 빌리지\n왜 리쿠한테 빌려...',
    // 유우시 답장 없이(읽씹) 바로 주점 종료로
    choices: [
      { id: 'A', text: '미안 ㅠㅠ', susp: 0, next: 'P3_Pub_Skip' },
      { id: 'B', text: '옆에 리쿠가 있어서... ㅜㅜ', susp: 0, next: 'P3_Pub_Skip' },
    ],
  },
  P2_Bag_Dead: {
    delay: 6,
    message: '어젯밤 ?\n어제 동방 회의 끝나고 다 같이 헤어졌는데\n밤에 리쿠랑 따로 만났어 ?',
    choices: [{ id: 'A', text: '어...? 아니 그게 아니라...', susp: 0, next: 'P2_Dead_End' }],
  },
  P2_Dead_End: {
    isGameOver: true,
    alert:
      '유우시가 말없이 휴대폰을 끄고\n테이블 밑의 쇼핑백을 집어 든 채\n부스 안의 리쿠에게 성큼성큼 걸어갑니다.\n\n둘이 이야기를 나누더니\n표정이 딱딱하게 굳어졌습니다.\n\n(세다리 발각 - GAME OVER)',
    message: '',
    choices: [],
  },
  // 18:00 주점 → 뒷정리 후 귀가. 시온·리쿠·유우시의 오후 답장이 모두 끝나야(SYNC_DAY5_PUB) 한 번만 뜸
  P3_Pub_Skip: {
    delay: 10,
    isSystem: true,
    alert: '18:00 ~ 23:00\n정신없이 바빴던 축제 주점이 끝나고\n뒷정리 후 집으로 돌아왔습니다',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Night_Msg' }],
  },
  // 23:35 번따 사건 직후 (Day 5 단톡방 스크립트가 생기면 holdNodes { c: 'P4_Night_Msg' } 로 단톡방 뒤에 도착)
  P4_Night_Msg: {
    delay: 18,
    message: '단톡방 얘기 뭐야 ?\n아까 번호 물어봤던 테이블 어디야\n안 줬지 ?',
    choices: [
      { id: 'A', text: '당연히 안 줬지!!\n내 눈에 유우시밖에 안 보이거든 ❤️', susp: -10, next: 'P4_Night_Good' },
      { id: 'B', text: '바빠 죽겠는데 무슨 번호야 ㅋㅋ\n바로 거절했어!', susp: 0, next: 'P4_Night_Normal' },
    ],
  },
  P4_Night_Good: {
    delay: 6,
    message: '다행이네 ..\n아까 내내 신경 쓰여서 죽는 줄 알았네\n내일은 내 옆에 붙어 있어 ~~',
    choices: [{ id: 'A', text: '웅 유우시도 잘 자 ❤️', susp: 0, next: 'end' }],
  },
  P4_Night_Normal: {
    delay: 6,
    message: '잘했어\n내일도 사람 많을 텐데 내 옆에서 일해\n피곤할 텐데 얼른 자\n사랑해',
    choices: [{ id: 'A', text: '웅 내일 봐!!', susp: 0, next: 'end' }],
  },
}

/** Day 5: 밤 방문 제안 교차 판정 (시온 Day 5 의 방문 제안 페이즈에도 같은 키를 달아주세요) */
export const SYNC_DAY5_NIGHT = 'day5-night'
/** Day 5: 시온의 밤 방문 제안을 승낙하면 켜짐 (시온 Day 5 스크립트에서 setFlag 예정) */
export const FLAG_DAY5_SION_VISIT = 'day5-sion-visit'
/** Day 5: 리쿠의 밤 방문 제안을 승낙하면 켜짐 */
export const FLAG_DAY5_RIKU_VISIT = 'day5-riku-visit'

/**
 * 리쿠 Day 5 (축제 첫날): 후드집업 입고 가기 / 쇼핑백 → 부스 세팅 → (주점 종료 팝업은 유우시 방)
 * → 밤 질투 & 기습 방문 (시온 방문과 겹치면 즉사)
 */
const RIKU_DAY5: Record<string, PhaseNode> = {
  P1_Morning: {
    preWork: true,
    message: '여주야 일어낫어?? ㅎㅎ\n오늘 바람 좀 불던데\n저번에 빌려준 내 후드집업\n오늘 입고 오면 안 돼?? ㅎㅎ\n여주가 입은 거 보고 시퍼 ❤️',
    choices: [
      { id: 'A', text: '웅 알겠어\n리쿠 옷 입고 나갈게 ㅎㅎ ❤️', susp: -15, setFlag: FLAG_DAY5_RIKU_HOODIE_WEAR, next: 'P1_Wear_Yes' },
      {
        id: 'B',
        text: '입고 가면 일하다 더러워질까 봐 ㅠㅠ\n쇼핑백에 접어서 들고 갈게!',
        susp: 0,
        setFlag: FLAG_DAY5_RIKU_HOODIE_BAG,
        next: 'P1_Bring_Bag',
      },
    ],
  },
  P1_Wear_Yes: {
    preWork: true,
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_HOODIE,
    message: '헐 진짜?!?!\n귀엽겟당...ㅎㅎ\n이따 보자 ❤️',
    choices: [{ id: 'A', susp: 0, next: 'P2_Afternoon_Wear' }],
  },
  P1_Bring_Bag: {
    preWork: true,
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_HOODIE,
    message: '에이\n입은 거 보고 시펏는데 아쉽다 ㅠㅠ\n그롬 이따 몰래 나한테 전달해 줘 ㅎㅎ\n이따 봐 ❤️',
    choices: [{ id: 'A', susp: 0, next: 'P2_Afternoon_Bag' }],
  },
  // 15:10 부스 세팅 중 [입고 간 경우] (유우시 방 P2_Wear_Msg 와 동시 진행)
  P2_Afternoon_Wear: {
    delay: 4,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: '여주야 내 옷 입으니까 진짜 완전 귀엽다 ㅠㅠ\n소매 남는 거 기여웡\n자꾸 표정관리가 안 되넹 ㅜ',
    choices: [{ id: 'A', text: '티 내지 마 ㅋㅋㅋㅋ\n애들 다 보잖아 ㅎㅎ', susp: 0, next: 'P4_Night_Jealous' }],
  },
  // 15:10 부스 세팅 중 [쇼핑백에 들고 간 경우] → 직후 유우시 방 P2_Bag_Bomb 추궁 (오답 시 유우시 방에서 게임오버)
  P2_Afternoon_Bag: {
    delay: 4,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: '여주야 쇼핑백 어디 둿어??\n애들 안 볼 때 내가 얼른 챙길게 ㅎㅎ',
    choices: [{ id: 'A', text: '어 잠깐만 테이블 밑에 뒀는데...', susp: 0, next: 'P4_Night_Jealous' }],
  },
  // 23:35 주점 종료 팝업(유우시 방) 뒤 질투 & 기습 방문
  P4_Night_Jealous: {
    delay: 4,
    message: '여주야 단톡방 얘기 뭐야??\n아까 번호 물어본 남자 누구야 진짜 안 줫지?!?! ㅠㅠ\n내가 옆에 계속 붙어 잇엇어야 햇는데 짜증 나...',
    choices: [{ id: 'A', text: '당연히 안 줬지!! 일하느라 바로 거절했어 ㅠㅠ', susp: 0, next: 'P4_Night_Visit' }],
  },
  P4_Night_Visit: {
    delay: 3,
    nextCheckGlobal: SYNC_DAY5_NIGHT,
    message: '안 되겟어\n단둘이서 잠깐이라도 봐야 맘 놓일 거 같아 ㅠㅠ\n아이스크림 사서 여주 집 갈랭\n잠깐만 나와조 ❤️',
    choices: [
      { id: 'A', text: '웅 고마워 ㅠㅠ\n집 앞에서 잠깐 보자 ❤️', susp: 0, setFlag: FLAG_DAY5_RIKU_VISIT, next: 'CHECK_SION_VISIT_CLASH' },
      { id: 'B', text: '헉\n나 지금 씻고 누워서 못 나가 ㅠㅠ\n마음만 받을게\n미아내용 ㅜ', susp: 10, next: 'P4_Reject_Riku' },
    ],
  },
  // 시온 방문도 승낙했으면 즉사, 아니면 리쿠 단독 만남
  CHECK_SION_VISIT_CLASH: {
    delay: 4,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY5_SION_VISIT], to: 'P4_Dead_Clash' },
      { none: [FLAG_DAY5_SION_VISIT], to: 'P4_Safe_Riku' },
    ],
  },
  P4_Reject_Riku: {
    delay: 6,
    message: '헐\n벌써 누웟어...?\n그롬 어쩔 수 없징...\n푹 자 여주야',
    choices: [{ id: 'A', text: '고마워 리쿠도 얼른 쉬어 ❤️', susp: 0, next: 'end' }],
  },
  P4_Safe_Riku: {
    isSystem: true,
    alert: '집 앞에서 리쿠를 만나\n달래줬습니다!',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P4_Safe_Riku_After' }],
  },
  P4_Safe_Riku_After: {
    delay: 6,
    message: '얼굴 보니까 이제 살 거 같아 ㅎㅎ\n잘 자\n사랑해애애❤️',
    choices: [{ id: 'A', text: '나도 사랑해 조심히 들어가 ❤️', susp: -10, next: 'end' }],
  },
  P4_Dead_Clash: {
    gameOver: true,
    alert:
      "현관문을 열고 나가자\n아이스크림 봉투를 든 리쿠와\n야식 봉투를 든 시온이\n정면으로 마주친 채 얼어붙어 있습니다...\n\n리쿠: '...시온이 형? 형이 왜 이 시간에 여주 집 앞에 잇어?'\n\n(세다리 발각 - GAME OVER)",
    message: '',
    choices: [],
  },
}

/**
 * 시온 Day 5 (축제 첫날): 대영 스토리 질투 → (주점 종료 팝업은 유우시 방)
 * → 밤 야식 방문 제안 (리쿠 방문과 겹치면 리쿠 방에서 즉사 판정)
 */
const SION_DAY5: Record<string, PhaseNode> = {
  // 대영이 국밥 스토리(afterWork)가 부스 세팅 이후에 올라오므로, 시온은 출근 전 모닝톡으로 먼저 시작
  P1_Morning: {
    preWork: true,
    message: '여주야 잘 잤어??\n오늘 축제 첫날이라며\n바쁘겠다 ㅠㅠ 무리하지 마',
    choices: [
      { id: 'A', text: '웅 ㅠㅠ 오늘 하루종일 정신없을 듯\n틈틈이 연락할게 ❤️', susp: 0, reply: '응 ㅋㅋ 이따 부스에서 봐 ❤️', next: 'P1_Insta_Jealous' },
      { id: 'B', text: '괜찮아 ㅎㅎ\n끝나고 연락할게!!', susp: 0, reply: '응 ㅋㅋ 이따 부스에서 봐 ❤️', next: 'P1_Insta_Jealous' },
    ],
  },
  P1_Insta_Jealous: {
    delay: 18,
    message: '대영이 스토리 봤는데\n점심 대영이랑 먹었네?\n나한테는 밥 먹자는 말도 없더니 ㅎㅎ',
    choices: [
      { id: 'A', text: '료랑 대영이랑 수업 가기 전에 먹었지 ㅎㅎ\n질투하지 망 ❤️', susp: -5, next: 'P1_Insta_Good' },
      { id: 'B', text: '수업 전이라 같이 먹었어 ㅎㅎ\n저번에 너 찍어준 게 더 잘나왔는데?', susp: 0, next: 'P1_Insta_Norm' },
    ],
  },
  // 답장 후 주점 종료 팝업(유우시 P3_Pub_Skip)이 끝날 때까지 대기
  P1_Insta_Good: {
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: 'ㅎㅎ 진짜지?\nㅋㅋㅋㅋ 알겠어\n나중에 보자 ❤️',
    choices: [{ id: 'A', text: '웅 이따 보자!!', susp: 0, next: 'P3_Night_Visit' }],
  },
  P1_Insta_Norm: {
    delay: 6,
    nextCheckGlobal: SYNC_DAY5_PUB,
    message: 'ㅋㅋㅋㅋㅋ 그래?\n동생들 너무 잘 챙겨주는 거 아니야? ㅎㅎ\n이따가 봐',
    choices: [{ id: 'A', text: 'ㅋㅋㅋㅋ 부스에서 봐!', susp: 0, next: 'P3_Night_Visit' }],
  },
  // 23:38 리쿠 방문 제안과 동시 진행 (둘 다 답해야 다음으로)
  P3_Night_Visit: {
    delay: 32,
    nextCheckGlobal: SYNC_DAY5_NIGHT,
    message: '오늘 일하느라 저녁도 제대로 못 먹었지\n먹고 싶은 거 포장해갈까?\n내려올래?\n내가 올라가도 되고 ㅎㅎ\n얼굴 보고 가고 싶어서 ❤️',
    choices: [
      { id: 'A', text: '헐 고마워 ㅠㅠ\n곧 나갈게 ❤️', susp: 0, setFlag: FLAG_DAY5_SION_VISIT, next: 'CHECK_RIKU_VISIT_CLASH' },
      { id: 'B', text: '아 어떡해\n나 벌써 씻고 누웠어 ㅠㅠ', susp: 10, next: 'P3_Reject_Sion' },
    ],
  },
  // 리쿠도 승낙했으면 리쿠 방 P4_Dead_Clash 에서 게임오버 (중복 팝업 방지로 여기선 종료)
  CHECK_RIKU_VISIT_CLASH: {
    delay: 4,
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY5_RIKU_VISIT], to: null },
      { none: [FLAG_DAY5_RIKU_VISIT], to: 'P3_Safe_Sion' },
    ],
  },
  P3_Reject_Sion: {
    delay: 6,
    message: '벌써 누웠어?\n아쉽네...\n알겠어 오늘 고생 많았으니까 푹 자',
    choices: [{ id: 'A', text: '너도 잘 자', susp: 0, next: 'end' }],
  },
  P3_Safe_Sion: {
    isSystem: true,
    alert: '집 앞에서 시온이 사 온 야식을 받으며\n다정하게 인사를 나눴습니다!',
    message: '',
    choices: [{ id: 'A', susp: 0, next: 'P3_Safe_Sion_After' }],
  },
  P3_Safe_Sion_After: {
    delay: 2,
    message: '잠깐이라도 얼굴 보니까 피로가 다 풀리네 ㅎㅎ\n맛있게 먹고 푹 자 사랑해 ❤️',
    choices: [{ id: 'A', text: '고마워 조심히 들어가 사랑해 ❤️', susp: -10, next: 'end' }],
  },
}

/* ─────────────────────── 6일 차 (11/11 빼빼로데이) ─────────────────────── */
/** Day 6: 동방 냉장고 빼빼로 결과를 정하는 동기화 키 (리쿠 Day 6 스크립트도 같은 키를 쓰면 함께 대기) */
export const SYNC_DAY6_FRIDGE = 'day6-fridge'
/** Day 6: 리쿠가 동방 냉장고 빼빼로를 가져감 → 시온 쪽은 대화 종료 (게임 오버는 리쿠 방에서 처리) */
export const FLAG_DAY6_RIKU_TAKE = 'day6-riku-take'
/** Day 6: 세 명의 오후 빼빼로 대화가 모두 끝나야 밤 11:40 카톡이 도착 */
const SYNC_DAY6_NIGHT = 'day6-night'
const DAY6_PUB_TRANSITION = '⏳ [축제 주점 마지막 날 영업 및 뒷정리 중...] (16:00 ~ 23:30) ⏳'

const SION_DAY6: Record<string, PhaseNode> = {
  // 오전 11:30
  P1_Morning: {
    preWork: true,
    message: '여주 일어났어?\n어제 늦게까지 일해서 피곤할 텐데\n눈 뜨자마자 또 보고 싶네\n근데\n오늘 빼빼로데이인데 내 거는 없나 ㅎㅎ',
    choices: [
      { id: 'A', text: '동방 냉장고 맨 안쪽에\n몰래 넣어뒀지 ㅎㅎ\n아무도 없을 때 챙겨 가 ❤️', susp: -5, next: 'P1_Sweet' },
      { id: 'B', text: '당연히 준비했지!! 동방 냉장고 안쪽에\n숨겨놨어 ㅎㅎ', susp: 0, next: 'P1_Sweet' },
    ],
  },
  // 오전 11:32 — 동방 냉장고 결과는 SYNC_DAY6_FRIDGE 충족 뒤 결정
  P1_Sweet: {
    preWork: true,
    nextCheckGlobal: SYNC_DAY6_FRIDGE,
    message: '진짜? ㅋㅋㅋ\n어쩐지 아침부터 기분 좋더라\n나 2시쯤 동방 들러서 챙겨갈게\n기대된다',
    choices: [{ id: 'A', text: '웅 이따 챙기면 카톡 해 ㅎㅎ\n나도 사랑해 ❤️', susp: 0, next: 'CHECK_FRIDGE_SION' }],
  },
  // 오후 3:30 — 리쿠가 가져갔으면 리쿠 방에서 게임 오버 (중복 팝업 방지로 여기선 종료)
  CHECK_FRIDGE_SION: {
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY6_RIKU_TAKE], to: null },
      { none: [FLAG_DAY6_RIKU_TAKE], to: 'P2_Fridge_Safe' },
    ],
  },
  P2_Fridge_Safe: {
    redirect: { flag: FLAG_DAY6_RIKU_TAKE, to: null },
    nextCheckGlobal: SYNC_DAY6_NIGHT,
    transitionText: DAY6_PUB_TRANSITION,
    message: '아까 동방 냉장고에서 빼빼로 잘 챙겼어 ㅎㅎ\n방금 동방 나오는 리쿠랑 마주쳤는데\n못 본 눈치더라 ㅎㅎ\n모양 완전 귀엽던데\n아까워서 어떻게 먹지?\n만드는 내내 내 생각 했을 거 아냐',
    choices: [
      { id: 'A', text: 'ㅋㅋㅋ 당연하지!\n이따 집 가서 맛있게 먹어 ❤️', susp: -5, reply: '응 ㅎㅎ\n고마워 공주', next: 'P3_Night_Cling' },
    ],
  },
  // 오후 11:40 — 주점 마지막 날 마감 후 (STAFF_DAY6 단톡방이 생기면 holdNodes { a: 'P3_Night_Cling' } 로 뒤에 도착)
  P3_Night_Cling: {
    delay: 5,
    message: '오늘 주점 마지막 날까지 고생 많았어\n집에는 잘 들어갔고?\n솔직히 말해서\n오늘 부스에서 일하는 내내\n다른 애들이 다 너만 쳐다보는 것 같아서\n솔직히 좀 불안해\n나만 너 좋아하는 거 아니지? ㅎㅎ',
    choices: [
      { id: 'A', text: '바보야...\n내가 너를 더 좋아하거든?\n나도 오늘 내내 너만 봤어 ❤️', susp: -10, next: 'P3_Night_Sweet1' },
      { id: 'B', text: '에이 기분 탓이야 ㅋㅋ\n오늘 너무 피곤했나 보네\n얼른 푹 쉬어!', susp: 10, next: 'P3_Night_Sulk' },
    ],
  },
  P3_Night_Sweet1: {
    delay: 2,
    message: '진짜지\n사람들 앞에서 내 거라고 자랑도 못 하고\n몰래 눈만 마주치는 거 힘드네 ㅎㅎ\n그냥 확 공개해버릴까?',
    choices: [{ id: 'A', text: '조금만 참아 ㅎㅎ\n내일 뒤풀이 끝나면 둘이서만 오래 있자 ❤️', susp: -5, next: 'P3_Night_Sweet2' }],
  },
  P3_Night_Sweet2: {
    delay: 3,
    message: '약속했다?\n내일 뒷풀이 끝나고 우리집 가자\n안 보내줄 거니까 ㅎㅎ\n내 꿈 꿔\n[[대기:5]]\n사랑해',
    choices: [{ id: 'A', text: '웅 내일 봐 사랑해 시온아 ❤️', susp: 0, next: 'end' }],
  },
  P3_Night_Sulk: {
    delay: 2,
    message: '나는 진심으로 불안해서 하는 말인데 ㅠㅠ\n야속하네...\n잘 자',
    choices: [{ id: 'A', text: '미안해...\n너도 잘 자', susp: 0, next: 'end' }],
  },
}

/**
 * 리쿠 Day 6: 오후 1:50 동방 냉장고에서 시온 몫 빼빼로 발견
 * → 가져가라고 하면 오후 3:35 시온과 마주쳐 게임 오버, 아니면 부스에서 선물 전달 → 밤 술주정
 */
const RIKU_DAY6: Record<string, PhaseNode> = {
  P1_Fridge_Find: {
    preWork: true,
    message: '여주\n나 앞치마 가지러 동방 왓는데\n냉장고에 리본 묶인 수제 빼빼로 상자가 잇어!!\nㅎㅎ\n이거 리쿠거 맞징❤️',
    choices: [
      {
        id: 'A',
        text: '웅 맞아!!\n리쿠 주려고 몰래 넣어둔 거야 ㅎㅎ\n얼른 챙겨 ❤️',
        susp: 0,
        setFlag: FLAG_DAY6_RIKU_TAKE,
        next: 'P1_Take_Confirm',
      },
      {
        id: 'B',
        text: '헉... 다른 애 건가 봐 ㅠㅠ\n리쿠 거는 내 가방에 따로 챙겨왔어!\n직접 줄게...!',
        susp: 0,
        next: 'P1_Stop_Safe',
      },
    ],
  },
  P1_Take_Confirm: {
    preWork: true,
    delay: 4,
    nextCheckGlobal: SYNC_DAY6_FRIDGE,
    message: '헤헤 역시 내 거 맞지?!\n여주 진짜 천사야 ㅠㅠ\n지금 들고 동방 나가는 중!!\n신난당 ❤️',
    choices: [{ id: 'A', text: '웅\n이따 부스에서 보자 ㅎㅎ', susp: 0, next: 'P2_Dead_Fridge' }],
  },
  P1_Stop_Safe: {
    preWork: true,
    delay: 4,
    nextCheckGlobal: SYNC_DAY6_FRIDGE,
    message: '아 진짜?!\n혼자 김칫국 마셧네 ㅋㅋㅋ\n빨리 3시 됏으면 좋겟어\n여주 얼굴도 보구\n빼빼로도 받을랭',
    choices: [{ id: 'A', text: '귀여워 ㅋㅋㅋ\n냉장고 건 그대로 두고\n이따 부스에서 봐 ❤️', susp: 0, next: 'P2_Booth_Gift' }],
  },
  // 오후 3:35 — 시온·유우시 방은 같은 플래그로 조용히 종료, 게임 오버 팝업은 여기서만
  P2_Dead_Fridge: {
    gameOver: true,
    alert: '동아리방 문 앞에서 시온과 리쿠가\n빼빼로 상자를 두고 마주쳤습니다\n\n(세다리 발각 - GAME OVER)',
    message:
      '여주야...\n나 방금 상자 들고\n동방 문 열다가 시온이 형이랑 마주쳣는데\n형이 이거 자기 거라는데...?\n뭐야??\n[[대기:8]]\n방금 형 폰으로 여주가 보낸 카톡 다 봣어\nㅋㅋ...\n여주 간도 크네\n우리 갖고 논 거야?',
    choices: [],
  },
  P2_Booth_Gift: {
    nextCheckGlobal: SYNC_DAY6_NIGHT,
    transitionText: DAY6_PUB_TRANSITION,
    message: '빼빼로 넘 고마워 ㅎㅎ\n여주가 만들엇을 거 상상하니까\n넘 행복해서 입꼬리가 안 내려가넹',
    choices: [
      {
        id: 'A',
        text: '누가 보면 어쩌려구 ㅋㅋㅋ\n이따 주점 마지막 날도 파이팅하자 ❤️',
        susp: -5,
        reply: '웅웅!! 오늘 여주 옆에 딱 붙어 잇어야지~',
        next: 'P3_Night_Drunk',
      },
    ],
  },
  // 오후 11:40 — 주점 마지막 날 마감 후
  P3_Night_Drunk: {
    delay: 20,
    message:
      '여주야 집 잘 들어갓어??\n나 아까 맥주 한 캔 마셧더니 알딸딸하네 ㅎㅎ...\n근데 술 마시니까\n여주 더 보고 시퍼서 미치겟어 ㅠㅠ\n요즘 단둘이 손도 못 잡구...\n나 혼자만 안달 나 잇는 거 같아서\n가끔 막 불안하구 속상해 ㅠㅠ\n여주도 나 많이 좋아하는 거 맞지...?\n나 버리면 안 돼',
    choices: [
      { id: 'A', text: '오늘 맥주 한 캔에 취했네 ㅋㅋㅋ\n아무 일도 없으니까 걱정 말고 푹 자!', susp: 10, next: 'P3_Night_Sulk' },
      { id: 'B', text: '내가 리쿠를 왜 버려 바보야 ㅠㅠ\n나도 오늘 얼마나 참았는데 ❤️', susp: -10, next: 'P3_Night_Sweet1' },
    ],
  },
  P3_Night_Sweet1: {
    delay: 2,
    message: '진짜지...?\n그 말 들으니까 갑자기 눈물 날 거 같아\n넘 조아서...\n나 진짜 여주 없으면 안 된단 말이야\n맨날맨날 나만 봐야 해 ㅠㅠ',
    choices: [{ id: 'A', text: '당연하지 내일 뒤풀이 끝나고\n리쿠 실컷 안아줄게 ㅎㅎ 얼른 자 ❤️', susp: -5, next: 'P3_Night_Sweet2' }],
  },
  P3_Night_Sweet2: {
    delay: 3,
    message: '응!! 내일 뒤풀이 끝나구\n꼭 나랑만 잇어야 해 약속햇다?!\n사랑해',
    choices: [{ id: 'A', text: '나도 사랑해 리쿠야 잘 자 ❤️', susp: 0, next: 'end' }],
  },
  P3_Night_Sulk: {
    delay: 2,
    message: '취해서 그런 거 아닌데...\n여주한테 사랑한다구 듣고 싶엇는데 ㅠㅠ\n치사해... 그래두 잘 자 내일 봐 ❤️',
    choices: [{ id: 'A', text: '사랑해 리쿠야 ㅎㅎ 푹 자 ❤️', susp: 0, next: 'end' }],
  },
}

/** 유우시 Day 6: 낮 빼빼로 약속 → 오후 3:40 똑같은 리본 상자 추궁 → 밤 어리광 */
const YUSHI_DAY6: Record<string, PhaseNode> = {
  // 오후 12:00
  P1_Morning: {
    preWork: true,
    message: '일어났어 ?\n오늘 축제 마지막 날이네\n오늘 빼빼로데이 ?\n그거 맞지',
    choices: [
      { id: 'A', text: '웅!! 오늘 빼빼로데이니까\n유우시 줄 것도\n가방에 챙겨놨어 ㅎㅎ\n이따 몰래 줄게 ❤️', susp: -5, next: 'P1_Sweet' },
      { id: 'B', text: '당연히 네 것도 있지!!\n이따 부스에서 보장', susp: 0, next: 'P1_Sweet' },
    ],
  },
  P1_Sweet: {
    preWork: true,
    delay: 4,
    nextCheckGlobal: SYNC_DAY6_FRIDGE,
    message: '진짜 ?\n벌써 설레네 ㅎㅎ\n나중에 보자',
    choices: [{ id: 'A', text: '웅 이따 부스에서 봐 ❤️', susp: 0, next: 'CHECK_FRIDGE_YUSHI' }],
  },
  // 리쿠가 가져갔으면 리쿠 방에서 게임 오버 (중복 팝업 방지로 여기선 종료)
  CHECK_FRIDGE_YUSHI: {
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_DAY6_RIKU_TAKE], to: null },
      { none: [FLAG_DAY6_RIKU_TAKE], to: 'P2_Ribbon_Ask' },
    ],
  },
  // 오후 3:40
  P2_Ribbon_Ask: {
    redirect: { flag: FLAG_DAY6_RIKU_TAKE, to: null },
    message:
      '빼빼로 고마워 ㅎㅎ\n근데\n[[대기:5]]\n아까 짐 정리하다 보니까\n시온이 형이랑 리쿠 가방에도\n네가 준 거랑 똑같은 리본 상자 있던데\n둘한테도 준 거야...?',
    choices: [
      { id: 'A', text: '그건 그냥 의리로 돌린 거고\n손편지랑 하트 초코 넣은 건\n유우시 거 하나뿐이야 ㅎㅎ', susp: -5, next: 'P2_Ribbon_Good' },
      { id: 'B', text: '상자 흔한 거라 겹쳤나 봐 ㅋㅋ\n내가 챙겨준 건 유우시 거밖에 없어!', susp: 10, next: 'P2_Ribbon_Doubt' },
    ],
  },
  P2_Ribbon_Good: {
    delay: 2,
    nextCheckGlobal: SYNC_DAY6_NIGHT,
    transitionText: DAY6_PUB_TRANSITION,
    message: '아 의리 ㅎㅎ\n편지 너무 좋다 ~~\n아껴 먹을게\n고마워',
    choices: [{ id: 'A', text: '헤헤 이따 집 가서 맛있게 먹어 ❤️', susp: 0, reply: '응 ㅎㅎ', next: 'P3_Night_Cling' }],
  },
  P2_Ribbon_Doubt: {
    delay: 2,
    nextCheckGlobal: SYNC_DAY6_NIGHT,
    transitionText: DAY6_PUB_TRANSITION,
    message: '그래 ?\n리본 모양까지 똑같던데...\n너한테는 나만 특별했으면 좋겠어',
    choices: [{ id: 'A', text: '웅 유우시 옆에 딱 붙어 있을게 ❤️', susp: 0, reply: '이따 봐 ㅎㅎ', next: 'P3_Night_Cling' }],
  },
  // 오후 11:40 — 주점 마지막 날 마감 후
  P3_Night_Cling: {
    delay: 35,
    message:
      '집 잘 들어갔어 ?\n여주야 사실\n요즘 네가 다른 사람들이랑\n웃고 얘기하는 거 볼 때마다\n마음이 좀 그래\n너도 나만큼 내 생각 많이 해 ?\n여주 보고 싶어서 잠이 안 오네...',
    choices: [
      {
        id: 'A',
        text: '나도 유우시 생각밖에 안 해 ㅠㅠ\n불안하게 해서 미안해\n내일 뒤풀이 끝나고 둘이서만 있자!!',
        susp: -10,
        next: 'P3_Night_Sweet1',
      },
      { id: 'B', text: '그런 걱정을 왜 해!! ㅎㅎ\n피곤할 텐데 얼른 자!', susp: 10, next: 'P3_Night_Sulk' },
    ],
  },
  P3_Night_Sweet1: {
    delay: 2,
    message: '미안할 건 없는데 그냥 ㅎㅎ\n그렇게 말해주니까 마음이 놓이네\n여주 끌어안고 자고 싶다',
    choices: [{ id: 'A', text: '나도 ㅠㅠ 오늘 피곤할 텐데\n내 생각 하면서 푹 자 ❤️', susp: -5, next: 'P3_Night_Sweet2' }],
  },
  P3_Night_Sweet2: {
    delay: 3,
    message: '응 내일 뒤풀이 때 보자\n잘 자 사랑해 ^_^',
    choices: [{ id: 'A', text: '웅 사랑해 ❤️', susp: 0, next: 'end' }],
  },
  P3_Night_Sulk: {
    delay: 2,
    message: '너한테만 이러는 건데...\n내일은 나 좀 더 많이 봐줘\n잘 자',
    choices: [{ id: 'A', text: '알겠어 ㅎㅎ 내일 봐 잘 자 ❤️', susp: 0, next: 'end' }],
  },
}

/* ─────────────────────── 7일 차 (축제 마지막 날 · 뒤풀이) ───────────────────────
 * 선택지 없이 시온(0초) → 리쿠(5초) → 유우시(10초) 순으로 카톡이 도착하고,
 * 마지막 카톡 이후 최종 선택 화면이 열립니다.
 */
const DAY7_TIMING: Record<'a' | 'b' | 'c', PhaseTiming> = {
  a: { initialDelay: 0, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 0 },
  b: { initialDelay: 10, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 0 },
  c: { initialDelay: 20, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 0 },
}

const SION_DAY7: Record<string, PhaseNode> = {
  P1_Morning: {
    message: '일어났어?\n어제에 한 약속 안 잊었지?\n이따 뒤풀이 끝나고 우리 집 가는 거다 ❤️',
    choices: [],
  },
}

const RIKU_DAY7: Record<string, PhaseNode> = {
  P1_Morning: {
    message: '여주야아 잘 잣어?? ㅎㅎ\n오늘 저녁에 뒤풀이당!!\n어제 약속한 대로 이따 뒤풀이 끝나구\n꼭 나랑만 잇어야 해 알겟지?! ❤️',
    choices: [],
  },
}

const YUSHI_DAY7: Record<string, PhaseNode> = {
  P1_Morning: {
    message: '일어났어 ?\n오늘 부스 정리만 하면 축제 진짜 끝이네\n이따 뒤풀이 끝나고 나랑 따로 보기로 한 거 잊지 마 ^_^',
    choices: [],
  },
}

export const SCRIPTS: Record<string, Script> = {
  ...sampleDay(),
  a: fromPhases('P1_Start', SION_DAY1, SAMPLE_TIMING.a),
  b: fromPhases('P1_Start', RIKU_DAY1, SAMPLE_TIMING.b),
  c: fromPhases('P1_Start', YUSHI_DAY1, SAMPLE_TIMING.c),
}

/** 일차별 대화. 그날 스크립트가 없는 멤버는 그날 카톡이 오지 않습니다. */
export const DAY_SCRIPTS: Record<number, Record<string, Script>> = {
  1: SCRIPTS,
  2: {
    ...sampleDay(),
    a: fromPhases('P0_Morning', SION_DAY2, SAMPLE_TIMING.a),
    b: fromPhases('P0_Morning', RIKU_DAY2, SAMPLE_TIMING.b),
    c: fromPhases('P0_Morning', YUSHI_DAY2, SAMPLE_TIMING.c),
  },
  3: {
    a: fromPhases('P1_Morning', SION_DAY3, SAMPLE_TIMING.a),
    b: fromPhases('P1_Morning', RIKU_DAY3, SAMPLE_TIMING.b),
    c: fromPhases('P1_Morning', YUSHI_DAY3, SAMPLE_TIMING.c),
  },
  4: {
    a: fromPhases('P1_Morning', SION_DAY4, SAMPLE_TIMING.a),
    b: fromPhases('P1_Morning', RIKU_DAY4, SAMPLE_TIMING.b),
    c: fromPhases('P1_Morning', YUSHI_DAY4, SAMPLE_TIMING.c),
  },
  5: {
    a: fromPhases('P1_Morning', SION_DAY5, SAMPLE_TIMING.a),
    b: fromPhases('P1_Morning', RIKU_DAY5, SAMPLE_TIMING.b),
    c: fromPhases('P1_Morning', YUSHI_DAY5, SAMPLE_TIMING.c),
    daeyoung: fromPhases('P1_Morning', DAEYOUNG_DAY5, DAEYOUNG_DAY5_TIMING),
  },
  6: {
    a: fromPhases('P1_Morning', SION_DAY6, SAMPLE_TIMING.a),
    b: fromPhases('P1_Fridge_Find', RIKU_DAY6, SAMPLE_TIMING.b),
    c: fromPhases('P1_Morning', YUSHI_DAY6, SAMPLE_TIMING.c),
  },
  7: {
    a: fromPhases('P1_Morning', SION_DAY7, DAY7_TIMING.a),
    b: fromPhases('P1_Morning', RIKU_DAY7, DAY7_TIMING.b),
    c: fromPhases('P1_Morning', YUSHI_DAY7, DAY7_TIMING.c),
  },
}

/* ──────────── 단톡방 이벤트 ───────────── */

/** unread: 말풍선 옆 안 읽은 사람 수. 더 작은 숫자의 메시지가 오면 이전 말풍선 숫자도 함께 줄어듭니다 (읽음 연출) */
export type GroupLine = { sender: string; text: string; delayMs: number; unread?: number; images?: string[] }
export type GroupChoice = { id: string; text: string; reply: GroupLine[]; setFlag?: string }
export type GroupScript = {
  /** 일차 시작(또는 afterAllChats 달성) 후 첫 메시지까지 (ms) */
  startDelayMs: number
  /** true 면 그날 모든 남자와의 대화가 끝난 뒤에 단톡방 이벤트 시작 */
  afterAllChats?: boolean
  /** true 면 근무 종료 직후 시작하고, 남자들의 근무 후 카톡은 이 이벤트가 끝난 뒤에 도착 */
  afterWorkEnd?: boolean
  messages: GroupLine[]
  choices: GroupChoice[]
  /**
   * 지정하면 messages 대신 단계별로 진행합니다.
   * 각 단계는 그날 모든 남주의 대화가 holdNodes 의 노드에 도착(또는 대화 종료)했을 때 시작되고,
   * 해당 노드의 카톡은 그 단계의 단톡방 대화가 끝난 뒤에 도착합니다.
   */
  stages?: GroupStage[]
  /** 이 플래그 중 하나라도 켜져 있으면 stages 단톡방 대화가 나오지 않습니다. */
  skipIfFlags?: string[]
}

export type GroupStage = {
  /** 채팅방 id → 이 단계가 끝날 때까지 대기시킬 노드 id */
  holdNodes: Record<string, string>
  /** 지정하면 이 단계가 시작되기 직전에 화면 전체 안내 팝업을 띄웁니다 (시간 경과 연출) */
  interlude?: string
  messages: GroupLine[]
  /** 지정하면 메시지 후 플레이어가 고르고, 반응이 끝난 뒤에 대기 중인 카톡이 이어집니다. */
  choices?: GroupChoice[]
}

/** 이전 메시지 이후 2~7초 사이의 랜덤 간격 */
const randomGap = () => Math.floor(Math.random() * 5000) + 2000

const gl = (sender: string, text: string): GroupLine => ({ sender, text, delayMs: randomGap() })

/** 단톡방 발신자 (lib/template-config.ts 의 GROUP_MEMBERS 에서 이름 변경) */
const GROUP_SENDER = GROUP_MEMBERS.daeyoung.name

const G_SION = CHARACTERS.a.name
const G_RIKU = CHARACTERS.b.name
const G_YUSHI = CHARACTERS.c.name
const G_DAEYOUNG = GROUP_MEMBERS.daeyoung.name
const G_SAKUYA = GROUP_MEMBERS.sakuya.name
const G_RYO = GROUP_MEMBERS.ryo.name

/** Day 1 단톡방: 시식회 전 대화 → 시식회 팝업 → 시식회 후 해산 대화 */
const STAFF_DAY1: GroupScript = {
  startDelayMs: 5000,
  skipIfFlags: [FLAG_RIKU_LUNCH_RAMEN, FLAG_YUSHI_LUNCH_RAMEN],
  messages: [],
  choices: [],
  stages: [
    {
      // 1단계: 점심 카톡이 모두 끝나면 오후 발표 수업 팝업 → 단톡방 공지 → 시온의 '일찍 와(P2_Start)' 카톡만 해금!
      holdNodes: { a: 'P2_Start' },
      interlude: '13:00 ~ 16:30\n오후 발표 수업 진행 중...',
      messages: [
        gl(G_SION, '애들아 오늘 저녁 7시 동방에서 주점 메뉴 관련 회의랑 시식 있는 거 안 잊었지?'),
        gl(G_SION, '나 지금 일찍 가서 동방 테이블 먼저 세팅해 둘게~'),
        gl(G_RIKU, '나도 집 앞 마트에서 타코야끼 가루랑 소스 사서 출발햇어 ㅎㅎ'),
        gl(G_RYO, '오 리쿠 형 벌써 기대돼요 ㅋㅋㅋ 저랑 사쿠야는 음료수 사서 갈게요!'),
        gl(G_SAKUYA, '네!! 콜라랑 사이다 사서 올라가겠습니다 ㅎㅎ'),
        gl(G_DAEYOUNG, '오키 나도 과제 마무리하고 7시 맞춰서 바로 갈게 ㅋㅋ'),
        gl(G_YUSHI, '응 이따 동방에서 봐 ^_^'),
      ],
    },
    {
      // 2단계: 19:00 ~ 21:30 동아리 회의 및 시식회 종료 후 해산 → 세 남자의 밤 카톡 해금!
      holdNodes: { a: 'P3_Start', b: 'P4_Start', c: 'P4_Start' },
      interlude: '19:00 ~ 21:30\n동아리방에서 주점 메뉴 회의 중...',
      messages: [
        gl(G_DAEYOUNG, '와 오늘 리쿠 형이 해준 야끼소바 진짜 파는 거보다 맛있었어요 ㅋㅋㅋ'),
        gl(G_SAKUYA, 'ㅇㅈ 저 타코야끼 열 알은 먹은 듯 ㅋㅋㅋ'),
        gl(G_RIKU, '다들 맛잇게 먹어줘서 고마워 ㅎㅎ 주점 대박 날 듯!!'),
        gl(G_RYO, '오늘 다들 고생하셨어요 조심히 들어가세요~!!'),
        gl(G_SION, '다들 오늘 고생 많았어 ㅋㅋ 잘 들어가고 내일 주점 장보기 팀은 내일 단톡방에서 나누자!'),
      ],
    },
  ],
}

/** Day 2 단톡방: 오전 10시 장보기 팀 나누기 (선택 결과가 시온의 분기를 결정) */
const STAFF_DAY2: GroupScript = {
  startDelayMs: 3000,
  messages: [],
  choices: [],
  stages: [
    {
      holdNodes: { a: 'Branch_Group', b: 'Branch_Group' },
      messages: [
        gl(G_SION, '애들아 어제 말한 대로 주점 장보기 팀 나누자 ㅋㅋ'),
        gl(G_SION, '나는 차 끌고 이마트 가서 식재료랑 음료 사 올게'),
        gl(G_RIKU, '나도 다이소 가서 앞치마랑 데코 소품 사 올게!'),
        gl(G_DAEYOUNG, '여주 누나는 어디 가실래요??'),
      ],
      choices: [
        {
          id: 'riku',
          text: '나는 리쿠랑 다이소 갈게!',
          setFlag: FLAG_SHOP_RIKU,
          reply: [gl(G_RIKU, '앗싸 ㅎㅎ 이따 정문에서 보자!'), gl(G_DAEYOUNG, '오키 그럼 이마트는 내가 시온이 형이랑 갈게')],
        },
        {
          id: 'sion',
          text: '나는 시온이랑 이마트 갈게!',
          setFlag: FLAG_SHOP_SION,
          reply: [gl(G_SION, '오키~ 2시까지 정문으로 와 ㅎㅎ'), gl(G_SAKUYA, '그럼 다이소는 제가 리쿠 형이랑 갈게여')],
        },
      ],
    },
  ],
}

/** Day 3 (일요일): 리쿠 자취방 데이트 팝업이 끝난 밤, 사쿠야 & 대영 영화관 단톡 → 그 뒤 리쿠 밤 카톡(P3_Night_Sweet) */
const STAFF_DAY3: GroupScript = {
  startDelayMs: 5000,
  messages: [],
  choices: [],
  stages: [
    {
      holdNodes: { b: 'P3_Night_Sweet' },
      messages: [
        {
          sender: G_SAKUYA,
          text: '사진 2장',
          images: ['/images/chat/sakuya_movie_1.jpg', '/images/chat/sakuya_movie_2.jpg'],
          delayMs: randomGap(),
        },
        gl(G_SAKUYA, '대영이 형이랑 영화 보러 왔어여 ㅎㅎ'),
        gl(G_DAEYOUNG, '사쿠야가 팝콘 라지 사이즈 시켜서 지갑 다 털림 ㅡㅡ'),
        gl(G_RYO, '헐 나만 빼고 갔네'),
        gl(G_SAKUYA, '응 아니야'),
        gl(G_RIKU, '오 재밋겟다 ㅋㅋㅋ'),
      ],
    },
  ],
}

const gl2 = (sender: string, text: string): GroupLine => ({ sender, text, delayMs: 2000 })

/** Day 4 단톡방: 17:40 동방 모이기 직전 저녁 메뉴 투표 (리쿠의 18:00 동방 작업 팝업 직전에 진행) */
const STAFF_DAY4: GroupScript = {
  startDelayMs: 3000,
  messages: [],
  choices: [],
  stages: [
    {
      holdNodes: { b: 'P4_Club_Work' },
      messages: [
        gl(G_SAKUYA, '저 너무 배고파여...'),
        gl2(G_RYO, '좀만 참아 어차피 다 같이 저녁 시켜 먹을 거잖아 ㅋㅋㅋ'),
        gl2(G_DAEYOUNG, '깔끔하게 치킨이나 피자 어때'),
        gl2(G_RIKU, '오 치킨 조타!!'),
        gl2(G_SION, '내가 가는 길에 콜라 큰 거 사 갈게 ㅋㅋ 여주는 뭐 먹고 싶어?'),
      ],
      choices: [
        {
          id: 'A',
          text: '나도 치킨 완전 찬성!!',
          reply: [
            gl2(G_YUSHI, '그럼 치킨 시키자 내가 배민으로 주문 넣어둘게'),
            gl2(G_SAKUYA, '오 치킨이면 인정이지 ㅎㅎ 사이드로 치즈볼도 추가해 주세용'),
            gl2(G_RYO, 'ㅋㅋㅋㅋ 돼지야'),
          ],
        },
      ],
    },
  ],
}

const gu = (sender: string, text: string, delaySec: number, unread: number): GroupLine => ({
  sender,
  text,
  delayMs: delaySec * 1000,
  unread,
})

/**
 * Day 5 단톡방: 23:30 주점 마감 후 귀가 → 번따 폭로.
 * 주점 종료 팝업 뒤, 세 남주의 밤 카톡(시온 P3_Night_Visit / 리쿠 P4_Night_Jealous / 유우시 P4_Night_Msg)보다 먼저 진행됩니다.
 * 시온·리쿠·유우시는 읽기만 하고 아무 말도 하지 않습니다 (안 읽음 숫자 0 = 싸한 정적).
 */
const STAFF_DAY5: GroupScript = {
  startDelayMs: 0,
  messages: [],
  choices: [],
  stages: [
    {
      holdNodes: { a: 'P3_Night_Visit', b: 'P4_Night_Jealous', c: 'P4_Night_Msg' },
      messages: [
        gu(G_RYO, '오늘 주점 하얗게 불태웠다 ㅠㅠ', 2, 5),
        gu(G_RYO, '다들 들어갔어요?', 1, 4),
        gu(G_DAEYOUNG, '오늘 사람 진짜 많았지...\n다들 일본음식을 좋아하나봐', 2, 3),
        gu(G_DAEYOUNG, '아 맞다\n아까 여주 누나 서빙하다가 번호 따임 ㅎㅎ', 1.5, 3),
        gu(G_RYO, '맞아\n나도 봤어\n누나 인기 많다\nㅋㅋㅋㅋㅋ', 1.5, 1),
        gu(G_SAKUYA, '헐 대박 ㅋㅋㅋ\n그래서 번호 줫어요??', 2, 0),
      ],
      choices: [{ id: 'A', text: '아 무슨 소리야 안 줬어 ㅋㅋㅋ\n다들 오늘 고생 많았어 얼른 쉬어!!', reply: [] }],
    },
  ],
}

/**
 * Day 6: 단톡방 대사 없이, 세 남주의 오후 빼빼로 대화가 모두 끝나(SYNC_DAY6_NIGHT) 밤 카톡 노드에 도착하면
 * 주점 마지막 날 전환 팝업을 띄운 뒤 밤 11:40 카톡들을 풀어줍니다.
 */
const STAFF_DAY6: GroupScript = {
  startDelayMs: 4000,
  skipIfFlags: [FLAG_DAY6_RIKU_TAKE],
  messages: [],
  choices: [],
  stages: [
    {
      // 1단계: 6일 차 부스 준비 중 사쿠야가 올리는 유우시 기빨림 짤
      holdNodes: { a: 'P2_Fridge_Safe', b: 'P2_Booth_Gift', c: 'P2_Ribbon_Ask' },
      messages: [
        {
          sender: G_SAKUYA,
          text: '사진',
          images: ['/images/chat/yushi_tired.jpg'],
          delayMs: 2000,
        },
        gl(G_SAKUYA, '우시 형 벌써 기빨리는 중 ㅋㅋㅋ'),
        gl(G_DAEYOUNG, 'ㅋㅋㅋㅋㅋ 영혼 나갔는데?'),
        gl(G_RYO, 'ㅋㅋㅋㅋㅋㅋㅋ'),
        gl(G_YUSHI, '야 그걸 왜 찍어...'),
        gl(G_YUSHI, '집 가고 싶다'),
        gl(G_RIKU, 'ㅋㅋㅋㅋㅋㅋㅋ'),
        gl(G_RIKU, '좀만 참아...'),
        gl(G_SION, '다들 조금만 더 힘내자'),
        gl(G_SION, '오늘만 버티면 끝이야~'),
      ],
    },
    {
      // 2단계: 오후 빼빼로 대화가 모두 끝난 뒤 주점 마지막 날 영업 팝업 -> 밤 11:40 카톡 해금
      holdNodes: { a: 'P3_Night_Cling', b: 'P3_Night_Drunk', c: 'P3_Night_Cling' },
      interlude: DAY6_PUB_TRANSITION,
      messages: [],
    },
  ],
}

/** 일차별 단톡방 이벤트 (키는 채팅방 id — chat-data.ts 의 단톡방 id 와 일치해야 함) */
const DAY_GROUP_SCRIPTS: Record<number, Record<string, GroupScript>> = {
  1: { staff: STAFF_DAY1 },
  2: { staff: STAFF_DAY2 },
  3: { staff: STAFF_DAY3 },
  4: { staff: STAFF_DAY4 },
  5: { staff: STAFF_DAY5 },
  6: { staff: STAFF_DAY6 },
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

/** 의심도 100 돌파 후 폭격 시작 전 정적 (ms) */
export const SPAM_START_DELAY_MS = 5000
/** 같은 캐릭터의 메시지가 하나씩 도착하는 간격 (ms) */
export const SPAM_INTERVAL_MS = 2000
/** 한 캐릭터의 마지막 메시지 후 다음 캐릭터까지의 간격 (ms) */
export const SPAM_SENDER_GAP_MS = 1000
/** 폭격이 끝난 뒤 게임오버 화면까지의 대기 (ms) */
export const SPAM_END_DELAY_MS = 1000
export const SUSPICION_100_GAME_OVER_TEXT =
  '의심도가 100%에 도달해 상대방이 당신의 바람을 확신했습니다!'

const spam = (senderId: 'a' | 'b' | 'c', texts: string[]): SpamNotification[] =>
  texts.map((text) => ({ senderId, senderName: CHARACTERS[senderId].name, text }))

/** 의심도 100 돌파 시 쏟아지는 알림 폭격 목록 */
export const SUSPICION_100_SPAM_LIST: SpamNotification[] = [
  ...spam('a', [
    '여주야',
    '나 말고 딴 새끼 만나냐? ㅋㅋ',
    '어쩐지 요즘 연락도 그렇고 앞뒤가 하나도 안 맞더라',
    '나 두고 바람피우니까 재밌어?',
    '사람 하나 제대로 병신 만들었네',
    '읽씹하지 말고 전화 받아',
  ]),
  ...spam('b', [
    '여주야 너 혹시 나 말고 다른 사람 만나...?',
    '아니라고 하지 마',
    '거짓말하는 거 이제 다 보여',
    '나 혼자만 바보처럼 너 좋아하고 속고 잇엇던 거네 ㅋㅋ',
    '너 진짜 최악이다',
  ]),
  ...spam('c', [
    '여주야',
    '나 말고 또 누구 만나고 있어 ?',
    '거짓말할 생각 하지 마',
    '다른 남자 있는 거 다 티 나니까',
    '나한테만 그렇게 웃어준 게 아니었구나 ?',
    '이런 앤지 몰랐네... ㅋㅋ',
  ]),
]

/** 심도 100을 찍은 캐릭터부터 순서대로 습격 일정(시작 정적 이후 기준 ms)을 계산 */
export function buildSpamSchedule(bustedId: string) {
  const order = ['a', 'b', 'c'].sort((x, y) => (x === bustedId ? -1 : y === bustedId ? 1 : 0))
  const schedule: { item: SpamNotification; at: number }[] = []
  let cursor = 0
  order.forEach((senderId, senderIndex) => {
    const items = SUSPICION_100_SPAM_LIST.filter((item) => item.senderId === senderId)
    if (!items.length) return
    if (senderIndex > 0 && schedule.length) cursor += SPAM_SENDER_GAP_MS
    items.forEach((item, index) => {
      if (index > 0) cursor += SPAM_INTERVAL_MS
      schedule.push({ item, at: cursor })
    })
  })
  return { schedule, end: cursor + SPAM_END_DELAY_MS }
}
