import {
  FLAG_DAY3_INSTA_A,
  FLAG_DAY3_INSTA_B,
  FLAG_DAY3_INSTA_C,
  SYNC_DAY3_INSTA,
  type CrossMessage,
} from '@/components/kakao/scripts'

/**
 * 인스타 게시물 댓글창 선택지.
 * 여주가 해당 게시물 댓글창에 들어가면 선택지가 뜨고, 고른 댓글 밑에 작성자 답글(authorReply)이 달립니다.
 * setFlag: 고르면 켜지는 플래그 (카톡 대본의 분기에 사용)
 * sync: 고르면 이 키로 대기 중인 카톡이 이어서 옴 (예: 유우시의 오후 카톡)
 * sendTo: 고르면 chat 톡방에 message 가 delay 초 뒤 카톡으로 도착 (susp 는 받는 사람 의심도)
 */
export type InstaCommentChoice = {
  id: string
  comment: string
  authorReply?: string
  setFlag?: string
  sync?: string
  sendTo?: { chat: string; message: string; delay: number; susp?: number }
}

export type InstaCommentPrompt = { day: number; postId: string; choices: InstaCommentChoice[] }

/** 시온 Day 3 인스타 게시물 (용산공원 + 역 사진). 게시물 화면 추가 시 이 id 를 사용 */
export const SION_DAY3_POST_ID = 'sion-day3-picnic'

/** 유우시의 반응 카톡은 scripts.ts 의 YUSHI_DAY3 (Branch_Insta) 에 있습니다 */
export const INSTA_COMMENT_PROMPTS: InstaCommentPrompt[] = [
  {
    day: 3,
    postId: SION_DAY3_POST_ID,
    choices: [
      { id: 'A', comment: '포토그래퍼 금손이네 🙋‍♀️', setFlag: FLAG_DAY3_INSTA_A, sync: SYNC_DAY3_INSTA },
      { id: 'B', comment: '와 날씨 좋다 ㅠㅠ 나도 놀러 갈래~', setFlag: FLAG_DAY3_INSTA_B, sync: SYNC_DAY3_INSTA },
      {
        id: 'C',
        comment: '옷 예쁘다 ㅋㅋㅋㅋ',
        authorReply: '저번에 여주가 골라준 거 ㅎㅎ',
        setFlag: FLAG_DAY3_INSTA_C,
        sync: SYNC_DAY3_INSTA,
      },
    ],
  },
]

export function commentPromptFor(day: number, postId: string) {
  return INSTA_COMMENT_PROMPTS.find((prompt) => prompt.day === day && prompt.postId === postId)
}

/** 인스타 → 카톡 이벤트 이름 */
export const INSTA_CROSS_MESSAGE_EVENT = 'insta-cross-message'

/** 댓글 선택 시 호출. 카톡 앱이 이벤트를 받아 플래그·sync 를 처리하고, sendTo 가 있으면 카톡을 보냅니다. */
export function emitInstaCommentChoice(choice: InstaCommentChoice) {
  if (typeof window === 'undefined' || (!choice.sendTo && !choice.setFlag && !choice.sync)) return
  const detail: CrossMessage = {
    chat: choice.sendTo?.chat ?? '',
    texts: (choice.sendTo?.message ?? '').split('\n').map((line) => line.trim()).filter(Boolean),
    delayMs: (choice.sendTo?.delay ?? 0) * 1000,
    delta: choice.sendTo?.susp ?? 0,
    sync: choice.sync,
    setFlag: choice.setFlag,
  }
  window.dispatchEvent(new CustomEvent<CrossMessage>(INSTA_CROSS_MESSAGE_EVENT, { detail }))
}
