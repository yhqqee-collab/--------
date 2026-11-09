import { SYNC_DAY3_EVENING, type CrossMessage } from '@/components/kakao/scripts'

/**
 * 인스타 게시물 댓글창 선택지.
 * 여주가 해당 게시물 댓글창에 들어가면 선택지가 뜨고, 고른 댓글 밑에 작성자 답글(authorReply)이 달립니다.
 * sendTo: 고르면 chat 톡방에 message 가 delay 초 뒤 카톡으로 도착 (susp 는 받는 사람 의심도)
 */
export type InstaCommentChoice = {
  id: string
  comment: string
  authorReply?: string
  /** sync: 메시지가 도착하면 해당 키로 대기 중인 카톡이 이어서 옴 */
  sendTo?: { chat: string; message: string; delay: number; susp?: number; sync?: string }
}

export type InstaCommentPrompt = { day: number; postId: string; choices: InstaCommentChoice[] }

/** 시온 Day 3 인스타 게시물 (용산공원 + 역 사진). 게시물 화면 추가 시 이 id 를 사용 */
export const SION_DAY3_POST_ID = 'sion-day3-picnic'

export const INSTA_COMMENT_PROMPTS: InstaCommentPrompt[] = [
  {
    day: 3,
    postId: SION_DAY3_POST_ID,
    choices: [
      {
        id: 'A',
        comment: '포토그래퍼 금손이네 🙋‍♀️',
        sendTo: { chat: 'c', message: '집에 있는다며\n형 사진 찍어주고 있었네 ㅋㅋㅋ', delay: 10, susp: 50, sync: SYNC_DAY3_EVENING },
      },
      {
        id: 'B',
        comment: '와 날씨 좋다 ㅠㅠ 나도 놀러 갈래~',
        sendTo: {
          chat: 'c',
          message: '시온이 형 인스타에 댓글 달았네\n솔직히 질투나 ㅋㅋㅋ ㅠㅠ\n다른 남자 인스타에 댓글 달지 마...',
          delay: 10,
          susp: 10,
          sync: SYNC_DAY3_EVENING,
        },
      },
      {
        id: 'C',
        comment: '옷 예쁘다 ㅋㅋㅋㅋ',
        authorReply: '저번에 여주가 골라준 거 ㅎㅎ',
        sendTo: { chat: 'c', message: '저번에 형 옷도 골라줬어?', delay: 10, susp: 30, sync: SYNC_DAY3_EVENING },
      },
    ],
  },
]

export function commentPromptFor(day: number, postId: string) {
  return INSTA_COMMENT_PROMPTS.find((prompt) => prompt.day === day && prompt.postId === postId)
}

/** 인스타 → 카톡 이벤트 이름 */
export const INSTA_CROSS_MESSAGE_EVENT = 'insta-cross-message'

/** 댓글 선택 시 호출. 카톡 앱이 이벤트를 받아 해당 톡방에 메시지를 보냅니다. */
export function emitInstaCommentChoice(choice: InstaCommentChoice) {
  if (!choice.sendTo || typeof window === 'undefined') return
  const detail: CrossMessage = {
    chat: choice.sendTo.chat,
    texts: choice.sendTo.message.split('\n').map((line) => line.trim()).filter(Boolean),
    delayMs: choice.sendTo.delay * 1000,
    delta: choice.sendTo.susp ?? 0,
    sync: choice.sendTo.sync,
  }
  window.dispatchEvent(new CustomEvent<CrossMessage>(INSTA_CROSS_MESSAGE_EVENT, { detail }))
}
