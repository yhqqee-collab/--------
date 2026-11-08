import { CHARACTERS, GROUP_CHAT_NAME, GROUP_MEMBERS } from '@/lib/template-config'

export type ChatItem =
  | { type: 'date'; label: string }
  | { type: 'break' }
  | { type: 'msg'; from: 'me' | 'them'; text: string; time: string; unread?: boolean; sender?: string; image?: boolean | string }

export type Chat = {
  id: string
  name: string
  /** 단톡방 인원 수 (지정하면 헤더와 목록에 표시) */
  members?: number
  /** 단톡방 대화상대 목록 (지정하면 ☰ 메뉴에서 볼 수 있음). '나'는 본인으로 표시 */
  roster?: string[]
  avatar?: string
  preview: string
  time: string
  unread?: number
  pinned?: boolean
  self?: boolean
  items: ChatItem[]
}

/** 대화가 불가능한 배경용 채팅방 (목록에만 표시) */
export type BackgroundChat = {
  name: string
  preview: string
  time: string
  color: string
  members?: number
  unread?: number
  muted?: boolean
}

const day = (label: string): ChatItem => ({ type: 'date', label })

function block(time: string, lines: [from: 'me' | 'them', text: string][]): ChatItem[] {
  return lines.map(([from, text]) => ({ type: 'msg', from, text, time }))
}

/**
- 단톡방 메시지.
- image: true면 사진 플레이스홀더, 문자열이면 해당 경로의 실제 사진으로 표시됩니다.
 */
function group(sender: string, time: string, lines: (string | { image: true | string })[]): ChatItem[] {
  return lines.map((line) =>
    typeof line === 'string'
      ? { type: 'msg', from: 'them', sender, text: line, time }
      : { type: 'msg', from: 'them', sender, text: '사진', image: line.image, time },
  )
}

const PHOTO = { image: true } as const
const photo = (src: string) => ({ image: src })

const T = 'them' as const
const M = 'me' as const

const ME = '나'
const SION = CHARACTERS.a.name
const RIKU = CHARACTERS.b.name
const YUSHI = CHARACTERS.c.name
const MINWOO = GROUP_MEMBERS.minwoo.name
const SUJIN = GROUP_MEMBERS.sujin.name
const YUNA = GROUP_MEMBERS.yuna.name
const DAEYOUNG = GROUP_MEMBERS.daeyoung.name
const SAKUYA = GROUP_MEMBERS.sakuya.name
const RYO = GROUP_MEMBERS.ryo.name

const STAFF_ROSTER = [ME, SION, RIKU, YUSHI, MINWOO, SUJIN, YUNA, DAEYOUNG, SAKUYA, RYO]

/** 단톡방 한 사람의 연속 발화. ME('나')는 오른쪽 노란 말풍선으로 표시됩니다. */
function say(sender: string, time: string, ...texts: string[]): ChatItem[] {
  return sender === ME
    ? texts.map((text) => ({ type: 'msg', from: 'me', text, time }))
    : texts.map((text) => ({ type: 'msg', from: 'them', sender, text, time }))
}

/*
- 대화 가능한 채팅방 (초기 과거 대화 로그 템플릿).
- id는 scripts.ts(선택지), suspicion.ts(의심도), replies.ts(재촉/엔딩 메시지)의 키와 일치해야 합니다.
- 마지막 메시지가 'them'이면 읽은 시점부터 답장 지연 패널티가 쌓입니다.
 */
export const CHATS: Chat[] = [
  {
    id: 'a',
    name: CHARACTERS.a.name,
    avatar: CHARACTERS.a.avatar,
    preview: '[최근 메시지 미리보기]',
    time: '어제',
    unread: 1,
    pinned: true,
    items: [
      day('2026년 10월 25일 일요일'),
      ...block('오후 8:20', [
        [T, '[과거 상대방 카톡 대사를 입력하세요]'],
      ]),
      ...block('오후 8:25', [
        [M, '[과거 내 답장 대사를 입력하세요]'],
      ]),
      ...block('오후 8:27', [
        [T, '[마지막 메시지 입력]'],
      ]),
    ],
  },
  {
    id: 'b',
    name: CHARACTERS.b.name,
    avatar: CHARACTERS.b.avatar,
    preview: '[최근 메시지 미리보기]',
    time: '어제',
    unread: 1,
    items: [
      day('2026년 10월 25일 일요일'),
      ...block('오후 9:10', [
        [T, '[과거 상대방 카톡 대사를 입력하세요]'],
      ]),
      ...block('오후 9:15', [
        [M, '[과거 내 답장 대사를 입력하세요]'],
      ]),
      ...block('오후 9:16', [
        [T, '[마지막 메시지 입력]'],
      ]),
    ],
  },
  {
    id: 'c',
    name: CHARACTERS.c.name,
    avatar: CHARACTERS.c.avatar,
    preview: '[최근 메시지 미리보기]',
    time: '어제',
    unread: 1,
    items: [
      day('2026년 10월 25일 일요일'),
      ...block('오후 10:00', [
        [T, '[과거 상대방 카톡 대사를 입력하세요]'],
      ]),
      ...block('오후 10:05', [
        [M, '[과거 내 답장 대사를 입력하세요]'],
      ]),
      ...block('오후 10:06', [
        [T, '[마지막 메시지 입력]'],
      ]),
    ],
  },
  {
    id: 'staff',
    name: GROUP_CHAT_NAME,
    members: STAFF_ROSTER.length,
    roster: STAFF_ROSTER,
    preview: '[단톡방 최근 메시지 미리보기]',
    time: '어제',
    unread: 0,
    items: [
      day('2026년 10월 25일 일요일'),
      ...say(SION, '오후 6:00', '[단톡방 공지 및 이전 대화 입력]'),
      ...say(DAEYOUNG, '오후 6:05', '[단톡방 부원 반응 입력]'),
      ...say(ME, '오후 6:10', '[내 단톡방 대사 입력]'),
    ],
  },
]

/** 목록 하단에 표시되는 클릭 불가 배경용 채팅방 템플릿 */
export const BACKGROUND_CHATS: BackgroundChat[] = [
  {
    name: '[배경 단톡방 1]',
    preview: '[미리보기 텍스트를 입력하세요]',
    time: '어제',
    color: '#94a3b8',
    members: 4,
    muted: true,
  },
  {
    name: '[배경 채팅방 2]',
    preview: '[미리보기 텍스트를 입력하세요]',
    time: '10월 23일',
    color: '#cbd5e1',
  },
]