import type { SuspicionStage } from './suspicion'

/** 모든 멤버의 출근 전 대화가 끝나면 4초간 표시되는 근무 전환 문구 (일차별) */
const WORK_TRANSITION_TEXTS: Record<number, string> = {
  1: '💸 오픈 근무 중... (09:00 ~ 12:00) 💸',
  2: '💸 미들 근무 및 데이트 진행 중... (12:00 ~ 16:00) 💸',
  4: '💸 마감 근무 중... (16:00 ~ 20:00) 💸',
  5: '💸 미들 근무 중... (12:00 ~ 16:00) 💸',
  6: '💸 오픈 근무 중... (09:00 ~ 12:00) 💸',
  7: '💸 마감 근무 중... (16:00 ~ 20:00) 💸',
}

/** 출근 전 대화 없이 일차 시작과 동시에 근무 전환이 뜨는 날 */
export const WORK_FIRST_DAYS = new Set([7])
/** 이 날의 카톡이 모두 끝나면 암전 후 최종 선택 + 엔딩으로 넘어갑니다. */
export const FINAL_DAY = 7

export function workTransitionText(day: number) {
  return WORK_TRANSITION_TEXTS[day] ?? WORK_TRANSITION_TEXTS[1]
}

const DIVIDER_WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

/** 각 남자의 그날 첫 카톡 위에 붙는 날짜 구분선 */
export function dayDivider(day: number) {
  const date = new Date(2026, 9, 25 + day)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DIVIDER_WEEKDAYS[date.getDay()]}`
}

/** 하이디라오(구서동, 매장 근처)를 고르면 켜지는 함정 플래그 */
export const FLAG_GOOSEO_TRAP = 'gooseo-trap'

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

/** 그날 외출해서 만난 남자를 고르면 켜지는 플래그. MET_TOKEN 이 해당 이름으로 바뀜 */
export const FLAG_MET_RIKU = 'met-riku'
export const FLAG_MET_YUSHI = 'met-yushi'
export const MET_TOKEN = '{만난사람}'

export function fillMetName(text: string, flags: ReadonlySet<string>) {
  if (!text.includes(MET_TOKEN)) return text
  const name = flags.has(FLAG_MET_YUSHI) ? '유우시' : '리쿠'
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

const SION_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어? 오늘 오픈이지\n밥 먹고 가 지각하지 말고 ㅎㅎ',
    choices: [
      { id: 'A', text: '웅 일어났어!\n휴무 부럽다 ㅠㅠ', susp: 0, next: 'phase2' },
      { id: 'B', text: '아 피곤해 ㅠㅠ\n오늘따라 시온이 보고 싶다...', susp: 0, next: 'phase2' },
      { id: 'C', text: '웅! 리쿠랑 같이 오픈이라\n그나마 다행이야 ㅠㅠ', susp: 15, alert: '단둘이네\n리쿠 너무 챙겨주지 마 ㅎㅎ', next: 'phase2' },
    ],
  },
  phase2: {
    preWork: true, // 💡 근무 중에 미리 오도록 설정
    delay: 60,
    message: '근데 너 저번주 금요일에 마감하고 기절했다며\n그때 말 못했는데\n아웃백 근처에서\n남자랑 걷는 거 본 거 같은데 ㅋㅋㅋ\n진짜 너 아니지?',
    choices: [
      { id: 'A', text: '에 진짜?!\n그날 나 씻지도 못하고 기절했잖아 ㅠㅠ\n비슷한 옷이었나 봐!', susp: 10, next: 'phase3' },
      { id: 'B', text: '어... 나 그날 잠깐 편의점 가긴 했는데...\n그때 봤나?', susp: 30, alert: '편의점을 거기까지 가?\n너네 집에서 30분 걸리는데? ㅋㅋ\n누구랑 있었는데', next: 'phase3' },
      { id: 'C', text: '뭐야 나 딴 사람 만났다고 의심하는 거야? ㅋㅋㅋ\n서운해 진짜 ㅡㅡ', susp: 0, alert: 'ㅋㅋㅋㅋ 알았어 장난이야\n이따 연락해', next: 'phase3' },
    ],
  },
  phase3: {
    delay: 45, // 💡 리쿠와 대화가 끝날 때쯤 절묘하게 도착
    message: '퇴근했어?\n아까 보니까 라멘 먹으러 갔던데 ㅋㅋㅋ\n혼밥한 거야?',
    choices: [
      { id: 'A', text: '오픈 끝나고 너무 배고파서\n리쿠랑 대충 먹고 헤어졌어! 담에 같이 가자 ㅎㅎ', susp: 15, next: 'end' },
      { id: 'B', text: '웅 혼밥이지\n리쿠는 바로 집 갔을 걸?', susp: 30, alert: '그래?\n스토리에는 두 그릇인데 ㅋㅋㅋ\n거짓말을 왜 해', next: 'end' },
    ],
  },
}

const RIKU_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '{이름아} 일어났엉?\n7시 ㅠㅠ 눈이 일찍 떠졌다\n이따 매장 앞에서 만날래? ㅎㅎ',
    choices: [
      { id: 'A', text: '매장 앞에�� 봐 ㅎㅎ', susp: 0, reply: '웅~', next: 'phase1_ramen' },
      // 🚨 30분 거리인데 7시에 버스 탔다고 하면 의심 폭증
      { id: 'B', text: '웅\n나도 나와서 버스 탔어!', susp: 20, next: 'phase1_excuse' },
    ],
  },
  phase1_excuse: {
    preWork: true,
    delay: 3,
    message: '출근 9시인데 벌써 나왔다고?\n너네 집에서 30분 거리잖아',
    choices: [
      { id: 'A', text: '바람 쐬려고 일찍 나왔어 ㅠㅠ', susp: 0, reply: '그랬구나\n조심히 와!', next: 'phase1_ramen' },
    ],
  },
  // 💡 라멘 제안 페이즈 분리 추가
  phase1_ramen: {
    preWork: true,
    message: '아 맞다!\n우리 이따 오픈 끝나구 같이 라멘 먹을래? ㅎㅎ\n맛집 찾앗어 ❤️',
    choices: [
      { id: 'A', text: '완전 좋아! 라멘 먹장 ㅎㅎ', susp: 0, reply: '오키오키 이따 봥 ❤️', next: 'phase2' },
      { id: 'B', text: '이따 끝나고 배고프면!', susp: 10, reply: '웅 ㅋㅋ ��겟어용!', next: 'phase2' },
    ],
  },
  phase2: {
    delay: 10, // 💡 퇴근 후 가장 먼저 카톡 도착
    message: '오늘 라멘 짱 맛잇엇옹 ㅎㅎ\n얼른 집 가서 쉬어 ❤️\n근데 아까 계속 폰 울리던데\n누구야? ㅡㅡ',
    choices: [
      { id: 'A', text: '아 대학교 동기!\n궁금한 거 있다고 계속 톡 오네 ㅠㅠ', susp: 0, reply: '아 그래??\n그냥 무시해버려 ㅋㅋㅋ', next: 'phase3' },
      { id: 'B', text: '시온이!\n오늘 쉬는데 뭐 하냐고 묻길래 대충 답장했어 ㅋㅋ', susp: 25, reply: '그래?', next: 'phase3' },
    ],
  },
  phase3: {
    message: '{이름} 안 자?\n마감은 엄청 바빴나 봐 ㅠㅠ\n잘 쉬고 있어?',
    choices: [
      { id: 'A', text: '웅 나 집 도착하구 기절했어...\n지금 일어나서 씻으려구!', susp: 0, reply: '잘 자 ㅎ', next: 'end' },
      { id: 'B', text: '유우시가 마감 힘들대 ㅋㅋㅋ', susp: 15, reply: '오픈도 힘들긴 해\nㅎㅎ', next: 'end' },
      { id: 'C', text: '아 방금 잠깐 집 앞 편의점 다녀왔어!\n이제 누우려구 ㅎㅎ', susp: 10, reply: '그렇구낭', next: 'end' },
    ],
  },
}

const YUSHI_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어 ?\n일어나자마자 보고 싶네\n아침 챙겨 먹고 무리하지 말고',
    choices: [
      { id: 'A', text: '넌 마감이라 못 보겠네\n아쉽다 ㅠㅠ', susp: 0, reply: '아쉽다 ㅜㅜ', next: 'phase2' },
      { id: 'B', text: '아 피곤해 ㅠㅠ\n유우시가 대신 출근해 줬음 좋겠다...', susp: 0, reply: '내가 갈까 ? ㅋㅋㅋㅋ\n장난\n조심히 가', next: 'phase2' },
      { id: 'C', text: '웅!\n리쿠랑 오픈이라 그나마 다행이야...', susp: 15, reply: '둘이 친하네\nㅋㅋ\n일에 집중해', next: 'phase2' },
    ],
  },
  phase2: {
    delay: 90, // 💡 시온 혼밥 카톡 이후에 도착
    message: '스토리 올렸네\n리쿠랑 갔어 ?',
    choices: [
      // 💡 유우시의 반응에 따라 phase2_reply_A 또는 B로 이동
      { id: 'A', text: '오픈 끝나구 배고파서\n같이 라멘 먹으러 왔어!', susp: 15, next: 'phase2_reply_A' },
      { id: 'B', text: '리쿠가 라멘 먹고 싶다고 해서 ㅋㅋㅋ', susp: 25, next: 'phase2_reply_B' },
    ],
  },
  // 💡 여주가 "웅~" 하고 대답할 수 있는 페이즈 분리 추가
  phase2_reply_A: {
    message: '맛있게 먹어\n다 먹고 바로 들어가고',
    choices: [
      { id: 'A', text: '웅~ 다 먹고 바로 집 갈게! ㅎㅎ', susp: 0, reply: '조심히 들어가 ^_^', next: 'phase3' },
    ],
  },
  phase2_reply_B: {
    message: '그래 ?\n나도 너랑 먹고 싶은데\n다음엔 나랑 가',
    choices: [
      { id: 'A', text: '웅~ 다음엔 유우시랑 가야지! ㅎㅎ', susp: 0, reply: '약속했다 ?\n얼른 먹고 들어가', next: 'phase3' },
    ],
  },
  phase3: {
    message: '마감 끝났어\n힘들다\n자 ?',
    choices: [
      { id: 'A', text: '안 자!\n오늘 마감 바빴다며 ㅠㅠ 고생했어', susp: 0, reply: '목소리 듣고 싶다 ^_^', next: 'end' },
      { id: 'B', text: '방금 씻고 누웠어!\n얼른 집 가서 쉬어어 ❤️', susp: 20, reply: '평소에 안 쓰던 말투ㅎ', next: 'end' },
      { id: 'C', text: '웅 ㅠㅠ 너무 졸려... 내일 봐', susp: 0, reply: '푹 자 ^_^', next: 'end' },
    ],
  },
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

/* ───────────── 2일차 ───────────── */

const SION_DAY2_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '잘 잤어?\n오늘 근무 같이 하네 ㅎㅎ',
    choices: [
      { id: 'A', text: '웅\n이따 매장에서 봥', susp: 0, reply: '보고 싶다 ㅎㅎ\n이따 봐', next: 'phase2' },
      { id: 'B', text: '피곤해 ㅠㅠ\n오늘 바쁘진 않겠지?', susp: 5, reply: 'ㅋㅋㅋ 내가 다 할게\n편하게 있어 너는', next: 'phase2' },
    ],
  },
  phase2: {
    preWork: true,
    delay: 10,
    message: '이따 근무 끝나고 밥 먹을까?',
    choices: [{ id: 'A', text: '완전 좋징', susp: 0, reply: '어디 갈지 찾아볼게', next: 'phase3' }],
  },
  phase3: {
    preWork: true,
    // 리쿠의 밥 제안(시작 50초)보다 항상 뒤에 오도록
    delay: 50,
    message: '아웃백 갈래 아님 하이디라오?\n뭐가 더 땡겨 ㅎㅎ',
    choices: [
      { id: 'A', text: '아웃백 가장\n양식 먹고 싶당', susp: 0, reply: '오키\n예약해둘게', next: 'phase4' },
      { id: 'B', text: '하이디라오!\n오랜만에 훠궈 기기', susp: 0, reply: '오케이 ㅋㅋㅋ\n예약할게', next: 'phase4', setFlag: FLAG_GOOSEO_TRAP },
    ],
  },
  phase4: {
    preWork: true,
    message: '밥 먹고 드라이브 하면 되겠다 ㅎㅎ',
    choices: [
      { id: 'A', text: '헐 재밌겠다', susp: 0, next: 'phase6' },
      { id: 'B', text: '웅 이따가 봐 ㅎㅎ', susp: 0, next: 'phase6' },
    ],
  },
  phase6: {
    redirect: { flag: FLAG_GOOSEO_TRAP, to: null },
    message: '집 조심히 들어갔어?\n오늘 진짜 예쁘더라 같이 있어서 좋았어\n사랑해 ❤️',
    choices: [
      { id: 'A', text: '웅 나도 너무 좋았어!\n운전하느라 고생했어 사랑해 ㅎㅎ ❤️', susp: 0, reply: '귀여워 ㅋㅋㅋㅋㅋ\n얼른 자', next: 'end' },
      { id: 'B', text: '나 방금 씻고 나왔어!\n꿀잠 자 낼 보자 ㅎㅎ', susp: 0, reply: '기대할게 ㅋㅋㅋ\n푹 자\n피곤하겠다', next: 'end' },
    ],
  },
}

const RIKU_DAY2_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '{이름} 오늘도 화이팅\n나 오늘 쉬는데 이따 퇴근하구 밥 먹을래? ㅎㅎ\n보고 싶어용',
    choices: [
      { id: 'A', text: '헉 미안 ㅠㅠ\n오늘 친한 언니 만나기로 했어', susp: 10, reply: '아쉽당 ㅠㅠ\n알았어 재밋게 놀구 와!', next: 'phase2' },
      { id: 'B', text: '오늘은 집에서 쉬고 싶어서 ㅠㅠ\n미안해용', susp: 10, reply: '그래?\n그럼 밤에 집 앞으로 갈게\n얼굴만 봐 ㅎㅎ', next: 'phase2' },
    ],
  },
  phase2: {
    redirect: { flag: FLAG_GOOSEO_TRAP, to: 'phase2Trap' },
    message: '{이름아} 밤까지 왜 톡을 안 봐 ㅠㅠ',
    choices: [
      { id: 'A', text: '앗 미안해\n알림이 안 떴다 ㅜㅜ', susp: 0, reply: '아하\n그럴 수 있징', next: 'phase3' },
      { id: 'B', text: '방금 집 와서 씻었어!', susp: 25, reply: '나 지금 너네 집 앞인데\n불 꺼져 있는데?', next: 'phase4' },
    ],
  },
  phase2Trap: {
    message: '{이름아}... ㅋㅋ\n집에 있는다며…\n너 왜 시온이 형 차 조수석에 타고 있어?',
    choices: [
      { id: 'A', text: '잘못본 거 아니야?? ㅠㅠ', susp: 0, reply: '대단하다 너 ㅋㅋ\n스케줄 맞추느라 그동안 고생 많았어', next: 'end', gameOver: true, gameOverAlert: '카페와 하이디라오는 너무 가깝습니다!' },
      { id: 'B', text: '헉... 미안해 ㅠㅠ\n태워준다고 해서...', susp: 0, reply: '너 내가 바보같아? ㅋㅋ\n실망이다 진짜', next: 'end', gameOver: true, gameOverAlert: '카페와 하이디라오는 너무 가깝습니다!' },
    ],
  },
  phase3: {
    message: '답장 늦어서 삐질 뻔했잖아 ㅠㅠ',
    choices: [
      { id: 'A', text: '웅 답장 늦어서 미안해용 ㅜㅜ\n나 이제 잘게!', susp: 0, reply: '웅 사랑해\n{이름}도 잘 자 ❤️', next: 'end' },
      { id: 'B', text: '미안해 ㅠㅠ\n리쿠 잘 자~', susp: 0, reply: '웅 사랑해\n{이름}도 잘 자 ❤️', next: 'end' },
    ],
  },
  phase4: {
    message: '진짜 어디야 ㅡㅡ',
    choices: [
      { id: 'A', text: '미안 ㅎㅎ\n아직 집 가는 중', susp: 5, reply: '알겠어\n들어가면 연락해', next: 'end' },
      { id: 'B', text: '걱정할까봐 거짓말 했어 ㅠㅠ\n금방 들어가...', susp: 5, reply: '알겠어\n들어가면 연락해', next: 'end' },
    ],
  },
}

const YUSHI_DAY2_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어 ? 오늘 미들이네\n난 마감이라 이따 교대할 때 보겠다\n탕비실 들어가서 뽀뽀할까 ?\nㅎㅎ',
    choices: [
      { id: 'A', text: '미쳤어 진짜 ㅋㅋㅋ\n애들 이보면 어쩌려구...', susp: 0, reply: '안 들키면 되잖아 ^_^\n이따 봐', next: 'phase2' },
      { id: 'B', text: '그럴까? ㅎㅎ\n나도 하고 싶은데', susp: -5, reply: 'ㅋㅋㅋㅋㅋㅋ\n조심히 출근해', next: 'phase2' },
    ],
  },
  phase2: {
    // 하이디라오(함정)를 고르면 리쿠만 연락하고 유우시는 조용
    redirect: { flag: FLAG_GOOSEO_TRAP, to: null },
    message: '고생했어~\n연락이 없네\n보고 싶은데',
    choices: [
      { id: 'A', text: '헉 미안! 알바 애들이랑 톡하느라 못 봤어 ㅠㅠ', susp: 15, reply: '그래 ?\n단톡방 아까부터 조용하던데\n갠톡이야?', next: 'phase3' },
      { id: 'B', text: '방금 집 와서 씻고 나왔어!\n폰을 무음으로 해놔서 몰랐네 ㅠㅠ', susp: 0, reply: '벌써 씻었어 ?\n빠르네', next: 'phase4' },
    ],
  },
  phase3: {
    message: '아까 교대할 때 짧게 봐서 아쉬웠는데...\n나 빼고 누구랑 그렇게 재밌게 연락해 ?\n질투 나게',
    choices: [
      { id: 'A', text: '사쿠야한테 레시피 물어볼 게 있어서!', susp: 25, reply: '나한테 물어보면 되잖아\n왜 사쿠야한테...', next: 'end' },
      { id: 'B', text: '그냥...\n난 너밖에 없지', susp: -5, reply: 'ㅎㅎ\n피곤할 텐데 얼른 자', next: 'end' },
    ],
  },
  phase4: {
    message: '씻어서 내 냄새 다 지워졌겠다\n아쉽네',
    choices: [
      { id: 'A', text: 'ㅋㅋㅋㅋ 그게 뭐야', susp: 0, reply: '진심인데\n무리하지 말고 푹 자 ^_^', next: 'end' },
      { id: 'B', text: '아니야 아직 안 지워졌어 ㅎㅎ', susp: 0, reply: '그래 ?\n그럼 내 생각 하면서 자~', next: 'end' },
    ],
  },
}

/* ───────────── 3일차 (휴무) ───────────── */

const SION_DAY3_NODES: Record<string, PhaseNode> = {
  phase1: {
    message: '일어났어?\n어제 봤는데 또 보고 싶네',
    choices: [
      { id: 'A', text: '아침부터 왜 이래 ㅋㅋㅋ', susp: 0, reply: '진심인데 ㅎㅎ\n푹 쉬어', next: 'phase2' },
      { id: 'B', text: '나도 시온이 보고 싶다 ㅠㅠ', susp: -5, reply: 'ㅋㅋㅋ\n밥 잘 챙겨 먹어', next: 'phase2' },
    ],
  },
  phase2: {
    message: '난 출근했다\n뭐 해?',
    choices: [
      { id: 'A', text: '뒹굴거리는 중 ㅎㅎ\n집 밖으로 한 발짝도 안 나갈 거야!', susp: 0, reply: 'ㅋㅋㅋㅋ 집순이 다 됐네\n이따 연락할게', next: 'phase3Home' },
      { id: 'B', text: '이따가 약속 있어서\n나갈 준비 중이얌', susp: 5, reply: '쉬는 날 약속도 있어?\n누구 만나는데?\n너무 예쁘게 하고 가지 마 ㅜㅜ', next: 'phase3Out' },
    ],
  },
  phase3Home: {
    waitOthers: true,
    // 다른 남자를 만났는데 시온에겐 집에 있다고 했다면 즉사 트랩으로 연결
    branch: [
      { all: [FLAG_MET_RIKU], to: 'phase3_trap' },
      { all: [FLAG_MET_YUSHI], to: 'phase3_trap' },
    ],
    message: '하루 종일 집에만 있어?\n나 퇴근했는데 너네 집 가도 돼?\n얼굴이나 잠깐 보게 ㅎㅎ',
    choices: [
      { id: 'A', text: '헐 당장 와!!\n나 금방 준비할게!', susp: -10, reply: '천천히 해 ㅋㅋㅋㅋㅋ\n갈게', next: 'phase4' },
      { id: 'B', text: '헉 나 지금 쌩얼에 잠옷이라\n절대 안 돼 ㅠㅠ', susp: 0, reply: '쌩얼이 뭐 어때서 ㅋㅋㅋ\n알았어 푹 쉬어', next: 'phase4' },
    ],
  },
  phase3_trap: {
    message: '너 집에 있다며.\n집 앞인데 왜 딴 새끼랑 있어?\n나 갖고 노니까 재밌어?',
    choices: [
      { id: 'A', text: '헉 시온아 그게 아니라...', susp: 0, reply: '입만 열면 거짓말이네\n연락하지 마라', next: 'gameover_trap' },
    ],
  },
  gameover_trap: { isGameOver: true, message: '', alert: '🚨 다른 남자와 있는 것을 시온에게 들켰습니다. 게임 오버! 🚨', choices: [] },
  phase3Out: {
    waitOthers: true,
    // 아무도 안 만났으면(리쿠X, 유우시X) 시온의 질투 카톡 없이 종료
    branch: [
      { none: [FLAG_MET_RIKU, FLAG_MET_YUSHI], to: null },
    ],
    message: '약속은 끝났어?\n누구 만났는데 답장이 이렇게 늦어...\n다른 남자 만난 건 아니지? ㅋㅋㅋ',
    choices: [
      { id: 'A', text: '대학교 동기들 만났어!\n이제 집 가는 중 ㅠㅠ', susp: 0, reply: '장난이야 ㅋㅋㅋ\n조심히 들어가', next: 'phase4' },
      { id: 'B', text: `어... ${MET_TOKEN}가 잠깐 보자고 해서\n밥 먹고 왔어 ㅠㅠ`, susp: 30, alert: '뭐?\n쉬는 날 걔를 왜 만나', next: 'phase4' },
    ],
  },
  phase4: {
    message: '어쨌든 내일 마감이지?\n바쁠 텐데 무리하지 말고.\n다른 애들한테 너무 예쁘게 웃어주지 마...',
    choices: [
      { id: 'A', text: '알겠어 ㅋㅋㅋ', susp: -5, reply: '그래 내 꿈 꾸고 ㅋㅋㅋ', next: 'end' },
      { id: 'B', text: '질투는 ㅋㅋㅋ\n나한텐 너밖에 없지! 잘 자 ㅎㅎ', susp: -10, reply: '말은 잘하네 ㅋㅋㅋ\n잘 자 ❤️', next: 'end' },
    ],
  },
}

const MEET_CHECK = 'day3_Meet_Combinations'
const WAIT_TEXT = '💸 (다른 톡방 대답 대기 중...) 💸'

/** 리쿠·유우시 둘 다 답한 뒤 만남 조합에 따라 3페이즈 결정 */
function meetBranch(self: string, other: string): Branch[] {
  return [
    { all: [self, other], to: 'phase3_trap_both' },
    { none: [self, other], to: 'phase3_trap_none' },
    { all: [self], to: 'phase3_safe_meet' },
    { all: [other], to: 'phase3_safe_decline' },
  ]
}

const RIKU_DAY3_NODES: Record<string, PhaseNode> = {
  phase1: {
    message: '{이름아} 일어낫엉?\n저번주 수요일에는 스터디 간다구 일찍 일어낫자나 ㅎㅎ\n오늘은 푹 쉬구 있어? ❤️',
    choices: [
      { id: 'A', text: '웅 ㅋㅋㅋ\n오늘은 스터디 없어서 늦잠 잤어!', susp: 0, reply: '다행이다 ㅎㅎ\n푹 쉬어어!', next: 'phase2' },
      { id: 'B', text: '헉 맞아 ㅠㅠ 근데 오늘 과제 있어서 이따 해야 해...', susp: 15, reply: '쉬는 날인데 또 과제 해?\n무슨 과제가 그렇게 많아 ㅡㅡ', next: 'phase2' },
    ],
  },
  phase2: {
    message: '나 오늘 일찍 끝나는데!\n{이름} 쉬니까 이따 잠깐 볼랭?\n예쁜 카페 가자 ❤️',
    choices: [
      { id: 'A', text: '좋아! 이따 몇 시에 볼까? ㅎㅎ', susp: 0, reply: '헐 진짜?!\n내가 집 앞으로 갈게! ❤️', setGlobal: { meetRiku: true }, next: 'phase3_check' },
      { id: 'B', text: '아 ㅠㅠ 나 오늘 몸 안 좋아서 집에서 쉬려구...', susp: 5, reply: '헉 아파? ㅠㅠ\n알겟어... 약 먹구 푹 쉬어어 ㅠㅠ', setGlobal: { meetRiku: false }, next: 'phase3_check' },
    ],
    transitionText: WAIT_TEXT,
    nextCheckGlobal: MEET_CHECK,
  },
  phase3_check: { message: '', choices: [], branch: meetBranch(FLAG_MET_RIKU, FLAG_MET_YUSHI) },
  phase3_trap_both: {
    message: '{이름아}... 유우시한테도 만나자고 한 거야?\n유우시가 너 어딨냐고 톡 왔는데?\n똑바로 말해',
    choices: [{ id: 'A', text: '어? 그럴리가 없는데?', susp: 0, reply: 'ㅋㅋ\n너를 믿은 내가 바보지\n됐어 그만하자', next: 'gameover_both' }],
  },
  gameover_both: { isGameOver: true, message: '', alert: '🚨 양다리가 발각되어 리쿠에게 이별을 통보받았습니다. 게임 오버! 🚨', choices: [] },
  phase3_trap_none: {
    message: '{이름아}\n아프다길래 죽 사서 집 앞인데...\n유우시가 왜...ㅋㅋ',
    choices: [{ id: 'A', text: '헉 나도 몰라 ㅠㅠ 왜 왔지??', susp: 0, reply: '하... 끝까지 거짓말이네\n그만하자', next: 'gameover_none' }],
  },
  gameover_none: { isGameOver: true, message: '', alert: '🚨 집 앞에서 리쿠와 유���시가 마주쳤습니다! 게임 오버! 🚨', choices: [] },
  phase3_safe_meet: {
    message: '오늘 재밌었다 ㅎㅎ',
    choices: [{ id: 'A', text: '웅! 오늘 카페 너무 예뻤어 고마워 ❤️', susp: -30, reply: '나두 진짜 좋앗어 ㅎㅎ\n푹 자 {이름아}! ❤️', next: 'end' }],
  },
  phase3_safe_decline: {
    message: '{이름아} 몸은 좀 어때 ㅠㅠ 계속 잤어?',
    choices: [{ id: 'A', text: '웅 약 먹고 푹 잤더니 좀 낫네 ㅠㅠ 고마워!', susp: 0, reply: '다행이다아 ㅠㅠ\n낼 오픈이니까 푹 자!', next: 'end' }],
  },
}

const YUSHI_DAY3_NODES: Record<string, PhaseNode> = {
  phase1: {
    message: '잘 자고 있어 ?\n저번 주 수요일엔 도서관 간다고 일찍 일어나길래',
    choices: [
      { id: 'A', text: '웅 ㅋㅋㅋ 오늘은 도서관 안 가도 돼서 늦잠!', susp: 5, reply: '지난주는 그렇게 바쁘더니\n오늘은 한가하네', next: 'phase2' },
      { id: 'B', text: '헉 그걸 기억해? ㅋㅋㅋ 고마워!', susp: 0, reply: '네 일인데 당연히...\n밥 챙겨 먹어', next: 'phase2' },
    ],
  },
  phase2: {
    message: '오늘 나 일찍 끝났는데\n너는 쉬는 날이잖아.\n잠깐 나올래 ? 맛있는 거 사줄게',
    choices: [
      { id: 'A', text: '완전 좋아! 어디서 볼까? ㅎㅎ', susp: 0, reply: '준비하고 천천히 나와\n데리러 갈게', setGlobal: { meetYushi: true }, next: 'phase3_check' },
      { id: 'B', text: '헉 미안해 ㅠㅠ 나 오늘 가족들 만나기로 해서...', susp: 0, reply: '그래 ? 아쉽네.\n가족들이랑 시간 잘 보내 ^_^', setGlobal: { meetYushi: false }, next: 'phase3_check' },
    ],
    transitionText: WAIT_TEXT,
    nextCheckGlobal: MEET_CHECK,
  },
  phase3_check: { message: '', choices: [], branch: meetBranch(FLAG_MET_YUSHI, FLAG_MET_RIKU) },
  phase3_trap_both: {
    message: '나 만난다면서 ?\n리쿠도 너 만나러 간다던데\n어떻게 된 건지 설명해',
    choices: [{ id: 'A', text: '리쿠?? 리쿠가 왔다고?', susp: 0, reply: '모르는 척 하지 마\n헤어지자 걍', next: 'gameover_both' }],
  },
  gameover_both: { isGameOver: true, message: '', alert: '🚨 양다리가 발각되어 유우시에게 이별을 통보받았습니다. 게임 오버! 🚨', choices: [] },
  phase3_trap_none: {
    message: '가족 만난다더니...\n집이라길래 얼굴이나 보러 왔는데\n리쿠는 죽 들고 왜 여깄어 ?\n거짓말한 거야 ?',
    choices: [{ id: 'A', text: '엥?? 리쿠가 왜 왔지??', susp: 0, reply: '너 진짜 질린다\n바람피면 재밌어?\n사람 제대로 갖고 노네...\n그만하자 지친다', next: 'gameover_none' }],
  },
  gameover_none: { isGameOver: true, message: '', alert: '🚨 집 앞에서 리쿠와 유우시가 마주쳤습니다! 게임 오버! 🚨', choices: [] },
  phase3_safe_meet: {
    message: '오늘 진짜 재밌었다 ㅎㅎ',
    choices: [{ id: 'A', text: '웅! 오늘 맛있는 거 사줘서 고마워 최고 ㅠㅠ ❤️', susp: -15, reply: '네가 잘 먹으니까 좋더라.\n푹 자 ❤️', next: 'end' }],
  },
  phase3_safe_decline: {
    message: '가족들이랑 시간 잘 보냈어 ?',
    choices: [{ id: 'A', text: '웅! 방금 밥 먹고 다 같이 들어왔어 ㅎㅎ', susp: 0, reply: '그래.\n내일 무리하지 말고 자 ^_^', next: 'end' }],
  },
}

/* ───────────── 4일차 (마감) ───────────── */

const FLAG_MEET_SION4 = 'meet-sion-4'
const FLAG_LIE_SION4 = 'lie-sion-4'
const FLAG_TRUTH_SION4 = 'truth-sion-4'
const FLAG_MEET_YUSHI4 = 'meet-yushi-4'
const FLAG_LIE_YUSHI4 = 'lie-yushi-4'

const MEET_CHECK_DAY4 = 'day4_Meet_Combinations'
const WAIT_TEXT_DAY4 = '💸 (매장 앞에서 눈치 싸움 중...) 💸'

const SION_DAY4_NODES: Record<string, PhaseNode> = {
  phase1_1: {
    preWork: true,
    message: '아직 자? 이불 밖으로 나오기 싫은 날씨네...',
    choices: [
      { id: 'A', text: '방금 일어났어!', susp: 0, reply: '난 방금 씻고 나왔어', next: 'phase1_2' },
      { id: 'B', text: '웅 ㅠㅠ 시온이가 와서 깨워줬으면...', susp: -5, reply: '진짜 가? ㅎㅎ', next: 'phase1_2' },
    ],
  },
  phase1_2: {
    preWork: true,
    message: '마감 때 무거운 건 네가 들지 말고 유우시 시키고 ㅋㅋㅋ',
    choices: [
      { id: 'A', text: '너도 감기 조심해! ❤️', susp: -5, reply: 'ㅎㅎ 아구 착해', next: 'phase1_3' },
      { id: 'B', text: '걱정해주는 거야? 감동 ㅠㅠ', susp: -5, reply: '내가 너 아님 누굴 걱정해 ㅎㅎ', next: 'phase1_3' },
    ],
  },
  phase1_3: {
    preWork: true,
    message: '밥 잘 챙겨 먹고 출근해\n이따 내 생각도 좀 하고 ❤️',
    choices: [
      { id: 'A', text: '이미 너 생각 중인데? ㅋㅋㅋ', susp: 0, reply: '귀여워 ㅎㅎ', next: 'phase2' },
      { id: 'B', text: '웅 알겠어! 시온이도 오늘 하루 잘 보내 ㅎㅎ', susp: 0, reply: '고마워 ㅋㅋㅋㅋ', next: 'phase2' },
    ],
  },
  phase2: {
    message: '마감 끝났지? 나 지금 매장 근처인데\n데려다줄게\n유우시 아까 가더라\n얼른 나와 ❤️',
    choices: [
      { id: 'A', text: '뒷골목에 차 대고 있어 ㅠㅠ 금방 갈게!', susp: 0, reply: '골목에서 기다릴게', setFlag: FLAG_MEET_SION4, next: 'phase3_check' },
      { id: 'B', text: '나 벌써 매장 뒷문으로 나와서 버스 탔어 ㅠㅠ', susp: 10, reply: '벌써 탔어? ㅋㅋㅋ 알았어', setFlag: FLAG_LIE_SION4, next: 'phase3_check' },
      { id: 'C', text: '헉 나 유우시랑 퇴근 같이 하기로 했어 미안 ㅠㅠ', susp: 20, reply: '아 유우시랑 같이 간다고...?', setFlag: FLAG_TRUTH_SION4, next: 'phase3_check' },
    ],
    transitionText: WAIT_TEXT_DAY4,
    nextCheckGlobal: MEET_CHECK_DAY4,
  },
  phase3_check: {
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_MEET_SION4, FLAG_MEET_YUSHI4], to: 'phase3_trap_both' },
      { all: [FLAG_LIE_SION4, FLAG_MEET_YUSHI4], to: 'phase3_trap_lie' },
      { all: [FLAG_TRUTH_SION4], to: 'phase3_safe_truth' },
      { all: [FLAG_MEET_SION4], to: 'phase3_safe_meet' },
      { all: [FLAG_LIE_SION4], to: 'phase3_safe_decline' },
    ],
  },
  phase3_trap_both: {
    message: '지금 유우시랑 같이 걸어가는 건 누굴까...\n사람 바람 맞히니까 재밌어?\n너는 내가 우습구나',
    choices: [{ id: 'A', text: '헉 시온아 그게 아니라 ㅠㅠ', susp: 0, reply: '연락하지 마 이제', next: 'gameover_both' }],
  },
  gameover_both: { isGameOver: true, message: '', alert: '🚨 양다리가 발각되어 시온에게 이별을 통보받았습니다. 게임 오버! 🚨', choices: [] },
  phase3_trap_lie: {
    message: '{이름}\n버스 탔다며 ㅋㅋ...\n지금 유우시랑 걷고 있는 건 누굴까\n내 눈이 잘못된 거야?',
    choices: [{ id: 'A', text: '시온아 내가 다 설명할게 ㅠㅠ', susp: 0, reply: '그만하자 우리', next: 'gameover_lie' }],
  },
  gameover_lie: { isGameOver: true, message: '', alert: '🚨 시온에게 버스를 탔다는 거짓말이 들통나 게임 오버! 🚨', choices: [] },
  phase3_safe_truth: {
    message: '유우시랑 조심히 갔어?',
    choices: [{ id: 'A', text: '너 보고 싶었는데 ㅠㅠ 미안해...', susp: 20, reply: '알았어 ㅋㅋㅋ 집 들어가면 연락 남겨', next: 'end' }],
  },
  // 시온 쪽은 정상 종료되지만, 유우시에게 아빠 핑계를 댔다면 유우시 톡방에서 게임 오버
  phase3_safe_meet: {
    message: '오늘도 예쁘네 ㅋㅋㅋ 빨리 타 얼어 죽겠다',
    choices: [{ id: 'A', text: '웅! ㅎㅎ', susp: -15, reply: '❤️', next: 'end' }],
  },
  phase3_safe_decline: {
    message: '아 벌써 탔구나\n일찍올 걸 ㅠㅠ\n조심히 들어가고 연락 남겨 ❤️',
    choices: [{ id: 'A', text: '웅 방금 도착했어! 시온이도 푹 자 ㅎㅎ ❤️', susp: 0, reply: '그래 내 꿈 꿔라 ❤️', next: 'end' }],
  },
}

const YUSHI_DAY4_NODES: Record<string, PhaseNode> = {
  phase1_1: {
    preWork: true,
    message: '어제 늦게 잤지\n피곤하겠다',
    choices: [
      { id: 'A', text: '유우시 톡 보니까 눈 떠졌어!', susp: -5, reply: '말 예쁘게 하네~~ ^_^', next: 'phase1_2' },
      { id: 'B', text: '아니야 푹 잤어! 너는?', susp: 0, reply: '나도 잘 잤지', next: 'phase1_2' },
    ],
  },
  phase1_2: {
    preWork: true,
    message: '오늘 엄청 춥다니까 겉옷 두꺼운 거 입고 와 ~~',
    choices: [
      { id: 'A', text: '꽁꽁 싸매고 갈게!', susp: 0, reply: '그래 ㅋㅋㅋ 이따 봐', next: 'phase1_3' },
      { id: 'B', text: '안아주면 안 추울 텐데 ㅠㅠ', susp: -5, reply: '그건 이따 만나서 해줄게 ㅎㅎ', next: 'phase1_3' },
    ],
  },
  phase1_3: {
    preWork: true,
    message: '이따가 마감 끝나고 같이 가자\n데려다줄게.',
    choices: [
      { id: 'A', text: '완전 좋아! 이따 같이 퇴근하자 ㅎㅎ', susp: 0, reply: '천천히 준비하고 출근해', setFlag: FLAG_MEET_YUSHI4, next: 'phase2_meet' },
      { id: 'B', text: '헉 아빠가 데리러 오시기로 했어 ㅠㅠ', susp: 10, reply: '아버님 오시는구나', setFlag: FLAG_LIE_YUSHI4, next: 'phase2_lie' },
    ],
  },
  phase2_meet: {
    message: '밖에서 기다리고 있을게 ㅎㅎ\n천천히 나와',
    choices: [{ id: 'A', text: '지금 나가!! 쪼금만 기다려 ㅎㅎ', susp: 0, reply: '천천히 와도 돼 ^_^', next: 'phase3_check' }],
    transitionText: WAIT_TEXT_DAY4,
    nextCheckGlobal: MEET_CHECK_DAY4,
  },
  phase2_lie: {
    message: '아버님은 오셨어 ?',
    choices: [{ id: 'A', text: '웅 방금 도착했대!', susp: 5, reply: '그래 ~~ 조심히 가고', next: 'phase3_check' }],
    transitionText: WAIT_TEXT_DAY4,
    nextCheckGlobal: MEET_CHECK_DAY4,
  },
  phase3_check: {
    message: '',
    choices: [],
    branch: [
      { all: [FLAG_MEET_YUSHI4, FLAG_MEET_SION4], to: 'phase3_trap_both' },
      { all: [FLAG_LIE_YUSHI4, FLAG_MEET_SION4], to: 'phase3_trap_lie' },
      { all: [FLAG_MEET_YUSHI4], to: 'phase3_safe_meet' },
      { all: [FLAG_LIE_YUSHI4], to: 'phase3_safe_decline' },
    ],
  },
  phase3_trap_both: {
    message: '근데\n골목에 시온이 형 차는 왜 있고... \n너는 거길 왜 타 ?\n언제부터 아빠가 시온이 형이었지?\nㅋㅋ...',
    choices: [{ id: 'A', text: '헉 유우시 그게 아니라...', susp: 0, reply: '실망이다 진짜', next: 'gameover_both' }],
  },
  gameover_both: { isGameOver: true, message: '', alert: '🚨 양다리가 발각되어 유우시에게 이별을 통보받았습니다. 게임 오버! 🚨', choices: [] },
  phase3_trap_lie: {
    message: '아빠 차가 시온이 형 차로 바뀌었네\n사람 가지고 노니까 좋았어?\n실망이다\nㅋㅋ...',
    choices: [{ id: 'A', text: '유우시 내가 설명할게 ㅠㅠ', susp: 0, reply: '연락하지 마', next: 'gameover_lie' }],
  },
  gameover_lie: { isGameOver: true, message: '', alert: '🚨 아빠라고 거짓말한 것이 들통나 게임 오버! 🚨', choices: [] },
  phase3_safe_meet: {
    message: '오늘 고생 많았어',
    choices: [{ id: 'A', text: '나 집 잘 들어왔다!\n고마워 데려다줘서 ㅎㅎ\n잘 자', susp: -15, reply: '응\n사랑해 ❤️', next: 'end' }],
  },
  phase3_safe_decline: {
    message: '아버님 차 탔어 ? 조심히 들어가',
    choices: [{ id: 'A', text: '웅 방금 집 도착했어! 유우시도 조심히 가 ㅠㅠ', susp: 0, reply: '조심히 들어가 ^_^', next: 'end' }],
  },
}

const RIKU_DAY4_NODES: Record<string, PhaseNode> = {
  phase1_1: {
    preWork: true,
    message: '오늘 마감이네 ㅠㅠ\n난 오픈이라 못 보겠당\n아쉬워어',
    choices: [
      { id: 'A', text: '웅 ㅠㅠ 나두 아쉽다 낼 꼭 보쟝', susp: 0, reply: '리쿠: 웅!! 낼은 꼭 보장 ❤️\n여주: ㅋㅋㅋㅋㅋ 낼 보면 되징', next: 'phase1_2' },
      { id: 'B', text: '마감 넘 시르다 ㅠㅠ 리쿠 보고 파...', susp: -5, reply: '리쿠: 헐 ㅠㅠ 나두우...\n매장 놀러가까?', next: 'phase1_2' },
    ],
  },
  phase1_2: {
    preWork: true,
    message: '샌드위치 먹는 중인데 이거 진짜 맛없어...\n점심 뭐 머것어?',
    choices: [
      { id: 'A', text: '나 아직 안 먹었지롱 ㅎㅎ', susp: 0, reply: '리쿠: 이잉 / 빨리 먹어 ㅠㅠ\n리쿠: 아니면 오후에 텔 잡을까? / 리쿠 먹을랭?❤️ ㅎㅎ\n여주: ㅋㅋㅋㅋㅋㅋ 너 오늘 약속있다며\n리쿠: ㅎㅎ', next: 'phase1_3' },
      { id: 'B', text: '나 샐러드 먹는 중!', susp: 0, reply: '리쿠: 그래도 맛있는 거 먹지...', next: 'phase1_3' },
    ],
  },
  phase1_3: {
    preWork: true,
    message: '힘내라 얍 ❤️',
    choices: [
      { id: 'A', text: '너무 힘난다 진짜루...', susp: 0, reply: '리쿠: 힝 고생해', next: 'phase2' },
      { id: 'B', text: '보고 싶당 ㅠㅠ', susp: 0, reply: '리쿠: 힝 고생해', next: 'phase2' },
    ],
  },
  phase2: {
    message: '마감 끝났지??\n오늘 엄청 추운데 따뜻하게 입고 조심히 들어가야 해 ❤️',
    choices: [
      { id: 'A', text: '웅! 조심히 들어갈게 리쿠도 잘 자 ❤️', susp: -5, reply: '다행이다아 ㅠㅠ 집 들어가서 연락해!', next: 'phase3_normal' },
      { id: 'B', text: '오늘 유우시가 데려다준대서 같이 가는 중...!', susp: 40, reply: '아... 유우시가?\n조심히 가', next: 'phase3_jealous' },
    ],
  },
  phase3_normal: {
    message: '집 도착했어?\n씻구 따뜻한 거 마셔어 ❤️',
    choices: [{ id: 'A', text: '웅 방금 씻고 누웠어! 리쿠도 자자 ❤️', susp: -5, reply: '웅 사랑해 푹 자어 ❤️', next: 'end' }],
  },
  phase3_jealous: {
    message: '아직도 유우시랑 같이 있어...?\n벌써 헤어졌지? ㅠㅠ',
    choices: [{ id: 'A', text: '헤어져서 방금 집에 들어왔어! 왜 그래 ㅎㅎ', susp: 0, reply: '아니다 ㅎㅎ 조심히 씻구 자어 ❤️', next: 'end' }],
  },
}

/* ───────────── 5일차 (미들) ───────────── */

const SION_DAY5_TRAP_ALERT = '... \n위에 대화 내역 올려보니까\n친한 언니 만났다며\n거짓말 친 거야?\n여주: 앗 미안해 ㅠㅠ 헷갈렸어...'

const SION_DAY5_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어?\n오늘 비 올수도 있대\n출근할 때 우산 챙겨 ❤️',
    choices: [
      { id: 'A', text: '웅! 시온이도 우산 꼭 챙겼지? ㅎㅎ', susp: 0, reply: '난 이미 챙겼지 ㅋㅋㅋ\n이따 교대할 때 보자 ❤️', next: 'phase2' },
      { id: 'B', text: '아 비 오는 거 진짜 싫다 ㅠㅠ 꿀꿀해', susp: 0, reply: '비 오니까 더 보고 싶네 ㅋㅋㅋ\n조심히 출근해', next: 'phase2' },
    ],
  },
  phase2: {
    // 15시 시온 퇴근, 여주는 미들 근무 중. 답장 후 근무 중 팝업
    preWork: true,
    message: '나 먼저 퇴근한다 ㅋㅋㅋ\n집 가서 밥 시켜 먹어야지',
    choices: [{ id: 'A', text: '웅 조심히 가', susp: 0, next: 'phase3_trap' }],
  },
  phase3_trap: {
    message: '아 맞다\n너 저번 주 화요일에 가족들 만나서 한정식 먹었다고 했었나?\n이번에 부모님 오시면 모시고 갈까 하는데\n거기 이름이 어디야? ㅋㅋㅋ',
    choices: [
      // 친한 언니라고 둘러댄 걸 잊고 '가족'에 긍정
      { id: 'A', text: '아 거기 담채 한정식이야! 룸도 있고 짱 조아 ㅎㅎ', susp: 40, reply: SION_DAY5_TRAP_ALERT, next: 'phase4' },
      // 한정식은 부정했지만 '가족'을 만났다는 전제는 수용
      { id: 'B', text: '아 그때 고기 구워 먹었어!', susp: 30, reply: SION_DAY5_TRAP_ALERT, next: 'phase4' },
      { id: 'C', text: '음... 기억이 안 나네...', susp: 0, reply: '아 맞다 친한 언니 만났댔지\nㅎㅎ 내가 착각했당', next: 'phase4' },
    ],
  },
}

const RIKU_DAY5_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '여주야 오늘 근무 끝나구 머해\n나랑 저녁에 맛잇는 거 먹으러 가자 ❤️',
    choices: [
      { id: 'A', text: '헉 나 낼 오픈이라...\n피곤할 거 같은데 ㅠㅠ', susp: 0, next: 'phase2' },
    ],
  },
  phase2: {
    preWork: true,
    delay: 3,
    message: '아 맞네\n그럼 숙박 하까?\n����� 마사지도 해줄게 ❤️',
    choices: [
      { id: 'A', text: '웅웅 알았어! 그럼 퇴근하구 봐 ㅎㅎ', susp: 0, next: 'phase3_trap' },
    ],
  },
  phase3_trap: {
    preWork: true,
    delay: 3,
    message: '조아!! 그럼 퇴근하구 우리\n늘 가던 곳에서 만나자! ㅎㅎ ❤️',
    choices: [
      { id: 'A', text: '스카이 모텔?\nㅎㅎ 이따 봐!', susp: 0, reply: '웅!! 이따 봥 ❤️', next: 'phase4_interrogation' },
      { id: 'B', text: '그레이 모텔 맞지?\nㅎㅎ 이따 봐!', susp: 40, alert: '거긴 안 가봤는데...\n누구랑 간 거야?', next: 'phase3_fail' },
    ],
  },
  phase3_fail: {
    preWork: true,
    message: '...\n나 말고 누구랑 모텔 간 건데',
    choices: [
      { id: 'A', text: '헉 ㅠㅠ\n예전에 친구들이랑\n파티룸 잡았던 거랑 헷갈렸어...', susp: 5, reply: '아... 파티룸... 알겟어 ㅠㅠ\n스카이로 와!', next: 'phase4_interrogation' },
      { id: 'B', text: '혼자 쉬고 싶을 때 가본 적 있어서\n헷갈렸어\n미안해', susp: 5, reply: '혼자...?\n알겟어\n스카이로 와', next: 'phase4_interrogation' },
    ],
  },
  phase4_interrogation: {
    // 여주 미들 근무 중, 리쿠 출근(마감) 후
    delay: 60,
    message: '아까 출근해서 봣는데...\n여주 사물함에 왜 유우시 옷이 있어\n유우시가 너한�� 따로 부탁한 거야...?',
    choices: [
      { id: 'A', text: '헉\n유우시가 잘못 넣었나...?', susp: -10, reply: '아 그래?\n난 또 둘이 따로 연락하는 줄 알구 놀랏자나...', next: 'phase5_safe' },
      { id: 'B', text: '유우시가\n챙겨달라고 부탁해서 넣어줬엉', susp: 15, reply: '아... 둘이 따로 연락도 해?\n몰랏네... 알겟어 조심히 와', next: 'phase5_risky' },
      // 민우 오빠 핑계 시 의심도 20 증가 후 진행
      { id: 'C', text: '근무하다가 민우오빠가\n넣어두라고 하길래...', susp: 30, alert: '민우 형 오늘 출근 아닌데...?\n왜 자꾸 거짓말해?', next: 'phase5_risky' },
    ],
  },
  phase5_safe: {
    delay: 3,
    message: '이따 봐 ❤️',
    choices: [{ id: 'A', text: '웅 이따 봐! ❤️', susp: 0, next: 'end' }],
  },
  phase5_risky: {
    delay: 3,
    message: '이따 봐',
    choices: [{ id: 'A', text: '웅 이따 봐!', susp: 0, next: 'end' }],
  },
}

const YUSHI_DAY5_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어 ?\n비 오는데 출근 조심하고\n아 그리고\n어제 겉옷 홀에 두고온 것 같은데\n혹시 챙겨놔줄 수 있어?',
    choices: [
      { id: 'A', text: '웅! 출근해서 바로\n사물함에 넣어둘게 ㅎㅎ', susp: 0, reply: '고마워\n오늘 바쁠 텐데 무리하지 말고', next: 'phase2' },
    ],
  },
  phase2: {
    delay: 60, // 여주 미들 출근 후 (옷 넣어둔 타이밍)
    message: '옷은 잘 넣었어 ? 고마워\n오늘 퇴근하고 동기들 만난다고 했지\n비도 오는데 그냥 집 가서 쉬지',
    choices: [
      // TODO: phase3 대본이 오면 next를 'phase3'로 변경
      { id: 'A', text: '옷 잘 넣어뒀엉!\n동기 모임은 밥만 먹구 일찍 가려고', susp:-5, reply: '그래 술 많이 마시지 말고\n집 갈 때 연락 남겨주고 ^_^', next: 'end' },
      { id: 'B', text: '웅 ㅎㅎ\n약속 파투내기가 좀 그래서...', susp: 5, reply: '어쩔 수 없네\n적당히 놀다 들어가 보고 싶다', next: 'end' },
    ],
  },
}

const YUSHI_DAY6_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어 ?\n어제 집에는 잘 들어갔고 ?\n오늘 오픈인데 피곤할 텐데 무리하지 마 ~~\n이따 교대할 때 보자 ^_^',
    choices: [
      { id: 'A', text: '어제 일찍 들어와서 푹 잤어!', susp: 0, reply: '그래 다행이네\n이따 봐 ^_^', next: 'phase2' },
      { id: 'B', text: '아 피곤해 죽겠어 ㅠㅠ\n살려줘...', susp: 5, reply: '어제 일찍 들어간다더니 늦게 잤어 ?\n이따 보자', next: 'phase2' },
    ],
  },
  phase2: {
    // 12시 교대 및 대영이 단톡방 외박 폭탄 직후
    delay: 20,
    message: '대영이가 단톡방에 말한 거 무슨 소리야 ?\n아까 교대할 때 보니까 진짜 어제랑 같은 옷이긴 하던데\n어제 밥만 먹고 일찍 집 들어간다며\n외박했어 ?',
    choices: [
      { id: 'A', text: '아니야 외박 안 했어! ㅠㅠ\n오늘 늦잠 자서 급하게 나오느라\n어제 입은 옷 그냥 주워 입고 나온 거야...', susp: 0, reply: '진짜지 ?\n순간 다른 생각 할 뻔했잖아...', next: 'phase3' },
      { id: 'B', text: '어제 비가 너무 많이 와서\n급하게 여자 동기 자취방에서 잤어 ㅠㅠ\n말 못 해서 미안해...', susp: 15, reply: '집 갈 때 연락 남기라니까\n결국 외박을 했네... 하...', next: 'phase3' },
      { id: 'C', text: '나 오늘 다른 옷 입었어\n대영이가 잘못 본 거야 ㅋㅋㅋ', susp: 10, reply: '아까 교대할 때 나도 네 옷 봤는데\n...\n일단 알겠어', next: 'phase3' },
    ],
  },
  phase3: {
    delay: 30,
    message: '집에서 잘 쉬고 있어 ?\n겉옷 챙겨줘서 고마워 ^_^\n근데\n아까 단톡방 일도 그렇고...\n요즘 너 때문에 하루에도 몇 번씩 심장이 내려앉아',
    choices: [
      { id: 'A', text: '유우시... 아까 일은 진짜 오해야\n걱정하게 해서 미안해 ㅠㅠ', susp: -5, reply: '미안해할 필요 없어\n그냥 내가 너를 너무 좋아해서 그래', next: 'phase4' },
      { id: 'B', text: '나 때문에 심장이 내려앉는다니\n그게 무슨 말이야...', susp: 0, reply: '말 그대로야\n네가 내 눈앞에 안 보이면 불안해져', next: 'phase4' },
    ],
  },
  phase4: {
    delay: 10,
    message: '솔직히 말하면 나 요즘 조금 무서워\n네가 나 말고 다른 곳을 볼까 봐\n어느 순간 내 옆에서 사라져 버릴까 봐 겁나\n나한테는 진짜 너밖에 없거든\n내 옆에만 있어 줘...\n진짜 많이 사랑해',
    choices: [
      { id: 'A', text: '내가 어딜 가...\n나도 유우시 진짜 많이 사랑해 ❤️', susp: -10, reply: '그 말 절대 잊지 마\n내일 봐... 내 꿈 꿔 ❤️', next: 'end' },
      { id: 'B', text: '바보야 그런 걱정 하지 마 ㅠㅠ\n내일도 보잖아! 사랑해 ❤️', susp: -5, reply: '그래 내일 보자\n잘 자 사랑해 ❤️', next: 'end' },
    ],
  },
}

const RIKU_DAY6_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '여주야 출근 잘하구 잇어?\n나 깨우지 왜 혼자 먼저 갔어...\n눈 떴는데 옆자리에 여주 없으니까 넘 허전행 ㅠㅠ',
    choices: [
      { id: 'A', text: '조금이라도 더 자라구 안 깨웠지 ㅎㅎ', susp: -5, reply: '천사야?\n얼른 씻구 출근 준비할게 이따 봥 ❤️', next: 'phase2' },
      { id: 'B', text: '나도 더 누워있고 싶었는데 ㅠㅠ', susp: 0, reply: '힝 어제 나랑 늦게까지 안 자서 그런가 ㅎㅎ\n이따 마주치면 몰래 뽀뽀해줄게 ❤️', next: 'phase2' },
    ],
  },
  phase2: {
    // 단톡방 외박 폭탄 후 유우시·시온의 옷 관련 카톡 다음에 도착
    delay: 15,
    message: '아까 단톡방에서 대영이가 외박 얘기 꺼내서 놀랏네 ㅋㅋㅋ\n어제 나랑 잇느라 옷 못 갈아입은 건데 들킬 뻔햇자나 ❤️',
    choices: [
      { id: 'A', text: 'ㅋㅋㅋ 그니까\n완전 놀랬어...ㅎㅎ', susp: 0, next: 'phase2_interrogation' },
    ],
  },
  phase2_interrogation: {
    delay: 5,
    message: '근데 여주야\n나 지금 유���시랑 근무 중인데\n단톡 올라오고 나서부터 표정이 진짜 안 좋거든?\n쟤가 네 외박 얘기에 왜 저렇게 예민하게 굴어...?',
    choices: [
      { id: 'A', text: '엥 내가 어떻게 알아 ㅠㅠ\n그냥 어제 사물함에 옷 챙겨준 거 때문에 그런가', susp: -5, reply: '아... 하긴 어제 옷 때문에 오해할 뻔햇지\n난 또 둘이 뭐 잇는 줄 알앗자나 ㅠㅠ', next: 'phase3' },
      { id: 'B', text: '글쎄...\n그냥 오늘 미들 바빠서 피곤한 거 아냐?', susp: 15, reply: '아니야 내가 바보도 아니구...\n아까 너 퇴근할 때부터 계속 너만 쳐다보던데 ㅡㅡ', next: 'phase3' },
      { id: 'C', text: '아... 사실 어제 유우시한테는\n동기 모임 간다고 했거든', susp: 30, reply: '?\n유우시한테 네 사생활 보고를 왜 해?\n나 만나면서 왜 걔 눈치를 보는 건데 ㅡㅡ', next: 'phase3' },
    ],
  },
  phase3: {
    delay: 30,
    message: '여주야 집에서 푹 쉬구 잇어?\n나 퇴근하구 집 왔는데 아까 매장 일이 자꾸 생각나서...\n어젯밤에 분명 너랑 하루 종일 같이 잇엇는데도\n매장에서 다른 사람들이 너 쳐다보는 거 보면 속이 다 뒤집어져\n미안 나 질투 많아',
    choices: [
      { id: 'A', text: '내가 어젯밤에 누구랑 있었는데~\n질투하지 마 바보야 ㅎㅎ', susp: -5, reply: '나랑 잇엇지... 그건 맞는데 ㅠㅠ\n그래도 자꾸 욕심이 나', next: 'phase4' },
      { id: 'B', text: '내가 더 잘할게 ㅎㅎ 걱정하지 마', susp: 0, reply: '여주가 잘못한 게 아니라\n그냥 내 마음이 너무 커져서 ��래...', next: 'phase4' },
    ],
  },
  phase4: {
    delay: 10,
    message: '나 요즘 맨날 웃고 장난치는 척해도\n사실 여주가 나한테서 멀어질까 봐 엄청 겁나\n너 없으면 나 진짜 아무것도 못 할 거 같단 말이야 ㅠㅠ\n여주 옆에 나만 잇엇으면 좋겟어...\n나 버리면 안 돼 ㅠ',
    choices: [
      { id: 'A', text: '내가 너를 왜 버려 ㅠㅠ\n나도 리쿠 많이 사랑해 ❤️', susp: -10, reply: '진짜지...? 약속한 거다 ㅠㅠ\n낼 봐 내 거... 사랑해 ❤️', next: 'end' },
      { id: 'B', text: '바보야 ㅠㅠ\n사랑해 리쿠 ❤️', susp: -5, reply: '웅 ㅠㅠ 내일 매장 가면 꼭 안아줘\n잘 자 사랑해 ❤️', next: 'end' },
    ],
  },
}

const SION_DAY6_NODES: Record<string, PhaseNode> = {
  phase1: {
    preWork: true,
    message: '일어났어?\n어제 비 오던데 집에서 푹 잤지? ㅋㅋㅋ\n교대할 때도 얼굴 못 보겠네\n아쉽다 ㅠㅠ',
    choices: [
      { id: 'A', text: '그러게 오늘 아예 못 보네 ㅠㅠ\n마감 화이팅해 ❤️', susp: 0, reply: '오픈 끝나고 집 가서 푹 쉬고 있어 ㅎㅎ\n이따 연락할게 ❤️', next: 'phase2' },
      { id: 'B', text: '아 아침부터 너무 피곤해 ㅠㅠ\n시온이 보고 싶다...', susp: 10, reply: '어제 일찍 안 잤어? ㅋㅋㅋ\n무리하지 말고 이따 톡해 ❤️', next: 'phase2' },
    ],
  },
  phase2: {
    // 유우시·리쿠의 페이즈 2 카톡이 온 뒤에 도착
    delay: 50,
    message: '리쿠는 오늘따라 신나있고\n유우시는 죽상이네 ㅋㅋㅋㅋㅋ\n단톡방 보니까\n어제 입었던 옷 입었나보네\n집 안 들어갔어?',
    choices: [
      { id: 'A', text: '어제 집에서 기절했다가 오늘 늦잠 자서 ㅎㅎ\n어제 입은 옷 그냥 주워 입고 나온 거야!', susp: -5, reply: '진짜지? ㅋㅋㅋ\n난 또 나 몰래 사고 친 줄 알았네\n일단 마감 끝나고 연락할게', next: 'phase3' },
      { id: 'B', text: '어제 비가 너무 많이 와서\n급하게 대학 동기 자취방에서 잤어 ㅠㅠ\n미리 말 못 해서 미안해...', susp: 15, reply: '어제 나한텐 아무 약속 없다더니\n갑자기 동기 자취방에서 외박을 했다고...?\n... 이따 끝나고 얘기해', next: 'phase3' },
      { id: 'C', text: '리쿠는 원래 텐션 높고 유우시는 피곤한가 보지!\n난 어제 집 들어갔옹', susp: 30, reply: '난 그냥 둘 표정 얘기만 했는데\n왜 갑자기 둘을 감싸? ㅋㅋㅋ\n진짜 수상하네...\n이따 연락할게', next: 'phase3' },
    ],
  },
  phase3: {
    delay: 35,
    message: '마감 끝났다\n아직 안 자지?\n아까 단톡방에서 대영이가 너 옷 얘기 꺼낼 때\n솔직히 기분이 좋진 않았어\n사귀는 건 난데\n왜 내가 아무 말도 못 하고\n남들이 너 두고 떠드는 걸 보고만 있어야 되나...',
    choices: [
      { id: 'A', text: '비밀 연애라 어쩔 수 없잖아 ㅠㅠ\n많이 답답했어?', susp: -5, reply: '답답한 정도가 아니라 미치겠어\n이제 숨기는 거 그만하고 싶다 진짜', next: 'phase4' },
      { id: 'B', text: '질투하는 거야? ㅋㅋㅋ\n나 걱정해 줘서 고마워 ㅠㅠ', susp: 0, reply: '난 진지해 여주야', next: 'phase4' },
    ],
  },
  phase4: {
    delay: 10,
    message: '나 이제 매장 애들 눈치 안 보고 다 티 내고 싶어\n다른 애들이 너 신경쓰는 것도 싫고\n우리 사귀는 거 다 소문내고 싶단 말이야\n어제 외박 안 했다니까 믿어줄게 대신 내일은 진짜 외박해 나랑\n내일 나 휴무고 너 마감이잖아 데리러 갈 테니까\n내일 밤은 무조건 내 거야\n사랑해',
    choices: [
      { id: 'A', text: '알겠어 내일 밤은 오시온 거 해 ㅎㅎ ❤️', susp: -10, reply: '약속했다 딴소리하기 없기야 ㅋㅋㅋ\n푹 자 내일 보러 갈게 사랑해 ❤️', next: 'end' },
      { id: 'B', text: '내일 마감 끝나고 봐 사랑해 ❤️', susp: -5, reply: '도망갈 생각 하지 마 ㅋㅋㅋ\n내일 봐 내 꿈 꿔 사랑해 ❤️', next: 'end' },
    ],
  },
}

const SION_DAY7_NODES: Record<string, PhaseNode> = {
  phase1: {
    delay: 6,
    message: '마감 끝났지?\n어제 말했잖아 오늘 밤은 무조건 내 거라고 ㅋㅋㅋ\n뒷골목에 차 대놨으니까 새지 말고 바로 타 ❤️',
    choices: [],
  },
}

const RIKU_DAY7_NODES: Record<string, PhaseNode> = {
  phase1: {
    delay: 4,
    message: '여주야 마감 끝낫지!!\n아까 교대할 때 보고 넘 보고 싶어서 집 안 가구 근처에서 기다렷어 ㅎㅎ\n얼른 나와',
    choices: [],
  },
}

const YUSHI_DAY7_NODES: Record<string, PhaseNode> = {
  phase1: {
    delay: 2,
    message: '마감 끝났지 ?\n네가 좋아하는 거 사서 기다리는 중이니까 얼른 나와 ^_^',
    choices: [],
  },
}

export const SCRIPTS: Record<string, Script> = {
  // 퇴근 후 리쿠 → 시온 → 유우시 순서로 10초 간격 (TIME_SCALE 적용 후 5s / 15s / 25s)
  a: fromPhases('phase1', SION_NODES, { initialDelay: 160, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 30 }),
  b: fromPhases('phase1', RIKU_NODES, { initialDelay: 90, phaseDelay: 30, replyDelayMs: 1500, workEndDelay: 10 }),
  c: fromPhases('phase1', YUSHI_NODES, { initialDelay: 20, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 50 }),
}

/** 일차별 대화. 그날 스크립트가 없는 멤버는 그날 카톡이 오지 않습니다. */
export const DAY_SCRIPTS: Record<number, Record<string, Script>> = {
  1: SCRIPTS,
  2: {
    a: fromPhases('phase1', SION_DAY2_NODES, { initialDelay: 6, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 45 }),
    b: fromPhases('phase1', RIKU_DAY2_NODES, { initialDelay: 50, phaseDelay: 30, replyDelayMs: 2500, workEndDelay: 15 }),
    c: fromPhases('phase1', YUSHI_DAY2_NODES, { initialDelay: 40, phaseDelay: 20, replyDelayMs: 2000, workEndDelay: 30 }),
  },
  3: {
    a: fromPhases('phase1', SION_DAY3_NODES, { initialDelay: 20, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 0 }),
    b: fromPhases('phase1', RIKU_DAY3_NODES, { initialDelay: 35, phaseDelay: 30, replyDelayMs: 2500, workEndDelay: 0 }),
    c: fromPhases('phase1', YUSHI_DAY3_NODES, { initialDelay: 50, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 0 }),
  },
  4: {
    a: fromPhases('phase1_1', SION_DAY4_NODES, { initialDelay: 25, phaseDelay: 20, replyDelayMs: 3000, workEndDelay: 10 }),
    b: fromPhases('phase1_1', RIKU_DAY4_NODES, { initialDelay: 40, phaseDelay: 25, replyDelayMs: 2000, workEndDelay: 25 }),
    c: fromPhases('phase1_1', YUSHI_DAY4_NODES, { initialDelay: 15, phaseDelay: 20, replyDelayMs: 2000, workEndDelay: 5 }),
  },
  5: {
    a: fromPhases('phase1', SION_DAY5_NODES, { initialDelay: 20, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 5 }),
    b: fromPhases('phase1', RIKU_DAY5_NODES, { initialDelay: 40, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 10 }),
    c: fromPhases('phase1', YUSHI_DAY5_NODES, { initialDelay: 30, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 10 }),
  },
  6: {
    // 단톡방 ��벤트가 끝난 뒤 유우시 → 시온 → 리쿠 순으로 10초 간격 (TIME_SCALE 적용 후 2s / 12s / 22s)
    a: fromPhases('phase1', SION_DAY6_NODES, { initialDelay: 50, phaseDelay: 30, replyDelayMs: 3000, workEndDelay: 24 }),
    b: fromPhases('phase1', RIKU_DAY6_NODES, { initialDelay: 40, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 44 }),
    c: fromPhases('phase1', YUSHI_DAY6_NODES, { initialDelay: 30, phaseDelay: 30, replyDelayMs: 2000, workEndDelay: 4 }),
  },
  // 7일 차는 근무 전환이 끝난 뒤 시계가 시작되므로 initialDelay 가 곧 '퇴근 후 도착 시간'
  7: {
    a: fromPhases('phase1', SION_DAY7_NODES, { initialDelay: 6, phaseDelay: 0, replyDelayMs: 3000, workEndDelay: 0 }),
    b: fromPhases('phase1', RIKU_DAY7_NODES, { initialDelay: 4, phaseDelay: 0, replyDelayMs: 2000, workEndDelay: 0 }),
    c: fromPhases('phase1', YUSHI_DAY7_NODES, { initialDelay: 2, phaseDelay: 0, replyDelayMs: 2000, workEndDelay: 0 }),
  },
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

const DAY3_STAFF_GROUP: GroupScript = {
  startDelayMs: 5000,
  messages: [
    gl('김대영', '죄송합니다...'),
    gl('김대영', '저 사고 쳤어요...'),
    gl('김대영', '제빙기에서 얼음 푸다가 스쿱을 안에 빠뜨렸는데 못 찾겠어요... ㅠㅠㅠ'),
    gl('오시온', 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋ'),
    gl('오시온', '그거 없으면 아이스 음료 어떻게 나가라고 ㅋㅋㅋ'),
    gl('오시온', '당장 손 씻고 안 빼?'),
    gl('김대영', '너무 깊숙이 들어가서 손이 얼어붙을 거 같아여 ㅠㅠㅠ'),
    gl('김대영', '살려줘...'),
    gl('료', '아 뭐야 ㅋㅋㅋㅋㅋㅋ'),
    gl('료', '형 저 출근하기 전까지 빼놓기...'),
  ],
  choices: [
    {
      id: 'A',
      text: 'ㅋㅋㅋㅋ 대영아 화이팅... 난 집에서 응원할게!',
      reply: [gl('김대영', '누나마저 날 버리네...'), gl('유우시', '타자 칠 시간에 스쿱 찾겠다...')],
    },
    {
      id: 'B',
      text: '헉 제빙기 엄청 깊은데 조심해 ㅠㅠ',
      reply: [gl('김대영', '역시 천사 {이름} 누나밖에 없어 ㅠㅠㅠ')],
    },
  ],
}

const DAY4_STAFF_GROUP: GroupScript = {
  // 4일 차 모든 남자의 대화가 끝난 뒤 3초 후 시작
  afterAllChats: true,
  startDelayMs: 3000,
  messages: [
    gl('이윤아', '내일 비 온다는데 벌써 기빨려 ㅠㅠ'),
    gl('료', '비 오면 배달...ㅋㅋ'),
    gl('사쿠야', '리쿠 형 내일 곡소리 나겟네요'),
    { sender: '정민우', text: '난 내일 드디어 휴무다... 너네 알아서 살아남아라 ㅠㅠ', delayMs: 5000 },
    gl('오시온', '민우 형 혼자 도망가네 ㅋㅋㅋ'),
    gl('오시온', '내일 오픈 재료 세팅 확실하게 해놓고 가요'),
    gl('이윤아', '여주야 우리 낼 그냥 멘탈 놓고 일하자... ㅠㅠ'),
  ],
  choices: [
    {
      id: 'A',
      text: '웅 ㅠㅠ 낼 멘탈 꽉 잡고 출근할겡...',
      reply: [gl('이윤아', '웅 낼 봐 ㅠㅠ 다들 굿밤!')],
    },
  ],
}

const DAY6_STAFF_GROUP: GroupScript = {
  // 6일 차 오픈 근무가 끝나면 바로 시작, 끝난 뒤 유우시 → 시온 → 리쿠 순으로 카톡 도착
  afterWorkEnd: true,
  startDelayMs: 2000,
  messages: [
    { sender: '김대영', text: '오늘 오픈 수고하셨습니다~!!', delayMs: 2000 },
    { sender: '김대영', text: '아 근데 ㅋㅋㅋ 여주누나 옷 어제랑 똑같던데', delayMs: 2000 },
    { sender: '김대영', text: '외박했어요?', delayMs: 1000 },
    { sender: '사쿠야', text: '헐 누나 어제 불금 달렸어요?? ㅋㅋㅋ', delayMs: 2000 },
    { sender: '김대영', text: '오픈 내내 꾸벅꾸벅 조시길래 합리적 의심 해봤음 ㅋㅋㅋㅋ', delayMs: 2000 },
    { sender: '료', text: '오 누나 어디 놀러 갔다 오셨나 보네 ㅋㅋㅋ', delayMs: 2000 },
  ],
  choices: [],
}

/** 일차별 단톡방 이벤트 (키는 채팅방 id) */
const DAY_GROUP_SCRIPTS: Record<number, Record<string, GroupScript>> = {
  3: { staff: DAY3_STAFF_GROUP },
  4: { staff: DAY4_STAFF_GROUP },
  6: { staff: DAY6_STAFF_GROUP },
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
export const SUSPICION_100_SPAM_LIST: SpamNotification[] = [
  { senderId: 'a', senderName: '오시온', text: '야' },
  { senderId: 'c', senderName: '유우시', text: '어디야 ?' },
  { senderId: 'b', senderName: '리쿠', text: '여주야 왜 답장 안 해?' },
  { senderId: 'a', senderName: '오시온', text: '전화 받아' },
  { senderId: 'b', senderName: '리쿠', text: '방금 시온이 형이랑 얘기 다 했어' },
  { senderId: 'c', senderName: '유우시', text: '거짓말 그만해 다 알고 있으니까' },
  { senderId: 'a', senderName: '오시온', text: '내가 끝까지 모를 줄 알았어? ㅋㅋㅋ' },
  { senderId: 'b', senderName: '리쿠', text: '거짓말한 거 다 들통났어 여주야' },
  { senderId: 'a', senderName: '오시온', text: '장난치지 말고 당장 전화 받���라고' },
  { senderId: 'c', senderName: '유우시', text: '내가 착하게 말할 때 받아' },
  { senderId: 'b', senderName: '리쿠', text: '전화 받아 제발' },
  { senderId: 'c', senderName: '유우시', text: '도망갈 생각 하지 마 금방 찾으러 갈게' },
  { senderId: 'a', senderName: '오시온', text: '지금 너네 집 앞으로 가는 중이다 나와' },
]
