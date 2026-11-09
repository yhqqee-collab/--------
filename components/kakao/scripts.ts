import { CHARACTERS, GROUP_MEMBERS } from '@/lib/template-config'
import type { SuspicionStage } from './suspicion'

/* ═══════════════════════════════════════════════════════════════
 * 휴대폰 시뮬레이터 스크립트 템플릿
 *  - 대사만 채우면 바로 동작합니다. 엔진 로직(fromPhases, resolveNode 등)은 수정하지 마세요.
 *  - 캐릭터 이름·프로필은 lib/template-config.ts 에서 관리합니다.
 * ═══════════════════════════════════════════════════════════════ */

/** 모든 멤버의 '일정 시작 전' 대화가 끝나면 4초간 표시되는 전환 문구 (일차별) */
const WORK_TRANSITION_TEXTS: Record<number, string> = {
  1: '⏳ [<영화와 현대사회> 수업 듣는 중...] (10:30 ~ 12:00) ⏳',
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

/** 유우시 카톡에서 점심 장소를 고르면 켜지는 플래그 (켜져 있으면 리쿠의 12:00 분기가 자동으로 결정됨) */
export const FLAG_YUSHI_LUNCH_SEOGA = 'yushi-lunch-seoga'
export const FLAG_YUSHI_LUNCH_RAMEN = 'yushi-lunch-ramen'

/** 리쿠 카톡에서 정문 라멘야를 고르면 켜지는 플래그 (유우시 쪽 12:40 카톡이 료의 목격담 엔딩으로 바뀜) */
export const FLAG_RIKU_LUNCH_RAMEN = 'riku-lunch-ramen'

const YUSHI_LUNCH_BRANCH = (variant: 'B' | 'C'): Branch[] => [
  { all: [FLAG_YUSHI_LUNCH_SEOGA], to: `END_Sakuya_Step1_${variant}` },
  { all: [FLAG_YUSHI_LUNCH_RAMEN], to: `P2_Safe2_${variant}` },
]

const SAKUYA_FINAL_REPLY = '리쿠: ㅋㅋ... / 유우시랑 다 얘기 햇는데 / 양다리 제대로 걸쳣네? / 사람 하나 바보 만들고... / 내가 그렇게 호구 같아 보였어?'

/** 리쿠 Day 1: 수업 전 점심 제안 → 점심 동선 → 동방 시식회 후 밤 카톡 */
const RIKU_DAY1: Record<string, PhaseNode> = {
  P1_Start: {
    preWork: true,
    message: '잘 잣어??\n학교 일찍 갈까 고민 중...\n12시에 수업 끝나구 나랑 점심 먹자 ❤️',
    choices: [
      { id: 'A', text: '좋아!! 12시에 수업 끝나고 보자 ㅎㅎ', susp: 0, reply: '앗싸 ㅎㅎ 그럼 나 지금 준비하구 나갈게!', next: 'P2_RikuFlow' },
      {
        id: 'B',
        text: '1시 수업 발표 준비 때문에 ㅠㅠ 점심 거르고 혼자 대본 보려구...',
        susp: 5,
        reply: '엥 밥도 안 먹구...? ㅠㅠ / 요즘 나 보기 힘들다... 알겟어 화이팅해!',
        next: 'P2_YushiLink_B',
      },
      {
        id: 'C',
        text: '미안 ㅠㅠ 오늘 점심에 동기랑 있어 ㅠㅠ',
        susp: 20,
        reply: '아... / 나랑 먹지 아쉽다... / 이따 동방에서 봐',
        next: 'P2_YushiLink_C',
      },
    ],
  },
  P2_RikuFlow: {
    preWork: true,
    delay: 12,
    message: '여주야 수업 들어가기 전이지??\n이따 우리 뭐 먹을까?',
    choices: [
      { id: 'A', text: '서가앤쿡 가자!', susp: 0, reply: '오 서가앤쿡 조아 ㅎㅎ / 수업 끝나구 후문 쪽으로 와!', next: 'P2_Safe1' },
      {
        id: 'B',
        text: '라멘야 어때?',
        susp: 0,
        reply: '라멘!! / 완전 조아 ㅎㅎ / 12시에 정문 앞에서 보자!',
        next: 'P2_Ryo',
        setFlag: FLAG_RIKU_LUNCH_RAMEN,
      },
    ],
  },
  P2_Safe1: {
    message: '여주랑 점심 먹으니까 넘 행복하당 ㅎㅎ\n일요일에 내 후드티 빌려간 거\n다음에 입고 왕 ㅎㅎ',
    choices: [{ id: 'A', text: '웅 담에 입고 갈게 ㅎㅎ', susp: 0, next: 'P4_Start' }],
  },
  P2_Ryo: {
    message: '여주야 나 정문 앞이야!\n라멘야 줄 별로 없다 ㅎㅎ',
    choices: [
      {
        id: 'A',
        text: '거의 다 왔어!',
        susp: 0,
        reply: '리쿠: 헉 료가 단톡에 우리 라멘야 있는 거 올렸어 ㅋㅋㅋ',
        next: 'END_Yushi',
      },
    ],
  },
  END_Yushi: {
    isGameOver: true,
    message: '',
    choices: [],
    alert:
      '[단톡방] 료: 어 여주 누나 리쿠 형이랑 정문 라멘야 계시네요?! 이따 1시 대중문화 수업 때 봬요!\n정문 라멘야에서 료에게 목격되어 유우시에게 양다리가 발각되었습니다.',
  },
  P2_YushiLink_B: {
    message: '여주야 수업 끝낫지??\n대본 보기 전에 뭐라도 먹어 ㅠㅠ 어디서 먹을 거야?',
    branch: YUSHI_LUNCH_BRANCH('B'),
    choices: [
      { id: 'A', text: '후문 서가앤쿡 잠깐 들를 것 같아', susp: 0, next: 'END_Sakuya_Step1_B' },
      { id: 'B', text: '정문 쪽 라멘야에서 빨리 먹으려구', susp: 10, next: 'P2_Safe2_B' },
    ],
  },
  P2_YushiLink_C: {
    message: '여주야 수업 끝낫지??\n동기랑 어디서 먹어?',
    branch: YUSHI_LUNCH_BRANCH('C'),
    choices: [
      { id: 'A', text: '후문 서가앤쿡 가기로 했어', susp: 0, next: 'END_Sakuya_Step1_C' },
      { id: 'B', text: '정문 쪽 라멘야 가려구', susp: 10, next: 'P2_Safe2_C' },
    ],
  },
  END_Sakuya_Step1_B: {
    delay: 8,
    message: '사쿠야가 단톡에 사회과학관 길목에서 너랑 유우시 봤다는데?\n둘이 서가앤쿡 간다고\n혼자 대본 본다더니 유우시랑 밥 먹어??\n나한테 왜 거짓말햇어...?',
    choices: [{ id: 'A', text: '내가 다 설명할게', susp: 100, reply: SAKUYA_FINAL_REPLY, next: 'END_Sakuya_Final' }],
  },
  END_Sakuya_Step1_C: {
    delay: 8,
    message: '사쿠야가 단톡에 사회과학관 길목에서 너랑 유우시 봤다는데?\n둘이 서가앤쿡 간다고\n선약 잇다더니 유우시랑 밥 먹어??\n나한테 왜 거짓말햇어...?',
    choices: [{ id: 'A', text: '내가 다 설명할게', susp: 100, reply: SAKUYA_FINAL_REPLY, next: 'END_Sakuya_Final' }],
  },
  END_Sakuya_Final: {
    isGameOver: true,
    message: '',
    choices: [],
    alert:
      '[단톡방] 사쿠야: 어 방금 사회과학관 길목에서 유우시 형이랑 여주 누나 봤어요 ㅋㅋㅋ 두 분 서가앤쿡 가세요?!\n사쿠야의 목격담으로 리쿠와 유우시가 모든 사실을 알게 되었습니다.',
  },
  P2_Safe2_B: {
    delay: 20,
    message: '여주야 대본은 다 봣어??\n답장이 없네 ㅠㅠ 1시 수업 잘 들어!',
    choices: [{ id: 'A', text: '웅 고마워 ㅎㅎ 이따 동방에서 봐!', susp: 0, next: 'P4_Start' }],
  },
  P2_Safe2_C: {
    delay: 20,
    message: '여주야 밥은 다 먹엇어??\n답장이 없네 ㅠㅠ 1시 수업 잘 들어!',
    choices: [{ id: 'A', text: '웅 고마워 ㅎㅎ 이따 동방에서 봐!', susp: 0, next: 'P4_Start' }],
  },
  P4_Start: {
    delay: 40,
    message: '여주야 오늘 내가 만든 거 맛잇엇어?? ㅎㅎ\n사람들 만아서\n여주 옆에 못 앉아서 넘 아쉬웟다구 ㅠㅠ\n우리집 들럿다 갈랭??',
    choices: [
      {
        id: 'A',
        text: '오늘은 늦었으니까 ㅠㅠ 주말에 집데이트하자 ❤️',
        susp: 0,
        reply: '헤헤 / 주말에 꼭 우리 집 오기다?? / 약속!! / 조심히 들어가구 잘 자 / 여주야 사랑해 ❤️',
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
      },
      {
        id: 'B',
        text: '1시 수업 발표 준비 때문에... 점심에 대본 봐야 할 것 같아... ㅠㅠ',
        susp: 15,
        reply: '아 그래 ? / 수업 늦지 않게 얼른 와 / 옆자리 비워놨어',
        next: 'P2_RikuFlow_B',
      },
      {
        id: 'C',
        text: '미안 ㅠㅠ 오늘 점심은 수진이랑 선약 있어',
        susp: 30,
        reply: '이상하네... 수진이 수요일에 본가 내려갔다던데 ? / 급하게 올라왔나 보네',
        next: 'P2_RikuFlow_C',
      },
    ],
  },
  P2_YushiFlow: {
    preWork: true,
    delay: 12,
    message: '오고 있어 ?\n이따가 뭐 먹지\n먹고 싶은 거 있어 ?',
    choices: [
      {
        id: 'A',
        text: '서가앤쿡 가자!',
        susp: 0,
        reply: '응 이따 수업 끝나고 같이 가자 ^_^',
        next: 'P2_Sakuya',
        setFlag: FLAG_YUSHI_LUNCH_SEOGA,
      },
      {
        id: 'B',
        text: '라멘야 어때?',
        susp: 0,
        reply: '알겠어 / 이따 사물함만 들렀다가 그쪽으로 갈게 ^_^',
        next: 'P2_Safe1',
        setFlag: FLAG_YUSHI_LUNCH_RAMEN,
      },
    ],
  },
  P2_Sakuya: {
    message: '여주야 사회과학관 길목이야\n방금 사쿠야 지나갔는데 우리 봤나 봐',
    choices: [
      {
        id: 'A',
        text: '헉 진짜? 금방 갈게!',
        susp: 0,
        reply: '유우시: 사쿠야가 단톡에 우리 서가앤쿡 간다고 올렸네',
        next: 'END_Riku',
      },
    ],
  },
  END_Riku: {
    isGameOver: true,
    message: '',
    choices: [],
    alert:
      '[단톡방] 사쿠야: 어 방금 사회과학관 길목에서 유우시 형이랑 여주 누나 봤어요 ㅋㅋㅋ 두 분 서가앤쿡 가세요?!\n사회과학관 동선이 겹치는 사쿠야에게 목격되어 리쿠에게 양다리가 발각되었습니다.',
  },
  P2_Safe1: {
    message: '라멘 맛있네 ㅎㅎ\n머리끈 여기 있어 ^_^',
    choices: [{ id: 'A', text: '고마워 ㅎㅎ 1시 수업 잘 들어!', susp: 0, next: 'P4_Start' }],
  },
  P2_RikuFlow_B: {
    message: '발표 연습 화이팅 !\n이따 연락해',
    choices: [{ id: 'A', text: '웅 고마워!', susp: 0, next: 'P3_LunchCheck' }],
  },
  P2_RikuFlow_C: {
    message: '수진이랑 맛있게 먹어\n이따 연락해',
    choices: [{ id: 'A', text: '웅 고마워!', susp: 0, next: 'P3_LunchCheck' }],
  },
  P3_LunchCheck: {
    delay: 20,
    message: '밥은 먹었어 ?\n대답이 좀 늦네\n수업 잘 들어 ^_^',
    branch: [{ all: [FLAG_RIKU_LUNCH_RAMEN], to: 'END_Ryo_Step1' }],
    choices: [{ id: 'A', text: '응 먹었어! 이따 동방에서 봐', susp: 10, next: 'P4_Start' }],
  },
  END_Ryo_Step1: {
    delay: 8,
    message: '료가 단톡에 너 리쿠랑 라멘야 있다고 올렸던데 ?\n점심에 바쁘다더니 리쿠랑 있어 ?\nㅋㅋ...\n나한테 거짓말하고 리쿠랑 밥 먹으러 갈 이유가 있나 ?',
    choices: [{ id: 'A', text: '내가 다 설명할게', susp: 100, reply: '유우시: ... 됐어', next: 'END_Ryo' }],
  },
  END_Ryo: {
    isGameOver: true,
    message: '',
    choices: [],
    alert:
      '[단톡방] 료: 어 여주 누나 리쿠 형이랑 라멘야 계시네요?! 이따 1시 대중문화 수업 때 봬요!\n료의 단톡방 목격담으로 유우시 의심도가 100% 폭발했습니다.',
  },
  P4_Start: {
    delay: 40,
    message:
      '방금 시온이 형이 그러는데 너 지난주 일요일에 비 올 때\n집 밖으로 한 발짝도 안 나가고 집에만 있었다며 ?\n나한테는 본가 다녀왔다고 했잖아',
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
        text: '본가는 토요일 밤에 잠깐 들렀다가 일요일 아침 일찍 자취방 와서 쉬었어!',
        susp: 0,
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
        next: 'P2_Start',
      },
      {
        id: 'B',
        text: '오 립밤 너한테 있었구나 ㅋㅋ 고마워 이따 저녁에 봐!',
        susp: 0,
        reply: '응 ㅋㅋ / 점심 잘 챙겨 먹고 이따 보자~',
        next: 'P2_Start',
      },
    ],
  },
  P2_Start: {
    delay: 45,
    message: '여주야 나 셋팅하러 동방 먼저 와 있어 ㅋㅋ\n아직 애들 아무도 안 왔는데\n일찍 올 수 있으면 카페 가자\n어제 그 립밤도 줄 겸 ㅎㅎ',
    branch: [
      { all: [FLAG_YUSHI_LUNCH_SEOGA], to: 'END_Group_Step1' },
      { all: [FLAG_RIKU_LUNCH_RAMEN], to: 'END_Group_Step1' },
    ],
    choices: [
      {
        id: 'A',
        text: '오 진짜? 지금 학생회관 앞인데 바로 올라갈게 ㅎㅎ',
        susp: 0,
        reply: '애들 오기 전에 잠깐이라도 단둘이 보자 / 얼른 와',
        next: 'P3_Start',
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
  END_Group_Step1: {
    delay: 8,
    message: '야 단톡방 뭐야? ㅋㅋ\n점심에 둘이 왜 같이 있어?',
    choices: [
      {
        id: 'A',
        text: '아 그게...',
        susp: 100,
        reply: '애들한테 얘기 다 들었어 / 너 레전드다 진짜...ㅋㅋ / 나중에 얼굴 어떻게 보려고 그래? / 이따가 애들 앞에서 해명할 거지? ㅋㅋ',
        next: 'END_Group',
      },
    ],
  },
  END_Group: {
    isGameOver: true,
    message: '',
    choices: [],
    alert: '[단톡방 목격담 후폭풍]\n단톡방 목격담으로 유우시·리쿠·시온 세 명 모두에게 진실이 밝혀졌습니다.',
  },
  P3_Start: {
    delay: 40,
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

export const SCRIPTS: Record<string, Script> = {
  ...sampleDay(),
  a: fromPhases('P1_Start', SION_DAY1, SAMPLE_TIMING.a),
  b: fromPhases('P1_Start', RIKU_DAY1, SAMPLE_TIMING.b),
  c: fromPhases('P1_Start', YUSHI_DAY1, SAMPLE_TIMING.c),
}

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
